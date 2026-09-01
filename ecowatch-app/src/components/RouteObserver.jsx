import React from 'react';
import useRouteInspect from '../hooks/useRouteInspect';

export default function RouteObserver() {
  useRouteInspect((location) => {
    if (location && location.pathname) {
      const title = {
        '/home': 'Home',
        '/dashboard': 'Dashboard',
        '/disaster-alerts': 'Disaster Alerts',
      }[location.pathname] || 'EcoWatch Intelligence';
      document.title = `${title} | EcoWatch`;
    }
    // lightweight analytics hook: console.log for now
    // eslint-disable-next-line no-console
    console.log('Route change:', location.pathname + (location.hash || ''));
  });
  return null;
}
