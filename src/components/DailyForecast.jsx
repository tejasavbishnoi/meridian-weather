import { getWeatherInfo } from "../utils/weatherCodes";

function DailyForecast({ daily, currentTemp }) {
  const mins = daily.temperature_2m_min;
  const maxs = daily.temperature_2m_max;

  // One shared scale for the whole week
  const lo = Math.min(...mins);
  const hi = Math.max(...maxs);
  const span = hi - lo || 1;
  const pct = (v) => Math.min(100, Math.max(0, ((v - lo) / span) * 100));

  return (
    <section className="card week" aria-label="7-day forecast">
      <h3 className="sheet-title">Next 7 days</h3>
      <ul className="week-list">
        {daily.time.map((date, i) => {
          const info = getWeatherInfo(daily.weather_code[i]);
          const day =
            i === 0
              ? "Today"
              : new Date(date).toLocaleDateString("en-US", {
                  weekday: "short",
                  timeZone: "UTC",
                });
          const left = pct(mins[i]);
          const width = Math.max(pct(maxs[i]) - left, 4);

          return (
            <li className="week-row" key={date}>
              <span className="week-day">{day}</span>
              <span className="week-icon" title={info.label}>
                {info.icon}
              </span>
              <span className="week-low">{Math.round(mins[i])}°</span>
              <span className="week-track" aria-hidden="true">
                <span
                  className="week-bar"
                  style={{ left: `${left}%`, width: `${width}%` }}
                />
                {i === 0 && currentTemp != null && (
                  <span
                    className="week-now"
                    style={{ left: `${pct(currentTemp)}%` }}
                  />
                )}
              </span>
              <span className="week-high">{Math.round(maxs[i])}°</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default DailyForecast;