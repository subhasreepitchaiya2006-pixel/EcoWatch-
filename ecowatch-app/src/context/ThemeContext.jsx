import React, { createContext, useState, useEffect, useCallback, useContext } from "react";

const ThemeContext = createContext(null);

/**
 * ThemeProvider
 *
 * Manages the color/black mode for the whole app.
 *
 * useState holds the current theme ("color" | "black").
 * useEffect runs a side effect every time `theme` changes: it toggles the
 * "dark" class on <html>, which is what activates the black palette and flips every Tailwind
 * dark: utility across the app, and it saves the choice to localStorage
 * so the theme persists across page refreshes.
 * useCallback keeps toggleTheme's identity stable across renders.
 */
export function ThemeProvider({ children }) {
  // Migrate the previous light/dark values to the new color/black modes.
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "color";
    const savedTheme = localStorage.getItem("ecowatch-theme");
    return savedTheme === "dark" || savedTheme === "black" ? "black" : "color";
  });

  const [brandColor, setBrandColor] = useState(() => {
    if (typeof window === "undefined") return "#004ac6";
    const savedColor = localStorage.getItem("ecowatch-brand-color");
    return savedColor === "#4fe0d1" ? "#004ac6" : savedColor || "#004ac6";
  });

  // useEffect: side effect that syncs React state -> the DOM + storage.
  // Runs on mount and again every time `theme` changes.
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "black") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("ecowatch-theme", theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--color-primary", brandColor);
    root.style.setProperty("--color-primary-container", brandColor);
    root.style.setProperty("--color-inverse-primary", brandColor);
    localStorage.setItem("ecowatch-brand-color", brandColor);
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
