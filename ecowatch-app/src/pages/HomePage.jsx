import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export default function HomePage() {
  const { toggleTheme, isDark } = useTheme();

  return (
    <div className="text-on-surface overflow-x-hidden bg-background min-h-screen flex flex-col justify-between">
      {/* Navigation Bar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center h-16 px-container_padding bg-surface-container-lowest shadow-sm border-b border-outline-variant">
        <Link to="/home" className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary font-bold text-3xl">public</span>
          <span className="font-headline-md text-headline-md font-bold text-primary">EcoWatch Intelligence</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link className="font-body-md text-body-md text-primary font-bold border-b-2 border-primary pb-1" to="/home">Home</Link>
          <Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" to="/about">About Us</Link>
          <Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" to="/demo">Demo</Link>
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

      {/* Main Hero Section */}
      <main className="pt-16 flex-1 flex items-center justify-center">
        <section className="relative w-full h-[90vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              className="w-full h-full object-cover"
              alt="Earth from Orbit Satellite View"
              src="https://lh3.googleusercontent.com/aida/AP1WRLv6l6VIct1T-oflbjGzpZoCpWiVAhEtbFmWXf6UiQK5PnQ1YnlQ2s3hPTB5SHCSNZZS7x4yFhGpOl1IqotTpRFwRS3oJr5iTE1eSLqqTw4R6wA6IBDMzWAt0_rgpYPiH2WykSb8ChTAnbXJMS2coJaAmdO2gFgrm7kBfXzShsrMVo6EJpKj8851MlOmvgVmvaVJfBj6kB_KBL6xN2C_bz2-Mjui1p4cFAjcbjESExE0GEOWKy6Qs1F2GRA"
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to bottom, rgba(247,249,251,0.1) 0%, rgba(247,249,251,1) 95%)" }}
            />
          </div>
          <div className="relative z-10 max-w-5xl px-container_padding text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container mb-6">
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <span className="font-label-sm text-label-sm">Satellite Data Suite 2.0 Now Live</span>
            </div>
            <h1 className="text-[48px] leading-tight font-bold text-on-surface mb-6 tracking-tight">
              Intelligence for a <span className="text-primary">Changing Planet.</span>
            </h1>
            <p className="font-headline-sm text-headline-sm text-on-surface mb-2">
              Satellite-Integrated Smart Weather Alert and Environmental Intelligence Platform
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant opacity-80 mb-10">
              Frontend-only • Public APIs • Static hosting • No server maintenance
            </p>
            
            {/* Action Buttons: Get Started & Request a Demo */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="w-full sm:w-auto px-10 py-4 bg-primary text-on-primary rounded-xl font-headline-sm text-headline-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg">
                Get Started
              </Link>
              <Link to="/demo" className="w-full sm:w-auto px-10 py-4 border-2 border-primary text-primary bg-white/90 rounded-xl font-headline-sm text-headline-sm hover:bg-surface-container-low transition-all">
                Request a Demo
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
            <Link to="/about" className="text-body-sm text-on-surface-variant hover:text-primary transition-colors">About Us</Link>
            <Link to="/demo" className="text-body-sm text-on-surface-variant hover:text-primary transition-colors">Request Demo</Link>
            <span className="material-symbols-outlined text-outline-variant hover:text-primary cursor-pointer transition-colors">language</span>
            <span className="material-symbols-outlined text-outline-variant hover:text-primary cursor-pointer transition-colors">help_outline</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
