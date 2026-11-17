import { useEffect, useState } from "react";
import { getForecast, reverseGeocode } from "./services/api";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { METRIC } from "./utils/units";
import SearchBar from "./components/SearchBar";
import Favorites from "./components/Favorites";
import UnitsDropdown from "./components/UnitsDropdown";
import CurrentWeather from "./components/CurrentWeather";
import WeatherMetrics from "./components/WeatherMetrics";
import ExtraDetails from "./components/ExtraDetails";
import DailyForecast from "./components/DailyForecast";
import HourlyForecast from "./components/HourlyForecast";
import CompareLocations from "./components/CompareLocations";

const DEFAULT_LOCATION = {
  name: "Pune",
  country: "India",
  latitude: 18.5196,
  longitude: 73.8553,
};

function isSamePlace(a, b) {
  return (
    Math.abs(a.latitude - b.latitude) < 0.01 &&
    Math.abs(a.longitude - b.longitude) < 0.01
  );
}

function App() {
  const [location, setLocation] = useLocalStorage("weather-location", null);
  const [units, setUnits] = useLocalStorage("weather-units", METRIC);
  const [favorites, setFavorites] = useLocalStorage("weather-favorites", []);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  // On a first visit (no saved location) we start in the "locating" state
  const [locating, setLocating] = useState(() => !location);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState("");
  const [showCompare, setShowCompare] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  // Asks the browser for the position. State is only set inside callbacks.
  function requestPosition() {
    function fail(message) {
      setNotice(message);
      setLocation((prev) => prev ?? DEFAULT_LOCATION);
      setLocating(false);
    }

    if (!navigator.geolocation) {
      Promise.resolve().then(() =>
        fail("Geolocation is not supported in this browser.")
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const place = await reverseGeocode(latitude, longitude);
        setWeather(null);
        setLocation({ ...place, latitude, longitude });
        setLocating(false);
      },
      () => fail("Location access denied. Showing a default city instead."),
      { timeout: 10000 }
    );
  }

  // Called by the 📍 button
  function handleLocateClick() {
    setLocating(true);
    setNotice("");
    requestPosition();
  }

  // First visit: no saved location yet, so detect it
  useEffect(() => {
    if (!location) requestPosition();
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
  }, [location, units, retryKey]);

  function handleSelectLocation(place) {
    setNotice("");
    setWeather(null);
    setLocation(place);
  }

  const isFavorite = location
    ? favorites.some((f) => isSamePlace(f, location))
    : false;

  function removeFavorite(place) {
    setFavorites(favorites.filter((f) => !isSamePlace(f, place)));
  }

  function toggleFavorite() {
    if (!location) return;
    if (isFavorite) {
      removeFavorite(location);
    } else {
      setFavorites([
        ...favorites,
        {
          name: location.name,
          country: location.country,
          latitude: location.latitude,
          longitude: location.longitude,
        },
      ]);
    }
  }

  return (
    <main className="app">
      <header className="header">
        <h1>☁️ Weather App</h1>
        <div className="header-actions">
          <button
            type="button"
            className="compare-btn"
            onClick={() => setShowCompare(!showCompare)}
            aria-pressed={showCompare}
          >
            {showCompare ? "← Back" : "⚖️ Compare"}
          </button>
          <button
            type="button"
            className="locate-btn"
            onClick={handleLocateClick}
            disabled={locating}
            aria-label="Use my current location"
            title="Use my current location"
          >
            📍
          </button>
          <UnitsDropdown units={units} onChange={setUnits} />
        </div>
      </header>

      {showCompare ? (
        <CompareLocations
          units={units}
          favorites={favorites}
          currentLocation={location}
        />
      ) : (
        <>
          <SearchBar onSelect={handleSelectLocation} />

          <Favorites
            favorites={favorites}
            onSelect={handleSelectLocation}
            onRemove={removeFavorite}
          />

          {notice && <p className="notice">{notice}</p>}
          {(locating || (loading && !weather)) && (
            <div className="loading" role="status">
              <div className="spinner" />
              <p className="muted">
                {locating ? "Detecting your location..." : "Loading..."}
              </p>
            </div>
          )}
          {error && (
            <div className="card error-card" role="alert">
              <p>⚠️ {error}. Check your connection and try again.</p>
              <button
                type="button"
                className="retry-btn"
                onClick={() => setRetryKey((k) => k + 1)}
              >
                Retry
              </button>
            </div>
          )}

          {weather && location && (
            <div className={loading ? "refreshing" : ""}>
              <CurrentWeather
                location={location}
                current={weather.current}
                isFavorite={isFavorite}
                onToggleFavorite={toggleFavorite}
              />
              <WeatherMetrics
                current={weather.current}
                units={weather.current_units}
              />
              <ExtraDetails
                current={weather.current}
                units={weather.current_units}
                daily={weather.daily}
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
        </>
      )}
    </main>
  );
}

export default App;