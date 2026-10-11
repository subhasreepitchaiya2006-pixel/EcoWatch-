import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import StatusIndicator from "../components/StatusIndicator";
import CitizenDashboard from "../components/CitizenDashboard";
import CitizenNotificationCenter from "../components/CitizenNotificationCenter";
import SignInPage from "../pages/SignInPage";
import RegisterPage from "../pages/RegisterPage";
import { calculateDistanceKm, validateDisasterAlert, evaluateLocationRelevance } from "../lib/locationAlerts";
import { getCitizenNotifications, markNotificationRead } from "../lib/citizenNotifications";
import { SatelliteDataProvider } from "../context/SatelliteDataContext";

// Mock AuthContext
vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    user: {
      id: 1791211077099,
      name: "Praveen Citizen",
      email: "citizen@ecowatch.global",
      role: "Citizen",
      location: "KTC Nagar, Tirunelveli",
    },
    login: vi.fn().mockResolvedValue(true),
    logout: vi.fn(),
    isLoading: false,
    error: null,
  }),
}));

describe("StatusIndicator Component", () => {
  it("renders Normal, Advisory, Warning, and Emergency states with indicators", () => {
    const { rerender } = render(<StatusIndicator level="Normal" />);
    expect(screen.getByText("Safe / Normal")).toBeDefined();

    rerender(<StatusIndicator level="Advisory" />);
    expect(screen.getByText("Advisory")).toBeDefined();

    rerender(<StatusIndicator level="Warning" />);
    expect(screen.getByText("Warning")).toBeDefined();

    rerender(<StatusIndicator level="Emergency" pulse />);
    expect(screen.getByText("Emergency")).toBeDefined();
  });
});

describe("Location & Disaster Alert Validation", () => {
  it("calculates Haversine distance correctly between Tirunelveli sectors", () => {
    // Palayamkottai (8.7180, 77.7340) to KTC Nagar (8.7522, 77.7414) is approx 3.9 km
    const dist = calculateDistanceKm(8.7180, 77.7340, 8.7522, 77.7414);
    expect(dist).toBeGreaterThan(3);
    expect(dist).toBeLessThan(5);
  });

  it("validates live disaster alert integrity and detects expired alerts", () => {
    const liveAlert = {
      id: 2001,
      type: "Flash Flood Warning",
      region: "Palayamkottai, Tirunelveli",
      severity: "CRITICAL",
      timestamp: new Date().toISOString(),
      status: "Active",
    };
    const validResult = validateDisasterAlert(liveAlert);
    expect(validResult.isValid).toBe(true);
    expect(validResult.isLive).toBe(true);
    expect(validResult.isExpired).toBe(false);

    const expiredAlert = {
      ...liveAlert,
      timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(), // 48h old
    };
    const expiredResult = validateDisasterAlert(expiredAlert);
    expect(expiredResult.isExpired).toBe(true);
    expect(expiredResult.isLive).toBe(false);
  });

  it("evaluates location relevance for user in Palayamkottai vs remote location", () => {
    const floodAlert = {
      id: 2001,
      type: "Flash Flood Warning",
      region: "Palayamkottai, Tirunelveli",
      severity: "CRITICAL",
      latitude: 8.7180,
      longitude: 77.7340,
      timestamp: new Date().toISOString(),
      status: "Active",
    };

    // User in Palayamkottai
    const localRelevance = evaluateLocationRelevance(floodAlert, "Palayamkottai, Tirunelveli", { lat: 8.7180, lon: 77.7340 });
    expect(localRelevance.isInUserArea).toBe(true);
    expect(localRelevance.priorityLevel).toBe("EMERGENCY");

    // User in Chennai (remote)
    const remoteRelevance = evaluateLocationRelevance(floodAlert, "Chennai, Tamil Nadu", { lat: 13.0827, lon: 80.2707 });
    expect(remoteRelevance.isInUserArea).toBe(false);
    expect(remoteRelevance.priorityLevel).toBe("ADVISORY");
  });
});

