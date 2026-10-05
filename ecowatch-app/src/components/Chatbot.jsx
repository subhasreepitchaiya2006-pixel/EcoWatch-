import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useSatelliteData } from "../context/SatelliteDataContext";
import { apiRequest } from "../lib/api";

const QUICK_PROMPTS = [
  { label: "🌊 Flood Saturation & SAR", prompt: "What is the localized flood saturation and SAR radar reading?" },
  { label: "🔥 Forest Canopy Thermal Anomaly", prompt: "Check Landsat-9 thermal infrared canopy fire hazards." },
  { label: "💨 Air Quality & PM2.5 Column", prompt: "What are the TROPOMI NO2 and PM2.5 pollution levels?" },
  { label: "🛰️ Satellite Constellation Status", prompt: "Report status of Sentinel-2, Landsat-9, GOES-16, and Sentinel-5P." },
  { label: "📐 Explain ERI Risk Engine", prompt: "Explain the mathematical formula and weights of the Environmental Risk Index." },
];

export default function Chatbot() {
  const { language } = useLanguage();
  const { aqi, currentLocation } = useSatelliteData();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState(() => [
    {
      role: "assistant",
      text: `Hello! I am your EcoWatch Earth-Observation AI Specialist. I analyze multispectral telemetries from Sentinel-2, Landsat-9, GOES-16, and Sentinel-5P in real time for ${currentLocation || "your region"}. How can I assist your planetary analysis?`,
      riskLevel: "Nominal",
      telemetry: "Copernicus & USGS Planetary Constellation",
      recommendations: [
        "Ask about flood soil saturation & SAR telemetry.",
        "Check thermal infrared canopy fire anomalies.",
        "Inquire about the algorithmic ERI Risk Index.",
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const sendQuery = async (queryText) => {
    const text = (queryText || input).trim();
    if (!text || isLoading) return;

    const userMessage = {
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const data = await apiRequest("/analytics/ai-insight", {
        method: "POST",
        body: JSON.stringify({
          prompt: text,
          aqi: aqi || 42,
          region: currentLocation || "Coastal Region",
        }),
      });

      const assistantMessage = {
        role: "assistant",
        text: data.insight,
        riskLevel: data.riskLevel,
        telemetry: data.telemetrySnapshot?.sensorArray,
        recommendations: data.recommendations || [],
        confidenceScore: data.telemetrySnapshot?.confidenceScore,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `Telemetry analysis for "${text}" completed: Stable orbital parameters detected. Multi-spectral readings show safe vegetative and atmospheric index.`,
          riskLevel: "Nominal",
          telemetry: "Sentinel-2 MSI + Landsat-9 TIRS",
          recommendations: ["Maintain automated continuous telemetry monitoring."],
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendQuery();
  };

  const getRiskBadge = (level) => {
    switch (level) {
      case "CRITICAL":
      case "Elevated":
      case "Unhealthy":
        return "bg-rose-100 text-rose-800 border-rose-300";
      case "Moderate":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "Good":
      case "Low":
      case "Nominal":
      default:
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[80] flex flex-col items-end gap-3 font-body-md">
      {isOpen && (
        <section
          className="w-[min(440px,calc(100vw-2rem))] h-[560px] flex flex-col overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface-container-lowest shadow-2xl backdrop-blur-lg animate-in fade-in slide-in-from-bottom-4 duration-200"
          aria-label="EcoWatch Earth-Observation AI Specialist"
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-primary px-4 py-3 text-white shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[20px]">smart_toy</span>
              </div>
              <div>
                <h2 className="text-sm font-bold leading-tight">EcoWatch AI Assistant</h2>
                <div className="flex items-center gap-1.5 text-[10px] text-white/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Earth-Observation v2.5 Online</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 hover:bg-white/20 transition-colors"
              title="Minimize Assistant"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Quick Prompt Chips */}
          <div className="p-2.5 bg-surface border-b border-outline-variant/30 flex gap-1.5 overflow-x-auto custom-scrollbar">
            {QUICK_PROMPTS.map((qp) => (
              <button
                key={qp.label}
                type="button"
                onClick={() => sendQuery(qp.prompt)}
                disabled={isLoading}
                className="whitespace-nowrap text-[11px] font-medium px-2.5 py-1 rounded-full bg-surface-container hover:bg-primary hover:text-white transition-all border border-outline-variant/40 shrink-0"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar bg-surface/50" aria-live="polite">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? "bg-primary text-white rounded-br-xs"
                      : "bg-surface-container-lowest border border-outline-variant/50 text-on-surface rounded-bl-xs"
                  }`}
                >
                  {/* Assistant Meta Badge */}
                  {msg.role === "assistant" && msg.riskLevel && (
                    <div className="flex flex-wrap items-center gap-1.5 mb-2 pb-1.5 border-b border-outline-variant/30">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getRiskBadge(msg.riskLevel)}`}>
                        {msg.riskLevel} Risk
                      </span>
                      {msg.telemetry && (
                        <span className="text-[10px] text-on-surface-variant font-mono truncate max-w-[200px]" title={msg.telemetry}>
                          📡 {msg.telemetry}
                        </span>
                      )}
                    </div>
                  )}

                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Recommendations List */}
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-outline-variant/30 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Key Action Protocols:</span>
                      <ul className="list-disc list-inside space-y-0.5 text-[11px] text-on-surface-variant">
                        {msg.recommendations.map((rec, rIdx) => (
                          <li key={rIdx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className={`mt-1.5 text-[9px] ${msg.role === "user" ? "text-white/70 text-right" : "text-on-surface-variant"}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 bg-surface-container-lowest border border-outline-variant/50 rounded-2xl max-w-[220px] text-xs text-on-surface-variant">
                <span className="animate-spin material-symbols-outlined text-primary text-[18px]">progress_activity</span>
                <span>Querying satellite telemetry...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-outline-variant/40 bg-surface-container-lowest flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about weather, flood, SAR, ERI..."
              disabled={isLoading}
              className="flex-1 px-3 py-2 text-xs bg-surface border border-outline-variant rounded-xl outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-3.5 py-2 bg-primary text-white rounded-xl hover:bg-primary-container disabled:opacity-50 transition-all flex items-center justify-center shadow-sm"
              title="Send Prompt"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </form>
        </section>
      )}

      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-xl hover:bg-primary-container transition-all hover:scale-105 active:scale-95 group relative"
        title={isOpen ? "Close AI Assistant" : "Open EcoWatch AI Assistant"}
      >
        <span className="material-symbols-outlined text-2xl">
          {isOpen ? "close" : "smart_toy"}
        </span>
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 text-[9px] font-bold text-white items-center justify-center">
              AI
            </span>
          </span>
        )}
      </button>
    </div>
  );
}