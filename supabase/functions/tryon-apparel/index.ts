// ReBloom — tryon-apparel Edge Function (STUB).
//
// Intended: proxy Perfect Corp's YouCam AI Clothes / Fabric Virtual Try-On (2 units/call) —
// take a user photo + a garment/fabric reference, run the same file→task→poll flow, and return
// a rendered try-on image. Key stays server-side; user photo never persisted.
//
// ⚠️ NOT WIRED YET. The VTO task endpoint/params aren't confirmed in the public reference, and the
// in-app try-on is a Pro feature (M8). This returns 501 so the route exists and the intent is
// documented; the fabric RECOMMENDATIONS (lib/apparel/recommend) are what ship in M6.

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve((req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  return new Response(
    JSON.stringify({ error: "not_implemented", detail: "Apparel VTO arrives with ReBloom Pro (M8); YouCam VTO endpoint to be confirmed." }),
    { status: 501, headers: { ...cors, "Content-Type": "application/json" } },
  );
});
