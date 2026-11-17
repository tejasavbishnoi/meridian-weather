const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

// Turns a city name into a list of matching locations
export async function searchLocations(query) {
  const params = new URLSearchParams({ name: query, count: 5 });
  const res = await fetch(`${GEO_URL}?${params}`);
  if (!res.ok) throw new Error("Failed to search locations");
  const data = await res.json();
  return data.results ?? [];
}

// Gets current, hourly and daily weather for coordinates
export async function getForecast({
  latitude,
  longitude,
  units = {
    temperature: "celsius",
    wind: "kmh",
    precipitation: "mm",
  },
}) {
  const params = new URLSearchParams({
    latitude,
    longitude,
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,surface_pressure,visibility",
    hourly: "temperature_2m,weather_code",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max",
    temperature_unit: units.temperature,
    wind_speed_unit: units.wind,
    precipitation_unit: units.precipitation,
    forecast_days: 7,
    timezone: "auto",
  });

  const res = await fetch(`${FORECAST_URL}?${params}`);
  if (!res.ok) throw new Error("Failed to fetch forecast");
  return res.json();
}