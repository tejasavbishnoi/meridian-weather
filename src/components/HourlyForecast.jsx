import { useState } from "react";
import { getWeatherInfo } from "../utils/weatherCodes";
import WeatherIcon from "./WeatherIcon";

const W = 960;
const H = 310;
const PAD_X = 28;
const PAD_TOP = 40;
const RAIN_BASE = H - 34;
const RAIN_MAX = 46;
const PLOT_BOTTOM = RAIN_BASE - RAIN_MAX - 56;

function formatHour(hour) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12} ${suffix}`;
}

// Smooth curve through the points
function buildPath(points) {
  return points.reduce((d, p, i) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const prev = points[i - 1];
    const mid = (prev.x + p.x) / 2;
    return `${d} C${mid},${prev.y} ${mid},${p.y} ${p.x},${p.y}`;
  }, "");
}

function HourlyForecast({ hourly, daily, currentTime }) {
  const [selectedDay, setSelectedDay] = useState(0);
  const [pickedHour, setPickedHour] = useState(null);

  const start = selectedDay * 24;
  const temps = hourly.temperature_2m.slice(start, start + 24);
  const codes = hourly.weather_code.slice(start, start + 24);
  const rain = (hourly.precipitation_probability ?? []).slice(
    start,
    start + 24
  );
  const dayFlags = (hourly.is_day ?? []).slice(start, start + 24);

  // Today starts on the current hour, other days on noon
  const nowHour = Number(currentTime.slice(11, 13));
  const activeHour = pickedHour ?? (selectedDay === 0 ? nowHour : 12);

  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const span = max - min || 1;
  const step = (W - PAD_X * 2) / 23;
  const barWidth = step * 0.56;
  const plotHeight = PLOT_BOTTOM - PAD_TOP;

  const points = temps.map((t, i) => ({
    x: PAD_X + i * step,
    y: PAD_TOP + (1 - (t - min) / span) * plotHeight,
  }));

  const line = buildPath(points);
  const area = `${line} L${points[23].x},${PLOT_BOTTOM} L${
    points[0].x
  },${PLOT_BOTTOM} Z`;

  const active = points[activeHour];
  const info = getWeatherInfo(codes[activeHour]);
  const isDay = dayFlags[activeHour] !== 0;
  const rainPct = rain[activeHour] ?? 0;
  const hasRain = rain.length > 0;
  const maxIndex = temps.indexOf(max);
  const minIndex = temps.indexOf(min);

  function indexFromEvent(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    return Math.min(23, Math.max(0, Math.round((x - PAD_X) / step)));
  }

  function handleKeyDown(e) {
    const keys = {
      ArrowRight: activeHour + 1,
      ArrowUp: activeHour + 1,
      ArrowLeft: activeHour - 1,
      ArrowDown: activeHour - 1,
      Home: 0,
      End: 23,
    };
    if (e.key in keys) {
      e.preventDefault();
      setPickedHour(Math.min(23, Math.max(0, keys[e.key])));
    }
  }

  function chooseDay(i) {
    setSelectedDay(i);
    setPickedHour(null);
  }

  return (
    <section className="card curve-sheet" aria-label="Hourly forecast">
      <div className="curve-head">
        <div>
          <h3 className="sheet-title">Hourly forecast</h3>
          <div className="curve-read">
            <span className="curve-big">{Math.round(temps[activeHour])}°</span>
            <span className="curve-meta">
              <WeatherIcon code={codes[activeHour]} isDay={isDay} />
              {info.label} at {formatHour(activeHour)}
            </span>
            {hasRain && (
              <span className="curve-meta">{rainPct}% chance of rain</span>
            )}
          </div>
        </div>

        <div className="day-tabs" role="group" aria-label="Select day">
          {daily.time.map((date, i) => (
            <button
              type="button"
              key={date}
              className="day-tab"
              aria-pressed={selectedDay === i}
              onClick={() => chooseDay(i)}
            >
              {i === 0
                ? "Today"
                : new Date(date).toLocaleDateString("en-US", {
                    weekday: "short",
                    timeZone: "UTC",
                  })}
            </button>
          ))}
        </div>
      </div>

      <div className="curve-scroll">
        <div
          className="curve"
          role="slider"
          tabIndex={0}
          aria-label="Hour of the day"
          aria-valuemin={0}
          aria-valuemax={23}
          aria-valuenow={activeHour}
          aria-valuetext={`${formatHour(activeHour)}, ${Math.round(
            temps[activeHour]
          )} degrees, ${info.label}${
            hasRain ? `, ${rainPct}% chance of rain` : ""
          }`}
          onKeyDown={handleKeyDown}
          onPointerDown={(e) => setPickedHour(indexFromEvent(e))}
          onPointerMove={(e) => {
            if (e.pointerType === "mouse") setPickedHour(indexFromEvent(e));
          }}
        >
          <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
            <defs>
              <linearGradient id="curveFill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  style={{ stopColor: "var(--heading)", stopOpacity: 0.32 }}
                />
                <stop
                  offset="100%"
                  style={{ stopColor: "var(--heading)", stopOpacity: 0 }}
                />
              </linearGradient>
            </defs>

            <path d={area} fill="url(#curveFill)" />
            <path className="curve-line" d={line} />

            {/* High and low of the day */}
            <text
              className="curve-peak"
              x={points[maxIndex].x}
              y={points[maxIndex].y - 14}
              textAnchor="middle"
            >
              {Math.round(max)}°
            </text>
            <text
              className="curve-peak"
              x={points[minIndex].x}
              y={points[minIndex].y + 26}
              textAnchor="middle"
            >
              {Math.round(min)}°
            </text>

            {/* Rain chance bars */}
            {hasRain && (
              <>
                <text
                  className="rain-title"
                  x={PAD_X}
                  y={RAIN_BASE - RAIN_MAX - 10}
                >
                  Chance of rain
                </text>
                <line
                  className="rain-base"
                  x1={PAD_X}
                  x2={W - PAD_X}
                  y1={RAIN_BASE}
                  y2={RAIN_BASE}
                />
                {temps.map((_, i) => {
                  const p = rain[i] ?? 0;
                  const h = p > 0 ? Math.max(3, (p / 100) * RAIN_MAX) : 0;
                  return (
                    <rect
                      key={i}
                      className={`rain-bar ${
                        i === activeHour ? "rain-bar-active" : ""
                      }`}
                      x={points[i].x - barWidth / 2}
                      y={RAIN_BASE - h}
                      width={barWidth}
                      height={h}
                      rx="3"
                    />
                  );
                })}
              </>
            )}

            {/* Hour labels every 3 hours */}
            {points.map(
              (p, i) =>
                i % 3 === 0 && (
                  <text
                    key={i}
                    className="curve-label"
                    x={p.x}
                    y={H - 8}
                    textAnchor="middle"
                  >
                    {formatHour(i)}
                  </text>
                )
            )}

            {/* The current hour (today only) */}
            {selectedDay === 0 && (
              <circle
                className="curve-now"
                cx={points[nowHour].x}
                cy={points[nowHour].y}
                r="6"
              />
            )}

            {/* The scrubber */}
            <g
              className="curve-active"
              style={{ transform: `translate(${active.x}px, ${active.y}px)` }}
            >
              <line
                className="curve-guide"
                x1="0"
                x2="0"
                y1={PAD_TOP - 18 - active.y}
                y2={RAIN_BASE - active.y}
              />
              <circle className="curve-dot" r="8" />
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}

export default HourlyForecast;