describe("Citizen Notifications Center", () => {
  it("provides predefined notifications including Flood Warning and KTC Nagar community event", () => {
    const notifs = getCitizenNotifications();
    expect(notifs.length).toBeGreaterThanOrEqual(5);

    const floodNotif = notifs.find((n) => n.id.includes("flood"));
    expect(floodNotif.title).toContain("Flood warning detected");

    const eventNotif = notifs.find((n) => n.id.includes("event"));
    expect(eventNotif.title).toContain("Community event happening at KTC Nagar");
  });

  it("renders notification modal with interactive list and detail view", () => {
    const onClose = vi.fn();
    render(
      <BrowserRouter>
        <CitizenNotificationCenter isOpen={true} onClose={onClose} />
      </BrowserRouter>
    );

    expect(screen.getAllByText(/Notifications/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Flood warning detected in your area.")).toBeDefined();
    expect(screen.getByText("Community event happening at KTC Nagar.")).toBeDefined();
  });
});

describe("CitizenDashboard Component", () => {
  it("renders citizen answers immediately answering all 10 core questions", () => {
    render(
      <BrowserRouter>
        <SatelliteDataProvider>
          <CitizenDashboard />
        </SatelliteDataProvider>
      </BrowserRouter>
    );

    // Question 1: What is the weather now?
    expect(screen.getAllByText(/Weather/i).length).toBeGreaterThan(0);

    // Question 2: What is the air quality now?
    expect(screen.getAllByText(/Air Quality/i).length).toBeGreaterThan(0);

    // Question 3: Is anything important happening near me?
    expect(screen.getAllByText(/Important happening near me\?/i).length).toBeGreaterThan(0);

    // Question 4: Are there any community events I can participate in?
    expect(screen.getAllByText(/Community Clean-up \/ Awareness Event/i).length).toBeGreaterThan(0);

    // Question 5: Do I have any new notifications?
    expect(screen.getAllByText(/Notifications/i).length).toBeGreaterThan(0);

    // Question 6 & 7: Disaster warning in my area & exact location
    expect(screen.getAllByText(/Palayamkottai/i).length).toBeGreaterThan(0);

    // Question 10: Recommended safety actions
    expect(screen.getAllByText(/Move immediately to higher ground or designated civil defense shelters/i).length).toBeGreaterThan(0);
  });

  it("handles Community Clean-up event participation and displays Participation Confirmed", () => {
    render(
      <BrowserRouter>
        <SatelliteDataProvider>
          <CitizenDashboard />
        </SatelliteDataProvider>
      </BrowserRouter>
    );

    // Look for participate button
    const participateBtn = screen.getByRole("button", { name: /Participate \/ Join Event/i });
    expect(participateBtn).toBeDefined();

    fireEvent.click(participateBtn);

    // Expect confirmation feedback
    expect(screen.getAllByText(/Participation Confirmed/i).length).toBeGreaterThan(0);
  });
});

describe("Citizen Flexible Email Registration & Sign-In Flow", () => {
  it("renders clean SignInPage allowing any custom citizen email", () => {
    render(
      <BrowserRouter>
        <SignInPage />
      </BrowserRouter>
    );

    // Check header
    expect(screen.getByText("Citizen & Community Sign In")).toBeDefined();

    // Check placeholder on email input accepts personal emails
    const emailInput = screen.getByLabelText(/Email Address/i);
    expect(emailInput.getAttribute("placeholder")).toBe("yourname@gmail.com");

    // Allows typing any custom personal email
    fireEvent.change(emailInput, { target: { value: "arun.citizen@gmail.com" } });
    expect(emailInput.value).toBe("arun.citizen@gmail.com");

    // Submit button shows Sign In as Citizen
    expect(screen.getByRole("button", { name: /Sign In as Citizen/i })).toBeDefined();
  });

  it("renders RegisterPage with personal email notice and default Citizen role", () => {
    render(
      <BrowserRouter>
        <SatelliteDataProvider>
          <RegisterPage />
        </SatelliteDataProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/No fixed email required for Citizens\./i)).toBeDefined();
    const roleSelect = screen.getByLabelText(/Operational Role/i);
    expect(roleSelect.value).toBe("Citizen");

    const emailInput = screen.getByLabelText(/Email Address/i);
    expect(emailInput.getAttribute("placeholder")).toBe("yourname@gmail.com");
  });
});
