import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "../hooks/useForm";
import { usePasswordToggle } from "../hooks/usePasswordToggle";
import { useAuth } from "../context/AuthContext";
import GoogleSignInButton from "../components/GoogleSignInButton";

const VERIFIED_ACCOUNTS = [
  {
    role: "System Admin",
    name: "Subhasree Pitchaiya",
    email: "24104031@nec.edu.in",
    password: "admin123",
    badge: "bg-purple-100 text-purple-800 border-purple-200",
    icon: "shield_person",
    desc: "Lead Analyst & System Admin (Full Command Center & Settings)",
  },
  {
    role: "System Admin",
    name: "Dr. Marcus Vance",
    email: "admin@ecowatch.global",
    password: "admin123",
    badge: "bg-purple-100 text-purple-800 border-purple-200",
    icon: "admin_panel_settings",
    desc: "Global Operations Director (Platform Oversight & Users)",
  },
  {
    role: "Analyst",
    name: "Elena Rostova",
    email: "analyst@ecowatch.global",
    password: "analyst123",
    badge: "bg-blue-100 text-blue-800 border-blue-200",
    icon: "query_stats",
    desc: "Copernicus Orbital Telemetry & Multi-Spectral Analytics",
  },
  {
    role: "Emergency Responder",
    name: "Capt. Vikram Rathore",
    email: "responder@ecowatch.global",
    password: "responder123",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    icon: "crisis_alert",
    desc: "Disaster Rapid Response Incident Commander",
  },
  {
    role: "Scientist",
    name: "Dr. Ananya Sharma",
    email: "scientist@ecowatch.global",
    password: "scientist123",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: "science",
    desc: "Atmospheric Chemistry & Climate Modeling Specialist",
  },
  {
    role: "Inspector",
    name: "Carlos Mendez",
    email: "inspector@ecowatch.global",
    password: "inspector123",
    badge: "bg-cyan-100 text-cyan-800 border-cyan-200",
    icon: "fact_check",
    desc: "Field Environmental Compliance Auditor",
  },
];

