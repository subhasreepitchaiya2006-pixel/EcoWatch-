import safeStorage from "./safeStorage";

export const DEFAULT_CITIZEN_NOTIFICATIONS = [
  {
    id: "notif-flood-palayamkottai",
    title: "Flood warning detected in your area.",
    description: "Emergency flood surge warning active for Palayamkottai basin. River level threshold exceeded by 0.65m.",
    location: "Palayamkottai, Tirunelveli",
    severity: "EMERGENCY",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    timeAgo: "15m ago",
    targetUrl: "/disaster-alerts?highlight=palayamkottai",
    category: "Disaster Alert",
    read: false,
  },
  {
    id: "notif-event-ktc-nagar",
    title: "Community event happening at KTC Nagar.",
    description: "Community Clean-up / Awareness Event is scheduled today at 4:00 PM. Tap to view event details and participate.",
    location: "KTC Nagar, Tirunelveli",
    severity: "NORMAL",
    timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    timeAgo: "40m ago",
    targetUrl: "/community-reports?highlight=101",
    category: "Community Event",
    read: false,
  },
  {
    id: "notif-air-unhealthy",
    title: "Air quality has reached an unhealthy level.",
    description: "Particulate PM2.5 elevated to 68 µg/m³. Sensitive residents and children should limit prolonged outdoor exertion.",
    location: "SIPCOT Industrial Corridor",
    severity: "WARNING",
    timestamp: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    timeAgo: "1h ago",
    targetUrl: "/air-quality",
    category: "Air Quality",
    read: false,
  },
  {
    id: "notif-rain-expected",
    title: "Heavy rainfall is expected in your location.",
    description: "NWP & Doppler radar indicate 35mm convective precipitation expected between 4:00 PM and 7:00 PM.",
    location: "Tirunelveli Region",
    severity: "WARNING",
    timestamp: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    timeAgo: "2h ago",
    targetUrl: "/weather",
    category: "Weather Alert",
    read: false,
  },
  {
    id: "notif-event-awareness-tomorrow",
    title: "Community awareness event scheduled for tomorrow.",
    description: "Green Corridor Tree Plantation Drive scheduled for tomorrow at 7:30 AM at KTC Nagar North Park.",
    location: "KTC Nagar North Park",
    severity: "ADVISORY",
    timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    timeAgo: "3h ago",
    targetUrl: "/community-reports?highlight=105",
    category: "Community Activity",
    read: false,
  },
];

const STORAGE_KEY = "ecowatch-citizen-notifications-v2";

export function getCitizenNotifications() {
  try {
    const raw = safeStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return DEFAULT_CITIZEN_NOTIFICATIONS;
}

export function saveCitizenNotifications(list) {
  try {
    safeStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event("ecowatch-notifications-updated"));
  } catch {}
}

export function markNotificationAsRead(id) {
  const current = getCitizenNotifications();
  const next = current.map((n) => (n.id === id ? { ...n, read: true } : n));
  saveCitizenNotifications(next);
  return next;
}

export function markAllNotificationsAsRead() {
  const current = getCitizenNotifications();
  const next = current.map((n) => ({ ...n, read: true }));
  saveCitizenNotifications(next);
  return next;
}
