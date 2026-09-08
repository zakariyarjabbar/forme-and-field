/** Validate against the public Host header. Next's internal request URL may use the bind address. */
export function isSameOrigin(origin: string | null, host: string | null, configuredUrl?: string) {
  try {
    if (!origin || !host) return false;
    const url = new URL(origin);
    return (
      ['http:', 'https:'].includes(url.protocol) &&
      url.host === host &&
      (!configuredUrl || url.origin === new URL(configuredUrl).origin)
    );
  } catch {
    return false;
  }
}
