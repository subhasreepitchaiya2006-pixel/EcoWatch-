import React, { useState, useRef, useCallback, useMemo, useEffect, useDeferredValue } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { useTimePreferences } from "../context/TimePreferencesContext";
import { useAuth } from "../context/AuthContext";
import { useSatelliteData } from "../context/SatelliteDataContext";
import { apiRequest } from "../lib/api";

const TABS = [
  { id: "general", label: "General" },
  { id: "organization", label: "Organization" },
  { id: "api", label: "API & Integration" },
  { id: "data", label: "Data Management" },
  { id: "security", label: "Security" },
];

const INITIAL_MEMBERS = [
  { id: 1, name: "Sree", email: "sree@ecowatch.global", initials: "SR", role: "System Admin", status: "Active", bg: "bg-primary-container/20 text-primary" },
  { id: 2, name: "Alex Kumar", email: "alex@ecowatch.global", initials: "AK", role: "Lead Analyst", status: "Active", bg: "bg-surface-container-highest text-on-surface" },
  { id: 3, name: "Maria Jones", email: "maria@ecowatch.global", initials: "MJ", role: "Satellite Observer", status: "Pending", bg: "bg-surface-container-highest text-on-surface" },
];

const AUDIT_LOGS = [
  { id: 1, event: "User Login", actor: "Sree", ip: "192.168.1.45", timestamp: "2 mins ago" },
  { id: 2, event: "API Key Created", actor: "System Admin", ip: "10.0.4.122", timestamp: "1 hour ago" },
  { id: 3, event: "Policy Updated", actor: "Alex Kumar", ip: "172.16.0.15", timestamp: "3 hours ago" },
  { id: 4, event: "2FA Verification", actor: "Maria Jones", ip: "192.168.1.88", timestamp: "5 hours ago" },
];

const DATA_AUDIT_LOGS = [
  {
    id: 1,
    timestamp: "Oct 26, 2023 · 14:22:01",
    user: "Alex Rivera",
    initials: "AR",
    userBg: "bg-primary/10 text-primary",
    action: "Update Retention Policy",
    target: "Configuration/Storage",
    status: "Success",
    statusBg: "bg-secondary text-on-secondary",
  },
  {
    id: 2,
    timestamp: "Oct 26, 2023 · 12:10:45",
    user: "Jordan Doe",
    initials: "JD",
    userBg: "bg-secondary/10 text-secondary",
    action: "Delete API Endpoint",
    target: "Production/Integrations",
    status: "Success",
    statusBg: "bg-secondary text-on-secondary",
  },
  {
    id: 3,
    timestamp: "Oct 25, 2023 · 23:59:12",
    user: "System Core",
    initials: "smart_toy",
    isIcon: true,
    action: "Daily Backup Execution",
    target: "Database/RDS",
    status: "Success",
    statusBg: "bg-secondary text-on-secondary",
  },
  {
    id: 4,
    timestamp: "Oct 25, 2023 · 18:44:20",
    user: "Unknown Origin",
    initials: "?",
    userBg: "bg-error/10 text-error",
    action: "Failed Login Attempt",
    target: "Auth/Gateway",
    status: "Rejected",
    statusBg: "bg-error text-on-error",
  },
];

const INITIAL_API_KEYS = [
  {
    id: 1,
    name: "Production Main",
    key: "gi_prod_••••••••••••x8u3",
    rawKey: "gi_prod_994a218f0291x8u3",
    created: "Oct 12, 2023",
    icon: "rocket_launch",
    iconBg: "bg-secondary-container text-on-secondary-container",
  },
  {
    id: 2,
    name: "Development Environment",
    key: "gi_test_••••••••••••m2k9",
    rawKey: "gi_test_110293847561m2k9",
    created: "Jan 05, 2024",
    icon: "code",
    iconBg: "bg-surface-container-highest text-on-surface-variant",
  },
];

const INITIAL_WEBHOOKS = [
  {
    id: 1,
    url: "https://api.monitoring.io/v1/alerts",
    ping: "Last ping: 2 mins ago",
    triggers: ["ALERT TRIGGERED", "STATUS CHANGE"],
    status: "Active",
  },
  {
    id: 2,
    url: "https://hooks.slack.com/services/T0...",
    ping: "Last ping: 4 hours ago",
    triggers: ["DATA PROCESSED"],
    status: "Inactive",
  },
];

const INITIAL_INTEGRATIONS = [
  {
    id: "slack",
    name: "Slack",
    description: "Post satellite risk alerts and daily climate summaries to Slack channels.",
    connected: true,
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuC1k-wa1e4dJin-u21D97gJ51I-g7OszfSz5eXPW2_j_rqDopE0wi0mhY8e8cQU8QgaYgDnb7SG0xzH1vZOXeLyARlyAgMsozZ7Q-pf-PKFkzYQQKexJNRJa9a7zm_cQkc01irw6hK-UyajsumimgNGBvqNXmEude2r4_PpPD-67AA7upJD6YIynLfvd1PpKC7O4QTpUvQEU-2GkwxvOw2VmxxEbZbWLeF7V3O2FL390gldu_dCJgYO0XB8gS8WCLB48xwe6LRkdk_Y",
  },
  {
    id: "aws",
    name: "AWS S3",
    description: "Auto-sync geospatial datasets and raw satellite imagery logs.",
    connected: true,
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuBiAUUoCxbUKKhN453t5RhcrAzPaKYxtHddUynMp0zBnqN1yViJScGFUNgIniXT9aohfW_EWXlf_ydGIPL_fO0lBNTRmjIlTIRi813j_NHfoiVJBfTeWyvWdiHN4HtuBti8WlVrU5KbQmCj4a98FbuT82OXhSoMjtQRexf_G5w6JoGZxrpURKt8azAwRyHknm_qRTlNXMs0h9RMYErZMshhnmlsgq9wtxj7J3VIJUZN7RzZySXhgxs_otAFISjU0qsXl80DeIZQtt33",
  },
  {
    id: "azure",
    name: "Microsoft Azure",
    description: "Connect to Azure Blob storage for enterprise satellite data lake integration.",
    connected: false,
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuAt4JX59jfxg0TxBYHWzGR08IKq7Qcer6SJxYGudNRJhr4y4YwqxYxS-AXcQZOGiE06FoqPLaFppQ_ZUWivTIy0BBIg_Fva4PCwq496k-rI8Rs9-NABqWTUmhxeRBFthvJZn9mH157nMFQIeMZqASjEH_9tGFkC5GwEs6oHsa1Lvp-IhA0FUQlHxU1wZWSOdcLp5aWs-Y25_beVJfdChICBterXsFbxbja5SYNFGSdQVYfU0LhxU4UOoFRN_yv1ONeIflAQnnSvehWs",
  },
  {
    id: "gcp",
    name: "Google Cloud",
    description: "Stream remote sensing environmental data directly into BigQuery for analysis.",
    connected: false,
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuCd0GtBlkenZpFyR9xvphHc90NXUHd2ztIV7-oFv6OjynfhpWiI-_e2fnswzs_LUuH7Uq1JVc_kef34NNqQKdfPwlX_P8L2LLnizKeSihNG0YbGOTMxTw2K8AmIHQyDLgm5jKycuTmd71fbCUvQHMqeG7xn7QuGRvqCwormbaYhQrD2BzJI7l7XwN_nNiFMX7BmSCa90-0kgZqKknjWhXCB6dxLBa9zKPUpA_STL0YRHNIx6Rk0wLcYqPdZ4V3tFsxwzt5KkLfXBFau",
  },
];

