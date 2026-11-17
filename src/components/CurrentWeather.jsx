import { getWeatherInfo } from "../utils/weatherCodes";

function CurrentWeather({ location, current }) {
  const info = getWeatherInfo(current.weather_code);
  const date = new Date(current.time).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <section className="card current">
      <div>
        <h2>{[location.name, location.country].filter(Boolean).join(", ")}</h2>
        <p className="muted">{date}</p>
        <p className="muted">{info.label}</p>
      </div>
      <div className="current-temp">
        <span className="current-icon">{info.icon}</span>
        <span className="temp">{Math.round(current.temperature_2m)}°</span>
      </div>
    </section>
  );
}

export default CurrentWeather;