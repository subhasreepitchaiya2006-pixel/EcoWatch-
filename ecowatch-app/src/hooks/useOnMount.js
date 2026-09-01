import { useEffect, useRef } from 'react';

// Runs the provided callback once on mount and returns an optional cleanup from it.
export default function useOnMount(callback) {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    const maybeCleanup = cbRef.current?.();
    return typeof maybeCleanup === 'function' ? maybeCleanup : undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
