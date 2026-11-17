import { useEffect, useState } from "react";
import { getForecast } from "./services/api";
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
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [units, setUnits] = useLocalStorage("weather-units", METRIC);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
    setWeather(null); // clear old data so the new city doesn't show stale numbers
    setLocation(place);
  }

  return (
    <main className="app">
      <header className="header">
        <h1>☁️ Weather App</h1>
        <UnitsDropdown units={units} onChange={setUnits} />
      </header>

      <SearchBar onSelect={handleSelectLocation} />

      {loading && !weather && <p className="muted">Loading...</p>}
      {error && <p className="error">{error}</p>}
      {weather && (
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