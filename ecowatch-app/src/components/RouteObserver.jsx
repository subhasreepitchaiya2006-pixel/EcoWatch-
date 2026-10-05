import React from 'react';
import useRouteInspect from '../hooks/useRouteInspect';
import { useAuth } from '../context/AuthContext';
import { recordRecentAccess } from '../lib/recentAccess';

export default function RouteObserver() {
  const { user } = useAuth();
  useRouteInspect((location) => {
    const titles = {
      '/home': 'Home',
      '/about': 'About',
      '/signin': 'Sign In',
      '/register': 'Register',
      '/dashboard': 'Dashboard',
      '/map': 'Interactive Map',
      '/weather': 'Weather',
      '/air-quality': 'Air Quality',
      '/community-reports': 'Community Reports',
      '/disaster-alerts': 'Disaster Alerts',
      '/analytics': 'Analytics',
      '/profile': 'Profile',
      '/settings': 'Settings',
      '/admin': 'Admin Dashboard',
      '/reports': 'Report',
    };

    if (location && location.pathname) {
      const title = titles[location.pathname] || 'EcoWatch Intelligence';
      document.title = `${title} | EcoWatch`;
      if (user?.id && !['/signin', '/register'].includes(location.pathname)) {
        recordRecentAccess(user.id, { path: location.pathname, title, visitedAt: new Date().toISOString() });
      }
    }
    // lightweight analytics hook: console.log for now
    // eslint-disable-next-line no-console
    console.log('Route change:', location.pathname + (location.hash || ''));
  });
  return null;
}
