import React, { createContext, useState, useEffect, useCallback, useContext } from "react";

const ThemeContext = createContext(null);

/**
 * ThemeProvider
 *
 * Manages light/dark mode for the whole app.
 *
 * useState holds the current theme ("light" | "dark").
 * useEffect runs a side effect every time `theme` changes: it toggles the
 * "dark" class on <html>, which is what actually flips every Tailwind
 * dark: utility across the app, and it saves the choice to localStorage
 * so the theme persists across page refreshes.
 * useCallback keeps toggleTheme's identity stable across renders.
 */
export function ThemeProvider({ children }) {
  // Read any previously saved theme on first render, defaulting to light.
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    return localStorage.getItem("ecowatch-theme") || "light";
  });

  // useEffect: side effect that syncs React state -> the DOM + storage.
  // Runs on mount and again every time `theme` changes.
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("ecowatch-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const value = { theme, toggleTheme, isDark: theme === "dark" };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside a <ThemeProvider>");
  return ctx;
}