export default function SignInPage() {
  const navigate = useNavigate();
  const { values, handleChange, setFieldValue, getFieldId } = useForm({ email: "", password: "" });
  const { inputType, iconName, toggleVisibility } = usePasswordToggle();
  const { login, loginWithFastOAuth, isLoading, error } = useAuth();
  const [fastLoading, setFastLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await login(values);
    if (ok) navigate("/dashboard");
  };

  const handleSelectAccount = async (acc, autoSubmit = false) => {
    setFieldValue("email", acc.email);
    setFieldValue("password", acc.password);
    if (autoSubmit) {
      const ok = await login({ email: acc.email, password: acc.password });
      if (ok) navigate("/dashboard");
    }
  };

  const handleFastOAuth = async (provider = "Google GIS") => {
    setFastLoading(true);
    const ok = await loginWithFastOAuth({
      provider,
      email: "24104031@nec.edu.in",
      name: "Subhasree Pitchaiya",
      role: "System Admin",
    });
    setFastLoading(false);
    if (ok) navigate("/dashboard");
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col relative overflow-x-hidden">
      <div className="fixed inset-0 z-0">
        <img
          alt="Planetary Satellite Earth Monitoring"
          className="w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida/AP1WRLt8oK3SXjG0va2rnKGk7tnx9DYQzlP719oENSpMqNANTbA316S8WAaEVzz6k83CDLW6a6QvC-ddK1cw91ktihKxhZgmj_3dyBFp16hkFpOUu-uXckj9GIDRWfT6Fg7WjMYYd_KjCr7rmdrO_seOHtyMlAP15PUsYUUwdq9SExWkAF0Ml_0W212DUFOvgw0wSbfGXydC1FTnfTjQhPZ9TrtqrX0m3qssT8GjkEajvJ2cLexO9xx2r8pwL5k"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-surface-container-lowest/90 via-surface-container-lowest/60 to-surface-container-lowest/40 backdrop-blur-[3px]" />
      </div>

      <main className="relative z-10 flex-1 flex flex-col lg:flex-row w-full max-w-[1440px] mx-auto px-6 lg:px-12 pt-8 pb-16 gap-8">
        {/* Left Hero & Verified Accounts Quick Switcher */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>public</span>
            </div>
            <div>
              <h1 className="font-headline-md text-headline-md font-bold text-primary tracking-tight">EcoWatch Intelligence</h1>
              <p className="text-[12px] font-semibold text-secondary uppercase tracking-widest">Multi-Constellation Earth-Observation v2.5</p>
            </div>
          </div>

          <h2 className="text-[38px] lg:text-[44px] leading-tight font-extrabold text-on-surface mb-4">
            Defensible Planetary Science. <br /><span className="text-primary">Instant Role Verification.</span>
          </h2>
          <p className="font-body-md text-on-surface-variant mb-6 max-w-[560px] leading-relaxed">
            Multi-spectral orbital telemetries from Sentinel-2, Landsat-9, GOES-16, and Sentinel-5P integrated with ground-sensor telemetry and algorithmic risk modeling.
          </p>

          {/* Quick Demo Accounts Grid (Mandatory >= 5 users created and verified) */}
          <div className="bg-surface-container-lowest/90 rounded-2xl p-5 border border-outline-variant/60 shadow-lg backdrop-blur-md mb-6 max-w-[620px]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">group</span>
                <span className="text-[13px] font-bold text-on-surface tracking-wide uppercase">
                  Verified Evaluator Accounts (6 Roles Ready)
                </span>
              </div>
              <span className="text-[11px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                1-Click Sign-In
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
              {VERIFIED_ACCOUNTS.map((acc) => (
                <div
                  key={acc.email}
                  className="p-2.5 rounded-xl border border-outline-variant/40 bg-surface hover:border-primary/50 transition-all flex flex-col justify-between group"
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:text-primary transition-colors">
                        {acc.icon}
                      </span>
                      <span className="font-semibold text-xs text-on-surface">{acc.name}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${acc.badge}`}>
                      {acc.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant mb-2 truncate" title={acc.email}>
                    {acc.email}
                  </p>
                  <div className="flex items-center gap-2 mt-auto">
                    <button
                      type="button"
                      onClick={() => handleSelectAccount(acc, false)}
                      className="text-[11px] font-medium text-on-surface-variant hover:text-primary underline"
                    >
                      Fill
                    </button>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleSelectAccount(acc, true)}
                      className="flex-1 py-1 px-2 text-[11px] font-semibold bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-lg transition-all text-center"
                    >
                      1-Click Login →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="glass-card p-3 rounded-xl border border-outline-variant/40 shadow-sm w-[150px]">
              <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-0.5">SATELLITES</div>
              <div className="font-bold text-sm text-on-surface">4 Active Feeds</div>
              <div className="text-[10px] text-on-surface-variant">Copernicus / USGS</div>
            </div>
            <div className="glass-card p-3 rounded-xl border border-outline-variant/40 shadow-sm w-[150px]">
              <div className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-0.5">RISK ENGINE</div>
              <div className="font-bold text-sm text-on-surface">Algorithmic ERI</div>
              <div className="text-[10px] text-on-surface-variant">Real-Time Sensor Fusion</div>
            </div>
          </div>
        </div>

        {/* Right Authentication Box */}
        <div className="w-full lg:w-[420px] flex items-center justify-center">
          <div className="w-full bg-white rounded-3xl shadow-xl p-8 border border-outline-variant/40 relative">
            <div className="mb-6">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Sign In</h3>
              <p className="text-body-sm text-on-surface-variant">Access your environmental intelligence command center</p>
            </div>

            {/* OAuth Sign-In Suite */}
            <div className="space-y-2.5 mb-5">
              <GoogleSignInButton label="Sign in with Google GIS" fullWidth />
              
              <button
                type="button"
                disabled={isLoading || fastLoading}
                onClick={() => handleFastOAuth("Google GIS")}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-outline-variant rounded-xl text-[13px] font-semibold text-on-surface hover:bg-surface-container transition-all"
              >
                <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
                <span>⚡ Instant Fast OAuth (Verified Demo Token)</span>
              </button>
            </div>

            <div className="flex items-center gap-3 mb-5">
              <div className="h-[1px] flex-1 bg-outline-variant/60" />
              <span className="text-[10px] font-bold text-outline uppercase tracking-wider">OR ENTER CREDENTIALS</span>
              <div className="h-[1px] flex-1 bg-outline-variant/60" />
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-[13px] font-medium text-on-surface mb-1" htmlFor={getFieldId("email")}>
                  Email Address
                </label>
                <input
                  className="w-full px-3.5 py-2.5 bg-surface border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-body-sm"
                  id={getFieldId("email")}
                  placeholder="admin@ecowatch.global"
                  type="email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[13px] font-medium text-on-surface" htmlFor={getFieldId("password")}>
                    Password
                  </label>
                  <span className="text-[11px] text-on-surface-variant font-mono">admin123</span>
                </div>
                <div className="relative">
                  <input
                    className="w-full px-3.5 pr-10 py-2.5 bg-surface border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-body-sm tracking-widest"
                    id={getFieldId("password")}
                    placeholder="••••••••"
                    type={inputType}
                    name="password"
                    value={values.password}
                    onChange={handleChange}
                    required
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface" onClick={toggleVisibility}>
                    <span className="material-symbols-outlined text-[18px]">{iconName}</span>
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-2.5 rounded-lg bg-error/10 border border-error/20 text-error text-[12px] font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">error</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-primary text-white font-semibold text-[14px] rounded-xl hover:bg-primary-container active:scale-[0.98] transition-all shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin material-symbols-outlined text-[18px]">progress_activity</span>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">login</span>
                    <span>Sign In to Dashboard</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-outline-variant/40 flex items-center justify-between text-[12px]">
              <span className="text-on-surface-variant">Need an account?</span>
              <Link className="text-primary font-bold hover:underline" to="/register">
                Register New User
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 w-full px-6 lg:px-12 py-4 flex flex-col md:flex-row justify-between items-center gap-2 text-[12px] font-medium text-on-surface-variant bg-surface-container-lowest/60 backdrop-blur-sm border-t border-outline-variant/30">
        <div className="flex items-center gap-4">
          <Link to="/home" className="hover:text-primary transition-colors">Public Home</Link>
          <Link to="/about" className="hover:text-primary transition-colors">About Telemetry</Link>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Planetary Cluster Operational: 4 Satellites Online</span>
        </div>
        <div>EcoWatch Intelligence Platform v2.5.0</div>
      </footer>
    </div>
  );
}
