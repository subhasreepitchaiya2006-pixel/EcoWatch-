export const initialAlertsState = {
  alerts: [
    {
      id: "ALERT-29402",
      title: "Flash Flood Warning",
      icon: "flood",
      severity: "CRITICAL",
      location: "Riverside Corridor & Marina Basin",
      issued: "12 mins ago",
      status: "Active Escalation",
    },
    {
      id: "ALERT-29388",
      title: "Wildfire Escalation",
      icon: "local_fire_department",
      severity: "WARNING",
      location: "Western Forest Reserve",
      issued: "45 mins ago",
      status: "Monitoring",
    },
    {
      id: "ALERT-29350",
      title: "High Wind Advisory",
      icon: "air",
      severity: "ADVISORY",
      location: "Coastal Harbor Area",
      issued: "2 hours ago",
      status: "Active",
    },
  ],
};

export function alertsReducer(state, action) {
  switch (action.type) {
    case "SET_ALERTS":
      return {
        alerts: action.payload.map((a) => ({
          id: a.id || a._id || `ALERT-${Math.floor(10000 + Math.random() * 90000)}`,
          title: a.title || a.type || "Hazard Alert",
          icon: a.icon || (a.type?.toLowerCase().includes("fire") ? "local_fire_department" : a.type?.toLowerCase().includes("wind") ? "air" : "flood"),
          severity: a.severity || "WARNING",
          location: a.location || a.region || "Monitored Region",
          issued: a.issued || (a.timestamp ? new Date(a.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recently"),
          status: a.status || "Active",
        })),
      };
    case "RESOLVE":
      return {
        alerts: state.alerts.map((a) =>
          a.id === action.payload ? { ...a, status: "Resolved" } : a
        ),
      };
    case "BROADCAST":
      return {
        alerts: state.alerts.map((a) =>
          a.id === action.payload ? { ...a, status: "Broadcasted" } : a
        ),
      };
    case "ADD_ALERT":
      return { alerts: [action.payload, ...state.alerts] };
    default:
      return state;
  }
}
