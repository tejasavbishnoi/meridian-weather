import { getWeatherInfo } from "../utils/weatherCodes";

function DailyForecast({ daily }) {
  return (
    <section>
      <h3 className="section-title">7-day forecast</h3>
      <div className="daily">
        {daily.time.map((date, i) => {
          const info = getWeatherInfo(daily.weather_code[i]);
          const day = new Date(date).toLocaleDateString("en-US", {
            weekday: "short",
            timeZone: "UTC",
          });

          return (
            <div className="card daily-item" key={date}>
              <p className="daily-day">{day}</p>
              <p className="daily-icon" title={info.label}>
                {info.icon}
              </p>
              <p className="daily-temps">
                <span>{Math.round(daily.temperature_2m_max[i])}°</span>
                <span className="muted">
                  {Math.round(daily.temperature_2m_min[i])}°
                </span>
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default DailyForecast;