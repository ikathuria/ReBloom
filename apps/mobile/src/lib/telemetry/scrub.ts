// Redaction for error telemetry. ReBloom's promise is that a scan photo never leaves the device
// except transiently to the analysis proxy — so nothing image-like or personally identifying may
// ever ride along in a crash report. This scrubber is the enforced contract (unit-tested), applied
// to every event before it reaches a reporter (Sentry, etc.).

const SENSITIVE_KEY_PARTS = [
  'imagebase64',
  'image',
  'base64',
  'photo',
  'password',
  'token',
  'secret',
  'apikey',
  'authorization',
  'email',
];

const REDACTED = '[redacted]';
const MAX_STRING = 256;

const isSensitiveKey = (key: string): boolean => {
  const k = key.toLowerCase();
  return SENSITIVE_KEY_PARTS.some((part) => k.includes(part));
};

/** A long, mostly-base64 string is almost certainly an image/blob — drop it wherever it appears. */
const looksLikeBlob = (v: string): boolean =>
  v.length > MAX_STRING && /^[A-Za-z0-9+/=\s]*$/.test(v.slice(0, 128));

export function scrubValue(value: unknown, depth = 0): unknown {
  if (depth > 6) return REDACTED; // guard against cycles / pathological nesting
  if (typeof value === 'string') {
    if (looksLikeBlob(value)) return REDACTED;
    return value.length > MAX_STRING ? `${value.slice(0, MAX_STRING)}…` : value;
  }
  if (Array.isArray(value)) return value.map((v) => scrubValue(v, depth + 1));
  if (value && typeof value === 'object') return scrubObject(value as Record<string, unknown>, depth);
  return value; // numbers, booleans, null, undefined
}

function scrubObject(obj: Record<string, unknown>, depth: number): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    out[key] = isSensitiveKey(key) ? REDACTED : scrubValue(val, depth + 1);
  }
  return out;
}

export const scrubContext = (context: Record<string, unknown>): Record<string, unknown> =>
  scrubObject(context, 0);
