import { describe, it, expect } from "vitest";
import { alertsReducer, initialAlertsState } from "../alertsReducer";

describe("alertsReducer unit test suite", () => {
  it("should return the default state for unrecognized actions", () => {
    const state = alertsReducer(initialAlertsState, { type: "UNKNOWN_ACTION" });
    expect(state).toEqual(initialAlertsState);
  });

  it("should handle SET_ALERTS from server data", () => {
    const rawAlerts = [
      {
        _id: "mongo-alert-101",
        type: "Flood Alert",
        severity: "CRITICAL",
        region: "Zone 4 Dam",
        status: "Active Escalation",
      },
    ];

    const state = alertsReducer(initialAlertsState, {
      type: "SET_ALERTS",
      payload: rawAlerts,
    });

    expect(state.alerts).toHaveLength(1);
    expect(state.alerts[0].id).toBe("mongo-alert-101");
    expect(state.alerts[0].severity).toBe("CRITICAL");
    expect(state.alerts[0].location).toBe("Zone 4 Dam");
  });

  it("should handle ADD_ALERT to prepend new alerts", () => {
    const newAlert = {
      id: "ALERT-99999",
      title: "Flash Fire Warning",
      severity: "CRITICAL",
      location: "Sector 8",
      status: "Active",
    };

    const state = alertsReducer(initialAlertsState, {
      type: "ADD_ALERT",
      payload: newAlert,
    });

    expect(state.alerts[0].id).toBe("ALERT-99999");
    expect(state.alerts.length).toBe(initialAlertsState.alerts.length + 1);
  });

  it("should handle RESOLVE to mark an alert as Resolved", () => {
    const existingState = {
      alerts: [
        { id: "ALERT-1", title: "Flood", status: "Active" },
        { id: "ALERT-2", title: "Fire", status: "Active" },
      ],
    };
    const targetId = "ALERT-1";
    const state = alertsReducer(existingState, {
      type: "RESOLVE",
      payload: targetId,
    });

    const target = state.alerts.find((a) => a.id === targetId);
    expect(target.status).toBe("Resolved");
  });

  it("should handle BROADCAST to mark an alert as Broadcasted", () => {
    const existingState = {
      alerts: [
        { id: "ALERT-1", title: "Flood", status: "Active" },
        { id: "ALERT-2", title: "Fire", status: "Active" },
      ],
    };
    const targetId = "ALERT-2";
    const state = alertsReducer(existingState, {
      type: "BROADCAST",
      payload: targetId,
    });

    const target = state.alerts.find((a) => a.id === targetId);
    expect(target.status).toBe("Broadcasted");
  });
});
