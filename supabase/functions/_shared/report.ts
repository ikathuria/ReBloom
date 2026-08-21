// Minimal, dependency-free error reporting for the Edge Functions.
//
// Always logs to stderr (captured in Supabase function logs). If SENTRY_DSN is set, also sends a
// compact event to Sentry's store endpoint. It NEVER forwards request bodies or images — only a
// location tag and the error message — so a scan photo can't leak into monitoring (docs/02).

const DSN = Deno.env.get("SENTRY_DSN");

interface Parsed {
  storeUrl: string;
  publicKey: string;
}

function parseDsn(dsn: string): Parsed | null {
  try {
    const u = new URL(dsn);
    const projectId = u.pathname.replace(/^\//, "");
    if (!projectId || !u.username) return null;
    return { storeUrl: `${u.protocol}//${u.host}/api/${projectId}/store/`, publicKey: u.username };
  } catch {
    return null;
  }
}

export function reportError(where: string, err: unknown, extra: Record<string, string | number> = {}): void {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[${where}]`, message); // always visible in `supabase functions logs`

  if (!DSN) return;
  const parsed = parseDsn(DSN);
  if (!parsed) return;

  const body = JSON.stringify({
    event_id: crypto.randomUUID().replace(/-/g, ""),
    timestamp: new Date().toISOString(),
    platform: "other",
    level: "error",
    logger: where,
    server_name: "rebloom-edge",
    message: { formatted: message },
    // `extra` is caller-supplied metadata only — never a request body or image.
    extra,
  });

  // Fire-and-forget: monitoring must never delay or fail the user's response.
  fetch(parsed.storeUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Sentry-Auth": `Sentry sentry_version=7, sentry_key=${parsed.publicKey}, sentry_client=rebloom-edge/1.0`,
    },
    body,
  }).catch(() => {
    /* swallow — never break the function on a telemetry failure */
  });
}
