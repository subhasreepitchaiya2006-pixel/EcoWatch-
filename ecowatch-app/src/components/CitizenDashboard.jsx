import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import StatusIndicator, { normalizeLevel } from "./StatusIndicator";
import CitizenNotificationCenter from "./CitizenNotificationCenter";
import { useSatelliteData } from "../context/SatelliteDataContext";
import { useAuth } from "../context/AuthContext";
import { fetchWeather, fetchAirQuality, apiRequest } from "../lib/api";
import { evaluateLocationRelevance } from "../lib/locationAlerts";
import { getCitizenNotifications } from "../lib/citizenNotifications";
import safeStorage from "../lib/safeStorage";

export default function CitizenDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    currentLocation,
    coordinates,
    temperature,
    humidity,
    windSpeed,
    aqi,
    aqiStatus,
    requestCurrentLocation,
    locationStatus,
  } = useSatelliteData();

  const [weatherData, setWeatherData] = useState(null);
  const [aqiData, setAqiData] = useState(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [participatedEventIds, setParticipatedEventIds] = useState(() => {
    try {
      const stored = safeStorage.getItem("ecowatch-joined-report-ids");
      return stored ? new Set(JSON.parse(stored)) : new Set([101]);
    } catch {
      return new Set([101]);
    }
  });
  const [participationFeedback, setParticipationFeedback] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // "all" | "my-events"

  // Fetch Live Weather & Air Quality
  useEffect(() => {
    if (!coordinates) return;
    let isCurrent = true;
    fetchWeather(currentLocation, coordinates.lat, coordinates.lon)
      .then((data) => {
        if (isCurrent && !data?.offlineFallback) setWeatherData(data);
      })
      .catch(() => {});

    fetchAirQuality(coordinates.lat, coordinates.lon)
      .then((data) => {
        if (isCurrent && !data?.offlineFallback) setAqiData(data);
      })
      .catch(() => {});

    return () => {
      isCurrent = false;
    };
  }, [coordinates?.lat, coordinates?.lon, currentLocation]);

  // Seed events
  const [communityEvents, setCommunityEvents] = useState([
    {
      id: 101,
      title: "Community Clean-up / Awareness Event",
      location: "KTC Nagar, Tirunelveli",
      date: "12 October 2026",
      time: "4:00 PM – 6:00 PM",
      status: "Upcoming",
      participantsCount: 42,
      participantType: "Neighborhood Residents & Youth Volunteers",
      description:
        "Community clean-up drive and awareness rally to clear storm drains, remove plastic blockages along 3rd Main Road, and prepare for seasonal monsoon.",
      instructions:
        "Assembly at KTC Nagar Community Hall. Gloves and disposal collection bags provided on-site. Bring your own drinking water.",
      latitude: 8.7522,
      longitude: 77.7414,
    },
    {
      id: 105,
      title: "Green Corridor Tree Plantation Drive",
      location: "KTC Nagar North Park, Tirunelveli",
      date: "14 October 2026",
      time: "7:30 AM – 9:30 AM",
      status: "Upcoming",
      participantsCount: 28,
      participantType: "School Eco-Clubs & Residents",
      description:
        "Planting native shade saplings (Neem, Pongamia, Peepal) to combat urban heat islands and enhance local biodiversity.",
      instructions:
        "Meet at North Park Gate 2. Saplings and gardening spades will be distributed.",
      latitude: 8.7550,
      longitude: 77.7430,
    },
    {
      id: 106,
      title: "Palayamkottai Canal De-silting & Awareness",
      location: "Palayamkottai, Tirunelveli",
      date: "09 October 2026",
      time: "3:00 PM – 5:30 PM",
      status: "Completed",
      participantsCount: 65,
      participantType: "Local Citizens & Municipality",
      description: "Community canal clearing campaign completed successfully.",
      instructions: "Completed. Thank you to all 65 citizen volunteers!",
      results:
        "2.4 tonnes of plastic and silt removed from Palayamkottai drainage culvert; water flow restored by 85%.",
      latitude: 8.7180,
      longitude: 77.7340,
    },
  ]);

  // Primary Disaster Alert in the area (Palayamkottai flood warning)
  const disasterAlert = useMemo(() => {
    return {
      id: 2001,
      title: "Flood Warning – Palayamkottai",
      type: "Flood Warning",
      region: "Palayamkottai, Tirunelveli",
      affectedArea: "Palayamkottai Low-Lying Corridor & Thamirabarani Basin",
      status: "Active",
      severity: "CRITICAL",
      issuedAt: "Today at 2:30 PM",
      timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      expectedDuration: "Next 6 hours (Until 11:30 PM)",
      expiresAt: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
      source: "Tamil Nadu State Disaster Management Authority (TNDMA) & Sentinel-1 SAR Radar",
      latitude: 8.7180,
      longitude: 77.7340,
      affected: "18,500 residents",
      depth: "0.65m Inundation Surge",
      description:
        "A flood warning has been issued for the Palayamkottai area. Rapid drainage runoff and Thamirabarani river basin surge exceed threshold by 0.65m.",
      recommendedActions: [
        "Move immediately to higher ground or designated civil defense shelters.",
        "Avoid traveling near low-lying riverbanks, underpasses, and Thamirabarani causeways.",
        "Keep emergency kits, battery torch, and fresh drinking water ready.",
        "Dial Tirunelveli Disaster Control Room: 1077 / 0462-2500828.",
      ],
    };
  }, []);

  // Location-aware disaster evaluation (Req 8, 9, 10)
  const disasterEval = useMemo(() => {
    return evaluateLocationRelevance(disasterAlert, currentLocation, coordinates);
  }, [disasterAlert, currentLocation, coordinates]);

  // Notifications
  const notifications = useMemo(() => getCitizenNotifications(), []);
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Handle Event Participation (Req 7)
  const handleParticipate = (eventId) => {
    const isJoined = participatedEventIds.has(eventId);
    const nextSet = new Set(participatedEventIds);

    if (isJoined) {
      nextSet.delete(eventId);
      setParticipationFeedback("Participation removed for this event.");
      setCommunityEvents((prev) =>
        prev.map((ev) =>
          ev.id === eventId ? { ...ev, participantsCount: Math.max(0, ev.participantsCount - 1) } : ev
        )
      );
    } else {
      nextSet.add(eventId);
      setParticipationFeedback("🎉 Participation Confirmed! Your registration is recorded.");
      setCommunityEvents((prev) =>
        prev.map((ev) =>
          ev.id === eventId ? { ...ev, participantsCount: ev.participantsCount + 1 } : ev
        )
      );
      try {
        apiRequest(`/community-reports/${eventId}/vote`, { method: "POST" }).catch(() => {});
      } catch {}
    }

    setParticipatedEventIds(nextSet);
    safeStorage.setItem("ecowatch-joined-report-ids", JSON.stringify([...nextSet]));
    setTimeout(() => setParticipationFeedback(""), 5000);
  };

  // Weather variables
  const currentTemp = weatherData?.temperature != null ? Math.round(weatherData.temperature) : Math.round(temperature);
  const currentCondition = weatherData?.condition || "Partly Cloudy";
  const rainChance = weatherData?.forecast?.[0]?.precipChance || "20%";
  const rainMm = weatherData?.forecast?.[0]?.precipSumMm != null ? weatherData.forecast[0].precipSumMm : 2.4;
  const currentWind = weatherData?.windSpeed != null ? weatherData.windSpeed : windSpeed;
  const currentHum = weatherData?.humidity != null ? weatherData.humidity : humidity;

  // AQI variables
  const currentAqi = aqiData?.aqi != null ? aqiData.aqi : aqi;
  const aqiCategory = aqiData?.category || aqiStatus?.label || "Good";

  // Global indicator status
  const weatherLevel = rainMm > 15 ? "WARNING" : rainMm > 5 ? "ADVISORY" : "NORMAL";
  const aqiLevel = currentAqi > 150 ? "EMERGENCY" : currentAqi > 100 ? "WARNING" : currentAqi > 50 ? "ADVISORY" : "NORMAL";
  const disasterLevel = disasterEval.priorityLevel;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in">
      {/* Citizen Notification Modal */}
      <CitizenNotificationCenter isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />

      {/* Top Banner: Citizen Welcome & Location Status */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white p-6 md:p-8 shadow-xl border border-emerald-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Citizen Portal
              </span>
              <span className="text-xs text-white/70 font-medium">
                Welcome back, {user?.name || "Neighbor"}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Community Environmental Safety Hub
            </h1>
            <p className="text-emerald-100/80 text-sm mt-1 max-w-2xl leading-relaxed">
              Instant neighborhood weather, air quality, real-time verified disaster alerts, and community volunteer initiatives for your area.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setIsNotifOpen(true)}
              className="relative px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95"
              title="View all notifications"
            >
              <span className="material-symbols-outlined text-[18px]">notifications</span>
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={requestCurrentLocation}
              disabled={locationStatus === "locating"}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-60"
              title="Detect live GPS location"
            >
              <span className="material-symbols-outlined text-[18px]">
                {locationStatus === "locating" ? "sync" : "my_location"}
              </span>
              <span>{locationStatus === "locating" ? "Locating..." : currentLocation}</span>
            </button>
          </div>
        </div>

        {/* Status Indicator Bar (Req 11, 12) */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-white/70">Weather Status</div>
              <div className="text-xs font-bold text-white mt-0.5">{currentCondition}</div>
            </div>
            <StatusIndicator level={weatherLevel} size="xs" showIcon={false} />
          </div>

          <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-white/70">Air Quality</div>
              <div className="text-xs font-bold text-white mt-0.5">AQI {currentAqi} ({aqiCategory})</div>
            </div>
            <StatusIndicator level={aqiLevel} size="xs" showIcon={false} />
          </div>

          <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-white/70">Disaster Alert</div>
              <div className="text-xs font-bold text-white mt-0.5 truncate max-w-[90px]">
                {disasterEval.isInUserArea ? "Palayamkottai" : "All Clear"}
              </div>
            </div>
            <StatusIndicator level={disasterLevel} size="xs" showIcon={false} />
          </div>

          <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-white/70">Community Events</div>
              <div className="text-xs font-bold text-white mt-0.5">1 Active in KTC Nagar</div>
            </div>
            <StatusIndicator level="NORMAL" size="xs" showIcon={false} />
          </div>
        </div>
      </div>

      {/* Participation Feedback Alert */}
      {participationFeedback && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 text-sm font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600">how_to_reg</span>
            <span>{participationFeedback}</span>
          </div>
          <button
            onClick={() => setParticipationFeedback("")}
            className="text-xs underline hover:opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* SECTION: 10 Immediate Answers Quick Grid (Main Goal) */}
      <section className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">help_center</span>
            </div>
            <h2 className="font-headline-sm text-base font-bold text-on-surface">
              Citizen Quick Status – 10 Immediate Answers
            </h2>
          </div>
          <span className="text-[11px] text-on-surface-variant font-medium hidden sm:inline">
            Location: <strong>{currentLocation}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
          {/* Q1: Weather now */}
          <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-xl mt-0.5">wb_sunny</span>
            <div className="flex-1">
              <div className="font-bold text-on-surface">1. What is the weather now?</div>
              <div className="text-on-surface-variant mt-0.5">
                <strong>{currentTemp}°C</strong>, {currentCondition}. Humidity: {currentHum}%, Wind: {currentWind} km/h.
              </div>
            </div>
          </div>

          {/* Q2: Air Quality now */}
          <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-start gap-3">
            <span className="material-symbols-outlined text-emerald-600 text-xl mt-0.5">air</span>
            <div className="flex-1">
              <div className="font-bold text-on-surface">2. What is the air quality now?</div>
              <div className="text-on-surface-variant mt-0.5">
                AQI: <strong>{currentAqi} ({aqiCategory})</strong>. Clean and safe for outdoor activities.
              </div>
            </div>
          </div>

          {/* Q3: Anything important near me */}
          <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-start gap-3">
            <span className="material-symbols-outlined text-amber-600 text-xl mt-0.5">radar</span>
            <div className="flex-1">
              <div className="font-bold text-on-surface">3. Important happening near me?</div>
              <div className="text-on-surface-variant mt-0.5">
                Community clean-up drive at KTC Nagar &amp; flood monitoring in Palayamkottai basin.
              </div>
            </div>
          </div>

          {/* Q4: Community events to join */}
          <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-start gap-3">
            <span className="material-symbols-outlined text-teal-600 text-xl mt-0.5">groups</span>
            <div className="flex-1">
              <div className="font-bold text-on-surface">4. Community events to join?</div>
              <div className="text-on-surface-variant mt-0.5">
                <strong>KTC Nagar Clean-up Event</strong> today 4:00 PM (42 participants confirmed).
              </div>
            </div>
          </div>

          {/* Q5: New notifications */}
          <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-start gap-3">
            <span className="material-symbols-outlined text-purple-600 text-xl mt-0.5">notifications</span>
            <div className="flex-1">
              <div className="font-bold text-on-surface">5. Do I have new notifications?</div>
              <div className="text-on-surface-variant mt-0.5">
                <strong>{unreadCount} unread</strong> alerts regarding floods, events, and rain.
              </div>
            </div>
          </div>

          {/* Q6: Disaster warning in my area */}
          <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-start gap-3">
            <span className="material-symbols-outlined text-red-600 text-xl mt-0.5">warning</span>
            <div className="flex-1">
              <div className="font-bold text-on-surface">6. Disaster warning in area?</div>
              <div className="text-on-surface-variant mt-0.5">
                {disasterEval.isInUserArea ? (
                  <span className="text-red-600 font-bold">Yes – Active Flood Warning in Palayamkottai</span>
                ) : (
                  <span>Nearby alert reported in Palayamkottai (~{disasterEval.distanceKm || "4.2"} km away)</span>
                )}
              </div>
            </div>
          </div>

          {/* Q7: Where exactly is the warning? */}
          <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-start gap-3">
            <span className="material-symbols-outlined text-red-600 text-xl mt-0.5">pin_drop</span>
            <div className="flex-1">
              <div className="font-bold text-on-surface">7. Where exactly is the warning?</div>
              <div className="text-on-surface-variant mt-0.5">
                Palayamkottai Low-Lying Corridor &amp; Thamirabarani River Basin.
              </div>
            </div>
          </div>

          {/* Q8: How serious is it? */}
          <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-start gap-3">
            <span className="material-symbols-outlined text-orange-600 text-xl mt-0.5">crisis_alert</span>
            <div className="flex-1">
              <div className="font-bold text-on-surface">8. How serious is it?</div>
              <div className="text-on-surface-variant mt-0.5 flex items-center gap-1.5">
                <StatusIndicator level="EMERGENCY" size="xs" labelOverride="Emergency 🔴" />
                <span>High surge risk</span>
              </div>
            </div>
          </div>

          {/* Q9: When was warning issued? */}
          <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-start gap-3">
            <span className="material-symbols-outlined text-blue-600 text-xl mt-0.5">schedule</span>
            <div className="flex-1">
              <div className="font-bold text-on-surface">9. When was warning issued?</div>
              <div className="text-on-surface-variant mt-0.5">
                Today at 2:30 PM (25 mins ago) • Duration: Next 6 hours.
              </div>
            </div>
          </div>

          {/* Q10: What should I do now? */}
          <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-start gap-3 md:col-span-2 lg:col-span-3 bg-red-500/5 border-red-500/20">
            <span className="material-symbols-outlined text-red-600 text-xl mt-0.5">shield</span>
            <div className="flex-1">
              <div className="font-bold text-red-800 dark:text-red-300">10. What should I do now?</div>
              <div className="text-on-surface-variant mt-0.5">
                Avoid canal banks and underpasses. Stay on upper floors. Keep emergency helpline handy: <strong>1077</strong> (District Disaster Center).
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: Weather & Air Quality Highlights (Req 2 & Req 3) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weather Card */}
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-2xl">wb_sunny</span>
                <h3 className="font-headline-sm text-base font-bold text-on-surface">
                  Weather Information
                </h3>
              </div>
              <StatusIndicator level={weatherLevel} size="xs" />
            </div>

            <div className="flex items-center justify-between my-4">
              <div>
                <div className="text-4xl font-extrabold text-on-surface leading-none">
                  {currentTemp}°C
                </div>
                <div className="text-sm font-semibold text-on-surface-variant mt-1">
                  {currentCondition}
                </div>
                <div className="text-xs text-on-surface-variant/80 mt-0.5">
                  📍 {currentLocation}
                </div>
              </div>

              <div className="text-right space-y-1 text-xs text-on-surface-variant">
                <div>💧 Humidity: <strong>{currentHum}%</strong></div>
                <div>💨 Wind: <strong>{currentWind} km/h</strong></div>
                <div>🌧️ Rainfall: <strong>{rainMm} mm ({rainChance})</strong></div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface-variant mb-4">
              <div className="font-bold text-on-surface mb-0.5">Weather Advisory</div>
              Light to moderate convective rain showers anticipated around late afternoon. Drainage nominal.
            </div>
          </div>

          <button
            onClick={() => navigate("/weather")}
            className="w-full py-2.5 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <span>View Complete Weather Forecast &amp; Radar</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        {/* Air Quality Card */}
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-500 text-2xl">air</span>
                <h3 className="font-headline-sm text-base font-bold text-on-surface">
                  Air Quality (AQI)
                </h3>
              </div>
              <StatusIndicator level={aqiLevel} size="xs" />
            </div>

            <div className="flex items-center justify-between my-4">
              <div>
                <div className="text-4xl font-extrabold text-emerald-600 leading-none">
                  {currentAqi}
                </div>
                <div className="text-sm font-semibold text-on-surface mt-1">
                  {aqiCategory} Air Quality
                </div>
                <div className="text-xs text-on-surface-variant/80 mt-0.5">
                  Safe for outdoor physical exertion
                </div>
              </div>

              <div className="text-right space-y-1 text-xs text-on-surface-variant font-mono">
                <div>PM2.5: <strong>12.4 µg/m³</strong></div>
                <div>PM10: <strong>24.1 µg/m³</strong></div>
                <div>NO2: <strong>14.8 µg/m³</strong></div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface-variant mb-4">
              <div className="font-bold text-on-surface mb-0.5">Citizen Health Advisory</div>
              Air quality is in the safe zone. Normal outdoor activities, jogging, and school sports are safe.
            </div>
          </div>

          <button
            onClick={() => navigate("/air-quality")}
            className="w-full py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-600 text-emerald-800 dark:text-emerald-300 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <span>View Full Air Quality &amp; Pollutants Breakdown</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* SECTION: Real-Time Location-Based Disaster Alert (Req 8, 9, 10, 11) */}
      <section className="bg-surface-container-lowest border border-red-500/30 rounded-3xl p-6 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-500/15 text-red-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">flood</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-base font-bold text-on-surface">
                Real-Time Disaster Management &amp; Location Alert
              </h3>
              <p className="text-xs text-on-surface-variant">
                Live sensor validated disaster telemetry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatusIndicator
              level={disasterEval.priorityLevel}
              labelOverride={disasterEval.priorityLabel}
              size="sm"
            />
          </div>
        </div>

        {/* Disaster Dossier Box (Req 8) */}
        <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-4">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-600 text-white uppercase tracking-wider">
                  ⚠️ {disasterAlert.type}
                </span>
                <span className="text-xs font-bold text-on-surface">
                  Affected Area: <strong>{disasterAlert.affectedArea}</strong>
                </span>
              </div>
              <h4 className="text-base font-extrabold text-on-surface mt-1">
                ⚠️ Flood Warning – Palayamkottai
              </h4>
              <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed max-w-3xl">
                A flood warning has been issued for the Palayamkottai area. Rapid drainage runoff and Thamirabarani river basin surge exceed threshold by 0.65m.
              </p>
            </div>

            <div className="bg-white/80 dark:bg-surface-container-high p-3 rounded-xl border border-red-500/20 text-xs shrink-0 space-y-1">
              <div>Status: <span className="font-bold text-red-600">Active</span></div>
              <div>Severity: <span className="font-bold text-red-600">High / Emergency 🔴</span></div>
              <div>Issued: <span className="font-medium text-on-surface">{disasterAlert.issuedAt}</span></div>
              <div>Duration: <span className="font-medium text-on-surface">{disasterAlert.expectedDuration}</span></div>
              <div>Source: <span className="font-semibold text-primary">{disasterAlert.source}</span></div>
              <div>Distance: <span className="font-bold text-on-surface">{disasterEval.formattedDistance}</span></div>
            </div>
          </div>

          {/* Recommended Safety Actions (Req 8) */}
          <div className="pt-3 border-t border-red-500/20">
            <div className="text-xs font-bold text-red-800 dark:text-red-300 mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">health_and_safety</span>
              Recommended Citizen Safety Actions:
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-on-surface-variant">
              {disasterAlert.recommendedActions.map((action, i) => (
                <li key={i} className="flex items-start gap-2 bg-surface-container-lowest p-2 rounded-lg border border-red-500/20">
                  <span className="text-red-600 font-bold">•</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-on-surface-variant">
              Verified Data Source: Tamil Nadu Disaster Management Authority
            </span>
            <button
              onClick={() => navigate("/disaster-alerts?highlight=palayamkottai")}
              className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
            >
              <span>View Full Disaster Operations Map</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION: Community Events & Activities (Req 4, 5, 7) */}
      <section className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-700 dark:text-teal-300 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">groups</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-base font-bold text-on-surface">
                Community Activities &amp; Events
              </h3>
              <p className="text-xs text-on-surface-variant">
                Participate in neighborhood safety drives and environmental initiatives
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "all"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              All Events ({communityEvents.length})
            </button>
            <button
              onClick={() => setActiveTab("my-events")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "my-events"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              My Participated Events ({participatedEventIds.size})
            </button>
          </div>
        </div>

        {/* Event Notification Callout Banner (Req 5) */}
        <div className="mb-6 p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-teal-700 dark:text-teal-300 text-2xl mt-0.5">
              campaign
            </span>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-600 text-white uppercase">
                  Event Notification
                </span>
                <span className="text-xs font-bold text-teal-900 dark:text-teal-200">
                  Community Event Happening Today!
                </span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                «Community Event Alert: A community event is happening at <strong>KTC Nagar today at 4:00 PM</strong>. Tap below to view details and confirm participation.»
              </p>
            </div>
          </div>
          <button
            onClick={() => handleParticipate(101)}
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-xs shrink-0"
          >
            {participatedEventIds.has(101) ? "Confirmed ✅" : "Participate Now"}
          </button>
        </div>

        {/* Events Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {communityEvents
            .filter((ev) => (activeTab === "my-events" ? participatedEventIds.has(ev.id) : true))
            .map((event) => {
              const isJoined = participatedEventIds.has(event.id);
              const isCompleted = event.status === "Completed";

              return (
                <div
                  key={event.id}
                  className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                    isJoined
                      ? "bg-teal-500/5 border-teal-500/40 shadow-sm"
                      : "bg-surface-container-low border-outline-variant/30 hover:border-outline-variant"
                  }`}
                >
                  <div>
                    {/* Header: Status & Joined badge */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isCompleted
                            ? "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        }`}
                      >
                        {event.status}
                      </span>

                      {isJoined && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-600 text-white flex items-center gap-1 shadow-xs">
                          <span className="material-symbols-outlined text-[13px]">check_circle</span>
                          Participation Confirmed
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-on-surface mb-2 leading-snug">
                      {event.title}
                    </h4>

                    {/* Metadata */}
                    <div className="space-y-1 text-xs text-on-surface-variant mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[15px] text-primary">location_on</span>
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[15px] text-primary">calendar_today</span>
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[15px] text-primary">schedule</span>
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[15px] text-teal-600">person</span>
                        <span>
                          <strong>{event.participantsCount}</strong> {event.participantType}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
                      {event.description}
                    </p>

                    {/* Additional Instructions */}
                    {event.instructions && (
                      <div className="p-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-[11px] text-on-surface-variant mb-3">
                        <span className="font-bold text-on-surface">Instructions: </span>
                        {event.instructions}
                      </div>
                    )}

                    {/* Outcome for completed events */}
                    {event.results && (
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-800 dark:text-emerald-200 mb-3 font-medium">
                        <span className="font-bold">Results/Outcome: </span>
                        {event.results}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-outline-variant/30 flex items-center gap-2">
                    {!isCompleted ? (
                      <button
                        onClick={() => handleParticipate(event.id)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 ${
                          isJoined
                            ? "bg-teal-700 text-white hover:bg-teal-800"
                            : "bg-primary text-white hover:bg-primary/90"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {isJoined ? "how_to_reg" : "group_add"}
                        </span>
                        <span>{isJoined ? "Participation Confirmed (Tap to change)" : "Participate / Join Event"}</span>
                      </button>
                    ) : (
                      <div className="w-full text-center py-1.5 text-xs font-semibold text-on-surface-variant bg-surface-container rounded-lg">
                        Event Completed
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        <div className="mt-6 pt-4 border-t border-outline-variant/30 flex items-center justify-between">
          <span className="text-xs text-on-surface-variant">
            Have a neighborhood issue to log? Submit a community environmental report.
          </span>
          <button
            onClick={() => navigate("/community-reports")}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>View All Community Reports</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </section>
    </div>
  );
}
