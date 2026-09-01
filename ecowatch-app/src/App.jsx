import React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SatelliteDataProvider } from "./context/SatelliteDataContext";
import { ThemeProvider } from "./context/ThemeContext";

import SignInPage from "./pages/SignInPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import PublicWeatherPage from "./pages/PublicWeatherPage";
import DemoPage from "./pages/DemoPage";
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
import RouteObserver from "./components/RouteObserver";

export default function App() {
  return (
    <ThemeProvider>
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
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/map" element={<InteractiveMapPage />} />
              <Route path="/disaster-alerts" element={<DisasterAlertsPage />} />
              <Route path="/community-reports" element={<CommunityReportsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/weather" element={<WeatherPage />} />
              <Route path="/weather-guest" element={<PublicWeatherPage />} />
              <Route path="/air-quality" element={<AirQualityPage />} />
              <Route path="/demo" element={<DemoPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/logout" element={<LogoutPage />} />
            </Routes>
          </HashRouter>
        </SatelliteDataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
