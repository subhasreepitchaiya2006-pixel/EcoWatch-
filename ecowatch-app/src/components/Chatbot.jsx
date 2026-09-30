import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";

const COPY = {
  en: { title: "EcoWatch assistant", welcome: "Hi! Ask me about weather, air quality, alerts, or your EcoWatch workspace.", placeholder: "Ask EcoWatch...", send: "Send", open: "Open EcoWatch assistant", close: "Close assistant", fallback: "I can help with weather, air quality, disaster alerts, and workspace settings." },
  de: { title: "EcoWatch-Assistent", welcome: "Hallo! Fragen Sie mich nach Wetter, Luftqualitaet, Warnungen oder Ihrem EcoWatch-Arbeitsbereich.", placeholder: "EcoWatch fragen...", send: "Senden", open: "EcoWatch-Assistent oeffnen", close: "Assistent schliessen", fallback: "Ich helfe bei Wetter, Luftqualitaet, Katastrophenwarnungen und Arbeitsbereich-Einstellungen." },
  fr: { title: "Assistant EcoWatch", welcome: "Bonjour ! Posez-moi une question sur la meteo, la qualite de l'air, les alertes ou votre espace EcoWatch.", placeholder: "Demander a EcoWatch...", send: "Envoyer", open: "Ouvrir l'assistant EcoWatch", close: "Fermer l'assistant", fallback: "Je peux aider avec la meteo, la qualite de l'air, les alertes et les reglages de l'espace de travail." },
};

export default function Chatbot() {
  const { language } = useLanguage();
  const copy = COPY[language] || COPY.en;
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(() => [{ role: "assistant", text: COPY.en.welcome }]);

  const sendMessage = (event) => {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    setMessages((current) => [...current, { role: "user", text }, { role: "assistant", text: copy.fallback }]);
    setInput("");
  };

  return (
    <div className="fixed bottom-24 right-5 z-[60] flex flex-col items-end gap-3">
      {isOpen && (
        <section className="w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-2xl" aria-label={copy.title}>
          <div className="flex items-center justify-between bg-primary px-4 py-3 text-on-primary">
            <div className="flex items-center gap-2"><span className="material-symbols-outlined">smart_toy</span><h2 className="font-label-md font-semibold">{copy.title}</h2></div>
            <button type="button" onClick={() => setIsOpen(false)} title={copy.close} aria-label={copy.close} className="rounded-full p-1 hover:bg-black/10"><span className="material-symbols-outlined">close</span></button>
          </div>
          <div className="flex max-h-80 min-h-48 flex-col gap-3 overflow-y-auto p-4" aria-live="polite">
            {messages.map((message, index) => <div key={`${message.role}-${index}`} className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${message.role === "user" ? "self-end bg-primary text-on-primary" : "bg-surface-container text-on-surface"}`}>{message.text}</div>)}
          </div>
          <form onSubmit={sendMessage} className="flex gap-2 border-t border-outline-variant p-3">
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder={copy.placeholder} className="min-w-0 flex-1 rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface outline-none focus:border-primary" />
            <button type="submit" title={copy.send} aria-label={copy.send} className="rounded-lg bg-primary px-3 text-on-primary hover:opacity-90"><span className="material-symbols-outlined">send</span></button>
          </form>
        </section>
      )}
      <button type="button" onClick={() => setIsOpen((open) => !open)} title={isOpen ? copy.close : copy.open} aria-label={isOpen ? copy.close : copy.open} className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-xl transition-transform hover:scale-105"><span className="material-symbols-outlined text-2xl">{isOpen ? "close" : "chat"}</span></button>
    </div>
  );
}