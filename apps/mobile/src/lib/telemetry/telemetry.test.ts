import { captureError, registerReporter, scrubContext, type TelemetryEvent } from './index';

const bigBase64 = 'A'.repeat(5000);

describe('scrubContext', () => {
  it('redacts an image passed under any key name', () => {
    const out = scrubContext({ imageBase64: bigBase64, scope: 'skin-scan' });
    expect(out.imageBase64).toBe('[redacted]');
    expect(out.scope).toBe('skin-scan');
  });

  it('drops a long base64 blob even under an innocent key', () => {
    expect(scrubContext({ payload: bigBase64 }).payload).toBe('[redacted]');
  });

  it('redacts PII / secret keys', () => {
    const out = scrubContext({ email: 'a@b.com', access_token: 'x', apiKey: 'k', note: 'ok' });
    expect(out.email).toBe('[redacted]');
    expect(out.access_token).toBe('[redacted]');
    expect(out.apiKey).toBe('[redacted]');
    expect(out.note).toBe('ok');
  });

  it('scrubs nested objects and arrays', () => {
    const out = scrubContext({ req: { headers: { authorization: 'Bearer z' } }, items: [{ base64: bigBase64 }] }) as {
      req: { headers: { authorization: string } };
      items: { base64: string }[];
    };
    expect(out.req.headers.authorization).toBe('[redacted]');
    expect(out.items[0].base64).toBe('[redacted]');
  });
});

describe('captureError', () => {
  afterEach(() => registerReporter(null));

  it('sends a scrubbed event to a registered reporter', () => {
    const events: TelemetryEvent[] = [];
    registerReporter((e) => events.push(e));

    captureError(new Error('scan failed'), { scope: 'skin-scan', imageBase64: bigBase64 });

    expect(events).toHaveLength(1);
    expect(events[0].message).toBe('scan failed');
    expect(events[0].context?.imageBase64).toBe('[redacted]');
    expect(events[0].context?.scope).toBe('skin-scan');
  });

  it('never throws when the reporter throws', () => {
    registerReporter(() => {
      throw new Error('reporter blew up');
    });
    expect(() => captureError(new Error('x'))).not.toThrow();
  });

  it('is a no-op (no throw) with no reporter', () => {
    expect(() => captureError('plain string error')).not.toThrow();
  });
});
