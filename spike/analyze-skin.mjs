#!/usr/bin/env node
// ReBloom — Milestone 0 spike: prove the YouCam Skin Analysis REST path end-to-end
// and the "one skin scan → multiple track blooms" fan-out, using the free sandbox units.
//
// THROWAWAY spike. The real, key-protected version lives in a Supabase Edge Function
// (PLAN.md M3). Here we call YouCam directly so you can prove the path with zero infra.
//
// Usage:
//   PERFECTCORP_API_KEY=xxxxx node spike/analyze-skin.mjs ./selfie.jpg
//   PERFECTCORP_API_KEY=xxxxx node spike/analyze-skin.mjs ./selfie.jpg recovery,acne
//
// - Arg 1: path to a clear, front-facing selfie (jpg/png).
// - Arg 2 (optional): comma-separated track ids to score. Default: recovery,acne.
//   The script requests the UNION of those tracks' concerns in ONE analysis call,
//   then computes a separate bloom per track — this is the core cost efficiency to prove.
//
// Auth + flow verified against docs.perfectcorp.com on 2026-08-12 (see docs/04-api-integration.md):
//   1) POST /s2s/v2.0/file            -> get file_id + a presigned PUT url
//   2) PUT  <presigned url>           -> upload the image bytes
//   3) POST /s2s/v2.0/task/skin-analysis  { src_file_id, dst_actions } -> task_id
//   4) GET  /s2s/v2.0/task/skin-analysis/<task_id> -> poll until task_status=success

import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { TRACKS, unionConcerns, bloom } from './tracks.mjs';

const BASE = 'https://yce-api-01.makeupar.com';
const API_KEY = process.env.PERFECTCORP_API_KEY;
const imagePath = process.argv[2];
const trackIds = (process.argv[3] || 'recovery,acne').split(',').map((s) => s.trim()).filter(Boolean);

function die(msg) { console.error(`\n✖ ${msg}\n`); process.exit(1); }
if (!API_KEY) die('Set PERFECTCORP_API_KEY (get a key + free units at https://yce.perfectcorp.com/ai-api).');
if (!imagePath) die('Pass a selfie path, e.g. node spike/analyze-skin.mjs ./selfie.jpg');

const authHeaders = { Authorization: `Bearer ${API_KEY}` };
const contentTypeFor = (p) => (p.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg');

async function jsonOrThrow(res, label) {
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  if (!res.ok) die(`${label} failed: HTTP ${res.status}\n${typeof body === 'string' ? body : JSON.stringify(body, null, 2)}`);
  return body;
}

async function main() {
  const bytes = await readFile(imagePath);
  const contentType = contentTypeFor(imagePath);
  console.log(`\n▶ ReBloom M0 spike — analyzing ${basename(imagePath)} for tracks: ${trackIds.join(', ')}`);

  // Resolve the union of concerns across the requested SKIN tracks.
  const concerns = unionConcerns(trackIds);
  const requestedSkinTracks = TRACKS.filter((t) => t.kind === 'skin' && trackIds.includes(t.id));
  if (concerns.length === 0) die('No skin concerns resolved — check the track ids (hair-regrowth is a separate API, not covered by this script).');
  console.log(`  Requesting ${concerns.length} concern(s) in ONE call: ${concerns.join(', ')}`);

  // 1) Request an upload URL.
  const fileRes = await fetch(`${BASE}/s2s/v2.0/file`, {
    method: 'POST',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ files: [{ content_type: contentType, file_name: basename(imagePath), file_size: bytes.length }] }),
  });
  const fileBody = await jsonOrThrow(fileRes, 'File API (request upload URL)');
  const fileEntry = fileBody?.result?.files?.[0] ?? fileBody?.data?.files?.[0] ?? fileBody?.files?.[0];
  const fileId = fileEntry?.file_id;
  const upload = fileEntry?.requests?.[0] ?? fileEntry?.requests ?? fileEntry?.upload;
  if (!fileId || !upload?.url) {
    console.error(JSON.stringify(fileBody, null, 2));
    die('Could not find file_id / presigned upload url in the File API response — inspect the shape above and adjust the parser.');
  }

  // 2) Upload the bytes to the presigned URL with the headers the API dictated.
  const putHeaders = { ...(upload.headers || {}) };
  if (!putHeaders['Content-Type'] && !putHeaders['content-type']) putHeaders['Content-Type'] = contentType;
  const putRes = await fetch(upload.url, { method: upload.method || 'PUT', headers: putHeaders, body: bytes });
  if (!putRes.ok) die(`Binary upload (PUT) failed: HTTP ${putRes.status}\n${await putRes.text()}`);
  console.log(`  ✓ uploaded (file_id=${fileId})`);

  // 3) Create the skin-analysis task.
  const taskRes = await fetch(`${BASE}/s2s/v2.0/task/skin-analysis`, {
    method: 'POST',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ src_file_id: fileId, dst_actions: concerns, miniserver_args: { enable_mask_overlay: false }, format: 'json' }),
  });
  const taskBody = await jsonOrThrow(taskRes, 'Create skin-analysis task');
  const taskId = taskBody?.data?.task_id ?? taskBody?.result?.task_id ?? taskBody?.task_id;
  if (!taskId) { console.error(JSON.stringify(taskBody, null, 2)); die('No task_id in create-task response.'); }
  console.log(`  ✓ task created (task_id=${taskId.slice(0, 12)}…)`);

  // 4) Poll until success.
  let out;
  for (let attempt = 1; attempt <= 30; attempt++) {
    await new Promise((r) => setTimeout(r, 2000));
    const pollRes = await fetch(`${BASE}/s2s/v2.0/task/skin-analysis/${taskId}`, { headers: authHeaders });
    const pollBody = await jsonOrThrow(pollRes, 'Poll task');
    const data = pollBody?.data ?? pollBody?.result ?? pollBody;
    const status = data?.task_status ?? data?.status;
    process.stdout.write(`  … poll ${attempt}: ${status}\r`);
    if (status === 'success') { out = data?.results?.output ?? data?.output ?? data?.results; break; }
    if (status === 'error' || status === 'failed') { console.error(JSON.stringify(pollBody, null, 2)); die('Task failed.'); }
  }
  if (!out) die('Timed out waiting for results.');
  console.log('\n  ✓ analysis complete\n');

  // Map concern -> ui_score.
  const scoresByConcern = {};
  for (const item of out) {
    const key = item.type ?? item.concern ?? item.name;
    const score = item.ui_score ?? item.score ?? item.raw_score;
    if (key != null && typeof score === 'number') scoresByConcern[key] = score;
  }

  console.log('  Concern scores (ui_score, 1..100, higher = healthier):');
  for (const c of concerns) console.log(`    ${c.padEnd(16)} ${scoresByConcern[c] ?? '—'}`);

  console.log('\n  Per-track bloom (0..100) from the SAME single scan:');
  for (const t of requestedSkinTracks) {
    const missing = t.concerns.filter((c) => !(c in scoresByConcern));
    const b = bloom(t, scoresByConcern);
    console.log(`    🌱 ${t.name.padEnd(28)} bloom=${b ?? '—'}${missing.length ? `   (missing: ${missing.join(', ')})` : ''}`);
  }

  console.log('\n✔ REST path proven: one selfie → one analysis call → multiple track blooms.');
  console.log('  Record the observed unit cost from the console dashboard into docs/04-api-integration.md, then flip the GO/NO-GO gate.\n');
}

main().catch((e) => die(e?.stack || String(e)));
