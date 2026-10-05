const MAX_RECENT_ACCESS = 6;

function storageKey(userId) {
  return `ecowatch-recent-access:${userId}`;
}

export function getRecentAccess(userId) {
  if (!userId) return [];
  try {
    const entries = JSON.parse(localStorage.getItem(storageKey(userId)) || "[]");
    return Array.isArray(entries) ? entries : [];
  } catch {
    return [];
  }
}

export function recordRecentAccess(userId, entry) {
  if (!userId) return;
  const entries = getRecentAccess(userId).filter((item) => item.path !== entry.path);
  localStorage.setItem(storageKey(userId), JSON.stringify([entry, ...entries].slice(0, MAX_RECENT_ACCESS)));
  window.dispatchEvent(new Event("ecowatch-recent-access"));
}