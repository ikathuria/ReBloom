// ReBloom — analyze-skin Edge Function.
//
// Stateless proxy to the Perfect Corp YouCam Skin Analysis REST API. Holds the API key
// server-side (Edge Function secret), runs the file → task → poll flow, returns per-concern
// scores, and NEVER persists the image. Flow + endpoints verified in docs/04-api-integration.md.
//
// Request  (POST JSON): { imageBase64: string, contentType?: string, concerns: string[],
//                         cadence?: { minIntervalDays: number, lastScanAt: string|null, tier?: 'free'|'pro' } }
// Response (JSON):      { scores: Record<string, number> }   // concern -> ui_score (1..100)
//   429 { error, code: 'cadence_exceeded', upgrade, waitDays } when a passed cadence hint is over-cap.

import { checkCadence, type CadenceHint } from "../_shared/cadence.ts";

const BASE = "https://yce-api-01.makeupar.com";
const API_KEY = Deno.env.get("PERFECTCORP_API_KEY");

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

function base64ToBytes(b64: string): Uint8Array {
  const clean = b64.includes(",") ? b64.slice(b64.indexOf(",") + 1) : b64; // strip any data: prefix
  const bin = atob(clean);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  if (!API_KEY) return json({ error: "PERFECTCORP_API_KEY not configured" }, 500);

  let body: { imageBase64?: string; contentType?: string; concerns?: string[]; cadence?: CadenceHint };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid JSON body" }, 400);
  }
  const { imageBase64, contentType = "image/jpeg", concerns, cadence } = body;
  if (!imageBase64 || !Array.isArray(concerns) || concerns.length === 0) {
    return json({ error: "imageBase64 and non-empty concerns[] required" }, 400);
  }

  // Guardrail: refuse an over-cadence scan (protects paid API units). See _shared/cadence.ts.
  const cap = checkCadence(cadence);
  if (cap.overCap) {
    return json({ error: "scan not due yet", code: "cadence_exceeded", upgrade: cadence?.tier !== "pro", waitDays: cap.waitDays }, 429);
  }

  const auth = { Authorization: `Bearer ${API_KEY}` };
  const bytes = base64ToBytes(imageBase64);

  try {
    // 1) Request an upload URL.
    const fileRes = await fetch(`${BASE}/s2s/v2.0/file`, {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({
        files: [{ content_type: contentType, file_name: "scan.jpg", file_size: bytes.length }],
      }),
    });
    if (!fileRes.ok) return json({ error: "file api failed", detail: await fileRes.text() }, 502);
    const fileBody = await fileRes.json();
    const entry = fileBody?.result?.files?.[0] ?? fileBody?.data?.files?.[0] ?? fileBody?.files?.[0];
    const fileId = entry?.file_id;
    const upload = entry?.requests?.[0] ?? entry?.requests ?? entry?.upload;
    if (!fileId || !upload?.url) return json({ error: "unexpected file api shape", fileBody }, 502);

    // 2) Upload the bytes (never stored by us).
    const putHeaders: Record<string, string> = { ...(upload.headers ?? {}) };
    if (!putHeaders["Content-Type"] && !putHeaders["content-type"]) putHeaders["Content-Type"] = contentType;
    const putRes = await fetch(upload.url, { method: upload.method ?? "PUT", headers: putHeaders, body: bytes });
    if (!putRes.ok) return json({ error: "upload failed", detail: await putRes.text() }, 502);

    // 3) Create the analysis task.
    const taskRes = await fetch(`${BASE}/s2s/v2.0/task/skin-analysis`, {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({
        src_file_id: fileId,
        dst_actions: concerns,
        miniserver_args: { enable_mask_overlay: false },
        format: "json",
      }),
    });
    if (!taskRes.ok) return json({ error: "create task failed", detail: await taskRes.text() }, 502);
    const taskBody = await taskRes.json();
    const taskId = taskBody?.data?.task_id ?? taskBody?.result?.task_id ?? taskBody?.task_id;
    if (!taskId) return json({ error: "no task_id", taskBody }, 502);

    // 4) Poll until success.
    let output: Array<Record<string, unknown>> | undefined;
    for (let i = 0; i < 25; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const pollRes = await fetch(`${BASE}/s2s/v2.0/task/skin-analysis/${taskId}`, { headers: auth });
      if (!pollRes.ok) continue;
      const pollBody = await pollRes.json();
      const data = pollBody?.data ?? pollBody?.result ?? pollBody;
      const status = data?.task_status ?? data?.status;
      if (status === "success") {
        output = data?.results?.output ?? data?.output ?? data?.results;
        break;
      }
      if (status === "error" || status === "failed") return json({ error: "analysis failed", pollBody }, 502);
    }
    if (!output) return json({ error: "analysis timed out" }, 504);

    // 5) Map output -> { concern: ui_score }. Never store the image.
    const scores: Record<string, number> = {};
    for (const item of output) {
      const key = (item.type ?? item.concern ?? item.name) as string | undefined;
      const score = (item.ui_score ?? item.score ?? item.raw_score) as number | undefined;
      if (key && typeof score === "number") scores[key] = score;
    }
    return json({ scores });
  } catch (e) {
    return json({ error: "proxy error", detail: String(e) }, 500);
  }
});
