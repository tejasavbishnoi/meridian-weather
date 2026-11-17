import { useEffect, useState } from "react";
import { searchLocations, getForecast } from "./services/api";

function App() {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const places = await searchLocations("Pune");
        const { latitude, longitude } = places[0];
        const data = await getForecast({ latitude, longitude });
        console.log(data);
        setWeather(data);
      } catch (err) {
        setError(err.message);
      }
    }
    load();
  }, []);

  if (error) return <p>Error: {error}</p>;
  if (!weather) return <p>Loading...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ color: "var(--primary)" }}>Pune</h1>
      <p>Temperature: {weather.current.temperature_2m}°C</p>
      <p>Humidity: {weather.current.relative_humidity_2m}%</p>
      <p>Wind: {weather.current.wind_speed_10m} km/h</p>
    </div>
  );
}

export default App;