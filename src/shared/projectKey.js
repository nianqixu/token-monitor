'use strict';

(function exposeProjectKey(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.TokenMonitorProjectKey = api;
})(typeof window !== 'undefined' ? window : null, function createProjectKeyApi() {
  // Canonicalization pays for Unicode NFC normalization on every call, and it
  // runs per session row in the project rollups, but distinct labels stay
  // bounded. Memoizing on the trimmed NFC form turns the repeat calls into hash
  // lookups; the bound keeps unbounded label streams from growing the cache.
  const KEY_MEMO_LIMIT = 8192;
  const keyMemo = new Map();

  function canonicalProjectKey(value) {
    const label = String(value || '').trim().normalize('NFC');
    if (!label) return '';
    const memoized = keyMemo.get(label);
    if (memoized !== undefined) return memoized;
    const key = label.toLowerCase().normalize('NFC');
    if (keyMemo.size >= KEY_MEMO_LIMIT) keyMemo.clear();
    keyMemo.set(label, key);
    return key;
  }

  function deterministicProjectLabel(left, right) {
    const a = String(left || '').trim().normalize('NFC');
    const b = String(right || '').trim().normalize('NFC');
    if (!a) return b;
    if (!b) return a;
    return a < b ? a : b;
  }

  return { canonicalProjectKey, deterministicProjectLabel };
});
