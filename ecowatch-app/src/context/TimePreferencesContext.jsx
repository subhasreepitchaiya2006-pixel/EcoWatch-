import React, { createContext, useContext, useEffect, useState } from "react";

const TimePreferencesContext = createContext(null);

export const TIMEZONE_OPTIONS = [
  { value: "Asia/Kolkata", label: "IST (UTC+05:30)" },
  { value: "UTC", label: "UTC (UTC+00:00)" },
  { value: "America/New_York", label: "Eastern Time (UTC-05:00)" },
  { value: "America/Los_Angeles", label: "Pacific Time (UTC-08:00)" },
  { value: "Europe/London", label: "London (UTC+00:00)" },
  { value: "Europe/Berlin", label: "Central Europe (UTC+01:00)" },
  { value: "Asia/Dubai", label: "Gulf Standard Time (UTC+04:00)" },
  { value: "Asia/Singapore", label: "Singapore (UTC+08:00)" },
  { value: "Asia/Tokyo", label: "Japan (UTC+09:00)" },
  { value: "Australia/Sydney", label: "Australian Eastern (UTC+10:00)" },
];

import safeStorage from "../lib/safeStorage";

export const TIME_FORMAT_OPTIONS = [
  { value: "24", label: "24-hour" },
  { value: "12", label: "12-hour" },
];

export function TimePreferencesProvider({ children }) {
  const [timezone, setTimezone] = useState(() => {
    return safeStorage.getItem("ecowatch-timezone", "Asia/Kolkata");
  });
  const [timeFormat, setTimeFormat] = useState(() => {
    return safeStorage.getItem("ecowatch-time-format", "24");
  });

  useEffect(() => {
    safeStorage.setItem("ecowatch-timezone", timezone);
    safeStorage.setItem("ecowatch-time-format", timeFormat);
  }, [timezone, timeFormat]);

  return (
    <TimePreferencesContext.Provider value={{ timezone, setTimezone, timeFormat, setTimeFormat, timezoneOptions: TIMEZONE_OPTIONS, timeFormatOptions: TIME_FORMAT_OPTIONS }}>
      {children}
    </TimePreferencesContext.Provider>
  );
}

export function useTimePreferences() {
  const context = useContext(TimePreferencesContext);
  if (!context) throw new Error("useTimePreferences must be used inside a <TimePreferencesProvider>");
  return context;
}
