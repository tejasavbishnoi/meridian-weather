import { useEffect, useState } from "react";
import { getForecast, reverseGeocode } from "./services/api";
import { useLocalStorage } from "./hooks/useLocalStorage";
import SearchBar from "./components/SearchBar";
import UnitsDropdown, { METRIC } from "./components/UnitsDropdown";
import CurrentWeather from "./components/CurrentWeather";
import WeatherMetrics from "./components/WeatherMetrics";
import DailyForecast from "./components/DailyForecast";
import HourlyForecast from "./components/HourlyForecast";

const DEFAULT_LOCATION = {
  name: "Pune",
  country: "India",
  latitude: 18.5196,
  longitude: 73.8553,
};

function App() {
  const [location, setLocation] = useLocalStorage("weather-location", null);
  const [units, setUnits] = useLocalStorage("weather-units", METRIC);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState("");

  // Ask the browser for the user's position
  function detectLocation() {
    if (!navigator.geolocation) {
      setNotice("Geolocation is not supported in this browser.");
      setLocation((prev) => prev ?? DEFAULT_LOCATION);
      return;
    }

    setLocating(true);
    setNotice("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const place = await reverseGeocode(latitude, longitude);
        setWeather(null);
        setLocation({ ...place, latitude, longitude });
        setLocating(false);
      },
      () => {
        setNotice("Location access denied. Showing a default city instead.");
        setLocation((prev) => prev ?? DEFAULT_LOCATION);
        setLocating(false);
      },
      { timeout: 10000 }
    );
  }

  // First visit: no saved location yet, so detect it
  useEffect(() => {
    if (!location) detectLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch weather whenever the location or units change
  useEffect(() => {
    if (!location) return;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getForecast({
          latitude: location.latitude,
          longitude: location.longitude,
          units,
        });
        setWeather(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [location, units]);

  function handleSelectLocation(place) {
    setNotice("");
    setWeather(null);
    setLocation(place);
  }

  return (
    <main className="app">
      <header className="header">
        <h1>☁️ Weather App</h1>
        <div className="header-actions">
          <button
            type="button"
            className="locate-btn"
            onClick={detectLocation}
            disabled={locating}
            aria-label="Use my current location"
            title="Use my current location"
          >
            📍
          </button>
          <UnitsDropdown units={units} onChange={setUnits} />
        </div>
      </header>

      <SearchBar onSelect={handleSelectLocation} />

      {notice && <p className="notice">{notice}</p>}
      {(locating || (loading && !weather)) && (
        <p className="muted">
          {locating ? "Detecting your location..." : "Loading..."}
        </p>
      )}
      {error && <p className="error">{error}</p>}
      {weather && location && (
        <div className={loading ? "refreshing" : ""}>
          <CurrentWeather location={location} current={weather.current} />
          <WeatherMetrics
            current={weather.current}
            units={weather.current_units}
          />
          <DailyForecast daily={weather.daily} />
          <HourlyForecast
            key={`${location.latitude}-${location.longitude}`}
            hourly={weather.hourly}
            daily={weather.daily}
            currentTime={weather.current.time}
          />
        </div>
      )}
    </main>
  );
}

export default App;