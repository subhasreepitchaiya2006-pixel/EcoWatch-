/**
 * ====================================================
 * EcoWatch Centralized Redux Store (CO1 Requirement)
 * ====================================================
 * Demonstrates the core Redux Architecture:
 * - Single source of truth (Store)
 * - State is read-only (getState)
 * - Changes are made with pure functions (Reducers)
 * - Action-driven state transitions (Dispatch)
 * - Observer pattern for reactive UI updates (Subscribe)
 */

import { useState, useEffect } from "react";

// --- Action Types ---
export const REDUX_ACTIONS = {
  SET_WEATHER_DATA: "weather/setWeatherData",
  UPDATE_AQI: "telemetry/updateAqi",
  BROADCAST_ALERT: "alerts/broadcastAlert",
  RESOLVE_ALERT: "alerts/resolveAlert",
  SET_SELECTED_ZONE: "geo/setSelectedZone",
};

// --- Initial State ---
export const initialStoreState = {
  weather: {
    temperature: 31,
    condition: "Partly Cloudy",
    humidity: 68,
    windSpeed: 14,
    location: "Chennai Coastal Sector",
  },
  telemetry: {
    aqi: 42,
    eriScore: 38,
    riskLevel: "Low Risk",
  },
  activeAlerts: [
    { id: "ALERT-RED-01", type: "Flash Flood Advisory", severity: "HIGH", region: "Chennai Coast" },
  ],
  selectedZone: "Zone 13 - South Coastal",
};

// --- Pure Reducer Function ---
export function rootReducer(state = initialStoreState, action) {
  switch (action.type) {
    case REDUX_ACTIONS.SET_WEATHER_DATA:
      return {
        ...state,
        weather: { ...state.weather, ...action.payload },
      };

    case REDUX_ACTIONS.UPDATE_AQI:
      return {
        ...state,
        telemetry: {
          ...state.telemetry,
          aqi: action.payload,
          riskLevel: action.payload > 100 ? "Unhealthy" : action.payload > 50 ? "Moderate" : "Good",
        },
      };

    case REDUX_ACTIONS.BROADCAST_ALERT:
      return {
        ...state,
        activeAlerts: [action.payload, ...state.activeAlerts],
      };

    case REDUX_ACTIONS.RESOLVE_ALERT:
      return {
        ...state,
        activeAlerts: state.activeAlerts.filter((a) => a.id !== action.payload),
      };

    case REDUX_ACTIONS.SET_SELECTED_ZONE:
      return {
        ...state,
        selectedZone: action.payload,
      };

    default:
      return state;
  }
}

// --- Canonical Redux Store Factory ---
export function createStore(reducer, preloadedState = initialStoreState) {
  let currentState = preloadedState;
  let listeners = [];

  function getState() {
    return currentState;
  }

  function dispatch(action) {
    if (!action || typeof action.type !== "string") {
      throw new Error("Actions must have a valid string 'type' property.");
    }
    currentState = reducer(currentState, action);
    listeners.forEach((listener) => listener());
    return action;
  }

  function subscribe(listener) {
    if (typeof listener !== "function") {
      throw new Error("Expected the listener to be a function.");
    }
    listeners.push(listener);
    return function unsubscribe() {
      listeners = listeners.filter((l) => l !== listener);
    };
  }

  // Initialize state with an internal dummy action
  dispatch({ type: "@@INIT" });

  return {
    getState,
    dispatch,
    subscribe,
  };
}

// Global Store Instance
export const store = createStore(rootReducer);

// --- React Custom Hook for Redux Store Binding ---
export function useStoreSelector(selectorFn) {
  const [selectedState, setSelectedState] = useState(() => selectorFn(store.getState()));

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setSelectedState(selectorFn(store.getState()));
    });
    return unsubscribe;
  }, [selectorFn]);

  return selectedState;
}

export function useStoreDispatch() {
  return store.dispatch;
}

export default store;
