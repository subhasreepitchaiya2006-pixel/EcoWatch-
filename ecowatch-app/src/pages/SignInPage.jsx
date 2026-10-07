import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "../hooks/useForm";
import { usePasswordToggle } from "../hooks/usePasswordToggle";
import { useAuth } from "../context/AuthContext";
import GoogleSignInButton from "../components/GoogleSignInButton";

import safeStorage from "../lib/safeStorage";

const VERIFIED_ROLE_ACCOUNTS = [
  {
    role: "Citizen",
    email: "citizen@ecowatch.global",
    password: "citizen123",
    icon: "nature_people",
    tag: "Public",
    cardBg: "bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/60 text-emerald-950 dark:text-emerald-200",
    activeCard: "bg-emerald-500/15 border-emerald-600 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/30 shadow-xs font-semibold",
    iconBg: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  },
  {
    role: "System Admin",
    email: "24104031@nec.edu.in",
    password: "admin@123",
    icon: "shield_person",
    tag: "Admin",
    cardBg: "bg-indigo-500/5 hover:bg-indigo-500/10 border-indigo-500/30 hover:border-indigo-500/60 text-indigo-950 dark:text-indigo-200",
    activeCard: "bg-indigo-500/15 border-indigo-600 text-indigo-950 dark:text-indigo-100 ring-2 ring-indigo-500/30 shadow-xs font-semibold",
    iconBg: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
  },
  {
    role: "Analyst",
    email: "analyst@ecowatch.global",
    password: "analyst123",
    icon: "analytics",
    tag: "Analytics",
    cardBg: "bg-teal-500/5 hover:bg-teal-500/10 border-teal-500/30 hover:border-teal-500/60 text-teal-950 dark:text-teal-200",
    activeCard: "bg-teal-500/15 border-teal-600 text-teal-950 dark:text-teal-100 ring-2 ring-teal-500/30 shadow-xs font-semibold",
    iconBg: "bg-teal-500/15 text-teal-700 dark:text-teal-300",
  },
  {
    role: "Scientist",
    email: "scientist@ecowatch.global",
    password: "scientist123",
    icon: "biotech",
    tag: "Research",
    cardBg: "bg-sky-500/5 hover:bg-sky-500/10 border-sky-500/30 hover:border-sky-500/60 text-sky-950 dark:text-sky-200",
    activeCard: "bg-sky-500/15 border-sky-600 text-sky-950 dark:text-sky-100 ring-2 ring-sky-500/30 shadow-xs font-semibold",
    iconBg: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  },
  {
    role: "Emergency Responder",
    email: "responder@ecowatch.global",
    password: "responder123",
    icon: "emergency",
    tag: "Operations",
    cardBg: "bg-rose-500/5 hover:bg-rose-500/10 border-rose-500/30 hover:border-rose-500/60 text-rose-950 dark:text-rose-200",
    activeCard: "bg-rose-500/15 border-rose-600 text-rose-950 dark:text-rose-100 ring-2 ring-rose-500/30 shadow-xs font-semibold",
    iconBg: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  },
  {
    role: "Inspector",
    email: "inspector@ecowatch.global",
    password: "inspector123",
    icon: "fact_check",
    tag: "Compliance",
    cardBg: "bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/30 hover:border-amber-500/60 text-amber-950 dark:text-amber-200",
    activeCard: "bg-amber-500/15 border-amber-600 text-amber-950 dark:text-amber-100 ring-2 ring-amber-500/30 shadow-xs font-semibold",
    iconBg: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
  },
];

