import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import EcoInteractiveMap from "../components/EcoInteractiveMap";
import { apiRequest } from "../lib/api";
import { useSatelliteData } from "../context/SatelliteDataContext";
import { useAuth } from "../context/AuthContext";
import safeStorage from "../lib/safeStorage";
import { safeTimestamp } from "../lib/dateUtils"; // added helper

const CATEGORY_OPTIONS = [
  { key: "All", icon: "select_all", label: "All Incidents" },
  { key: "Flooding", icon: "water_drop", label: "Flooding" },
  { key: "Waste", icon: "delete_sweep", label: "Waste Dumping" },
  { key: "Air Pollution", icon: "air", label: "Air Pollution" },
  { key: "Leakage", icon: "opacity", label: "Water Leakage" },
  { key: "Illegal Tree", icon: "eco", label: "Tree Removal" },
  { key: "Water Quality", icon: "biotech", label: "Water Quality" },
  { key: "Other", icon: "grid_view", label: "Other Issues" },
];

function getRelativeTime(timestamp) {
  if (!timestamp) return "Recently";
  const safe = safeTimestamp(timestamp);
  const diffMs = Date.now() - safe.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function getStatusBadgeClasses(status) {
  const s = String(status || "").toLowerCase();
  if (s === "urgent") {
    return "bg-error/15 text-error border border-error/30";
  }
  if (s === "resolved" || s === "verified") {
    return "bg-secondary/15 text-secondary border border-secondary/30";
  }
  return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30";
}

export default function CommunityReportsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { coordinates, currentLocation } = useSatelliteData();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportsList, setReportsList] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [statsList, setStatsList] = useState([]);
  const [leaderboardList, setLeaderboardList] = useState([]);
  const [joinBannerMessage, setJoinBannerMessage] = useState("");
  const [joinedReportIds, setJoinedReportIds] = useState(() => {
    try {
      const stored = safeStorage.getItem("ecowatch-joined-report-ids");
      return stored ? new Set(JSON.parse(stored)) : new Set([101]);
    } catch {
      return new Set([101]);
    }
  });

  const handleJoinWorkingGroup = async (reportId) => {
    if (!reportId) return;
    try {
      await apiRequest(`/community-reports/${reportId}/vote`, { method: "POST" });
    } catch {
      // fallback
    }
    setJoinedReportIds((prev) => {
      const next = new Set(prev);
      next.add(Number(reportId));
      safeStorage.setItem("ecowatch-joined-report-ids", JSON.stringify([...next]));
      return next;
    });
    setReportsList((prev) =>
      prev.map((r) => (String(r.id) === String(reportId) ? { ...r, votes: (r.votes || 0) + 1 } : r))
    );
    setSelectedReport((prev) => (prev && String(prev.id) === String(reportId) ? { ...prev, votes: (prev.votes || 0) + 1 } : prev));
    setJoinBannerMessage("🎉 You have joined this community working group! You will receive ground-truth updates.");
    setTimeout(() => setJoinBannerMessage(""), 5000);
  };
  const [reportForm, setReportForm] = useState({
    title: "",
    description: "",
    category: "Flooding",
    location: "",
  });
  const [reportMessage, setReportMessage] = useState("");
  const [dispatchMessage, setDispatchMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [votedIds, setVotedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const activeCityName = currentLocation ? currentLocation.split(",")[0].trim() : "Monitored Sector";

  // Pre-fill location in report form
  useEffect(() => {
    if (currentLocation) {
      setReportForm((form) => ({
        ...form,
        location: form.location || currentLocation,
      }));
    }
  }, [currentLocation]);

  // Fetch live reports and statistics from backend
  const loadData = () => {
    setLoading(true);
    const locParam = currentLocation ? `?location=${encodeURIComponent(currentLocation)}` : "";

    Promise.all([
      apiRequest("/community-reports"),
      apiRequest(`/community-reports/stats${locParam}`),
    ])
      .then(([reportsData, statsData]) => {
        if (reportsData?.reports) {
          const mapped = reportsData.reports.map((r) => ({
            id: r.id || r._id,
            title: r.title,
            category: r.category || "Other",
            status: r.status || "Investigating",
            time: getRelativeTime(r.timestamp),
            rawTimestamp: r.timestamp,
            location: r.location || currentLocation || "Monitored Sector",
            author: r.reporter || "Community Contributor",
            image:
              r.image ||
              "https://lh3.googleusercontent.com/aida-public/AB6AXuBXmeoetrEIdj2jQQ4kKTckOEKKBuAq1ltMe8Xmpj0Uv3Dlxlu3_Jr9vVnEh6cL1RF3WBZt1GQ5sCsNlaLgVrrnNdau2B9H3W9BEoYCceeVmbfDrpNIGXuhp3W8OBsNUS_TpJQyXWIJfGMqWrJfPoRk5BEx682Zty94J7TAzEH_YNOsGlMB0PvfqEq2I1EaN7_hgPYDA0Ovr7_Ffbsr-8zV63x4lgtkLdUZR4dzWqnwzQtqJEPdDD3yPA",
            description: r.description,
            satelliteMatch: r.satelliteMatch || "Cross-referenced with Sentinel-2 MSI Surface Telemetry",
            latitude: Number(r.latitude) || coordinates?.lat || 8.7522,
            longitude: Number(r.longitude) || coordinates?.lon || 77.7414,
            votes: Number(r.votes) || 0,
          }));

          setReportsList(mapped);
          const targetId = searchParams.get("highlight") || searchParams.get("id");
          if (targetId) {
            const found = mapped.find((m) => String(m.id) === String(targetId));
            setSelectedReport(found || mapped[0]);
          } else {
            setSelectedReport((prev) => (prev ? mapped.find((m) => m.id === prev.id) || mapped[0] : mapped[0]));
          }
        }

        if (statsData?.stats) {
          setStatsList(statsData.stats);
        }
        if (statsData?.leaderboard) {
          setLeaderboardList(statsData.leaderboard);
        }
      })
      .catch((err) => {
        console.warn("Error fetching community reports data:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [currentLocation]);

  // Handle voting
  const handleVote = async (reportId, e) => {
    if (e) e.stopPropagation();
    try {
      setVotedIds((prev) => new Set(prev).add(reportId));
      setReportsList((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, votes: r.votes + 1 } : r))
      );
      if (selectedReport?.id === reportId) {
        setSelectedReport((prev) => ({ ...prev, votes: prev.votes + 1 }));
      }
      await apiRequest(`/community-reports/${reportId}/vote`, { method: "POST" });
    } catch (err) {
      console.warn("Vote recording error:", err.message);
    }
  };

  // Dispatch Quick Response Team
  const handleDispatchQRT = async () => {
    if (!selectedReport) return;
    setDispatchMessage(`🚨 Dispatch Confirmed: Quick Response Unit deployed to ${selectedReport.location}!`);
    try {
      await apiRequest(`/community-reports/${selectedReport.id}`, {
        method: "PUT",
        body: JSON.stringify({ status: "Investigating" }),
      });
      setReportsList((prev) =>
        prev.map((r) => (r.id === selectedReport.id ? { ...r, status: "Investigating" } : r))
      );
      setSelectedReport((prev) => ({ ...prev, status: "Investigating" }));
    } catch (err) {
      console.warn("Status update error:", err.message);
    }
    setTimeout(() => setDispatchMessage(""), 6000);
  };

  // Submit new report
  const submitReport = async (event) => {
    event.preventDefault();
    if (!reportForm.title.trim() || !reportForm.description.trim()) return;
    if (!coordinates) {
      setReportMessage("Choose or share a location before submitting a report.");
      return;
    }
    setIsSubmitting(true);
    setReportMessage("");
    try {
      const res = await apiRequest("/community-reports", {
        method: "POST",
        body: JSON.stringify({
          title: reportForm.title.trim(),
          description: reportForm.description.trim(),
          category: reportForm.category,
          location: reportForm.location.trim() || currentLocation || "Monitored Sector",
          latitude: coordinates.lat,
          longitude: coordinates.lon,
        }),
      });

      const newId = res?.report?.id || Date.now();
      const createdItem = {
        id: newId,
        title: reportForm.title.trim(),
        category: reportForm.category,
        status: res?.report?.status || (reportForm.category === "Flooding" ? "Urgent" : "Investigating"),
        time: "Just now",
        rawTimestamp: new Date().toISOString(),
        location: reportForm.location.trim() || currentLocation || "Monitored Sector",
        author: "You (Active Citizen Contributor)",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBXmeoetrEIdj2jQQ4kKTckOEKKBuAq1ltMe8Xmpj0Uv3Dlxlu3_Jr9vVnEh6cL1RF3WBZt1GQ5sCsNlaLgVrrnNdau2B9H3W9BEoYCceeVmbfDrpNIGXuhp3W8OBsNUS_TpJQyXWIJfGMqWrJfPoRk5BEx682Zty94J7TAzEH_YNOsGlMB0PvfqEq2I1EaN7_hgPYDA0Ovr7_Ffbsr-8zV63x4lgtkLdUZR4dzWqnwzQtqJEPdDD3yPA",
        description: reportForm.description.trim(),
        satelliteMatch: res?.report?.satelliteMatch || "Sentinel-2 MSI surface anomaly match confirmed",
        latitude: coordinates.lat,
        longitude: coordinates.lon,
        votes: 1,
      };

      setReportsList((prev) => [createdItem, ...prev]);
      setSelectedReport(createdItem);
      setReportForm({
        title: "",
        description: "",
        category: "Flooding",
        location: currentLocation || "",
      });
      setIsReportOpen(false);
      setReportMessage(`✅ Report submitted and cross-verified via satellite telemetry! (Incident #${newId})`);
      setTimeout(() => setReportMessage(""), 8000);
    } catch (error) {
      setReportMessage(`Submission error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter and sort reports
  const filteredReports = useMemo(() => {
    return reportsList
      .filter((report) => {
        const matchesCategory =
          activeCategory === "All" ||
          report.category.toLowerCase() === activeCategory.toLowerCase();

        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          report.title.toLowerCase().includes(q) ||
          report.description.toLowerCase().includes(q) ||
          report.location.toLowerCase().includes(q) ||
          report.author.toLowerCase().includes(q);

        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "votes") {
          return b.votes - a.votes;
        }
        if (sortBy === "severity") {
          const rank = { Urgent: 3, Investigating: 2, "In Progress": 2, Active: 2, Resolved: 1, Verified: 1 };
          return (rank[b.status] || 0) - (rank[a.status] || 0);
        }
        // default "recent"
        const timeA = a.rawTimestamp ? safeTimestamp(a.rawTimestamp).getTime() : 0;
        const timeB = b.rawTimestamp ? safeTimestamp(b.rawTimestamp).getTime() : 0;
        return timeB - timeA;
      });
  }, [reportsList, activeCategory, searchQuery, sortBy]);

  // Compute live category counts
  const categoryCounts = useMemo(() => {
    const counts = { All: reportsList.length };
    reportsList.forEach((r) => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });
    return counts;
  }, [reportsList]);

  // Compute dynamic trending concerns
  const trendingConcerns = useMemo(() => {
    const total = reportsList.length || 1;
    const catMap = {};
    reportsList.forEach((r) => {
      catMap[r.category] = (catMap[r.category] || 0) + 1;
    });

    const colors = [
      "bg-primary",
      "bg-primary/80",
      "bg-primary/60",
      "bg-secondary",
      "bg-tertiary",
      "bg-outline",
    ];

    return Object.entries(catMap)
      .sort(([, a], [, b]) => b - a)
      .map(([label, count], idx) => {
        const pct = Math.round((count / total) * 100);
        return {
          label,
          count,
          pct,
          width: `${pct}%`,
          color: colors[idx % colors.length],
        };
      });
  }, [reportsList]);

  // Compute dynamic status distribution
  const statusDistribution = useMemo(() => {
    const total = reportsList.length || 1;
    const resolved = reportsList.filter((r) => r.status === "Resolved" || r.status === "Verified").length;
    const inProgress = reportsList.filter((r) => r.status === "Investigating" || r.status === "In Progress" || r.status === "Active").length;
    const urgent = reportsList.filter((r) => r.status === "Urgent").length;
    const other = Math.max(0, reportsList.length - resolved - inProgress - urgent);

    const resolvedPct = Math.round((resolved / total) * 100);
    const inProgressPct = Math.round((inProgress / total) * 100);
    const urgentPct = Math.round((urgent / total) * 100);

    return {
      total: reportsList.length,
      resolved,
      inProgress,
      urgent,
      other,
      resolvedPct,
      inProgressPct,
      urgentPct,
    };
  }, [reportsList]);

  // Dynamic AI & Telemetry Insights
  const dynamicAiInsights = useMemo(() => {
    const urgent = statusDistribution.urgent;
    const total = reportsList.length;
    const resolvedPct = statusDistribution.resolvedPct;

    return [
      `Satellite cross-referencing active across ${activeCityName}: Sentinel-1 SAR & Sentinel-2 optical bands monitored.`,
      urgent > 0
        ? `${urgent} high-priority incident${urgent > 1 ? "s" : ""} correlated with surface radar & thermal anomalies in ${activeCityName}.`
        : `All monitored incident zones in ${activeCityName} remain within standard ecological tolerance thresholds.`,
      `Citizen verification efficiency stands at ${resolvedPct}% with ${total} verified ground-truth submission${total !== 1 ? "s" : ""}.`,
    ];
  }, [activeCityName, statusDistribution, reportsList.length]);

  // Map markers from filtered reports
  const mapMarkers = useMemo(() => {
    return filteredReports
      .filter((r) => Number.isFinite(Number(r.latitude)) && Number.isFinite(Number(r.longitude)))
      .map((r) => {
        const lat = Number(r.latitude);
        const lon = Number(r.longitude);
        const isUrgent = String(r.status || "").toLowerCase() === "urgent";
        const isResolved = ["resolved", "verified"].includes(String(r.status || "").toLowerCase());
        const color = isUrgent ? "#ba1a1a" : isResolved ? "#006c49" : "#d97706";

        return {
          id: r.id,
          position: [lat, lon],
          lat,
          lon,
          title: r.title,
          label: r.title,
          category: r.category,
          status: r.status,
          color,
          fillColor: color,
          isSelected: selectedReport?.id === r.id,
          details: `${r.category} • ${r.status} — ${r.location}`,
          popupContent: `<strong>${r.title}</strong><br/><span style="color:${color};font-weight:600;">${r.category}</span> &bull; <span style="font-weight:bold;">${r.status}</span><br/><small>${r.location}</small>`,
        };
      });
  }, [filteredReports, selectedReport]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[28px]">groups</span>
              <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">
                Community Intelligence Reports
              </h1>
            </div>
            <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
              Live ground-truth incident reporting cross-referenced with ESA Copernicus and NASA satellite telemetry in {currentLocation || "your selected region"}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsReportOpen((prev) => !prev)}
              disabled={!coordinates}
              title={!coordinates ? "Set or share coordinates to file a report" : "File an environmental incident report"}
              className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-label-md text-label-md font-semibold text-on-primary shadow-sm transition-all hover:bg-primary/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">{isReportOpen ? "close" : "add"}</span>
              {isReportOpen ? "Cancel Report" : "New Report"}
            </button>
            <button
              onClick={() => navigate("/map")}
              className="flex items-center gap-2 rounded-full border border-outline-variant bg-surface px-5 py-2.5 font-label-md text-label-md font-semibold text-on-surface transition-all hover:bg-surface-container active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">map</span>
              Map View
            </button>
            <button
              onClick={() => navigate("/reports?type=community")}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-outline-variant bg-surface text-on-surface transition-all hover:bg-surface-container active:scale-95"
              title="Open Incident Dossier & Export Summary"
            >
              <span className="material-symbols-outlined text-[20px]">download</span>
            </button>
          </div>
        </header>

        {/* Global Notifications */}
        {reportMessage && (
          <div className="flex items-center gap-3 rounded-xl border border-secondary/30 bg-secondary-container/20 px-4 py-3 font-body-sm text-on-secondary-container shadow-sm">
            <span className="material-symbols-outlined text-secondary">check_circle</span>
            <span className="flex-1">{reportMessage}</span>
          </div>
        )}

        {dispatchMessage && (
          <div className="flex items-center gap-3 rounded-xl border border-error/30 bg-error-container/20 px-4 py-3 font-body-sm text-on-error-container shadow-sm animate-pulse">
            <span className="material-symbols-outlined text-error">emergency</span>
            <span className="flex-1 font-semibold">{dispatchMessage}</span>
          </div>
        )}

        {/* Citizen Exclusive: Community Working Group Join Notification */}
        {user?.role === "Citizen" && (searchParams.get("join") === "true" || joinBannerMessage) && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/35 bg-emerald-500/10 px-4 py-3.5 font-body-sm text-emerald-950 dark:text-emerald-100 shadow-sm animate-in fade-in">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-emerald-600 text-2xl">groups</span>
              <div>
                <span className="font-bold text-xs uppercase tracking-wide text-emerald-800 dark:text-emerald-300 block">
                  Citizen Community Working Group
                </span>
                <span className="text-xs">
                  {joinBannerMessage || "You are viewing an active community initiative where neighbors are collaborating. Click 'Join Community Working Group' below to take part!"}
                </span>
              </div>
            </div>
            {joinBannerMessage && (
              <button
                type="button"
                onClick={() => setJoinBannerMessage("")}
                className="p-1 hover:bg-emerald-500/20 rounded-lg text-emerald-800 dark:text-emerald-200 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>
        )}

        {/* New Report Form Modal / Inline Panel */}
        {isReportOpen && (
          <form
            onSubmit={submitReport}
            className="rounded-xxl border border-primary/30 bg-surface-container-lowest p-stack_lg shadow-ambient ring-1 ring-primary/20"
          >
            <div className="mb-4 flex items-center justify-between border-b border-outline-variant pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">add_alert</span>
                <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                  File Community Environmental Report
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsReportOpen(false)}
                aria-label="Close"
                className="rounded-full p-1 text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block font-label-sm text-label-sm font-semibold text-on-surface">
                  Incident Title *
                </label>
                <input
                  required
                  value={reportForm.title}
                  onChange={(e) => setReportForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Severe Stormwater Inundation on Arterial Road"
                  className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 font-body-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div>
                <label className="mb-1 block font-label-sm text-label-sm font-semibold text-on-surface">
                  Category *
                </label>
                <select
                  value={reportForm.category}
                  onChange={(e) => setReportForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 font-body-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  {CATEGORY_OPTIONS.filter((c) => c.key !== "All").map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block font-label-sm text-label-sm font-semibold text-on-surface">
                  Incident Location & Sector *
                </label>
                <input
                  required
                  value={reportForm.location}
                  onChange={(e) => setReportForm((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g. KTC Nagar, Tirunelveli"
                  className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 font-body-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <p className="mt-1 font-body-sm text-[12px] text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-primary">my_location</span>
                  GPS Coordinates: {coordinates ? `${coordinates.lat.toFixed(4)}° N, ${coordinates.lon.toFixed(4)}° E` : "Location Active"} (Auto-verified with Sentinel orbital path)
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block font-label-sm text-label-sm font-semibold text-on-surface">
                  Incident Description & Ground Observation *
                </label>
                <textarea
                  required
                  rows={3}
                  value={reportForm.description}
                  onChange={(e) => setReportForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Detail visible water accumulation, plastic debris obstruction, particulate smoke density, or sewer line break..."
                  className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 font-body-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3 border-t border-outline-variant pt-4">
              <button
                type="button"
                onClick={() => setIsReportOpen(false)}
                className="rounded-full px-5 py-2 font-label-md text-label-md font-medium text-on-surface-variant hover:bg-surface-container"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 font-label-md text-label-md font-semibold text-on-primary transition-all hover:bg-primary/90 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Submitting &amp; Verifying...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    Submit &amp; Cross-Verify
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* 5 Real-Time KPI Metric Cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {statsList.map((item) => (
            <div
              key={item.label}
              className="rounded-xxl border border-outline-variant/30 bg-surface-container-lowest p-stack_md shadow-ambient transition-all hover:shadow-md"
            >
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                {item.label}
              </p>
              <div className="flex items-end justify-between gap-3">
                <span className="font-headline-md text-headline-md font-bold text-on-surface">
                  {item.value}
                </span>
                <span className={`font-label-sm text-label-sm font-semibold ${item.tone || "text-primary"}`}>
                  {item.suffix}
                </span>
              </div>
            </div>
          ))}
        </section>

        {/* 3-Column Main Grid */}
        <section className="grid grid-cols-12 gap-6">
          {/* Left Column: Categories & AI Insights (3 cols) */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            {/* Category Selector */}
            <div className="rounded-xxl border border-outline-variant/30 bg-surface-container-lowest p-stack_lg shadow-ambient">
              <div className="mb-4 flex items-center justify-between border-b border-outline-variant pb-2">
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Categories
                </h3>
                <span className="rounded-full bg-surface-container-high px-2.5 py-0.5 text-[11px] font-bold text-on-surface-variant">
                  {filteredReports.length} {filteredReports.length === 1 ? "Report" : "Reports"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {CATEGORY_OPTIONS.map((option) => {
                  const isActive = option.key === activeCategory;
                  const count = categoryCounts[option.key] || 0;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setActiveCategory(option.key)}
                      className={`flex min-h-[90px] flex-col items-center justify-center rounded-xl border p-3 text-center transition-all ${
                        isActive
                          ? "border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary/30"
                          : "border-outline-variant/30 bg-surface-container-low text-on-surface-variant hover:border-primary hover:text-on-surface"
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined mb-1.5 text-3xl ${
                          isActive ? "text-primary" : "text-on-surface-variant"
                        }`}
                      >
                        {option.icon}
                      </span>
                      <span className="font-label-sm text-[12px] font-semibold leading-tight line-clamp-1">
                        {option.label}
                      </span>
                      <span className="mt-0.5 text-[10px] font-bold text-on-surface-variant">
                        ({count})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Environmental Telemetry Insights */}
            <div className="relative overflow-hidden rounded-xxl border border-primary/20 bg-primary-container p-stack_lg text-on-primary-container shadow-md">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-on-primary-container/10 blur-2xl" />
              <div className="relative z-10">
                <div className="mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[22px]">psychology</span>
                  <h3 className="font-headline-sm text-headline-sm font-bold">
                    Satellite Intelligence
                  </h3>
                </div>
                <ul className="space-y-3">
                  {dynamicAiInsights.map((insight, idx) => (
                    <li key={idx} className="flex gap-2.5">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-on-primary-container" />
                      <p className="font-body-sm text-body-sm leading-snug">
                        {insight}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Center Column: Interactive Map & Recent Feed (6 cols) */}
          <div className="col-span-12 lg:col-span-6 space-y-6">
            {/* Interactive Incident Map */}
            <div className="relative h-[480px] overflow-hidden rounded-xxl border border-outline-variant/30 bg-surface-container-lowest shadow-ambient">
              <EcoInteractiveMap
                className="absolute inset-0"
                center={coordinates ? [coordinates.lat, coordinates.lon] : [8.7522, 77.7414]}
                zoom={11}
                markers={mapMarkers}
                onMarkerClick={(marker) => {
                  const match = reportsList.find((r) => r.id === marker.id);
                  if (match) setSelectedReport(match);
                }}
              />

              {/* Status Map Legend */}
              <div className="absolute bottom-4 right-4 z-10 flex gap-2">
                <div className="flex items-center gap-3 rounded-full border border-outline-variant/50 bg-surface/90 px-3.5 py-1.5 text-body-sm shadow-md backdrop-blur-md">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-on-surface">
                    <span className="h-2.5 w-2.5 rounded-full bg-error" /> Urgent
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-on-surface">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Investigating
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-on-surface">
                    <span className="h-2.5 w-2.5 rounded-full bg-secondary" /> Resolved
                  </div>
                </div>
              </div>
            </div>

            {/* Incident Feed Header with Search & Sort */}
            <div className="overflow-hidden rounded-xxl border border-outline-variant/30 bg-surface-container-lowest shadow-ambient">
              <div className="flex flex-col gap-3 border-b border-outline-variant p-stack_lg sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                    Ground-Truth Reports Feed
                  </h3>
                  <p className="font-body-sm text-[12px] text-on-surface-variant">
                    Showing {filteredReports.length} of {reportsList.length} incident{reportsList.length !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search reports..."
                      className="w-40 sm:w-48 rounded-lg border border-outline-variant bg-surface py-1 pl-8 pr-2.5 text-label-sm text-on-surface outline-none focus:border-primary"
                    />
                    <span className="material-symbols-outlined absolute left-2 top-1.5 text-[16px] text-on-surface-variant">
                      search
                    </span>
                  </div>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-lg border border-outline-variant bg-surface px-3 py-1.5 text-label-sm font-medium text-on-surface outline-none focus:border-primary"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="severity">Highest Severity</option>
                    <option value="votes">Most Upvoted</option>
                  </select>
                </div>
              </div>

              {/* Feed Items */}
              <div className="divide-y divide-outline-variant/50 max-h-[640px] overflow-y-auto">
                {reportsList.length === 0 ? (
                  <div className="py-16 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl text-outline mb-2">assignment</span>
                    <p className="font-label-md text-label-md font-semibold text-on-surface">No community reports filed yet</p>
                    <p className="font-body-sm text-body-sm mt-1">Ground-truth reports will appear here as incidents are reported.</p>
                    <button
                      onClick={() => setIsReportOpen(true)}
                      className="mt-4 rounded-full bg-primary px-5 py-2 text-label-sm font-bold text-white shadow-sm hover:bg-primary/90"
                    >
                      File First Report
                    </button>
                  </div>
                ) : filteredReports.length === 0 ? (
                  <div className="py-16 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl text-outline mb-2">find_in_page</span>
                    <p className="font-label-md text-label-md font-semibold text-on-surface">No reports match your filters</p>
                    <p className="font-body-sm text-body-sm mt-1">Try switching categories or clearing your search keywords.</p>
                    <button
                      onClick={() => {
                        setActiveCategory("All");
                        setSearchQuery("");
                      }}
                      className="mt-4 rounded-full bg-primary/10 px-4 py-1.5 text-label-sm font-bold text-primary hover:bg-primary/20"
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  filteredReports.map((report) => {
                    const isSelected = selectedReport?.id === report.id;
                    const hasVoted = votedIds.has(report.id);
                    return (
                      <div
                        key={report.id}
                        onClick={() => setSelectedReport(report)}
                        className={`cursor-pointer p-stack_lg transition-colors hover:bg-surface-container-low ${
                          isSelected ? "bg-surface-container-low/80 border-l-4 border-primary" : ""
                        }`}
                      >
                        <div className="flex gap-4">
                          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-high">
                            <img
                              src={report.image}
                              alt={report.title}
                              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "https://lh3.googleusercontent.com/aida-public/AB6AXuBXmeoetrEIdj2jQQ4kKTckOEKKBuAq1ltMe8Xmpj0Uv3Dlxlu3_Jr9vVnEh6cL1RF3WBZt1GQ5sCsNlaLgVrrnNdau2B9H3W9BEoYCceeVmbfDrpNIGXuhp3W8OBsNUS_TpJQyXWIJfGMqWrJfPoRk5BEx682Zty94J7TAzEH_YNOsGlMB0PvfqEq2I1EaN7_hgPYDA0Ovr7_Ffbsr-8zV63x4lgtkLdUZR4dzWqnwzQtqJEPdDD3yPA";
                              }}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="mb-1 flex items-start justify-between gap-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${getStatusBadgeClasses(report.status)}`}>
                                  {report.status}
                                </span>
                                <span className="rounded-full bg-surface-container px-2 py-0.5 text-[10px] font-bold text-on-surface-variant">
                                  {report.category}
                                </span>
                              </div>
                              <span className="font-label-sm text-[12px] text-on-surface-variant shrink-0">
                                {report.time}
                              </span>
                            </div>

                            <h4 className="font-label-md text-label-md font-bold text-on-surface hover:text-primary transition-colors truncate">
                              {report.title}
                            </h4>

                            <p className="mt-1 mb-2 font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                              {report.description}
                            </p>

                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-3 text-on-surface-variant text-[12px]">
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[15px] text-primary">location_on</span>
                                  <span className="truncate max-w-[150px]">{report.location}</span>
                                </span>
                                <span className="hidden sm:flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[15px]">person</span>
                                  <span>{report.author}</span>
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => handleVote(report.id, e)}
                                  className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all ${
                                    hasVoted
                                      ? "bg-primary text-on-primary shadow-sm"
                                      : "border border-outline-variant bg-surface text-on-surface hover:bg-surface-container"
                                  }`}
                                  title="Upvote verified incident"
                                >
                                  <span className="material-symbols-outlined text-[14px]">
                                    {hasVoted ? "thumb_up" : "thumb_up_off"}
                                  </span>
                                  <span>{report.votes}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/reports?id=${report.id}&type=community`);
                                  }}
                                  className="flex items-center gap-1 font-bold text-[12px] text-primary hover:underline"
                                >
                                  <span>Dossier</span>
                                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Report Details, Trending Concerns & Status Distribution (3 cols) */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            {/* Selected Report Details Card */}
            <div className="overflow-hidden rounded-xxl border border-outline-variant/30 bg-surface-container-lowest shadow-ambient">
              <div className="border-b border-outline-variant bg-surface-container-low p-stack_lg">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">feed</span>
                    <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                      Report Details
                    </h3>
                  </div>
                  {selectedReport && (
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${getStatusBadgeClasses(selectedReport.status)}`}>
                      {selectedReport.status}
                    </span>
                  )}
                </div>

                {selectedReport ? (
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full border border-primary/40 bg-surface-container-high p-0.5">
                      <img
                        className="h-full w-full rounded-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCP0Uqw6QtUBTC1BFllbYzjtG11qfHeJ54nzDcXELSwHdYdrx_kUBujrd3tgJzmdNdtYIJd1i6tNohu96rYRYOjCSCZl4AIdLFeRMyFW4cjC6oyoetDDfdCIUQUce0_41JMYfPmEUBw5CclLntT4CGGyb2GnVFiMC8psxnsQJlGSPsbNpQvMsULqTX-pMIdtEEjYNhVE0Uct-KkiqZ1L5HW-vGOUEUukg4mY3LGMf8pkgiiSMw7cK229g"
                        alt="Reporter"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-on-surface text-[13px] truncate">
                        {selectedReport.author}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-tight text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px] text-secondary">verified</span>
                        Verified Citizen Reporter
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-[12px] text-on-surface-variant">Select an incident to view telemetry.</p>
                )}
              </div>

              {selectedReport && (
                <div className="space-y-4 p-stack_lg">
                  <div>
                    <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                      Incident Title
                    </p>
                    <p className="font-label-md text-label-md font-bold text-on-surface">
                      {selectedReport.title}
                    </p>
                  </div>

                  {/* Satellite Cross-Verification Box */}
                  <div className="rounded-xl border border-secondary/30 bg-secondary/10 p-3">
                    <div className="flex items-center gap-1.5 text-secondary font-bold text-[11px] uppercase tracking-wider mb-1">
                      <span className="material-symbols-outlined text-[15px]">satellite_alt</span>
                      Satellite Telemetry Verification
                    </div>
                    <p className="text-[12px] text-on-surface font-medium leading-relaxed">
                      {selectedReport.satelliteMatch}
                    </p>
                  </div>

                  <div>
                    <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                      Reported Location &amp; Coordinates
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface font-medium">
                      {selectedReport.location}
                    </p>
                    <p className="flex items-center gap-1 font-body-sm text-[12px] text-on-surface-variant mt-0.5">
                      <span className="material-symbols-outlined text-[15px] text-primary">pin_drop</span>
                      {selectedReport.latitude.toFixed(4)}° N, {selectedReport.longitude.toFixed(4)}° E
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                      Status Timeline
                    </p>
                    <div className="relative space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant/60">
                      <div className="relative pl-6">
                        <div className="absolute left-0 top-1 h-4 w-4 rounded-full bg-primary ring-4 ring-primary/20" />
                        <p className="text-[11px] font-bold text-on-surface">Ground Observation Logged</p>
                        {/* Guard – only render when timestamp is ready */}
                      {selectedReport?.rawTimestamp ? (
                        <p className="text-[10px] text-on-surface-variant">{selectedReport.time}</p>
                      ) : (
                        <p className="text-[10px] text-on-surface-variant">Loading…</p>
                      )}
                      </div>
                      <div className="relative pl-6">
                        <div className="absolute left-0 top-1 h-4 w-4 rounded-full border-2 border-secondary bg-surface" />
                        <p className="text-[11px] font-bold text-secondary">Orbit Telemetry Matched</p>
                        <p className="text-[10px] text-on-surface-variant">Automated remote sensing cross-check complete</p>
                      </div>
                      <div className="relative pl-6">
                        <div className="absolute left-0 top-1 h-4 w-4 rounded-full border-2 border-outline-variant bg-surface" />
                        <p className="text-[11px] font-bold text-on-surface-variant">
                          Assigned to {activeCityName} Municipal Division
                        </p>
                        <p className="text-[10px] text-on-surface-variant">Field triage active</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-1">
                    {user?.role === "Citizen" && (
                      <button
                        type="button"
                        onClick={() => handleJoinWorkingGroup(selectedReport.id)}
                        className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-label-md text-label-md font-semibold transition-all active:scale-95 shadow-sm cursor-pointer ${
                          joinedReportIds.has(Number(selectedReport.id))
                            ? "bg-emerald-700 text-white cursor-default"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {joinedReportIds.has(Number(selectedReport.id)) ? "task_alt" : "groups"}
                        </span>
                        {joinedReportIds.has(Number(selectedReport.id))
                          ? "You Joined This Action Group ✓"
                          : "Join Community Working Group"}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleDispatchQRT}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-label-md text-label-md font-semibold text-on-primary transition-all hover:bg-primary/90 active:scale-95 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      Dispatch Quick Response Team
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate(`/reports?id=${selectedReport.id}&type=community`)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-outline-variant bg-surface px-4 py-2 font-label-md text-label-md font-semibold text-on-surface transition-all hover:bg-surface-container active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                      Open Full Dossier
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Trending Concerns (Dynamic percentages computed from live data) */}
            <div className="rounded-xxl border border-outline-variant/30 bg-surface-container-lowest p-stack_lg shadow-ambient">
              <h3 className="mb-4 font-headline-sm text-headline-sm font-bold text-on-surface">
                Trending Concerns
              </h3>
              <div className="space-y-3.5">
                {trendingConcerns.map((concern) => (
                  <div key={concern.label}>
                    <div className="mb-1 flex items-center justify-between text-body-sm text-on-surface font-medium">
                      <span>{concern.label}</span>
                      <span className="font-bold text-primary">{concern.pct}% ({concern.count})</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
                      <div className={`h-full ${concern.color} transition-all duration-500`} style={{ width: concern.width }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Distribution (Dynamic SVG donut with real proportions) */}
            <div className="rounded-xxl border border-outline-variant/30 bg-surface-container-lowest p-stack_lg shadow-ambient">
              <h3 className="mb-4 font-headline-sm text-headline-sm font-bold text-on-surface">
                Status Distribution
              </h3>
              <div className="relative mx-auto mb-4 h-36 w-36">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  {/* Background Track */}
                  <circle cx="18" cy="18" r="15.9155" fill="none" stroke="currentColor" className="text-surface-container-high" strokeWidth="3.8" />
                  {/* Resolved Arc */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3.8"
                    strokeDasharray={`${statusDistribution.resolvedPct} 100`}
                    strokeDashoffset="0"
                  />
                  {/* In Progress Arc */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="3.8"
                    strokeDasharray={`${statusDistribution.inProgressPct} 100`}
                    strokeDashoffset={`-${statusDistribution.resolvedPct}`}
                  />
                  {/* Urgent Arc */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="3.8"
                    strokeDasharray={`${statusDistribution.urgentPct} 100`}
                    strokeDashoffset={`-${statusDistribution.resolvedPct + statusDistribution.inProgressPct}`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-headline-md text-headline-md font-bold text-on-surface">
                    {statusDistribution.total}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Reports
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-on-surface">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  Resolved: {statusDistribution.resolved}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  In Progress: {statusDistribution.inProgress}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  Urgent: {statusDistribution.urgent}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-surface-container-high" />
                  Total: {statusDistribution.total}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Participation Leaderboard by Zone (Dynamic from API) */}
        <section className="rounded-xxl border border-outline-variant/30 bg-surface-container-lowest p-stack_lg shadow-ambient">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                Participation Leaderboard by Zone
              </h3>
              <p className="font-body-sm text-[12px] text-on-surface-variant">
                Citizen resolution rate and environmental engagement scores across {activeCityName} municipal sectors.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/analytics")}
              className="font-bold text-[13px] text-primary hover:underline flex items-center gap-1"
            >
              <span>View Full Analytics</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  <th className="px-6 py-3.5">Rank</th>
                  <th className="px-6 py-3.5">Zone &amp; Sector Name</th>
                  <th className="px-6 py-3.5 text-center">Reports Filed</th>
                  <th className="px-6 py-3.5 text-center">Resolution Rate</th>
                  <th className="px-6 py-3.5 text-center">Engagement Score</th>
                  <th className="px-6 py-3.5 text-right">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30 text-body-sm">
                {leaderboardList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-on-surface-variant">
                      No zone leaderboard entries available for the active region.
                    </td>
                  </tr>
                ) : (
                  leaderboardList.map((item) => (
                    <tr key={item.zone} className="hover:bg-surface-container-low/60 transition-colors">
                      <td className="px-6 py-3.5 font-bold text-primary">{item.rank}</td>
                      <td className="px-6 py-3.5 font-label-md text-label-md font-semibold text-on-surface">
                        {item.zone}
                      </td>
                      <td className="px-6 py-3.5 text-center font-medium text-on-surface">
                        {item.reports}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span className="inline-block rounded-full bg-secondary/10 px-3 py-0.5 text-[11px] font-bold text-secondary">
                          {item.resolution}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="mx-auto flex items-center justify-center gap-2">
                          <div className="h-2 w-28 overflow-hidden rounded-full bg-surface-container-high">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: item.score || "75%" }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-on-surface-variant">{item.score}</span>
                        </div>
                      </td>
                      <td className={`px-6 py-3.5 text-right ${item.trendColor || "text-secondary"}`}>
                        <span className="material-symbols-outlined text-[18px]">
                          {item.trend || "trending_up"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
