import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Simple hook to observe route changes and run the callback with (location)
export default function useRouteInspect(callback) {
  const location = useLocation();
  useEffect(() => {
    if (typeof callback === 'function') callback(location);
  }, [location, callback]);
}
