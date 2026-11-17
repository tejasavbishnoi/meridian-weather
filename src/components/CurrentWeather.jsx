import { getWeatherInfo } from "../utils/weatherCodes";
import { formatTime, formatDuration, tempToType } from "../utils/format";

// A thin arc across the page with the sun's position on it
function Horizon({ sunrise, sunset, now }) {
  const rise = new Date(sunrise).getTime();
  const set = new Date(sunset).getTime();
  const current = new Date(now).getTime();

  const progress = (current - rise) / (set - rise);
  const isDay = progress >= 0 && progress <= 1;
  const t = Math.min(1, Math.max(0, progress));

  // Point on the curve M0,140 Q500,-100 1000,140
  const x = 1000 * t;
  const y = 140 * ((1 - t) ** 2 + t ** 2) - 200 * t * (1 - t);

  return (
    <div className="horizon">
      <svg
        viewBox="0 0 1000 150"
        role="img"
        aria-label={isDay ? "Position of the sun today" : "The sun is down"}
      >
        <line className="horizon-ground" x1="0" y1="140" x2="1000" y2="140" />
        <path className="horizon-line" d="M0,140 Q500,-100 1000,140" />
        <path
          className="horizon-travelled"
          d="M0,140 Q500,-100 1000,140"
          pathLength="1"
          strokeDasharray={`${t} 1`}
        />
        <circle
          className={isDay ? "horizon-sun" : "horizon-sun-down"}
          cx={x}
          cy={y}
          r="11"
        />
      </svg>

      <div className="horizon-times">
        <span>
          <strong>{formatTime(sunrise)}</strong> sunrise
        </span>
        <span className="horizon-length">
          {formatDuration(set - rise)} of daylight
          {!isDay && ", sun is down"}
        </span>
        <span>
          <strong>{formatTime(sunset)}</strong> sunset
        </span>
      </div>
    </div>
  );
}

function CurrentWeather({
  location,
  current,
  daily,
  units,
  isFavorite,
  onToggleFavorite,
}) {
  const info = getWeatherInfo(current.weather_code);
  const temp = Math.round(current.temperature_2m);
  const feels = Math.round(current.apparent_temperature);

  // The type axes always work in Celsius, whatever unit is shown
  const celsius =
    units.temperature_2m === "°F"
      ? ((current.temperature_2m - 32) * 5) / 9
      : current.temperature_2m;
  const { wght, wdth } = tempToType(celsius);

  const date = new Date(current.time).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <section className="hero">
      <div className="hero-top">
        <div>
          <h2 className="hero-place">
            {[location.name, location.country].filter(Boolean).join(", ")}
          </h2>
          <p className="hero-date">{date}</p>
        </div>
        <button
          type="button"
          className="fav-btn"
          onClick={onToggleFavorite}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorite ? "★" : "☆"}
        </button>
      </div>

      <div className="hero-main">
        {/* The key replays the "thicken into place" animation on change */}
        <div
          key={`${location.latitude}-${location.longitude}-${temp}`}
          className="hero-temp"
          role="img"
          aria-label={`${temp} degrees`}
          style={{ fontVariationSettings: `"wght" ${wght}, "wdth" ${wdth}` }}
        >
          {temp}
          <span className="deg" aria-hidden="true">
            °
          </span>
        </div>

        <div className="hero-side">
          <span className="hero-icon" title={info.label}>
            {info.icon}
          </span>
          <p className="hero-summary">
            {info.label}. Feels like {feels}°.
          </p>
        </div>
      </div>

      <Horizon
        sunrise={daily.sunrise[0]}
        sunset={daily.sunset[0]}
        now={current.time}
      />
    </section>
  );
}

export default CurrentWeather;