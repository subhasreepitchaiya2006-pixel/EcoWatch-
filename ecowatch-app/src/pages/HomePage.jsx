import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { useTimePreferences } from "../context/TimePreferencesContext";

export default function HomePage() {
  const { toggleTheme, isDark } = useTheme();
  const { language, setLanguage, options: languageOptions, translate: t } = useLanguage();
  const { timezone, setTimezone, timeFormat, setTimeFormat, timezoneOptions, timeFormatOptions } = useTimePreferences();

  return (
    <div className="text-on-surface overflow-x-hidden bg-background min-h-screen flex flex-col justify-between">
      {/* Navigation Bar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center h-16 px-container_padding bg-surface-container-lowest shadow-sm border-b border-outline-variant">
        <Link to="/home" className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary font-bold text-3xl">public</span>
          <span className="font-headline-md text-headline-md font-bold text-primary">EcoWatch Intelligence</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link className="font-body-md text-body-md text-primary font-bold border-b-2 border-primary pb-1" to="/home">{t("home")}</Link>
          <Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" to="/about">{t("about")}</Link>
          <Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" to="/weather-guest">{t("weather")}</Link>
        </nav>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-low px-2.5 py-1.5">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">language</span>
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              aria-label="Language preference"
              className="bg-transparent text-label-md text-on-surface outline-none"
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div className="hidden lg:flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-low px-2.5 py-1.5">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">schedule</span>
            <select value={timezone} onChange={(event) => setTimezone(event.target.value)} aria-label="Timezone preference" className="max-w-[130px] bg-transparent text-label-sm text-on-surface outline-none">
              {timezoneOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <select value={timeFormat} onChange={(event) => setTimeFormat(event.target.value)} aria-label="Time format preference" className="bg-transparent text-label-sm text-on-surface outline-none">
              {timeFormatOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          <button onClick={toggleTheme} className="p-2 hover:bg-surface-container-low rounded-full transition-colors" title="Toggle theme">
            <span className="material-symbols-outlined text-on-surface-variant">{isDark ? "light_mode" : "dark_mode"}</span>
          </button>
          <Link to="/signin" className="px-6 py-2 rounded-lg font-label-md text-label-md text-primary hover:bg-surface-container-low transition-all">Login</Link>
          <Link to="/register" className="px-6 py-2 rounded-lg font-label-md text-label-md bg-primary text-on-primary hover:opacity-90 shadow-sm transition-all">Get Started</Link>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="pt-16 flex-1 flex items-center justify-center">
        <section
          className="relative w-full h-[90vh] flex items-center justify-center overflow-hidden bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1600&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="home-hero-overlay absolute inset-0" />
          <div className="relative z-10 max-w-5xl px-container_padding text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container mb-6">
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <span className="font-label-sm text-label-sm">{t("tag")}</span>
            </div>
            <h1 className="text-[48px] leading-tight font-bold text-on-surface mb-6 tracking-tight">
              {t("title")}
            </h1>
            <p className="font-headline-sm text-headline-sm text-on-surface mb-2">
              {t("subtitle")}
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant opacity-80 mb-10">
              {t("note")}
            </p>
            
            {/* Action Buttons: Get Started */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="w-full sm:w-auto px-10 py-4 bg-primary text-on-primary rounded-xl font-headline-sm text-headline-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg">
                {t("start")}
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-stack_lg px-container_padding border-t border-outline-variant bg-surface-container-low">
        <div className="max-w-7xl mx-auto pt-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body-sm text-body-sm text-on-surface-variant">© 2026 EcoWatch Intelligence. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/about" className="text-body-sm text-on-surface-variant hover:text-primary transition-colors">{t("footerAbout")}</Link>
            <span className="material-symbols-outlined text-outline-variant hover:text-primary cursor-pointer transition-colors">language</span>
            <span className="material-symbols-outlined text-outline-variant hover:text-primary cursor-pointer transition-colors">help_outline</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
