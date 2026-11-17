import { useEffect, useState } from "react";
import { getForecast } from "./services/api";
import SearchBar from "./components/SearchBar";
import CurrentWeather from "./components/CurrentWeather";
import WeatherMetrics from "./components/WeatherMetrics";
import DailyForecast from "./components/DailyForecast";

const DEFAULT_LOCATION = {
  name: "Pune",
  country: "India",
  latitude: 18.5196,
  longitude: 73.8553,
};

function App() {
  const [location, setLocation] = useState(DEFAULT_LOCATION);
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
        });
        setWeather(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [location]);

  return (
    <main className="app">
      <header className="header">
        <h1>☁️ Weather App</h1>
      </header>

      <SearchBar onSelect={setLocation} />

      {!loading && !error && weather && (
  <>
    <CurrentWeather location={location} current={weather.current} />
    <WeatherMetrics
      current={weather.current}
      units={weather.current_units}
    />
    <DailyForecast daily={weather.daily} />
  </>
)}
    </main>
  );
}

export default App;