import { useState } from "react";
import { getWeatherInfo } from "../utils/weatherCodes";

function formatHour(timeString) {
  // timeString looks like "2026-11-17T14:00"
  const hour = Number(timeString.slice(11, 13));
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12} ${suffix}`;
}

function HourlyForecast({ hourly, daily, currentTime }) {
  const [selectedDay, setSelectedDay] = useState(0);

  // Slice 24 hours for the chosen day
  const start = selectedDay * 24;
  const end = start + 24;
  const hours = hourly.time.slice(start, end);

  // Used to highlight the current hour (only on today)
  const currentHourKey = currentTime.slice(0, 13); // "2026-11-17T14"

  return (
    <section className="card hourly">
      <div className="hourly-header">
        <h3 className="hourly-title">Hourly forecast</h3>
        <select
          value={selectedDay}
          onChange={(e) => setSelectedDay(Number(e.target.value))}
          aria-label="Select day"
        >
          {daily.time.map((date, i) => (
            <option key={date} value={i}>
              {new Date(date).toLocaleDateString("en-US", {
                weekday: "long",
                timeZone: "UTC",
              })}
            </option>
          ))}
        </select>
      </div>

      <ul className="hourly-list">
        {hours.map((time, i) => {
          const index = start + i;
          const info = getWeatherInfo(hourly.weather_code[index]);
          const isNow = time.slice(0, 13) === currentHourKey;

          return (
            <li
              key={time}
              className={`hourly-item ${isNow ? "hourly-now" : ""}`}
            >
              <span className="hourly-icon" title={info.label}>
                {info.icon}
              </span>
              <span className="hourly-time">{formatHour(time)}</span>
              <span className="hourly-temp">
                {Math.round(hourly.temperature_2m[index])}°
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default HourlyForecast;