import React from 'react';
import useRouteInspect from '../hooks/useRouteInspect';

export default function RouteObserver() {
  useRouteInspect((location) => {
    if (location && location.pathname) {
      const title = {
        '/home': 'Home',
        '/about': 'About',
        '/signin': 'Sign In',
        '/register': 'Register',
        '/dashboard': 'Dashboard',
        '/map': 'Interactive Map',
        '/weather': 'Weather',
        '/weather-guest': 'Public Weather',
        '/air-quality': 'Air Quality',
        '/community-reports': 'Community Reports',
        '/disaster-alerts': 'Disaster Alerts',
        '/analytics': 'Analytics',
        '/profile': 'Profile',
        '/settings': 'Settings',
        '/reports': 'Report',
      }[location.pathname] || 'EcoWatch Intelligence';
      document.title = `${title} | EcoWatch`;
    }
    // lightweight analytics hook: console.log for now
    // eslint-disable-next-line no-console
    console.log('Route change:', location.pathname + (location.hash || ''));
  });
  return null;
}
