import React, { createContext, useState, useEffect, useCallback, useContext } from "react";
import safeStorage from "../lib/safeStorage";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const savedTheme = safeStorage.getItem("ecowatch-theme", "color");
    return savedTheme === "dark" || savedTheme === "black" ? "black" : "color";
  });

  const [brandColor, setBrandColor] = useState(() => {
    const savedColor = safeStorage.getItem("ecowatch-brand-color", "#004ac6");
    return savedColor === "#4fe0d1" ? "#004ac6" : savedColor || "#004ac6";
  });

  useEffect(() => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      if (theme === "black") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
    safeStorage.setItem("ecowatch-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.style?.setProperty?.("--color-primary", brandColor);
      root.style?.setProperty?.("--color-primary-container", brandColor);
      root.style?.setProperty?.("--color-inverse-primary", brandColor);
    }
    safeStorage.setItem("ecowatch-brand-color", brandColor);
  }, [brandColor]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "color" ? "black" : "color"));
  }, []);

  const value = { theme, setTheme, toggleTheme, isDark: theme === "black", brandColor, setBrandColor };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside a <ThemeProvider>");
  return ctx;
}
