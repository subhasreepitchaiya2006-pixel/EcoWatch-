import React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SatelliteDataProvider } from "./context/SatelliteDataContext";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import { TimePreferencesProvider } from "./context/TimePreferencesContext";
import Chatbot from "./components/Chatbot";

import SignInPage from "./pages/SignInPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import DashboardPage from "./pages/DashboardPage";
import InteractiveMapPage from "./pages/InteractiveMapPage";
import DisasterAlertsPage from "./pages/DisasterAlertsPage";
import CommunityReportsPage from "./pages/CommunityReportsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import WeatherPage from "./pages/WeatherPage";
import AirQualityPage from "./pages/AirQualityPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import LogoutPage from "./pages/LogoutPage";
import ReportPage from "./pages/ReportPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import RouteObserver from "./components/RouteObserver";

export default function App() {
  return (
    <ThemeProvider>
      <div id="google_translate_element" className="hidden" aria-hidden="true" />
      <LanguageProvider>
        <TimePreferencesProvider>
          <AuthProvider>
            <SatelliteDataProvider>
              <HashRouter>
            {/* Route observer to inspect route changes for analytics / debug */}
            <RouteObserver />
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/weather-guest" element={<Navigate to="/home" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/map" element={<InteractiveMapPage />} />
              <Route path="/disaster-alerts" element={<DisasterAlertsPage />} />
              <Route path="/community-reports" element={<CommunityReportsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/weather" element={<WeatherPage />} />
              <Route path="/air-quality" element={<AirQualityPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/logout" element={<LogoutPage />} />
              <Route path="/reports" element={<ReportPage />} />
              <Route path="/reports/:id" element={<ReportPage />} />
            </Routes>
              <Chatbot />
              </HashRouter>
            </SatelliteDataProvider>
          </AuthProvider>
        </TimePreferencesProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
