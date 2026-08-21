// ReBloom — analyze-hair Edge Function.
//
// Stateless proxy to Perfect Corp's YouCam AI Hair Density Detection. Same file→task→poll
// pattern as analyze-skin; key stays server-side; image never persisted. Returns { grade }
// (coarse 1..4 density grade).
//
// ⚠️ UNVERIFIED ENDPOINT: the YouCam Hair & Beard suite (Jun 2026) isn't in the public API
// reference yet, so the task path + action key + response shape below are BEST-GUESSES and must
// be confirmed in the sandbox console before flipping HAIR_ANALYSIS_REAL on the client. Until
// then the app uses the mock hair analyzer (see lib/analysis/getHairAnalyzer).
//
// Request  (POST JSON): { imageBase64: string, contentType?: string }
// Response (JSON):      { grade: number }   // 1..4

const BASE = "https://yce-api-01.makeupar.com";
const API_KEY = Deno.env.get("PERFECTCORP_API_KEY");

// ⟳ confirm: task path + action for hair density
const HAIR_TASK_PATH = "/s2s/v2.0/task/hair-analysis";
const HAIR_ACTION = "hair_density";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

function base64ToBytes(b64: string): Uint8Array {
  const clean = b64.includes(",") ? b64.slice(b64.indexOf(",") + 1) : b64;
  const bin = atob(clean);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  if (!API_KEY) return json({ error: "PERFECTCORP_API_KEY not configured" }, 500);

  let body: { imageBase64?: string; contentType?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid JSON body" }, 400);
  }
  const { imageBase64, contentType = "image/jpeg" } = body;
  if (!imageBase64) return json({ error: "imageBase64 required" }, 400);

  const auth = { Authorization: `Bearer ${API_KEY}` };
  const bytes = base64ToBytes(imageBase64);

  try {
    // 1) upload url
    const fileRes = await fetch(`${BASE}/s2s/v2.0/file`, {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({ files: [{ content_type: contentType, file_name: "scalp.jpg", file_size: bytes.length }] }),
    });
    if (!fileRes.ok) return json({ error: "file api failed", detail: await fileRes.text() }, 502);
    const fileBody = await fileRes.json();
    const entry = fileBody?.result?.files?.[0] ?? fileBody?.data?.files?.[0] ?? fileBody?.files?.[0];
    const fileId = entry?.file_id;
    const upload = entry?.requests?.[0] ?? entry?.requests ?? entry?.upload;
    if (!fileId || !upload?.url) return json({ error: "unexpected file api shape", fileBody }, 502);

    // 2) upload bytes (not stored by us)
    const putHeaders: Record<string, string> = { ...(upload.headers ?? {}) };
    if (!putHeaders["Content-Type"] && !putHeaders["content-type"]) putHeaders["Content-Type"] = contentType;
    const putRes = await fetch(upload.url, { method: upload.method ?? "PUT", headers: putHeaders, body: bytes });
    if (!putRes.ok) return json({ error: "upload failed", detail: await putRes.text() }, 502);

    // 3) create task  (⟳ confirm path/action)
    const taskRes = await fetch(`${BASE}${HAIR_TASK_PATH}`, {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({ src_file_id: fileId, dst_actions: [HAIR_ACTION], format: "json" }),
    });
    if (!taskRes.ok) return json({ error: "create hair task failed", detail: await taskRes.text() }, 502);
    const taskBody = await taskRes.json();
    const taskId = taskBody?.data?.task_id ?? taskBody?.result?.task_id ?? taskBody?.task_id;
    if (!taskId) return json({ error: "no task_id", taskBody }, 502);

    // 4) poll
    let output: Array<Record<string, unknown>> | undefined;
    let raw: unknown;
    for (let i = 0; i < 25; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const pollRes = await fetch(`${BASE}${HAIR_TASK_PATH}/${taskId}`, { headers: auth });
      if (!pollRes.ok) continue;
      const pollBody = await pollRes.json();
      const data = pollBody?.data ?? pollBody?.result ?? pollBody;
      const status = data?.task_status ?? data?.status;
      if (status === "success") {
        raw = data;
        output = data?.results?.output ?? data?.output ?? data?.results;
        break;
      }
      if (status === "error" || status === "failed") return json({ error: "hair analysis failed", pollBody }, 502);
    }
    if (output === undefined && raw === undefined) return json({ error: "hair analysis timed out" }, 504);

    // 5) extract a 1..4 grade (⟳ confirm field name once endpoint is verified)
    const first = Array.isArray(output) ? output[0] : undefined;
    const gradeRaw =
      (first?.grade ?? first?.density ?? first?.density_grade ?? first?.level ?? first?.ui_score) as number | undefined;
    if (typeof gradeRaw !== "number") return json({ error: "no grade in hair output", raw }, 502);
    const grade = Math.max(1, Math.min(4, Math.round(gradeRaw)));
    return json({ grade });
  } catch (e) {
    return json({ error: "proxy error", detail: String(e) }, 500);
  }
});
