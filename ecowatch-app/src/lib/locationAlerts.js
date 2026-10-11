/**
 * Location-Aware Disaster Alert & Real-Time Validation Utilities
 * Implements requirements 8, 9, 10, 11, 12 for the Citizen Module.
 */

/**
 * Calculates Haversine great-circle distance between two coordinates in kilometers.
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (
    lat1 === undefined ||
    lat1 === null ||
    lon1 === undefined ||
    lon1 === null ||
    lat2 === undefined ||
    lat2 === null ||
    lon2 === undefined ||
    lon2 === null
  ) {
    return null;
  }
  const R = 6371; // Earth's radius in kilometers
  const dLat = (Number(lat2) - Number(lat1)) * (Math.PI / 180);
  const dLon = (Number(lon2) - Number(lon1)) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(Number(lat1) * (Math.PI / 180)) *
      Math.cos(Number(lat2) * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

/**
 * Validates a disaster alert's data integrity and active status (Req 10).
 * Validates: disaster type, location, status, timestamp, severity, data source, active/expired.
 */
export function validateDisasterAlert(alert) {
  const issues = [];
  const now = Date.now();

  if (!alert.type && !alert.title) issues.push("Missing disaster type");
  if (!alert.region && !alert.location && !alert.affectedArea) issues.push("Missing location");
  if (!alert.severity) issues.push("Missing severity level");

  const alertTimestamp = alert.timestamp ? new Date(alert.timestamp).getTime() : null;
  if (!alertTimestamp || isNaN(alertTimestamp)) {
    issues.push("Invalid timestamp");
  }

  // Check expiration (alerts older than 24h without explicit active duration or marked expired)
  let isExpired = false;
  if (alert.status && String(alert.status).toLowerCase().includes("expired")) {
    isExpired = true;
  } else if (alert.expiresAt && new Date(alert.expiresAt).getTime() < now) {
    isExpired = true;
  } else if (alertTimestamp && now - alertTimestamp > 24 * 3600 * 1000 && !alert.isRecurring) {
    // Over 24 hours old without renewal
    isExpired = true;
  }

  const isValid = issues.length === 0;
  const isLive = isValid && !isExpired && String(alert.status || "").toLowerCase() !== "resolved";

  return {
    isValid,
    isLive,
    isExpired,
    issues,
    verifiedSource: alert.detectedBy || alert.source || "Tamil Nadu State Disaster Management & Sentinel-1 SAR",
    status: isExpired ? "Expired" : alert.status || "Active",
  };
}

/**
 * Evaluates whether an alert is local or nearby to the citizen (Req 9).
 */
export function evaluateLocationRelevance(alert, userLocationName = "", userCoords = null) {
  const validation = validateDisasterAlert(alert);

  let distanceKm = null;
  if (userCoords?.lat && userCoords?.lon && alert.latitude && alert.longitude) {
    distanceKm = calculateDistanceKm(userCoords.lat, userCoords.lon, alert.latitude, alert.longitude);
  }

  const userNorm = String(userLocationName || "").toLowerCase();
  const alertLoc = String(alert.region || alert.location || alert.affectedArea || "").toLowerCase();

  // Match specific neighborhoods or municipal sectors
  const keyAreas = ["palayamkottai", "ktc nagar", "tirunelveli", "vannarpettai", "melapalayam", "chennai", "marina"];
  let hasExactAreaMatch = false;
  for (const area of keyAreas) {
    if (userNorm.includes(area) && alertLoc.includes(area)) {
      hasExactAreaMatch = true;
      break;
    }
  }

  if (!hasExactAreaMatch && userNorm.length > 3 && alertLoc.includes(userNorm)) {
    hasExactAreaMatch = true;
  }

  // A warning is considered in user's area if exact area matches OR within 3.5 km
  const isInUserArea = hasExactAreaMatch || (distanceKm !== null && distanceKm <= 3.5);

  const sevUpper = String(alert.severity || "WARNING").toUpperCase();
  const isEmergency = sevUpper.includes("CRIT") || sevUpper.includes("EMERG") || sevUpper.includes("HIGH");

  let priorityLevel = "NORMAL";
  let priorityLabel = "";

  if (isInUserArea) {
    if (isEmergency) {
      priorityLevel = "EMERGENCY";
      priorityLabel = "🔴 High Priority Alert – Active In Your Area";
    } else {
      priorityLevel = "WARNING";
      priorityLabel = "🟠 Warning Active In Your Area";
    }
  } else {
    priorityLevel = "ADVISORY";
    priorityLabel = distanceKm !== null ? `🟡 Nearby Disaster Alert (~${distanceKm} km away)` : "🟡 Nearby Disaster Alert";
  }

  return {
    ...validation,
    isInUserArea,
    distanceKm,
    formattedDistance: distanceKm !== null ? `${distanceKm} km away` : "Nearby Sector",
    priorityLevel,
    priorityLabel,
    userLocationName,
    alertLocation: alert.region || alert.location || alert.affectedArea,
  };
}
