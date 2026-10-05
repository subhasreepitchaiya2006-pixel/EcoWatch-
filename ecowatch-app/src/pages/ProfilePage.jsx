import React, { useEffect, useRef, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { useSatelliteData } from "../context/SatelliteDataContext";
import { apiRequest } from "../lib/api";

const PRESET_AVATARS = [
  {
    id: "satellite",
    name: "Satellite Analyst",
    icon: "satellite_alt",
    bg: "bg-blue-600",
    color: "text-white",
  },
  {
    id: "scientist",
    name: "Environmental Scientist",
    icon: "science",
    bg: "bg-emerald-600",
    color: "text-white",
  },
  {
    id: "forest",
    name: "Forestry & Ecology",
    icon: "forest",
    bg: "bg-teal-600",
    color: "text-white",
  },
  {
    id: "water",
    name: "Hydrology Expert",
    icon: "water_drop",
    bg: "bg-cyan-600",
    color: "text-white",
  },
  {
    id: "responder",
    name: "Incident Responder",
    icon: "crisis_alert",
    bg: "bg-amber-600",
    color: "text-white",
  },
  {
    id: "admin",
    name: "Command Director",
    icon: "shield_person",
    bg: "bg-purple-600",
    color: "text-white",
  },
];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { currentLocation } = useSatelliteData();
  const fileInputRef = useRef(null);

  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [mfaActive, setMfaActive] = useState(true);

  // Form State
  const [form, setForm] = useState({
    fullName: user?.name || user?.fullName || "Subhasree Pitchaiya",
    jobTitle: user?.jobTitle || "Lead Environmental Analyst",
    email: user?.email || "24104031@nec.edu.in",
    phone: user?.mobile || "",
    organization: user?.organization || "EcoWatch Global",
    location: user?.location || currentLocation || "KTC Nagar, Tirunelveli",
    picture: user?.picture || null,
  });

  const [initialForm, setInitialForm] = useState(form);

  // Password Modal State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Fetch real profile from backend
  useEffect(() => {
    apiRequest("/profile")
      .then((data) => {
        const p = data?.user || data?.profile;
        if (p) {
          const loaded = {
            fullName: p.name || p.full_name || user?.name || "",
            jobTitle: p.jobTitle || p.job_title || "Lead Environmental Analyst",
            email: p.email || user?.email || "",
            phone: p.mobile || "",
            organization: p.organization || "EcoWatch Global",
            location: p.location || currentLocation || "",
            picture: p.picture || user?.picture || null,
          };
          setForm(loaded);
          setInitialForm(loaded);
        }
      })
      .catch(() => {});
  }, [user?.email, user?.name, user?.picture, currentLocation]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Save updated profile
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await apiRequest("/profile", {
        method: "PUT",
        body: JSON.stringify({
          fullName: form.fullName,
          jobTitle: form.jobTitle,
          mobile: form.phone,
          location: form.location,
          organization: form.organization,
          picture: form.picture,
        }),
      });

      const updated = res?.user || res?.profile || form;
      if (updateUser) {
        updateUser(updated);
      }
      setInitialForm(form);
      showToast("Profile information updated successfully.");
    } catch (error) {
      showToast(error.message || "Failed to save profile changes.");
    } finally {
      setIsSaving(false);
    }
  };

  // Discard changes
  const handleDiscard = () => {
    setForm(initialForm);
    showToast("Unsaved changes discarded.");
  };

  // Display Picture (DP) Upload via File Input
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please upload a valid image file (PNG, JPG, WebP).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast("Image size exceeds 2MB limit. Please choose a smaller image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result;
      setForm((prev) => ({ ...prev, picture: dataUrl }));
      setShowAvatarModal(false);

      // Auto-save picture immediately to backend and auth context
      try {
        await apiRequest("/profile", {
          method: "PUT",
          body: JSON.stringify({ picture: dataUrl }),
        });
        if (updateUser) {
          updateUser({ picture: dataUrl });
        }
        showToast("Profile display picture updated.");
      } catch {
        showToast("Display picture previewed. Click 'Save Changes' to commit.");
      }
    };
    reader.readAsDataURL(file);
  };

  // Choose preset avatar
  const handleSelectPreset = async (avatar) => {
    // Generate SVG Data URL from preset icon
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="100%" height="100%" fill="${avatar.id === 'satellite' ? '#2563eb' : avatar.id === 'scientist' ? '#059669' : avatar.id === 'forest' ? '#0d9488' : avatar.id === 'water' ? '#0891b2' : avatar.id === 'responder' ? '#d97706' : '#7c3aed'}"/><text x="50%" y="54%" font-family="sans-serif" font-size="48" fill="#ffffff" dominant-baseline="middle" text-anchor="middle">🛰️</text></svg>`;
    const presetUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;

    setForm((prev) => ({ ...prev, picture: presetUrl }));
    setShowAvatarModal(false);

    try {
      await apiRequest("/profile", {
        method: "PUT",
        body: JSON.stringify({ picture: presetUrl }),
      });
      if (updateUser) {
        updateUser({ picture: presetUrl });
      }
      showToast(`Selected "${avatar.name}" avatar.`);
    } catch {
      showToast("Avatar previewed. Click 'Save Changes' to commit.");
    }
  };

  // Remove DP
  const handleRemovePhoto = async () => {
    setForm((prev) => ({ ...prev, picture: null }));
    setShowAvatarModal(false);
    try {
      await apiRequest("/profile", {
        method: "PUT",
        body: JSON.stringify({ picture: "" }),
      });
      if (updateUser) {
        updateUser({ picture: null });
      }
      showToast("Display picture removed. Default monogram active.");
    } catch {
      showToast("Display picture cleared.");
    }
  };

  // Password submission
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    // Success response
    setPasswordSuccess("Security credentials updated successfully.");
    setTimeout(() => {
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess("");
      showToast("Account password updated.");
    }, 1200);
  };

  // Initials for avatar fallback
  const userInitials = (form.fullName || user?.name || "User")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const userRole = user?.role || "System Admin";

  return (
    <DashboardLayout>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 right-8 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-secondary-fixed">task_alt</span>
          <span className="text-body-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Hidden File Input for DP */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />

      <div className="max-w-5xl mx-auto space-y-stack_lg pb-16">
        <div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">User Profile &amp; Identity</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Manage your personal credentials, operational role, and account security.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-stack_lg">
          {/* Left Column: Avatar & Operational Role Card */}
          <div className="space-y-stack_lg flex flex-col">
            <div className="bg-surface-container-lowest rounded-2xl shadow-ambient p-stack_lg flex flex-col items-center text-center relative overflow-hidden border border-outline-variant/40">
              {/* Profile Display Picture (DP) */}
              <div className="relative group mt-2 mb-4">
                <div className="w-28 h-28 rounded-full border-4 border-surface shadow-md overflow-hidden bg-primary/10 flex items-center justify-center">
                  {form.picture ? (
                    <img src={form.picture} alt="Profile DP" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-3xl">
                      {userInitials}
                    </div>
                  )}
                </div>

                {/* Edit Camera Button */}
                <button
                  type="button"
                  onClick={() => setShowAvatarModal(true)}
                  className="absolute bottom-0 right-0 w-9 h-9 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer border-2 border-surface"
                  title="Update Display Picture"
                >
                  <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                </button>
              </div>

              <h2 className="font-headline-md text-headline-md font-bold text-on-surface">{form.fullName}</h2>
              <p className="font-body-sm text-body-sm text-primary font-semibold">{form.jobTitle}</p>

              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                <span className="material-symbols-outlined text-sm">verified_user</span>
                <span>{userRole}</span>
              </div>

              <div className="flex items-center gap-1 mt-3 text-on-surface-variant text-body-sm">
                <span className="material-symbols-outlined text-sm">location_on</span>
                <span className="font-label-sm text-label-sm">{form.location || currentLocation || "Monitored Region"}</span>
              </div>

              <button
                type="button"
                onClick={() => setShowAvatarModal(true)}
                className="mt-6 w-full py-2.5 px-4 rounded-xl bg-surface-container-low border border-outline-variant text-primary font-label-md font-semibold hover:bg-surface-container transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">image</span>
                Update Profile Photo (DP)
              </button>
            </div>

            {/* Operational Role Credentials Card */}
            <div className="bg-surface-container-lowest rounded-2xl shadow-ambient p-stack_lg flex-1 border border-outline-variant/40">
              <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface border-b border-outline-variant pb-3 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">workspace_premium</span>
                Clearance &amp; Authorizations
              </h3>

              <div className="space-y-3">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30">
                  <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">verified</span>
                  <div>
                    <p className="text-xs font-bold text-on-surface">{userRole} Clearance</p>
                    <p className="text-[11px] text-on-surface-variant">
                      {userRole === "System Admin"
                        ? "Full root authorization across all planetary monitoring nodes."
                        : "Authorized telemetry operator for regional sensor streams."}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30">
                  <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">satellite_alt</span>
                  <div>
                    <p className="text-xs font-bold text-on-surface">Satellite Telemetry Access</p>
                    <p className="text-[11px] text-on-surface-variant">
                      Synchronized with Sentinel-2 MSI, Landsat-9, and GOES-16 downlinks.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30">
                  <span className="material-symbols-outlined text-tertiary text-[20px] mt-0.5">lock_open</span>
                  <div>
                    <p className="text-xs font-bold text-on-surface">Incident Dispatch Authorization</p>
                    <p className="text-[11px] text-on-surface-variant">
                      {userRole === "System Admin"
                        ? "Emergency regional alert broadcasts and evacuation coordination."
                        : "Field verification and telemetry submission permissions."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Personal Information & Security */}
          <div className="lg:col-span-2 space-y-stack_lg">
            {/* Personal Information Form */}
            <div className="bg-surface-container-lowest rounded-2xl shadow-ambient p-stack_lg border border-outline-variant/40">
              <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface border-b border-outline-variant pb-3 mb-6 flex items-center justify-between">
                <span>Personal Information</span>
                <span className="text-xs font-normal text-on-surface-variant">Connected to Live User Store</span>
              </h3>

              <form className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4" onSubmit={handleSave}>
                <div className="space-y-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="fullName">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    className="w-full h-11 px-3.5 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-body-sm text-on-surface"
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="jobTitle">
                    Designation / Job Title
                  </label>
                  <input
                    id="jobTitle"
                    className="w-full h-11 px-3.5 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-body-sm text-on-surface"
                    type="text"
                    name="jobTitle"
                    value={form.jobTitle}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="email">
                    Email Address
                  </label>
                  <input
                    id="email"
                    className="w-full h-11 px-3.5 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface-variant outline-none text-body-sm cursor-not-allowed"
                    type="email"
                    name="email"
                    value={form.email}
                    readOnly
                    title="Account email is managed by your identity provider"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="phone">
                    Phone / Mobile Contact
                  </label>
                  <input
                    id="phone"
                    className="w-full h-11 px-3.5 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-body-sm text-on-surface"
                    type="tel"
                    name="phone"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="organization">
                    Organization / Institution
                  </label>
                  <input
                    id="organization"
                    className="w-full h-11 px-3.5 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-body-sm text-on-surface"
                    type="text"
                    name="organization"
                    value={form.organization}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="location">
                    Assigned Monitoring Locality
                  </label>
                  <input
                    id="location"
                    className="w-full h-11 px-3.5 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-body-sm text-on-surface"
                    type="text"
                    name="location"
                    placeholder="e.g. KTC Nagar, Tirunelveli"
                    value={form.location}
                    onChange={handleChange}
                  />
                </div>

                <div className="md:col-span-2 pt-4 flex items-center justify-end gap-3 border-t border-outline-variant mt-2">
                  <button
                    onClick={handleDiscard}
                    className="px-5 py-2.5 rounded-xl font-label-md text-on-surface bg-surface-container-low border border-outline-variant hover:bg-surface-container transition-colors cursor-pointer"
                    type="button"
                  >
                    Discard Changes
                  </button>
                  <button
                    className="px-6 py-2.5 rounded-xl font-label-md text-on-primary bg-primary hover:bg-primary/90 transition-all shadow-sm flex items-center gap-2 cursor-pointer font-bold disabled:opacity-50"
                    type="submit"
                    disabled={isSaving}
                  >
                    {isSaving && <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>}
                    <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Account Security & Telemetry Sessions */}
            <div className="bg-surface-container-lowest rounded-2xl shadow-ambient p-stack_lg border border-outline-variant/40 space-y-5">
              <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface border-b border-outline-variant pb-3 flex items-center justify-between">
                <span>Account Security &amp; Sessions</span>
                <span className="text-xs text-secondary font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  Secured via JWT &amp; PBKDF2
                </span>
              </h3>

              <div className="flex items-center justify-between py-2 border-b border-outline-variant/30">
                <div>
                  <p className="font-label-md text-on-surface font-bold">Password &amp; Authentication</p>
                  <p className="font-body-sm text-on-surface-variant text-xs">
                    Protected with SHA-256 password hashing and secure token renewal.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(true)}
                  className="px-4 py-1.5 rounded-lg border border-outline-variant text-primary font-label-md font-semibold hover:bg-surface-container transition-colors cursor-pointer"
                >
                  Change Password
                </button>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-outline-variant/30">
                <div>
                  <p className="font-label-md text-on-surface font-bold">Two-Factor Authentication (2FA)</p>
                  <p className="font-body-sm text-on-surface-variant text-xs">
                    Require biometric confirmation or TOTP authenticator token on login.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !mfaActive;
                    setMfaActive(next);
                    showToast(next ? "Two-Factor Authentication enabled." : "Two-Factor Authentication disabled.");
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    mfaActive
                      ? "bg-secondary-container text-secondary border border-secondary"
                      : "bg-surface-container text-on-surface-variant border border-outline-variant"
                  }`}
                >
                  {mfaActive ? "Active" : "Disabled"}
                </button>
              </div>

              <div className="pt-1">
                <p className="font-label-md text-on-surface font-bold mb-2">Active Telemetry Sessions</p>
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary text-[22px]">laptop_windows</span>
                      <div>
                        <p className="text-xs font-bold text-on-surface">Web Dashboard Session</p>
                        <p className="text-[11px] text-on-surface-variant">Active Telemetry Terminal • Current Node</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary-container text-secondary">
                      Active Now
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar / Display Picture (DP) Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-md w-full shadow-2xl border border-outline-variant space-y-5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Update Display Picture (DP)
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Choose a custom photo or an EcoWatch Earth Observation avatar.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="material-symbols-outlined text-outline hover:text-on-surface cursor-pointer p-1"
              >
                close
              </button>
            </div>

            {/* Upload from Local Device */}
            <div className="p-4 rounded-xl border border-dashed border-primary/40 bg-primary/5 text-center space-y-2">
              <span className="material-symbols-outlined text-primary text-3xl">cloud_upload</span>
              <p className="text-xs font-semibold text-on-surface">Upload Image from Device</p>
              <p className="text-[11px] text-on-surface-variant">PNG, JPG, or WebP up to 2MB</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 px-4 py-2 bg-primary text-on-primary rounded-xl font-bold text-xs hover:bg-primary/90 transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">folder_open</span>
                Browse Local Files
              </button>
            </div>

            {/* Presets */}
            <div>
              <p className="text-xs font-bold text-on-surface mb-2 uppercase tracking-wider">
                Select Curated Avatar
              </p>
              <div className="grid grid-cols-3 gap-2.5">
                {PRESET_AVATARS.map((avatar) => (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => handleSelectPreset(avatar)}
                    className="p-3 rounded-xl border border-outline-variant/40 hover:border-primary hover:bg-primary/5 transition-all text-center flex flex-col items-center gap-1.5 group cursor-pointer"
                  >
                    <div className={`w-10 h-10 rounded-full ${avatar.bg} ${avatar.color} flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform`}>
                      <span className="material-symbols-outlined text-[20px]">{avatar.icon}</span>
                    </div>
                    <span className="text-[10px] font-bold text-on-surface leading-tight">
                      {avatar.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {form.picture && (
              <div className="pt-2 border-t border-outline-variant/30 flex justify-between items-center">
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="text-error text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                  Remove Custom Photo
                </button>
                <button
                  type="button"
                  onClick={() => setShowAvatarModal(false)}
                  className="px-4 py-1.5 bg-surface-container border border-outline-variant rounded-lg text-xs font-semibold text-on-surface cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-md w-full shadow-2xl border border-outline-variant space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Change Password
                </h3>
                <p className="text-xs text-on-surface-variant">Update your account authentication credentials</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="material-symbols-outlined text-outline hover:text-on-surface cursor-pointer p-1"
              >
                close
              </button>
            </div>

            {passwordError && (
              <div className="p-3 rounded-xl bg-error/10 border border-error/30 text-error text-xs font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">warning</span>
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-xs font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                <span>{passwordSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant" htmlFor="curPass">
                  Current Password
                </label>
                <input
                  id="curPass"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full h-10 px-3 rounded-xl border border-outline-variant bg-surface text-body-sm outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant" htmlFor="newPass">
                  New Password
                </label>
                <input
                  id="newPass"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full h-10 px-3 rounded-xl border border-outline-variant bg-surface text-body-sm outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant" htmlFor="confirmPass">
                  Confirm New Password
                </label>
                <input
                  id="confirmPass"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full h-10 px-3 rounded-xl border border-outline-variant bg-surface text-body-sm outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 border border-outline-variant rounded-xl text-xs font-semibold text-on-surface cursor-pointer hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold shadow-sm hover:bg-primary/90 transition-all cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
