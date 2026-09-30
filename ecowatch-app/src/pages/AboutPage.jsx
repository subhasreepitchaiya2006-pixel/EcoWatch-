import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export default function AboutPage() {
  const { toggleTheme, isDark } = useTheme();

  return (
    <div className="text-on-surface overflow-x-hidden bg-background min-h-screen flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center h-16 px-container_padding bg-surface-container-lowest shadow-sm border-b border-outline-variant">
        <Link to="/home" className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary font-bold text-3xl">public</span>
          <span className="font-headline-md text-headline-md font-bold text-primary">EcoWatch Intelligence</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" to="/home">Home</Link>
          <Link className="font-body-md text-body-md text-primary font-bold border-b-2 border-primary pb-1" to="/about">About Us</Link>
          <Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" to="/weather-guest">Weather</Link>
        </nav>
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="p-2 hover:bg-surface-container-low rounded-full transition-colors" title="Toggle theme">
            <span className="material-symbols-outlined text-on-surface-variant">{isDark ? "light_mode" : "dark_mode"}</span>
          </button>
          <Link to="/signin" className="px-6 py-2 rounded-lg font-label-md text-label-md text-primary hover:bg-surface-container-low transition-all">Login</Link>
          <Link to="/register" className="px-6 py-2 rounded-lg font-label-md text-label-md bg-primary text-on-primary hover:opacity-90 shadow-sm transition-all">Get Started</Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main
        className="pt-24 pb-16 flex-1"
        style={{
          backgroundImage:
            "linear-gradient(rgba(7, 13, 15, 0.42), rgba(7, 13, 15, 0.62)), url('https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1600&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* About Hero Banner */}
        <section className="max-w-7xl mx-auto px-container_padding text-center py-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary mb-6">
            <span className="material-symbols-outlined text-[18px]">info</span>
            <span className="font-label-sm text-label-sm uppercase tracking-widest font-bold">About EcoWatch Intelligence</span>
          </div>
          <h1 className="text-[42px] md:text-[54px] font-bold text-on-surface mb-6 tracking-tight leading-tight">
            Pioneering Pure <span className="text-primary">Satellite Earth Observation.</span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl mx-auto leading-relaxed">
            EcoWatch Intelligence is a 100% software-driven Earth Observation (EO) platform fusing multi-spectral satellite telemetry, orbital radiometers, and predictive AI to monitor planetary health without ground hardware.
          </p>
        </section>

        {/* Feature Cards Section (Matching SS media_1787821807934.png) */}
        <section className="py-16" style={{ backgroundImage: "radial-gradient(#e2e8f0 1.5px, transparent 1.5px)", backgroundSize: "28px 28px" }}>
          <div className="max-w-7xl mx-auto px-container_padding">
            <div className="mb-14 text-center max-w-3xl mx-auto">
              <h2 className="font-headline-lg text-[32px] md:text-[36px] font-bold text-on-surface mb-4">
                Unrivaled Precision, Global Reach
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Our satellite-integrated remote observation platform provides the granular data needed to navigate the complex environmental landscape of the 21st century.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1: Global Satellite Monitoring */}
              <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/30 hover:border-primary/20 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-[#dbe1ff] text-[#004ac6] rounded-xl flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-2xl">satellite_alt</span>
                  </div>
                  <h3 className="text-headline-sm font-bold mb-3 text-on-surface">Global Satellite Monitoring</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    Sub-meter resolution satellite imagery and multispectral data updated hourly for every square kilometer of the planet.
                  </p>
                </div>
              </div>

              {/* Card 2: Predictive Analytics */}
              <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/30 hover:border-primary/20 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-[#6cf8bb] text-[#005236] rounded-xl flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-2xl">psychology</span>
                  </div>
                  <h3 className="text-headline-sm font-bold mb-3 text-on-surface">Predictive Analytics</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    Proprietary AI-driven models forecasting climate risk, flood vulnerabilities, and disaster probabilities with 98% historical accuracy.
                  </p>
                </div>
              </div>

              {/* Card 3: Real-time Alerts */}
              <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/30 hover:border-primary/20 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-[#ffddb8] text-[#784b00] rounded-xl flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-2xl">notifications_active</span>
                  </div>
                  <h3 className="text-headline-sm font-bold mb-3 text-on-surface">Real-time Alerts</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    Instant notification system for environmental anomalies, seismic shifts, and extreme weather events via API, Slack, or SMS.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Card Section (Matching SS media_1787821822155.png) */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-container_padding">
            <div className="bg-[#2563eb] text-white rounded-[32px] p-10 md:p-16 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
              <div className="relative z-10 max-w-2xl">
                <h2 className="text-[36px] md:text-[44px] font-bold mb-4 leading-tight tracking-tight">
                  Ready to master your environmental footprint?
                </h2>
                <p className="text-[16px] md:text-[18px] opacity-90 leading-relaxed font-body-md">
                  Join 500+ enterprises using EcoWatch's satellite intelligence to drive sustainability and operational excellence.
                </p>
              </div>
              <div className="relative z-10 flex flex-wrap gap-4 min-w-max">
                <Link
                  to="/register"
                  className="px-8 py-3.5 bg-white text-[#2563eb] font-bold text-body-md rounded-xl hover:bg-gray-100 transition-all shadow-md"
                >
                  Create Free Account
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-stack_lg px-container_padding border-t border-outline-variant bg-surface-container-low">
        <div className="max-w-7xl mx-auto pt-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body-sm text-body-sm text-on-surface-variant">© 2026 EcoWatch Intelligence. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/about" className="text-body-sm text-on-surface-variant hover:text-primary transition-colors">About Us</Link>
            <span className="material-symbols-outlined text-outline-variant hover:text-primary cursor-pointer transition-colors">language</span>
            <span className="material-symbols-outlined text-outline-variant hover:text-primary cursor-pointer transition-colors">help_outline</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
