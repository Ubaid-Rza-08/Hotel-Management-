// ─────────────────────────────────────────────────────────────
//  HTTP UTILITY
// ─────────────────────────────────────────────────────────────

/**
 * Wrapper around fetch that:
 *  - always sends Content-Type: application/json
 *  - throws a readable Error on non-2xx responses
 */
export const callApi = async (url, opts = {}) => {
  const r = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    ...opts,
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.message || d.error || `Error ${r.status}`);
  return d;
};