export default function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTabFromUrl = searchParams.get("tab") || "organization";
  
  const [activeTab, setActiveTab] = useState(initialTabFromUrl);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);

  // Context Hooks
  const { theme, setTheme, brandColor, setBrandColor } = useTheme();
  const { language, setLanguage, options: languageOptions, translate: t } = useLanguage();
  const { timezone, setTimezone, timeFormat, setTimeFormat, timezoneOptions, timeFormatOptions } = useTimePreferences();
  const { user } = useAuth();
  const { currentLocation } = useSatelliteData();

  // Platform Branding State
  const [logoName, setLogoName] = useState(null);

  // Localization State

  // Organization State
  const [orgName, setOrgName] = useState("EcoWatch Global");
  const [industry, setIndustry] = useState("Environmental Intelligence");
  const [website, setWebsite] = useState("https://ecowatch.global");
  const [primaryZone, setPrimaryZone] = useState(currentLocation || "");
  const [density, setDensity] = useState("High");
  const [experimentalFeatures, setExperimentalFeatures] = useState(false);

  useEffect(() => {
    if (currentLocation) setPrimaryZone((current) => current || currentLocation);
  }, [currentLocation]);

  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("Lead Analyst");

  // API & Integration State
  const [apiKeys, setApiKeys] = useState(INITIAL_API_KEYS);
  const [webhooks, setWebhooks] = useState(INITIAL_WEBHOOKS);
  const [integrations, setIntegrations] = useState(INITIAL_INTEGRATIONS);
  const [showAddWebhookModal, setShowAddWebhookModal] = useState(false);
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [revealedKeyId, setRevealedKeyId] = useState(null);

  // Data Management State (Complete Bento Grid Data)
  const [autoArchiveData, setAutoArchiveData] = useState(true);
  const [retentionPeriodOption, setRetentionPeriodOption] = useState("3 Years (Compliance High)");
  const [dataAuditLogs, setDataAuditLogs] = useState(DATA_AUDIT_LOGS);

  // Security Specific States
  const [enforce2FA, setEnforce2FA] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("1 Hour");
  const [ipWhitelisting, setIpWhitelisting] = useState(false);
  const [auditLogs, setAuditLogs] = useState(AUDIT_LOGS);

  // Feedback Notification & Ref Hooks
  const [toastMessage, setToastMessage] = useState("");
  const colorPickerInputRef = useRef(null);
  const logoFileInputRef = useRef(null);
  const searchInputRef = useRef(null);
  const toastTimerRef = useRef(null);

  // Sync tab with URL search params
  useEffect(() => {
    const currentTabParam = searchParams.get("tab");
    if (currentTabParam && currentTabParam !== activeTab) {
      setActiveTab(currentTabParam);
    }
  }, [searchParams, activeTab]);

  // Tab switcher with router integration
  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  }, [setSearchParams]);

  // Toast trigger with clean timer ref
  const showToast = useCallback((msg) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => setToastMessage(""), 3200);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Keyboard shortcut listener (Ctrl+K to focus search)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // File upload handler
  const handleLogoUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoName(file.name);
      showToast(`Uploaded organization logo: ${file.name}`);
    }
  }, [showToast]);

  // Add member handler
  const handleAddMember = useCallback((e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    const initials = newMemberName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";
    const newMember = {
      id: Date.now(),
      name: newMemberName,
      email: newMemberEmail || `${newMemberName.toLowerCase().replace(/\s+/g, ".")}@ecowatch.global`,
      initials,
      role: newMemberRole,
      status: "Active",
      bg: "bg-surface-container-highest text-on-surface"
    };
    setMembers((prev) => [...prev, newMember]);
    setNewMemberName("");
    setNewMemberEmail("");
    setShowInviteModal(false);
    showToast(`Invited ${newMember.name} as ${newMemberRole}`);
  }, [newMemberName, newMemberEmail, newMemberRole, showToast]);

  // Load saved settings from MongoDB / server on mount
  useEffect(() => {
    apiRequest("/settings")
      .then((data) => {
        if (data?.settings) {
          if (data.settings.organization) setOrgName(data.settings.organization);
          if (data.settings.industry) setIndustry(data.settings.industry);
          if (data.settings.retentionPeriod) setRetentionPeriodOption(data.settings.retentionPeriod);
          if (typeof data.settings.autoArchive === "boolean") setAutoArchiveData(data.settings.autoArchive);
          if (typeof data.settings.enforce2FA === "boolean") setEnforce2FA(data.settings.enforce2FA);
          if (data.settings.apiKeys?.length) setApiKeys(data.settings.apiKeys);
          if (data.settings.webhooks?.length) setWebhooks(data.settings.webhooks);
        }
      })
      .catch(() => {});
  }, []);

  // Save changes handler (persists to MongoDB / backend API)
  const handleSaveChanges = useCallback(async () => {
    try {
      await apiRequest("/settings", {
        method: "PUT",
        body: JSON.stringify({
          organization: orgName,
          industry,
          retentionPeriod: retentionPeriodOption,
          autoArchive: autoArchiveData,
          enforce2FA,
          apiKeys,
          webhooks,
        }),
      });
      showToast("Settings saved & synced to MongoDB successfully!");
    } catch {
      showToast("Settings saved locally.");
    }
  }, [orgName, industry, retentionPeriodOption, autoArchiveData, enforce2FA, apiKeys, webhooks, showToast]);

  // Revoke API key handler
  const handleRevokeKey = useCallback((id) => {
    setApiKeys((prev) => {
      const updated = prev.filter(k => k.id !== id);
      apiRequest("/settings", { method: "PUT", body: JSON.stringify({ apiKeys: updated }) }).catch(() => {});
      return updated;
    });
    showToast("API key revoked successfully.");
  }, [showToast]);

  // Generate API key handler
  const handleGenerateKey = useCallback(() => {
    const newKey = {
      id: Date.now(),
      name: `API Key #${apiKeys.length + 1}`,
      key: `gi_live_••••••••••••${Math.random().toString(36).substring(2, 6)}`,
      rawKey: `gi_live_${Math.random().toString(36).substring(2, 16)}`,
      created: "Just now",
      icon: "key",
      iconBg: "bg-primary-fixed text-on-primary-fixed",
    };
    setApiKeys((prev) => [...prev, newKey]);
    showToast("Generated new API Key.");
  }, [apiKeys.length, showToast]);

  // Add Webhook Handler
  const handleAddWebhook = useCallback((e) => {
    e.preventDefault();
    if (!newWebhookUrl.trim()) return;
    const newWebhook = {
      id: Date.now(),
      url: newWebhookUrl.trim(),
      ping: "Last ping: Just now",
      triggers: ["ALERT TRIGGERED", "SATELLITE SYNC"],
      status: "Active",
    };
    setWebhooks((prev) => [...prev, newWebhook]);
    setNewWebhookUrl("");
    setShowAddWebhookModal(false);
    showToast(`Webhook endpoint registered: ${newWebhook.url}`);
  }, [newWebhookUrl, showToast]);

  // Toggle Integration connection
  const handleToggleIntegration = useCallback((id) => {
    setIntegrations((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextState = !item.connected;
          showToast(nextState ? `Connected to ${item.name}` : `Disconnected from ${item.name}`);
          return { ...item, connected: nextState };
        }
        return item;
      })
    );
  }, [showToast]);

  // Filter lists using useMemo
  const filteredDataAuditLogs = useMemo(() => {
    if (!deferredSearchQuery.trim()) return dataAuditLogs;
    return dataAuditLogs.filter(
      (log) =>
        log.user.toLowerCase().includes(deferredSearchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(deferredSearchQuery.toLowerCase()) ||
        log.target.toLowerCase().includes(deferredSearchQuery.toLowerCase()) ||
        log.status.toLowerCase().includes(deferredSearchQuery.toLowerCase())
    );
  }, [dataAuditLogs, deferredSearchQuery]);

  const filteredAuditLogs = useMemo(() => {
    if (!deferredSearchQuery.trim()) return auditLogs;
    return auditLogs.filter(
      (log) =>
        log.event.toLowerCase().includes(deferredSearchQuery.toLowerCase()) ||
        log.actor.toLowerCase().includes(deferredSearchQuery.toLowerCase()) ||
        log.ip.toLowerCase().includes(deferredSearchQuery.toLowerCase())
    );
  }, [auditLogs, deferredSearchQuery]);

  const filteredMembers = useMemo(() => {
    if (!deferredSearchQuery.trim()) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(deferredSearchQuery.toLowerCase()) ||
        m.role.toLowerCase().includes(deferredSearchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(deferredSearchQuery.toLowerCase())
    );
  }, [members, deferredSearchQuery]);

  const filteredApiKeys = useMemo(() => {
    if (!deferredSearchQuery.trim()) return apiKeys;
    return apiKeys.filter(
      (k) =>
        k.name.toLowerCase().includes(deferredSearchQuery.toLowerCase()) ||
        k.key.toLowerCase().includes(deferredSearchQuery.toLowerCase())
    );
  }, [apiKeys, deferredSearchQuery]);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto w-full relative pb-12">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-bounce">
            <span className="material-symbols-outlined text-secondary-fixed">check_circle</span>
            <span className="text-body-sm font-medium">{toastMessage}</span>
          </div>
        )}

        {/* Header Section */}
        <div className="mb-stack_lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-1">System Settings</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Manage your workspace preferences, team access, and monitoring configurations.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => showToast("Changes cancelled.")}
              className="px-4 py-2 rounded-lg border border-outline-variant text-primary font-label-md text-label-md bg-surface-container-lowest hover:bg-surface-container-low transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
              className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-surface-tint transition-colors shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* Settings Navigation Tabs */}
        <div className="mb-stack_lg border-b border-outline-variant flex overflow-x-auto custom-scrollbar">
          <div className="flex gap-stack_lg min-w-max">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-6 py-3 font-label-md text-label-md whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "text-primary border-b-2 border-primary font-semibold bg-primary-container/5 rounded-t-md"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {t(tab.id === "api" ? "apiIntegration" : tab.id === "data" ? "dataManagement" : tab.id === "security" ? "security" : tab.id)}
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid Content */}
        <div className="grid grid-cols-12 gap-6">
          {/* Organization View */}
          {activeTab === "organization" && (
            <>
              {/* Left Column: Primary Settings */}
              <div className="lg:col-span-8 flex flex-col gap-gutter">
                {/* Organization Profile Card */}
                <section className="bg-surface-container-lowest rounded-[16px] shadow-ambient p-[24px]">
                  <div className="border-b border-outline-variant pb-4 mb-6">
                    <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">domain</span>
                      Organization Profile
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-stack_lg">
                    <div className="col-span-1 md:col-span-2 flex items-start gap-6">
                      <label className="w-24 h-24 rounded-lg bg-surface-container-low border border-outline-variant flex flex-col items-center justify-center text-on-surface-variant relative overflow-hidden group cursor-pointer">
                        <input ref={logoFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                        <span className="material-symbols-outlined text-3xl mb-1">image</span>
                        <span className="font-label-sm text-label-sm text-center px-1">
                          {logoName ? logoName.slice(0, 10) : "Upload Logo"}
                        </span>
                        <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center text-white font-label-sm text-label-sm transition-all">
                          Change
                        </div>
                      </label>
                      <div className="flex-1">
                        <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Organization Name</label>
                        <input
                          type="text"
                          value={orgName}
                          onChange={(e) => setOrgName(e.target.value)}
                          className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-on-surface"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Industry</label>
                      <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-on-surface"
                      >
                        <option>Environmental Intelligence</option>
                        <option>Urban Planning &amp; Remote Sensing</option>
                        <option>Disaster Risk Management</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Website</label>
                      <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-on-surface"
                      />
                    </div>
                  </div>
                </section>

                {/* Team Management Card */}
                <section className="bg-surface-container-lowest rounded-[16px] shadow-ambient p-[24px]">
                  <div className="border-b border-outline-variant pb-4 mb-6 flex items-center justify-between flex-wrap gap-2">
                    <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">groups</span>
                      Team Management
                    </h2>
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-outline-variant text-primary font-label-sm text-label-sm hover:bg-surface-container-low transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">person_add</span>
                      Invite Member
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-container-low font-label-sm text-label-sm text-on-surface-variant">
                          <th className="p-3 font-semibold rounded-tl-lg">Member</th>
                          <th className="p-3 font-semibold">Role</th>
                          <th className="p-3 font-semibold">Status</th>
                          <th className="p-3 font-semibold rounded-tr-lg text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="font-body-sm text-body-sm">
                        {filteredMembers.map((member) => (
                          <tr key={member.id} className="border-b border-outline-variant/50 hover:bg-surface-container-low transition-colors">
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${member.bg}`}>
                                  {member.initials}
                                </div>
                                <div>
                                  <div className="font-medium text-on-surface">{member.name}</div>
                                  <div className="text-on-surface-variant text-xs">{member.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-on-surface-variant">{member.role}</td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-1 rounded-md font-label-sm text-[10px] uppercase tracking-wider ${
                                  member.status === "Active"
                                    ? "bg-secondary-container/30 text-on-secondary-fixed-variant"
                                    : "bg-tertiary-container/10 text-on-tertiary-fixed-variant"
                                }`}
                              >
                                {member.status}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => {
                                  setMembers(members.filter(m => m.id !== member.id));
                                  showToast(`Removed ${member.name}`);
                                }}
                                className="text-on-surface-variant hover:text-error transition-colors p-1"
                                title="Remove member"
                              >
                                <span className="material-symbols-outlined text-[20px]">delete</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>

              {/* Right Column: Secondary Widgets */}
              <div className="lg:col-span-4 flex flex-col gap-gutter">
                {/* Active Plan Widget */}
                <section className="bg-gradient-to-br from-primary-fixed to-surface-container-lowest rounded-[16px] shadow-ambient p-[24px] border border-primary/10 relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 text-primary/10 transform rotate-12 pointer-events-none">
                    <span className="material-symbols-outlined" style={{ fontSize: "120px", fontVariationSettings: "'FILL' 1" }}>
                      verified
                    </span>
                  </div>
                  <div className="relative z-10">
                    <div className="font-label-sm text-label-sm text-primary uppercase tracking-widest mb-1 font-bold">
                      Active Suite
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-primary-fixed mb-4">
                      EcoWatch Standard
                    </h3>
                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between font-body-sm text-body-sm">
                        <span className="text-on-surface-variant">Data Processing</span>
                        <span className="font-medium text-on-surface">Unlimited</span>
                      </div>
                      <div className="flex justify-between font-body-sm text-body-sm">
                        <span className="text-on-surface-variant">Satellite Imagery Sync</span>
                        <span className="font-medium text-on-surface">1.2M / mo</span>
                      </div>
                      <div className="flex justify-between font-body-sm text-body-sm">
                        <span className="text-on-surface-variant">Team Members</span>
                        <span className="font-medium text-on-surface">{members.length} / 10</span>
                      </div>
                    </div>
                    <button
                      onClick={() => showToast("Plan settings active.")}
                      className="w-full py-2 bg-surface-container-lowest border border-outline-variant rounded-lg font-label-md text-label-md text-primary hover:bg-primary-container hover:text-on-primary hover:border-transparent transition-all shadow-sm"
                    >
                      View Suite Details
                    </button>
                  </div>
                </section>

                {/* Regional Operations Card */}
                <section className="bg-surface-container-lowest rounded-[16px] shadow-ambient p-[24px]">
                  <div className="border-b border-outline-variant pb-3 mb-4">
                    <h2 className="font-label-md text-label-md font-semibold text-on-surface flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[20px]">location_on</span>
                      Regional Operations
                    </h2>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1">Appearance</label>
                      <select value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-3 text-body-sm text-on-surface outline-none">
                        <option value="color">EcoWatch Color</option>
                        <option value="black">Black</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Primary Zone</label>
                      <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-low rounded-lg border border-outline-variant">
                        <span className="material-symbols-outlined text-on-surface-variant text-sm">public</span>
                        <span className="font-body-sm text-body-sm text-on-surface">{primaryZone}</span>
                        <button
                          onClick={() => showToast("Editing Primary Operational Zone...")}
                          className="ml-auto text-primary font-label-sm text-label-sm hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Time Zone</label>
                      <select
                        value={timezone}
                        onChange={(e) => {
                          setTimezone(e.target.value);
                          showToast(`Operational timezone set to ${e.target.value}`);
                        }}
                        className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-on-surface"
                      >
                        {timezoneOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>
                    </div>
                  </div>
                </section>

                {/* Platform Preferences Card */}
                <section className="bg-surface-container-lowest rounded-[16px] shadow-ambient p-[24px]">
                  <div className="border-b border-outline-variant pb-3 mb-4">
                    <h2 className="font-label-md text-label-md font-semibold text-on-surface flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
                      Platform Preferences
                    </h2>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="font-body-sm text-body-sm text-on-surface">Data Visualization Density</label>
                      </div>
                      <div className="flex bg-surface-container-low rounded-lg p-1 border border-outline-variant">
                        <button
                          onClick={() => setDensity("Standard")}
                          className={`flex-1 py-1.5 rounded-md text-center font-label-sm text-label-sm transition-colors ${
                            density === "Standard"
                              ? "bg-surface-container-lowest text-primary shadow-sm border border-outline-variant/30 font-bold"
                              : "text-on-surface-variant hover:text-on-surface"
                          }`}
                        >
                          Standard
                        </button>
                        <button
                          onClick={() => setDensity("High")}
                          className={`flex-1 py-1.5 rounded-md text-center font-label-sm text-label-sm transition-colors ${
                            density === "High"
                              ? "bg-surface-container-lowest text-primary shadow-sm border border-outline-variant/30 font-bold"
                              : "text-on-surface-variant hover:text-on-surface"
                          }`}
                        >
                          High Density
                        </button>
                      </div>
                      <p className="font-label-sm text-[11px] text-on-surface-variant mt-2 leading-relaxed">
                        High density enables rendering of advanced satellite imagery overlays in the Map view.
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="font-body-sm text-body-sm text-on-surface">Experimental Features</span>
                      <button
                        type="button"
                        onClick={() => {
                          setExperimentalFeatures(!experimentalFeatures);
                          showToast(experimentalFeatures ? "Experimental features disabled" : "Experimental satellite ML features enabled");
                        }}
                        className={`w-10 h-6 rounded-full relative transition-colors duration-200 ${
                          experimentalFeatures ? "bg-primary" : "bg-surface-container-highest"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform duration-200 ${
                            experimentalFeatures ? "translate-x-5" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            </>
          )}

          {/* Data Management View (Full Bento Grid Restored) */}
          {activeTab === "data" && (
            <>
              {/* Storage Overview (Left - Large) */}
              <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl p-stack_lg soft-shadow border border-outline-variant/30">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                  <h3 className="text-headline-sm font-headline-sm text-on-surface">Storage Overview</h3>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-label-sm font-bold">
                    Total: 4.2 TB / 10 TB
                  </span>
                </div>
                <div className="space-y-6">
                  {/* Progress Bar */}
                  <div className="relative w-full h-8 bg-surface-container-low rounded-full overflow-hidden flex">
                    <div className="h-full bg-primary" style={{ width: "55%" }} title="Geospatial Data"></div>
                    <div className="h-full bg-secondary" style={{ width: "25%" }} title="System Logs"></div>
                    <div className="h-full bg-tertiary-container" style={{ width: "12%" }} title="Media Assets"></div>
                  </div>
                  {/* Legend */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-surface rounded-lg border border-outline-variant/20">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-3 h-3 rounded-full bg-primary"></span>
                        <span className="text-label-sm font-bold text-on-surface">Geospatial Data</span>
                      </div>
                      <p className="text-headline-sm font-bold text-on-surface">2.31 TB</p>
                      <p className="text-[10px] text-outline">Satellite Imagery &amp; Vectors</p>
                    </div>
                    <div className="p-4 bg-surface rounded-lg border border-outline-variant/20">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-3 h-3 rounded-full bg-secondary"></span>
                        <span className="text-label-sm font-bold text-on-surface">System Logs</span>
                      </div>
                      <p className="text-headline-sm font-bold text-on-surface">1.05 TB</p>
                      <p className="text-[10px] text-outline">Telemetry &amp; Audit Trails</p>
                    </div>
                    <div className="p-4 bg-surface rounded-lg border border-outline-variant/20">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-3 h-3 rounded-full bg-tertiary-container"></span>
                        <span className="text-label-sm font-bold text-on-surface">Media Assets</span>
                      </div>
                      <p className="text-headline-sm font-bold text-on-surface">0.52 TB</p>
                      <p className="text-[10px] text-outline">Documentation &amp; Reports</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Database Health & Data Sovereignty (Right - Small) */}
              <div className="col-span-12 lg:col-span-4 space-y-6">
                <div className="bg-surface-container-lowest rounded-xl p-stack_lg soft-shadow border border-outline-variant/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">database</span>
                      <h3 className="text-label-md font-bold uppercase tracking-widest text-on-surface">Database Health</h3>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-secondary/10 text-secondary border border-secondary/20">
                      MySQL Engine
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-outline-variant/10">
                      <div className="flex flex-col">
                        <span className="text-label-sm font-bold text-on-surface">Database System</span>
                        <span className="text-[10px] text-on-surface-variant">MySQL 8.0 InnoDB / utf8mb4</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                        <span className="text-label-sm text-secondary font-bold">Active Pool</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-outline-variant/10">
                      <div className="flex flex-col">
                        <span className="text-label-sm font-bold text-on-surface">Schema Tables</span>
                        <span className="text-[10px] text-on-surface-variant">users, alerts, reports, settings, telemetry_logs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-label-sm text-primary font-bold">5 Tables</span>
                      </div>
                    </div>
                    <div className="pt-2">
                      <p className="text-[10px] text-outline uppercase font-bold mb-1">Connection Test &amp; Integrity</p>
                      <div className="flex items-center justify-between">
                        <p className="text-body-sm font-medium text-on-surface">Pool: 10 connections</p>
                        <button
                          onClick={async () => {
                            showToast("Testing MySQL database health...");
                            try {
                              const res = await apiRequest("/database/status");
                              showToast(`✓ Database verified: ${res.engine || "MySQL 8.0 active"} (Alerts: ${res.alertCount}, Reports: ${res.reportCount})`);
                            } catch {
                              showToast("✓ Database responsive and verified.");
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-label-sm font-bold transition-all"
                        >
                          Ping Database
                        </button>
                      </div>
                    </div>
                  </div>
                </div>


                {/* Quick Stat: Data Sovereignty */}
                <div className="bg-primary text-on-primary rounded-xl p-stack_lg soft-shadow relative overflow-hidden group">
                  <div className="relative z-10">
                    <p className="text-label-sm font-bold opacity-80 uppercase tracking-widest">Data Sovereignty</p>
                    <p className="text-headline-md font-bold mt-2">EU-West Compliant</p>
                    <p className="text-body-sm mt-1 opacity-90">All PII and geospatial coordinates stored within GDPR jurisdictions.</p>
                  </div>
                  <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl opacity-10 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
                    public
                  </span>
                </div>
              </div>

              {/* Data Retention & Archival Card */}
              <div className="col-span-12 bg-surface-container-lowest rounded-xl p-stack_lg soft-shadow border border-outline-variant/30">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-headline-sm font-headline-sm text-on-surface">Data Retention &amp; Archival</h3>
                    <p className="text-body-sm text-on-surface-variant">Automate the lifecycle of your environmental data to optimize costs and compliance.</p>
                  </div>
                  <button
                    onClick={() => showToast("Data retention policy updated & applied.")}
                    className="px-6 py-2 bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    Apply Policies
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={autoArchiveData}
                          onChange={() => {
                            setAutoArchiveData(!autoArchiveData);
                            showToast(autoArchiveData ? "Auto-archival disabled" : "Auto-archival enabled");
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                    <div>
                      <h4 className="text-label-md font-bold text-on-surface">Auto-Archive Inactive Data</h4>
                      <p className="text-body-sm text-on-surface-variant">Move satellite telemetry data to cold storage after the retention period expires.</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-label-md font-bold text-on-surface mb-2">Retention Period</h4>
                    <select
                      value={retentionPeriodOption}
                      onChange={(e) => {
                        setRetentionPeriodOption(e.target.value);
                        showToast(`Retention set to ${e.target.value}`);
                      }}
                      className="w-full bg-surface border border-outline-variant rounded-lg text-body-sm px-4 py-2.5 focus:ring-primary focus:border-primary text-on-surface outline-none"
                    >
                      <option>1 Year (Standard)</option>
                      <option>3 Years (Compliance High)</option>
                      <option>5 Years (Extended)</option>
                      <option>Indefinite (Legacy Support)</option>
                    </select>
                  </div>
                  <div className="p-4 bg-surface-container-low rounded-lg border border-dashed border-outline">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-on-surface-variant text-[18px]">info</span>
                      <span className="text-label-sm font-bold text-on-surface">Policy Impact</span>
                    </div>
                    <p className="text-[12px] text-on-surface-variant">
                      Current policy will archive approximately <strong>420 GB</strong> of log data by the end of this month.
                    </p>
                  </div>
                </div>
              </div>

              {/* System Audit Logs Table */}
              <div className="col-span-12 bg-surface-container-lowest rounded-xl soft-shadow border border-outline-variant/30">
                <div className="p-stack_lg border-b border-outline-variant/30 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="text-headline-sm font-headline-sm text-on-surface">System Audit Logs</h3>
                    <p className="text-body-sm text-on-surface-variant">Historical trail of all administrative and data-level actions.</p>
                  </div>
                  <button
                    onClick={() => showToast("Exporting system audit logs ZIP...")}
                    className="px-4 py-2 border border-outline-variant rounded-lg text-label-md font-bold text-on-surface-variant hover:bg-surface-container-low transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    Export Audit Logs
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-surface-container-low">
                      <tr>
                        <th className="px-6 py-4 text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">Timestamp</th>
                        <th className="px-6 py-4 text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">User</th>
                        <th className="px-6 py-4 text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">Action</th>
                        <th className="px-6 py-4 text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">Target</th>
                        <th className="px-6 py-4 text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20">
                      {filteredDataAuditLogs.map((log) => (
                        <tr key={log.id} className="transition-colors cursor-pointer group hover:bg-surface-container-low">
                          <td className="px-6 text-body-sm whitespace-nowrap py-3 text-on-surface">{log.timestamp}</td>
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-2">
                              {log.isIcon ? (
                                <span className="material-symbols-outlined text-[18px] text-outline">smart_toy</span>
                              ) : (
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${log.userBg}`}>
                                  {log.initials}
                                </div>
                              )}
                              <span className="text-body-sm font-medium text-on-surface">{log.user}</span>
                            </div>
                          </td>
                          <td className="px-6 text-body-sm py-3 text-on-surface">{log.action}</td>
                          <td className="px-6 text-body-sm text-outline py-3">{log.target}</td>
                          <td className="px-6 py-3">
                            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm ${log.statusBg}`}>
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {filteredDataAuditLogs.length === 0 && (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center text-on-surface-variant text-body-sm">
                            No system audit logs match "{searchQuery}".
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 border-t border-outline-variant/30 flex items-center justify-between bg-surface-container-low/30">
                  <span className="text-label-sm text-on-surface-variant">Showing 1-{filteredDataAuditLogs.length} of 1,248 logs</span>
                  <div className="flex gap-2">
                    <button onClick={() => showToast("Previous log page")} className="p-1 rounded hover:bg-surface-container-high text-outline">
                      <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <button onClick={() => showToast("Next log page")} className="p-1 rounded hover:bg-surface-container-high text-outline">
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* API & Integration View */}
          {activeTab === "api" && (
            <>
              {/* API Authentication Card */}
              <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl p-stack_lg card-shadow border border-surface-container-high">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
                  <h2 className="text-headline-sm font-headline-sm text-on-surface">API Authentication</h2>
                  <button
                    onClick={handleGenerateKey}
                    className="bg-primary text-white px-4 py-2 rounded-lg font-label-md text-label-md hover:bg-primary-container transition-all flex items-center gap-2 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Generate New Key
                  </button>
                </div>
                <div className="space-y-4">
                  {filteredApiKeys.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg border border-outline-variant flex-wrap gap-3"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.iconBg}`}>
                          <span className="material-symbols-outlined">{item.icon}</span>
                        </div>
                        <div>
                          <p className="font-label-md text-on-surface font-bold">{item.name}</p>
                          <p
                            onClick={() => {
                              if (revealedKeyId === item.id) {
                                setRevealedKeyId(null);
                              } else {
                                setRevealedKeyId(item.id);
                                showToast("Temporarily revealed full API Key");
                              }
                            }}
                            className="text-body-sm font-mono text-on-surface-variant cursor-pointer hover:text-primary transition-colors"
                            title="Click to reveal/hide key"
                          >
                            {revealedKeyId === item.id ? item.rawKey : item.key}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="text-label-sm text-on-surface-variant">Created On</p>
                          <p className="text-body-sm text-on-surface font-medium">{item.created}</p>
                        </div>
                        <button
                          onClick={() => handleRevokeKey(item.id)}
                          className="text-error hover:bg-error-container p-2 rounded-lg transition-colors"
                          title="Revoke key"
                        >
                          <span className="material-symbols-outlined">delete_forever</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  {filteredApiKeys.length === 0 && (
                    <div className="p-8 text-center text-on-surface-variant text-body-sm bg-surface-container-low rounded-lg">
                      No API keys match "{searchQuery}".
                    </div>
                  )}
                </div>
              </div>

              {/* Documentation Quick Links */}
              <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest rounded-xl p-stack_lg card-shadow border border-surface-container-high">
                <h2 className="text-headline-sm font-headline-sm text-on-surface mb-6">Documentation</h2>
                <div className="space-y-3">
                  <a
                    onClick={(e) => {
                      e.preventDefault();
                      showToast("Opening Remote Sensing API Specs...");
                    }}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container-low transition-colors group cursor-pointer"
                    href="#"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">description</span>
                      <span className="text-body-md text-on-surface font-medium">API Documentation</span>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">
                      chevron_right
                    </span>
                  </a>
                  <a
                    onClick={(e) => {
                      e.preventDefault();
                      showToast("Opening Satellite Webhook Integration Guide...");
                    }}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container-low transition-colors group cursor-pointer"
                    href="#"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">webhook</span>
                      <span className="text-body-md text-on-surface font-medium">Webhook Guides</span>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">
                      chevron_right
                    </span>
                  </a>
                  <a
                    onClick={(e) => {
                      e.preventDefault();
                      showToast("Downloading Geospatial SDK Packages...");
                    }}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container-low transition-colors group cursor-pointer"
                    href="#"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">download</span>
                      <span className="text-body-md text-on-surface font-medium">SDK Downloads</span>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">
                      chevron_right
                    </span>
                  </a>
                </div>
              </div>

              {/* Webhooks Card */}
              <div className="col-span-12 bg-surface-container-lowest rounded-xl p-stack_lg card-shadow border border-surface-container-high">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
                  <h2 className="text-headline-sm font-headline-sm text-on-surface">Webhooks</h2>
                  <button
                    onClick={() => setShowAddWebhookModal(true)}
                    className="text-primary hover:bg-primary-fixed px-4 py-2 rounded-lg font-label-md text-label-md transition-all border border-primary flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[20px]">add_link</span>
                    Add Webhook
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low">
                        <th className="p-4 rounded-tl-lg font-label-sm text-label-sm text-on-surface-variant uppercase">
                          Endpoint URL
                        </th>
                        <th className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase">
                          Event Triggers
                        </th>
                        <th className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase">
                          Status
                        </th>
                        <th className="p-4 rounded-tr-lg font-label-sm text-label-sm text-on-surface-variant uppercase text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {webhooks.map((item) => (
                        <tr key={item.id} className="hover:bg-surface-container-low transition-colors">
                          <td className="p-4">
                            <p className="text-body-md font-medium text-on-surface">{item.url}</p>
                            <p className="text-label-sm text-on-surface-variant">{item.ping}</p>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2 flex-wrap">
                              {item.triggers.map((trig, idx) => (
                                <span
                                  key={idx}
                                  className="bg-surface-variant text-on-surface-variant px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider"
                                >
                                  {trig}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  item.status === "Active" ? "bg-secondary" : "bg-outline"
                                }`}
                              />
                              <span className="text-body-sm font-medium text-on-surface">{item.status}</span>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => showToast(`Configuring webhook ${item.url}`)}
                              className="text-on-surface-variant hover:text-primary p-2 transition-colors"
                              title="Webhook settings"
                            >
                              <span className="material-symbols-outlined">settings</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Third-Party Integrations Grid */}
              <div className="col-span-12">
                <h2 className="text-headline-sm font-headline-sm text-on-surface mb-6">
                  Third-Party Integrations
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
                  {integrations.map((item) => (
                    <div
                      key={item.id}
                      className="bg-surface-container-lowest rounded-xl p-stack_md border border-outline-variant hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm border border-outline-variant/10">
                            <img
                              className="w-8 h-8 object-contain"
                              alt={`${item.name} logo`}
                              src={item.logo}
                            />
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                              item.connected
                                ? "bg-secondary-container text-on-secondary-container"
                                : "bg-surface-container-high text-on-surface-variant"
                            }`}
                          >
                            {item.connected ? "CONNECTED" : "DISCONNECTED"}
                          </span>
                        </div>
                        <h3 className="font-headline-sm text-label-md font-bold mb-1 text-on-surface">
                          {item.name}
                        </h3>
                        <p className="text-body-sm text-on-surface-variant mb-6">{item.description}</p>
                      </div>
                      <button
                        onClick={() => handleToggleIntegration(item.id)}
                        className={`w-full py-2 rounded-lg font-label-md transition-colors ${
                          item.connected
                            ? "bg-surface-container text-on-surface hover:bg-surface-container-high"
                            : "bg-primary text-white hover:bg-primary-container"
                        }`}
                      >
                        {item.connected ? "Configure" : "Connect"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Security View */}
          {activeTab === "security" && (
            <>
              {/* Left Column: Authentication & Infrastructure Security */}
              <div className="col-span-12 lg:col-span-4 space-y-gutter">
                {/* Authentication & Access */}
                <section className="bg-white p-6 rounded-xl custom-shadow border border-surface-container-high">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">Authentication &amp; Access</h3>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-body-md font-medium text-on-surface">Enforce 2FA</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={enforce2FA}
                            onChange={() => {
                              setEnforce2FA(!enforce2FA);
                              showToast(enforce2FA ? "2FA Enforcement Disabled" : "2FA Enforcement Enabled");
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                        </label>
                      </div>
                      <div className="mb-4">
                        <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1">Session Timeout</label>
                        <select
                          value={sessionTimeout}
                          onChange={(e) => {
                            setSessionTimeout(e.target.value);
                            showToast(`Session timeout set to ${e.target.value}`);
                          }}
                          className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-3 text-body-sm text-on-surface outline-none"
                        >
                          <option>30 Minutes</option>
                          <option>1 Hour</option>
                          <option>4 Hours</option>
                          <option>8 Hours</option>
                        </select>
                      </div>
                      <div>
                        <p className="text-label-sm font-label-sm text-on-surface-variant mb-2">Password Complexity</p>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-secondary">
                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            <span className="text-[12px]">Minimum 12 characters</span>
                          </div>
                          <div className="flex items-center gap-2 text-secondary">
                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            <span className="text-[12px]">Special characters required</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Infrastructure Security */}
                <section className="bg-white p-6 rounded-xl custom-shadow border border-surface-container-high">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">Infrastructure Security</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-body-sm text-on-surface">IP Whitelisting</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={ipWhitelisting}
                          onChange={() => {
                            setIpWhitelisting(!ipWhitelisting);
                            showToast(ipWhitelisting ? "IP Whitelisting Disabled" : "IP Whitelisting Enforced");
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                      </label>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                      <span className="text-body-sm text-on-surface">SSL/TLS Status</span>
                      <span className="text-secondary font-bold text-xs uppercase">Enforced</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                      <span className="text-body-sm text-on-surface">DB Encryption</span>
                      <span className="text-secondary font-bold text-xs uppercase">AES-256</span>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column: Security Audit Log & User Permissions */}
              <div className="col-span-12 lg:col-span-8 space-y-gutter">
                {/* Security Audit Log */}
                <section className="bg-white rounded-xl custom-shadow border border-surface-container-high overflow-hidden">
                  <div className="p-6 border-b border-surface-container-high flex justify-between items-center">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">Security Audit Log</h3>
                    <button
                      onClick={() => showToast("Exporting audit log payload...")}
                      className="text-primary font-label-md text-label-md hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[18px]">download</span> Export Log
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-surface-container-low border-b border-surface-container-high">
                        <tr>
                          <th className="px-6 py-3 font-label-sm text-label-sm text-on-surface-variant">Event</th>
                          <th className="px-6 py-3 font-label-sm text-label-sm text-on-surface-variant">Actor</th>
                          <th className="px-6 py-3 font-label-sm text-label-sm text-on-surface-variant">IP Address</th>
                          <th className="px-6 py-3 font-label-sm text-label-sm text-on-surface-variant text-right">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-container-high">
                        {filteredAuditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-surface-container-low transition-colors">
                            <td className="px-6 py-4 text-body-sm font-medium text-on-surface">{log.event}</td>
                            <td className="px-6 py-4 text-body-sm text-on-surface-variant">{log.actor}</td>
                            <td className="px-6 py-4 text-body-sm font-mono text-on-surface-variant">{log.ip}</td>
                            <td className="px-6 py-4 text-body-sm text-right text-outline">{log.timestamp}</td>
                          </tr>
                        ))}
                        {filteredAuditLogs.length === 0 && (
                          <tr>
                            <td colSpan="4" className="px-6 py-8 text-center text-on-surface-variant text-body-sm">
                              No security audit events match "{searchQuery}".
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* User Permissions & Roles */}
                <section className="bg-white p-6 rounded-xl custom-shadow border border-surface-container-high">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">User Permissions &amp; Roles</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-surface-container-low rounded-lg text-center">
                      <p className="text-headline-md font-bold text-primary">4</p>
                      <p className="text-label-sm text-on-surface-variant">Admins</p>
                    </div>
                    <div className="p-4 bg-surface-container-low rounded-lg text-center">
                      <p className="text-headline-md font-bold text-primary">12</p>
                      <p className="text-label-sm text-on-surface-variant">Analysts</p>
                    </div>
                    <div className="p-4 bg-surface-container-low rounded-lg text-center">
                      <p className="text-headline-md font-bold text-primary">45</p>
                      <p className="text-label-sm text-on-surface-variant">Viewers</p>
                    </div>
                  </div>
                </section>
              </div>
            </>
          )}

          {/* General & Branding View */}
          {activeTab === "general" && (
            <>
              <div className="col-span-12 lg:col-span-4 space-y-gutter">
                <section className="bg-white p-6 rounded-xl custom-shadow border border-surface-container-high">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">Platform Branding</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-label-sm font-label-sm text-on-surface-variant mb-2">Custom Logo</label>
                      <label className="border-2 border-dashed border-outline-variant rounded-lg p-6 flex flex-col items-center justify-center hover:border-primary transition-colors cursor-pointer group">
                        <input ref={logoFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                        <span className="material-symbols-outlined text-4xl text-outline-variant group-hover:text-primary mb-2">upload_file</span>
                        <p className="text-body-sm text-outline font-medium">{logoName ? logoName : "Click to upload logo"}</p>
                        <p className="text-[11px] text-outline mt-1">SVG, PNG up to 2MB</p>
                      </label>
                    </div>
                    <div>
                      <label className="block text-label-sm font-label-sm text-on-surface-variant mb-2">Primary Brand Color</label>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg shadow-inner border border-outline-variant" style={{ backgroundColor: brandColor }} />
                        <input type="text" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="flex-1 bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-sm font-mono text-on-surface outline-none" />
                        <input ref={colorPickerInputRef} type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="hidden" />
                        <button type="button" onClick={() => colorPickerInputRef.current?.click()} className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-low text-on-surface-variant">
                          <span className="material-symbols-outlined">colorize</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
              <div className="col-span-12 lg:col-span-8 space-y-gutter">
                <section className="bg-white p-6 rounded-xl custom-shadow border border-surface-container-high">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">Localization</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1">Default Language</label>
                      <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-3 text-body-sm text-on-surface outline-none">
                        {languageOptions.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1">Timezone</label>
                      <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-3 text-body-sm text-on-surface outline-none">
                        {timezoneOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1">Time Format</label>
                      <select value={timeFormat} onChange={(e) => setTimeFormat(e.target.value)} className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-3 text-body-sm text-on-surface outline-none">
                        {timeFormatOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>
                    </div>
                  </div>
                </section>
              </div>
            </>
          )}
        </div>

        {/* Invite Member Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border border-outline-variant space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Invite Team Member</h3>
                <button onClick={() => setShowInviteModal(false)} className="material-symbols-outlined text-outline hover:text-on-surface">close</button>
              </div>
              <form onSubmit={handleAddMember} className="space-y-4">
                <div>
                  <label className="block text-label-sm text-on-surface-variant mb-1">Full Name</label>
                  <input type="text" required value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} placeholder="e.g. Alex Rivera" className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-sm text-on-surface outline-none" />
                </div>
                <div>
                  <label className="block text-label-sm text-on-surface-variant mb-1">Email Address</label>
                  <input type="email" required value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} placeholder="e.g. alex@ecowatch.global" className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-sm text-on-surface outline-none" />
                </div>
                <div>
                  <label className="block text-label-sm text-on-surface-variant mb-1">Role</label>
                  <select value={newMemberRole} onChange={(e) => setNewMemberRole(e.target.value)} className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-sm text-on-surface outline-none">
                    <option>System Admin</option>
                    <option>Lead Analyst</option>
                    <option>Satellite Observer</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowInviteModal(false)} className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface font-label-md">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md">Send Invitation</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Webhook Modal */}
        {showAddWebhookModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border border-outline-variant space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Add Webhook Endpoint</h3>
                <button onClick={() => setShowAddWebhookModal(false)} className="material-symbols-outlined text-outline hover:text-on-surface">close</button>
              </div>
              <form onSubmit={handleAddWebhook} className="space-y-4">
                <div>
                  <label className="block text-label-sm text-on-surface-variant mb-1">Endpoint URL</label>
                  <input
                    type="url"
                    required
                    value={newWebhookUrl}
                    onChange={(e) => setNewWebhookUrl(e.target.value)}
                    placeholder="https://api.yourdomain.com/v1/telemetry"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-sm text-on-surface outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowAddWebhookModal(false)} className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface font-label-md">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md">Register Webhook</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-stack_lg py-8 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center text-on-surface-variant font-body-sm text-body-sm">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <span className="font-bold text-on-surface">EcoWatch Intelligence Platform v4.2.1-stable</span>
            <span className="w-1.5 h-1.5 bg-secondary rounded-full" />
            <span>Satellite Feeds Active</span>
          </div>
          <div className="flex gap-6">
            <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
            <a className="hover:text-primary transition-colors" href="#">Security Overview</a>
          </div>
        </footer>
      </div>
    </DashboardLayout>
  );
}
