export const initialAlertsState = {
  alerts: [
    {
      id: "ALERT-29402",
      title: "Flash Flood Warning",
      icon: "flood",
      severity: "CRITICAL",
      location: "Downtown District, Riverside Valley",
      issued: "12 mins ago",
      status: "Active Escalation",
    },
    {
      id: "ALERT-29388",
      title: "Wildfire Escalation",
      icon: "local_fire_department",
      severity: "WARNING",
      location: "Northern Ridge Forest Preserve",
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