export default function SignInPage() {
  const navigate = useNavigate();
  const [rememberMe, setRememberMe] = useState(() => safeStorage.getItem("ecowatch-remember-pref") !== "false");

  const initialEmail = safeStorage.getItem("ecowatch-remember-email", "24104031@nec.edu.in");
  const initialPassword = safeStorage.getItem("ecowatch-remember-password", "admin@123");

  const { values, handleChange, getFieldId, setValues } = useForm({
    email: initialEmail,
    password: initialPassword,
  });

  const { inputType, iconName, toggleVisibility } = usePasswordToggle();
  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rememberMe) {
      safeStorage.setItem("ecowatch-remember-email", values.email);
      safeStorage.setItem("ecowatch-remember-password", values.password);
      safeStorage.setItem("ecowatch-remember-pref", "true");
    } else {
      safeStorage.removeItem("ecowatch-remember-email");
      safeStorage.removeItem("ecowatch-remember-password");
      safeStorage.setItem("ecowatch-remember-pref", "false");
    }
    const ok = await login(values);
    if (ok) navigate("/dashboard");
  };

  const handleQuickLogin = async (email = "24104031@nec.edu.in", password = "admin@123") => {
    setValues({ email, password });
    if (rememberMe) {
      safeStorage.setItem("ecowatch-remember-email", email);
      safeStorage.setItem("ecowatch-remember-password", password);
      safeStorage.setItem("ecowatch-remember-pref", "true");
    }
    const ok = await login({ email, password });
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

      <main className="relative z-10 flex-1 flex flex-col lg:flex-row w-full max-w-[1440px] mx-auto px-6 lg:px-12 pt-12 pb-16 gap-12 items-center">
        {/* Left Hero Overview */}
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

          <h2 className="text-[38px] lg:text-[46px] leading-tight font-extrabold text-on-surface mb-4">
            Defensible Planetary Science. <br /><span className="text-primary">Real-Time Environmental Intelligence.</span>
          </h2>
          <p className="font-body-md text-on-surface-variant mb-8 max-w-[580px] leading-relaxed text-base">
            Multi-spectral orbital telemetries from Sentinel-2, Landsat-9, GOES-16, and Sentinel-5P integrated with live sensor telemetry and algorithmic risk modeling.
          </p>

          {/* Platform Capability Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-8 max-w-[580px]">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/50 backdrop-blur-sm shadow-sm">
              <span className="material-symbols-outlined text-primary text-2xl">satellite_alt</span>
              <div>
                <div className="font-bold text-xs text-on-surface">Satellite Constellation</div>
                <div className="text-[11px] text-on-surface-variant">Copernicus &amp; USGS multi-spectral feeds</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/50 backdrop-blur-sm shadow-sm">
              <span className="material-symbols-outlined text-secondary text-2xl">monitoring</span>
              <div>
                <div className="font-bold text-xs text-on-surface">Algorithmic Risk (ERI)</div>
                <div className="text-[11px] text-on-surface-variant">Real-time planetary hazard calculation</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/50 backdrop-blur-sm shadow-sm">
              <span className="material-symbols-outlined text-amber-600 text-2xl">warning</span>
              <div>
                <div className="font-bold text-xs text-on-surface">Disaster Early Warning</div>
                <div className="text-[11px] text-on-surface-variant">Floods, fires, and atmospheric anomalies</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/50 backdrop-blur-sm shadow-sm">
              <span className="material-symbols-outlined text-emerald-600 text-2xl">groups</span>
              <div>
                <div className="font-bold text-xs text-on-surface">Community Ground-Truth</div>
                <div className="text-[11px] text-on-surface-variant">Citizen verified ecological reporting</div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="glass-card p-3.5 rounded-xl border border-outline-variant/40 shadow-sm w-[160px]">
              <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-0.5">SATELLITES</div>
              <div className="font-bold text-sm text-on-surface">4 Active Feeds</div>
              <div className="text-[10px] text-on-surface-variant">Copernicus / USGS</div>
            </div>
            <div className="glass-card p-3.5 rounded-xl border border-outline-variant/40 shadow-sm w-[160px]">
              <div className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-0.5">RISK ENGINE</div>
              <div className="font-bold text-sm text-on-surface">Algorithmic ERI</div>
              <div className="text-[10px] text-on-surface-variant">Real-Time Sensor Fusion</div>
            </div>
          </div>
        </div>

        {/* Right Authentication Box */}
        <div className="w-full lg:w-[430px] flex items-center justify-center">
          <div className="w-full bg-white rounded-3xl shadow-xl p-8 border border-outline-variant/40 relative">
            <div className="mb-5">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Sign In</h3>
              <p className="text-body-sm text-on-surface-variant">Access your environmental intelligence command center</p>
            </div>


            {/* OAuth Sign-In Suite */}
            <div className="mb-4">
              <GoogleSignInButton label="Continue with Google" fullWidth />
            </div>

            <div className="flex items-center gap-3 mb-4">
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
                  className="w-full px-3.5 py-2.5 bg-surface border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-body-sm font-medium"
                  id={getFieldId("email")}
                  placeholder="24104031@nec.edu.in"
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
                </div>
                <div className="relative">
                  <input
                    className="w-full px-3.5 pr-10 py-2.5 bg-surface border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-body-sm"
                    id={getFieldId("password")}
                    placeholder="••••••••"
                    type={inputType}
                    name="password"
                    value={values.password}
                    onChange={handleChange}
                    required
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface cursor-pointer" onClick={toggleVisibility}>
                    <span className="material-symbols-outlined text-[18px]">{iconName}</span>
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between text-[12px] pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-on-surface font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant accent-primary cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>
              </div>

              {/* Quick Role-Based Account Selector */}
              <div className="pt-3 pb-1 border-t border-outline-variant/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px] text-primary">badge</span>
                    Sign-In by Role:
                  </span>
                  <span className="text-[10px] text-on-surface-variant/70 font-medium">Select role to sign in</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {VERIFIED_ROLE_ACCOUNTS.map((acc) => {
                    const isSelected = values.email === acc.email;
                    return (
                      <button
                        key={acc.email}
                        type="button"
                        onClick={() => {
                          setValues({ email: acc.email, password: acc.password });
                        }}
                        className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all duration-150 text-left cursor-pointer ${
                          isSelected ? acc.activeCard : acc.cardBg
                        }`}
                        title={`Switch to ${acc.role} role`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${acc.iconBg}`}
                          >
                            <span className="material-symbols-outlined text-[17px]">{acc.icon}</span>
                          </div>
                          <span className="text-[12px] font-semibold tracking-tight truncate">
                            {acc.role}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="material-symbols-outlined text-[16px] text-primary shrink-0 ml-1">
                            check_circle
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && (
                <div className="p-2.5 rounded-lg bg-error/10 border border-error/20 text-error text-[12px] font-medium flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">error</span>
                    <span>{error}</span>
                  </div>
                  {error.includes("register") && (
                    <Link to="/register" className="underline font-bold text-primary shrink-0 hover:opacity-80">
                      Register Now
                    </Link>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-primary text-white font-semibold text-[14px] rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin material-symbols-outlined text-[18px]">progress_activity</span>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">login</span>
                    <span>Sign In</span>
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
