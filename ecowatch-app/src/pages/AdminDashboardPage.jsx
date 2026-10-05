import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { useSatelliteData } from "../context/SatelliteDataContext";
import { apiRequest } from "../lib/api";

const ROLES = ["System Admin", "Analyst", "Scientist", "Emergency Responder", "Inspector"];

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user, isReady, login } = useAuth();
  const { currentLocation } = useSatelliteData();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Broadcast Alert Form State
  const [broadcastType, setBroadcastType] = useState("Flood Inundation Warning");
  const [broadcastSeverity, setBroadcastSeverity] = useState("HIGH");
  const [broadcastRegion, setBroadcastRegion] = useState(currentLocation || "Monitored Regional Sector");
  const [broadcastDesc, setBroadcastDesc] = useState("Tidal surge and torrential monsoon runoff threatening urban stormwater sluices.");
  const [broadcastLoading, setBroadcastLoading] = useState(false);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiRequest("/admin/overview");
      setOverview(data);
    } catch (err) {
      setError(err.message || "Failed to load administrative overview.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isReady) return;
    if (user?.role === "System Admin") {
      fetchOverview();
    } else {
      setLoading(false);
    }
  }, [isReady, user?.role]);

  const handleQuickAdminLogin = async () => {
    try {
      setLoading(true);
      setError("");
      const success = await login({ email: "24104031@nec.edu.in", password: "admin123" });
      if (success) {
        setActionSuccess("Authenticated as System Administrator (Subhasree Pitchaiya).");
      }
    } catch (err) {
      setError(err.message || "Failed to authenticate admin.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setActionSuccess("");
      await apiRequest(`/admin/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      });
      setActionSuccess(`User role updated to ${newRole} successfully.`);
      fetchOverview();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusChange = async (userId, currentStatus) => {
    try {
      setActionSuccess("");
      const nextStatus = currentStatus === "Suspended" ? "Active" : "Suspended";
      await apiRequest(`/admin/users/${userId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      setActionSuccess(`User status changed to ${nextStatus}.`);
      fetchOverview();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (userId, email) => {
    if (!window.confirm(`Are you sure you want to permanently remove user: ${email}?`)) return;
    try {
      setActionSuccess("");
      await apiRequest(`/admin/users/${userId}`, {
        method: "DELETE",
      });
      setActionSuccess(`User ${email} removed successfully.`);
      fetchOverview();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBroadcastAlert = async (e) => {
    e.preventDefault();
    try {
      setBroadcastLoading(true);
      setError("");
      setActionSuccess("");
      await apiRequest("/admin/alerts/broadcast", {
        method: "POST",
        body: JSON.stringify({
          type: broadcastType,
          severity: broadcastSeverity,
          region: broadcastRegion,
          description: broadcastDesc,
        }),
      });
      setActionSuccess("Emergency broadcast alert dispatched across all regional nodes!");
      fetchOverview();
    } catch (err) {
      setError(err.message);
    } finally {
      setBroadcastLoading(false);
    }
  };

  const filteredUsers = (overview?.users || []).filter((u) => {
    const q = search.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q)) ||
      (u.organization && u.organization.toLowerCase().includes(q))
    );
  });

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-7xl space-y-6 pb-16">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/40 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-primary text-2xl">admin_panel_settings</span>
              <p className="text-xs font-bold uppercase tracking-widest text-primary">System Administration Center</p>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-on-surface">Platform Governance & Mission Operations</h1>
            <p className="text-sm text-on-surface-variant">Global telemetry status, role-based access control, and incident dispatch</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchOverview}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant text-sm font-semibold hover:bg-surface-container transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              Refresh
            </button>
            <Link
              to="/settings"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-container transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              System Config
            </Link>
          </div>
        </header>

        {/* Notifications */}
        {actionSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-sm font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600">check_circle</span>
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess("")} className="text-emerald-700 hover:text-emerald-900">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-error/10 border border-error/30 text-error text-sm font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">warning</span>
              <span>{error}</span>
            </div>
            <button onClick={() => setError("")} className="text-error hover:opacity-80">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        )}

        {/* Access Check */}
        {!isReady || loading ? (
          <div className="p-16 text-center">
            <span className="animate-spin material-symbols-outlined text-primary text-4xl mb-3">progress_activity</span>
            <p className="text-sm font-medium text-on-surface-variant">Connecting to EcoWatch Administration Engine...</p>
          </div>
        ) : !user ? (
          <section className="max-w-2xl mx-auto py-10 px-4" role="alert">
            <div className="glass-card p-8 rounded-2xl soft-shadow border border-outline-variant/60 text-center space-y-5 bg-surface-container-lowest">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
                <span className="material-symbols-outlined text-4xl">admin_panel_settings</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-on-surface">Admin Portal Login Required</h2>
                <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
                  The Platform Governance &amp; Mission Operations Command Center is strictly restricted to authorized System Administrators. Please log in with administrative credentials to access user management, audit logs, and orbital downlink configurations.
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleQuickAdminLogin}
                  className="px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  Sign In as System Admin (1-Click)
                </button>
                <Link
                  to="/signin"
                  className="px-5 py-2.5 bg-surface-container-low border border-outline-variant text-on-surface rounded-xl font-semibold text-sm hover:bg-surface-container transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">login</span>
                  Sign In with Other Account
                </Link>
              </div>
            </div>
          </section>
        ) : user.role !== "System Admin" ? (
          <section className="max-w-2xl mx-auto py-10 px-4" role="alert">
            <div className="glass-card p-8 rounded-2xl soft-shadow border border-error/30 text-center space-y-5 bg-surface-container-lowest">
              <div className="w-16 h-16 rounded-2xl bg-error/10 border border-error/20 flex items-center justify-center mx-auto text-error">
                <span className="material-symbols-outlined text-4xl">gpp_bad</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-on-surface">Access Restricted: Administrator Privileges Required</h2>
                <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
                  The Mission Operations Command Center requires <strong className="text-primary font-bold">System Admin</strong> security clearance. Your current active account does not have permission to govern users or dispatch emergency alerts.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 flex items-center justify-between text-left max-w-md mx-auto">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {user.name ? user.name[0].toUpperCase() : "U"}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">{user.name || user.email}</p>
                    <p className="text-xs text-on-surface-variant">{user.email}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  {user.role || "User"}
                </span>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleQuickAdminLogin}
                  className="px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                  Switch to Admin (Subhasree Pitchaiya)
                </button>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="px-5 py-2.5 bg-surface-container-low border border-outline-variant text-on-surface rounded-xl font-semibold text-sm hover:bg-surface-container transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">dashboard</span>
                  Return to Dashboard
                </button>
              </div>
            </div>
          </section>
        ) : (
          <>
            {/* KPI Metrics Bento */}
            <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5" aria-label="Command Center Metrics">
              <div className="p-4 rounded-xl border border-outline-variant/40 bg-surface-container-lowest shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Total Users</span>
                <p className="text-2xl font-bold text-on-surface mt-1">{overview?.metrics.totalUsers ?? 0}</p>
                <span className="text-[11px] text-emerald-600 font-medium">Multi-tenant ready</span>
              </div>
              <div className="p-4 rounded-xl border border-outline-variant/40 bg-surface-container-lowest shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">System Admins</span>
                <p className="text-2xl font-bold text-primary mt-1">{overview?.metrics.administrators ?? 0}</p>
                <span className="text-[11px] text-on-surface-variant">Full root access</span>
              </div>
              <div className="p-4 rounded-xl border border-outline-variant/40 bg-surface-container-lowest shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Analysts</span>
                <p className="text-2xl font-bold text-blue-600 mt-1">{overview?.metrics.analysts ?? 0}</p>
                <span className="text-[11px] text-on-surface-variant">Telemetry operators</span>
              </div>
              <div className="p-4 rounded-xl border border-outline-variant/40 bg-surface-container-lowest shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Responders</span>
                <p className="text-2xl font-bold text-amber-600 mt-1">{overview?.metrics.responders ?? 0}</p>
                <span className="text-[11px] text-on-surface-variant">Rapid mitigation</span>
              </div>
              <div className="p-4 rounded-xl border border-outline-variant/40 bg-surface-container-lowest shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600">Constellation</span>
                <p className="text-2xl font-bold text-teal-600 mt-1">4 Feeds</p>
                <span className="text-[11px] text-on-surface-variant">Copernicus / NASA</span>
              </div>
              <div className="p-4 rounded-xl border border-outline-variant/40 bg-surface-container-lowest shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Active Alerts</span>
                <p className="text-2xl font-bold text-rose-600 mt-1">{overview?.metrics.activeAlerts ?? 0}</p>
                <span className="text-[11px] text-on-surface-variant">Live incident watch</span>
              </div>
            </section>

            {/* Middle Grid: User Management Table & Emergency Dispatcher */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* User Governance Table (2 cols) */}
              <section className="lg:col-span-2 border border-outline-variant/40 rounded-2xl bg-surface-container-lowest p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">manage_accounts</span>
                      User Identity & Access Management
                    </h2>
                    <p className="text-xs text-on-surface-variant">Manage permissions, role assignments, and account statuses</p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                      search
                    </span>
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface border border-outline-variant rounded-lg outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-outline-variant/30">
                  <table className="w-full min-w-[650px] text-left text-xs">
                    <thead className="bg-surface-container text-on-surface-variant font-semibold">
                      <tr>
                        <th className="px-3 py-2.5">User</th>
                        <th className="px-3 py-2.5">Role (Live Change)</th>
                        <th className="px-3 py-2.5">Organization</th>
                        <th className="px-3 py-2.5">Status</th>
                        <th className="px-3 py-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20">
                      {filteredUsers.map((acc) => {
                        const isSelf = String(acc.id) === String(user?.id);
                        return (
                          <tr key={acc.id} className="hover:bg-surface-container/40 transition-colors">
                            <td className="px-3 py-2.5">
                              <div className="font-semibold text-on-surface">{acc.name}</div>
                              <div className="text-[11px] text-on-surface-variant font-mono">{acc.email}</div>
                            </td>
                            <td className="px-3 py-2.5">
                              <select
                                value={acc.role}
                                onChange={(e) => handleRoleChange(acc.id, e.target.value)}
                                disabled={isSelf}
                                className="bg-surface border border-outline-variant rounded px-2 py-1 text-xs font-medium text-on-surface outline-none focus:border-primary cursor-pointer disabled:opacity-50"
                              >
                                {ROLES.map((r) => (
                                  <option key={r} value={r}>{r}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-3 py-2.5 text-on-surface-variant">
                              {acc.organization || "EcoWatch Global"}
                            </td>
                            <td className="px-3 py-2.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  acc.status === "Suspended"
                                    ? "bg-rose-100 text-rose-700"
                                    : "bg-emerald-100 text-emerald-700"
                                }`}
                              >
                                {acc.status || "Active"}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-right space-x-2">
                              {!isSelf && (
                                <>
                                  <button
                                    onClick={() => handleStatusChange(acc.id, acc.status)}
                                    title={acc.status === "Suspended" ? "Activate User" : "Suspend User"}
                                    className="p-1 rounded text-on-surface-variant hover:text-amber-600 hover:bg-surface-container"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">
                                      {acc.status === "Suspended" ? "check_circle" : "pause_circle"}
                                    </span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(acc.id, acc.email)}
                                    title="Delete User"
                                    className="p-1 rounded text-on-surface-variant hover:text-error hover:bg-error/10"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                  </button>
                                </>
                              )}
                              {isSelf && (
                                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">You</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Emergency Alert Broadcast Dispatcher (1 col) */}
              <section className="border border-outline-variant/40 rounded-2xl bg-surface-container-lowest p-5 shadow-sm space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-error">campaign</span>
                    Emergency Broadcast Dispatcher
                  </h2>
                  <p className="text-xs text-on-surface-variant">Transmit high-priority warnings to all active analyst dashboards</p>
                </div>

                <form onSubmit={handleBroadcastAlert} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                      Hazard Classification
                    </label>
                    <input
                      type="text"
                      value={broadcastType}
                      onChange={(e) => setBroadcastType(e.target.value)}
                      placeholder="e.g. Flash Flood Advisory"
                      className="w-full px-3 py-1.5 text-xs bg-surface border border-outline-variant rounded-lg outline-none focus:border-primary"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                        Severity
                      </label>
                      <select
                        value={broadcastSeverity}
                        onChange={(e) => setBroadcastSeverity(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs bg-surface border border-outline-variant rounded-lg outline-none focus:border-primary"
                      >
                        <option value="CRITICAL">CRITICAL</option>
                        <option value="HIGH">HIGH</option>
                        <option value="ADVISORY">ADVISORY</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                        Target Region
                      </label>
                      <input
                        type="text"
                        value={broadcastRegion}
                        onChange={(e) => setBroadcastRegion(e.target.value)}
                        placeholder="e.g. Chennai Coast"
                        className="w-full px-2 py-1.5 text-xs bg-surface border border-outline-variant rounded-lg outline-none focus:border-primary"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                      Incident Telemetry & Protocol
                    </label>
                    <textarea
                      rows={3}
                      value={broadcastDesc}
                      onChange={(e) => setBroadcastDesc(e.target.value)}
                      placeholder="Describe sensor threshold breach..."
                      className="w-full px-3 py-1.5 text-xs bg-surface border border-outline-variant rounded-lg outline-none focus:border-primary"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={broadcastLoading}
                    className="w-full py-2 bg-error text-white font-semibold text-xs rounded-lg hover:bg-error-container hover:text-on-error-container transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
                  >
                    {broadcastLoading ? (
                      <>
                        <span className="animate-spin material-symbols-outlined text-[16px]">progress_activity</span>
                        <span>Dispatching...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[16px]">send</span>
                        <span>Dispatch Regional Alert</span>
                      </>
                    )}
                  </button>
                </form>
              </section>
            </div>

            {/* Lower Grid: Satellite Constellation Status & Live Audit Trail */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Satellite Constellation Status */}
              <section className="border border-outline-variant/40 rounded-2xl bg-surface-container-lowest p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-teal-600">satellite_alt</span>
                    Planetary Constellation Telemetry Feeds
                  </h2>
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                    All Downlinks Nominal
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {(overview?.satellites || [
                    { name: "Sentinel-2 (MSI)", orbit: "#882", sensor: "Multispectral 10m", status: "Nominal" },
                    { name: "Landsat-9 (TIRS-2)", orbit: "#412", sensor: "Thermal Infrared", status: "Nominal" },
                    { name: "GOES-16 (ABI)", orbit: "Geostationary", sensor: "16-Band Atmospheric", status: "Nominal" },
                    { name: "Sentinel-5P (TROPOMI)", orbit: "#104", sensor: "Atmospheric Chemistry", status: "Nominal" },
                  ]).map((sat) => (
                    <div key={sat.name} className="p-3 rounded-xl border border-outline-variant/30 bg-surface flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-on-surface">{sat.name}</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <div className="text-[11px] text-on-surface-variant mt-1">Orbit: {sat.orbit}</div>
                      <div className="text-[10px] text-primary font-medium mt-1">{sat.sensor}</div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Live Audit Log Stream */}
              <section className="border border-outline-variant/40 rounded-2xl bg-surface-container-lowest p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">history</span>
                    Security & Operations Audit Trail
                  </h2>
                  <span className="text-[11px] text-on-surface-variant font-mono">Live Append</span>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-2 pr-1 divide-y divide-outline-variant/20">
                  {(overview?.auditLogs || []).map((log) => (
                    <div key={log.id} className="pt-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-on-surface">{log.action}</span>
                        <span className="text-[10px] text-on-surface-variant font-mono">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">{log.details}</p>
                      <span className="text-[10px] text-primary/80 font-mono">Actor: {log.actor}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}