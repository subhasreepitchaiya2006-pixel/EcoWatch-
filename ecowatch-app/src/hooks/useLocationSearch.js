import { useEffect, useState } from "react";

function formatLocation(properties = {}) {
  return [properties.name, properties.city || properties.town || properties.village, properties.state, properties.country]
    .filter(Boolean)
    .filter((value, index, values) => values.indexOf(value) === index)
    .join(", ");
}

export function useLocationSearch(query, enabled = true) {
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const search = query.trim();
    if (!enabled || search.length < 2) {
      setResults([]);
      setIsSearching(false);
      return undefined;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      setError(null);
      try {
        const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(search)}&limit=6`, { signal: controller.signal });
        if (!response.ok) throw new Error("Location search is unavailable.");
        const data = await response.json();
        setResults((data.features || []).map((feature) => ({
          id: feature.properties?.osm_id || `${feature.geometry.coordinates[0]}-${feature.geometry.coordinates[1]}`,
          label: formatLocation(feature.properties) || search,
          address: feature.properties || {},
          lat: feature.geometry.coordinates[1],
          lon: feature.geometry.coordinates[0],
        })));
      } catch (searchError) {
        if (searchError.name !== "AbortError") {
          setResults([]);
          setError(searchError.message);
        }
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, enabled]);

  return { results, isSearching, error };
}
