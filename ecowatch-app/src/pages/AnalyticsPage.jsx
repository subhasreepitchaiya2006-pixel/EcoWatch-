import React, { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { useSatelliteData } from "../context/SatelliteDataContext";

const SECTORS = [
  { name: "North Sector", score: 84.2, trend: "trending_up", trendColor: "text-secondary", coverage: "62%" },
  { name: "East Sector", score: 79.5, trend: "trending_up", trendColor: "text-secondary", coverage: "54%" },
  { name: "West Sector", score: 68.1, trend: "trending_flat", trendColor: "text-on-tertiary-fixed-variant", coverage: "41%" },
  { name: "South Sector", score: 42.8, trend: "trending_down", trendColor: "text-error", coverage: "22%" },
];

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export default function AnalyticsPage() {
  const { aqi } = useSatelliteData();

  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [mapZoom, setMapZoom] = useState(1);
  const [selectedSector, setSelectedSector] = useState(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleExport = () => {
    showToast("Generating comprehensive environmental analytics PDF report...");
  };

  const handleRapidAnalysis = () => {
    showToast("Triggering rapid satellite raster telemetry analysis...");
  };

  const handleAiAsk = (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setAiResponse(
      `Specialist AI Analysis for "${aiPrompt}": Based on current telemetry data (AQI ${aqi}), immediate reforestation in South Sector will decrease localized soil erosion by 24% while increasing regional carbon sequestration.`
    );
  };

  return (
    <DashboardLayout>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 right-8 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-secondary-fixed">task_alt</span>
          <span className="text-body-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-stack_lg gap-stack_md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Environmental Analytics</h1>
          <p className="text-body-md text-on-surface-variant">Visualizing critical ecological shifts and performance metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-xl border border-outline-variant cursor-pointer hover:bg-surface-container transition-colors text-on-surface"
            >
              <span className="material-symbols-outlined text-body-md">calendar_month</span>
              <span className="text-label-md font-label-md">{dateRange}</span>
              <span className="material-symbols-outlined text-body-md">arrow_drop_down</span>
            </button>
            {showDatePicker && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-modal z-30 p-2 space-y-1">
                {["Last 7 Days", "Last 30 Days", "Last Quarter", "Year to Date"].map((range) => (
                  <button
                    key={range}
                    onClick={() => {
                      setDateRange(range);
                      setShowDatePicker(false);
                      showToast(`Updated analytics view to ${range}`);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-body-sm transition-colors ${
                      dateRange === range ? "bg-primary/10 text-primary font-bold" : "hover:bg-surface-container-low text-on-surface"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleExport}
            className="bg-primary text-on-primary px-4 py-2 rounded-xl font-label-md flex items-center gap-2 active:scale-95 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-body-md">download</span>
            Export Report
          </button>
        </div>
      </header>

      {/* KPI Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-gutter">
        {/* KPI 1 */}
        <div className="glass-card p-stack_lg rounded-xl soft-shadow flex flex-col justify-between">
          <div className="flex justify-between items-start mb-stack_sm">
            <div className="p-2 bg-secondary-container rounded-lg text-on-secondary-container">
              <span className="material-symbols-outlined">eco</span>
            </div>
            <span className="text-secondary font-label-sm px-2 py-1 bg-secondary-container rounded-full">+12.4%</span>
          </div>
          <div>
            <p className="text-label-md font-label-md text-on-surface-variant mb-1">Carbon Sequestration Rate</p>
            <h3 className="text-headline-md font-headline-md text-on-surface">
              4.2 <span className="text-body-sm font-normal text-on-surface-variant">MtCO2e/yr</span>
            </h3>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="glass-card p-stack_lg rounded-xl soft-shadow flex flex-col justify-between">
          <div className="flex justify-between items-start mb-stack_sm">
            <div className="p-2 bg-primary-container rounded-lg text-on-primary-container">
              <span className="material-symbols-outlined">bolt</span>
            </div>
            <span className="text-on-surface-variant font-label-sm px-2 py-1 bg-surface-container-high rounded-full">Target 70%</span>
          </div>
          <div>
            <p className="text-label-md font-label-md text-on-surface-variant mb-1">Renewable Energy Contribution</p>
            <h3 className="text-headline-md font-headline-md text-on-surface">64%</h3>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="glass-card p-stack_lg rounded-xl soft-shadow flex flex-col justify-between">
          <div className="flex justify-between items-start mb-stack_sm">
            <div className="p-2 bg-tertiary-container rounded-lg text-on-tertiary-container">
              <span className="material-symbols-outlined">air</span>
            </div>
            <span className="text-secondary font-label-sm px-2 py-1 bg-secondary-container rounded-full">Good</span>
          </div>
          <div>
            <p className="text-label-md font-label-md text-on-surface-variant mb-1">Average Air Quality Index</p>
            <h3 className="text-headline-md font-headline-md text-on-surface">
              {aqi} <span className="text-body-sm font-normal text-on-surface-variant">AQI</span>
            </h3>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="glass-card p-stack_lg rounded-xl soft-shadow flex flex-col justify-between">
          <div className="flex justify-between items-start mb-stack_sm">
            <div className="p-2 bg-on-tertiary-fixed-variant rounded-lg text-tertiary-fixed">
              <span className="material-symbols-outlined">water_drop</span>
            </div>
            <span className="text-primary font-label-sm px-2 py-1 bg-primary-fixed rounded-full">On Track</span>
          </div>
          <div>
            <p className="text-label-md font-label-md text-on-surface-variant mb-1">Water Conservation Target</p>
            <h3 className="text-headline-md font-headline-md text-on-surface">
              82% <span className="text-body-sm font-normal text-on-surface-variant">achieved</span>
            </h3>
          </div>
        </div>
      </section>

      {/* Historical Trends Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mb-gutter">
        {/* Multi-line Chart Card */}
        <div className="lg:col-span-2 glass-card p-stack_lg rounded-xl soft-shadow">
          <div className="flex items-center justify-between mb-stack_lg">
            <h4 className="font-headline-sm text-headline-sm text-on-surface">Temperature vs. Humidity Trends</h4>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-label-sm font-label-sm text-on-surface-variant">Temperature (°C)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-secondary" />
                <span className="text-label-sm font-label-sm text-on-surface-variant">Humidity (%)</span>
              </div>
            </div>
          </div>
          <div className="h-80 w-full flex items-end justify-between gap-2 px-2 relative border-b border-l border-outline-variant">
            <div className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t h-[60%] group relative">
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-on-surface text-surface text-[10px] px-2 py-1 rounded hidden group-hover:block whitespace-nowrap shadow-sm">
                Jan: 18°C
              </div>
            </div>
            <div className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t h-[65%]" />
            <div className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t h-[75%]" />
            <div className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t h-[85%]" />
            <div className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t h-[90%]" />
            <div className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t h-[80%]" />
            <div className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t h-[70%]" />
            <div className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t h-[60%]" />
            <div className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t h-[55%]" />
            <div className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t h-[65%]" />
            <div className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t h-[75%]" />
            <div className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t h-[85%]" />
            <div className="absolute inset-0 flex items-center justify-between px-4 opacity-50 pointer-events-none">
              <div className="w-full h-0.5 bg-secondary border-dashed border-t-2" />
            </div>
          </div>
          <div className="flex justify-between mt-4 text-[10px] text-on-surface-variant font-medium">
            {MONTHS.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>

        {/* Pollutant Distribution Stacked Bar */}
        <div className="glass-card p-stack_lg rounded-xl soft-shadow">
          <h4 className="font-headline-sm text-headline-sm text-on-surface mb-stack_lg">Pollutant Distribution</h4>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-label-sm font-label-sm">
                <span className="text-on-surface">Carbon Dioxide (CO2)</span>
                <span className="text-on-surface-variant">42%</span>
              </div>
              <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: "39.7061%" }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-label-sm font-label-sm">
                <span className="text-on-surface">Nitrogen Dioxide (NO2)</span>
                <span className="text-on-surface-variant">28%</span>
              </div>
              <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-secondary" style={{ width: "29.0795%" }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-label-sm font-label-sm">
                <span className="text-on-surface">Particulate Matter (PM2.5)</span>
                <span className="text-on-surface-variant">18%</span>
              </div>
              <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-tertiary" style={{ width: "18%" }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-label-sm font-label-sm">
                <span className="text-on-surface">Sulfur Dioxide (SO2)</span>
                <span className="text-on-surface-variant">12%</span>
              </div>
              <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-error" style={{ width: "12%" }} />
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-surface-variant">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-tertiary">info</span>
              <p className="text-body-sm text-on-surface-variant leading-relaxed">
                Overall air pollutant levels are 14% lower than the regional industrial average for this quarter.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Geographic & Regional Comparison */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-gutter mb-gutter">
        {/* Heatmap / Map Integration */}
        <div className="glass-card overflow-hidden rounded-xl soft-shadow border border-surface-variant flex flex-col">
          <div className="p-stack_lg flex items-center justify-between bg-white z-10">
            <h4 className="font-headline-sm text-headline-sm text-on-surface">Environmental Impact by Region</h4>
            <span className="px-3 py-1 bg-surface-container rounded-full text-label-sm font-label-sm text-on-surface-variant">
              Live Heatmap
            </span>
          </div>
          <div className="relative flex-1 min-h-[360px] bg-surface-container-low overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCnY5O1cBu-8ASIGXOKMknG1O-XK4B2Bw4iNVFCjiaBhCnSeqRzicHyYfh0BKrukfy1Go5elQIN0p4I5HzxEgXWX9x9K4yHpBbKpMbfakZNKCWvol6HIbkOOooMpxb16-kgSzXFjPk5GWw30tCZsNYFvkJQTAJYLl_W03i5awSefb3ay1fTQ9VuRZHye2IDuN7F-bmjcc9LWNEMxqljFqBGKXsXerS7buIcKSm-0Zjp8jDiHjT43_AErDzSLCy3cMnNIpt6HUxkwMOH')",
                transform: `scale(${mapZoom})`,
              }}
            />
            {/* Map Controls */}
            <div className="absolute right-4 bottom-4 flex flex-col gap-2 z-10">
              <button
                onClick={() => setMapZoom((z) => Math.min(2, z + 0.2))}
                className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">add</span>
              </button>
              <button
                onClick={() => setMapZoom((z) => Math.max(0.8, z - 0.2))}
                className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">remove</span>
              </button>
            </div>
            {/* Sector Labels (Floating UI) */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-outline-variant shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                <span className="text-label-sm font-label-sm text-on-surface">North Sector: Stable</span>
              </div>
              <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-outline-variant shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-error" />
                <span className="text-label-sm font-label-sm text-on-surface">South Sector: Critical</span>
              </div>
            </div>
          </div>
        </div>

        {/* Regional Comparison Table */}
        <div className="glass-card p-stack_lg rounded-xl soft-shadow border border-surface-variant">
          <h4 className="font-headline-sm text-headline-sm text-on-surface mb-stack_lg">Regional Sustainability Scores</h4>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-left">
                  <th className="p-3 font-label-sm text-label-sm text-on-surface-variant rounded-tl-lg">Sector</th>
                  <th className="p-3 font-label-sm text-label-sm text-on-surface-variant">Sustainability Index</th>
                  <th className="p-3 font-label-sm text-label-sm text-on-surface-variant">Green Coverage</th>
                  <th className="p-3 font-label-sm text-label-sm text-on-surface-variant rounded-tr-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-variant">
                {SECTORS.map((sec) => (
                  <tr key={sec.name} className="hover:bg-surface-container transition-colors group">
                    <td className="p-4 text-body-sm font-medium text-on-surface">{sec.name}</td>
                    <td className="p-4 text-body-sm">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${sec.trendColor}`}>{sec.score}</span>
                        <span className={`material-symbols-outlined text-[16px] ${sec.trendColor}`}>{sec.trend}</span>
                      </div>
                    </td>
                    <td className="p-4 text-body-sm text-on-surface">{sec.coverage}</td>
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedSector(sec)}
                        className="text-primary font-label-sm hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Predictive AI Insights Section */}
      <section className="p-stack_lg rounded-xl soft-shadow bg-primary text-on-primary relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-secondary/20 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row gap-gutter p-4">
          <div className="lg:w-1/2">
            <div className="flex items-center gap-3 mb-stack_md">
              <span className="material-symbols-outlined text-headline-sm">psychology</span>
              <h4 className="font-headline-sm text-headline-sm">AI-Powered Predictive Insights</h4>
            </div>
            <p className="text-body-md mb-stack_lg text-on-primary/90">
              Based on historical climate models and current industrial activity, our proprietary AI projects the following outcomes for Q3.
            </p>
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-sm">
              <h5 className="font-label-md text-label-md mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">analytics</span>
                Forecasted Environmental Impact (Q3)
              </h5>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-body-sm font-medium opacity-90">Sequestration Growth</span>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-secondary-fixed text-[18px]">trending_up</span>
                    <span className="text-secondary-fixed text-headline-sm font-bold">+8.2%</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary-fixed" style={{ width: "75%" }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-body-sm font-medium opacity-90">Potential Heat Stress (Urban)</span>
                  <span className="px-3 py-1 bg-tertiary-container text-on-tertiary-container rounded-full text-label-sm font-bold">
                    Medium Risk
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 flex flex-col justify-center">
            <h5 className="font-label-md text-label-md mb-stack_md text-secondary-fixed">Recommended Interventions</h5>
            <div className="space-y-stack_md">
              <div
                onClick={() => showToast("Selected Intervention: Reforestation Initiative")}
                className="flex gap-4 p-5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/5 hover:bg-white/20 transition-all cursor-pointer group/card"
              >
                <span className="material-symbols-outlined text-secondary-fixed">forest</span>
                <div>
                  <h6 className="font-label-md text-label-md">Reforestation - South Sector</h6>
                  <p className="text-body-sm text-on-primary/80">Immediate tree planting initiative recommended to counter high soil erosion data from satellite scans.</p>
                </div>
              </div>
              <div
                onClick={() => showToast("Selected Intervention: Flood Barrier Reinforcement")}
                className="flex gap-4 p-5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/5 hover:bg-white/20 transition-all cursor-pointer group/card"
              >
                <span className="material-symbols-outlined text-tertiary-fixed-dim">water_damage</span>
                <div>
                  <h6 className="font-label-md text-label-md">Flood Barrier Reinforcement</h6>
                  <p className="text-body-sm text-on-primary/80">West sector river banks showing 15% increased saturation. Early reinforcement advised before seasonal rains.</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowAiModal(true)}
              className="mt-6 flex items-center justify-center gap-2 w-full py-3 bg-white text-primary rounded-xl font-label-md font-bold hover:bg-primary-fixed transition-colors shadow-md active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[20px]">smart_toy</span>
              Ask Specialist AI
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-gutter pt-stack_lg border-t border-surface-variant flex flex-col md:flex-row justify-between items-center text-on-surface-variant text-body-sm gap-stack_md">
        <span>© 2026 EcoWatch Intelligence Platform. All rights reserved.</span>
        <div className="flex gap-stack_lg">
          <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
          <a className="hover:text-primary transition-colors" href="#">Documentation</a>
          <a className="hover:text-primary transition-colors" href="#">Contact Support</a>
        </div>
      </footer>

      {/* FAB Floating Action Button */}
      <button
        onClick={handleRapidAnalysis}
        className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all group z-40"
        title="Trigger Rapid Analysis"
      >
        <span className="material-symbols-outlined">bolt</span>
        <span className="absolute right-full mr-4 px-3 py-1.5 bg-on-surface text-surface text-label-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
          Trigger Rapid Analysis
        </span>
      </button>

      {/* Sector Details Modal */}
      {selectedSector && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-md w-full shadow-2xl border border-outline-variant space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                {selectedSector.name} Analytics
              </h3>
              <button onClick={() => setSelectedSector(null)} className="material-symbols-outlined text-outline hover:text-on-surface">
                close
              </button>
            </div>
            <div className="space-y-3 text-body-sm text-on-surface-variant">
              <div className="flex justify-between py-2 border-b border-outline-variant/20">
                <span>Sustainability Score</span>
                <span className={`font-bold ${selectedSector.trendColor}`}>{selectedSector.score}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-outline-variant/20">
                <span>Green Canopy Coverage</span>
                <span className="font-bold text-on-surface">{selectedSector.coverage}</span>
              </div>
            </div>
            <button onClick={() => setSelectedSector(null)} className="w-full py-2 bg-primary text-on-primary rounded-lg font-bold">
              Close Report
            </button>
          </div>
        </div>
      )}

      {/* Ask Specialist AI Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-outline-variant space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">smart_toy</span>
                Ask Specialist Environmental AI
              </h3>
              <button onClick={() => setShowAiModal(false)} className="material-symbols-outlined text-outline hover:text-on-surface">
                close
              </button>
            </div>
            <form onSubmit={handleAiAsk} className="space-y-3">
              <textarea
                rows={3}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ask about reforestation targets, heat mitigation, or regional carbon sink forecasts..."
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowAiModal(false)} className="px-4 py-2 border border-outline-variant rounded-lg text-body-sm">
                  Close
                </button>
                <button type="submit" className="px-4 py-2 bg-primary text-on-primary rounded-lg text-body-sm font-bold">
                  Analyze &amp; Advise
                </button>
              </div>
            </form>
            {aiResponse && (
              <div className="p-4 bg-primary/10 rounded-xl border border-primary/20 text-body-sm text-on-surface leading-relaxed">
                {aiResponse}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
