import { useEffect, useState } from "react";

function formatLocation(properties = {}) {
  const sub = properties.name;
  const rawDistrict = properties.city || properties.district || properties.county;
  const district = rawDistrict === "Palayamkottai" ? "Tirunelveli" : rawDistrict;
  return [sub, (district && district !== sub) ? district : null, properties.state, properties.country]
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
        // 1. Try Open-Meteo Geocoding (specialized for weather/geography, fast & reliable)
        const openMeteoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(search)}&count=6&language=en&format=json`,
          { signal: controller.signal }
        );
        if (openMeteoRes.ok) {
          const omData = await openMeteoRes.json();
          if (Array.isArray(omData.results) && omData.results.length > 0) {
            setResults(
              omData.results.map((item) => {
                const cleanDistrict = item.admin2 ? item.admin2.replace(/\s+district/i, "").trim() : null;
                const district = cleanDistrict === "Palayamkottai" ? "Tirunelveli" : cleanDistrict;
                return {
                  id: item.id || `${item.latitude}-${item.longitude}`,
                  label: [item.name, (district && district !== item.name) ? district : null, item.admin1, item.country]
                    .filter(Boolean)
                    .filter((v, i, a) => a.indexOf(v) === i)
                    .join(", "),
                  address: item,
                  lat: item.latitude,
                  lon: item.longitude,
                };
              })
            );
            return;
          }
        }

        // 2. Fallback to Photon Komoot
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
