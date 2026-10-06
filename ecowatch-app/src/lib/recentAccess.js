import safeStorage from "./safeStorage";

const MAX_RECENT_ACCESS = 6;

function storageKey(userId) {
  return `ecowatch-recent-access:${userId}`;
}

export function getRecentAccess(userId) {
  if (!userId) return [];
  try {
    const raw = safeStorage.getItem(storageKey(userId), "[]");
    const entries = JSON.parse(raw || "[]");
    return Array.isArray(entries) ? entries : [];
  } catch {
    return [];
  }
}

export function recordRecentAccess(userId, entry) {
  if (!userId || !entry) return;
  try {
    const entries = getRecentAccess(userId).filter((item) => item.path !== entry.path);
    safeStorage.setItem(storageKey(userId), JSON.stringify([entry, ...entries].slice(0, MAX_RECENT_ACCESS)));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("ecowatch-recent-access"));
    }
  } catch {}
}