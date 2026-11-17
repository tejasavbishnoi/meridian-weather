import { getWeatherInfo } from "../utils/weatherCodes";

const CLOUD = "M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z";
const MOON = "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z";
const ALL_RAYS = [0, 45, 90, 135, 180, 225, 270, 315];

function kindOf(code) {
  if (code === 0 || code === 1) return "clear";
  if (code === 2) return "partly";
  if (code === 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";
  if (code >= 51 && code <= 57) return "drizzle";
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if (code >= 95) return "storm";
  return "cloudy";
}

function Rays({ cx, cy, r1, r2, angles }) {
  return angles.map((angle) => {
    const rad = (angle * Math.PI) / 180;
    return (
      <line
        key={angle}
        className="wi-ray"
        x1={cx + r1 * Math.cos(rad)}
        y1={cy + r1 * Math.sin(rad)}
        x2={cx + r2 * Math.cos(rad)}
        y2={cy + r2 * Math.sin(rad)}
      />
    );
  });
}

function WeatherIcon({ code, isDay = true, className = "" }) {
  const kind = kindOf(code);
  const label = getWeatherInfo(code).label;
  const raised = "translate(1.8 -1.2) scale(0.85)";

  return (
    <svg
      className={`wi ${className}`}
      viewBox="0 0 24 24"
      role="img"
      aria-label={label}
    >
      {kind === "clear" &&
        (isDay ? (
          <>
            <circle className="wi-sun" cx="12" cy="12" r="4.4" />
            <Rays cx={12} cy={12} r1={7.4} r2={9.8} angles={ALL_RAYS} />
          </>
        ) : (
          <path className="wi-moon" d={MOON} />
        ))}

      {kind === "partly" && (
        <>
          {isDay ? (
            <>
              <circle className="wi-sun" cx="8" cy="8" r="3.2" />
              <Rays
                cx={8}
                cy={8}
                r1={5.3}
                r2={7.2}
                angles={[135, 180, 225, 270, 315]}
              />
            </>
          ) : (
            <path
              className="wi-moon"
              d={MOON}
              transform="translate(0.5 0) scale(0.5)"
            />
          )}
          <path
            className="wi-cloud"
            d={CLOUD}
            transform="translate(6.3 7.4) scale(0.7)"
          />
        </>
      )}

      {kind === "cloudy" && <path className="wi-cloud" d={CLOUD} />}

      {kind === "fog" && (
        <>
          <path
            className="wi-cloud"
            d={CLOUD}
            transform="translate(2.4 -0.5) scale(0.8)"
          />
          <path className="wi-fog" d="M4 18h16M7 21.2h10" />
        </>
      )}

      {kind === "drizzle" && (
        <>
          <path className="wi-cloud" d={CLOUD} transform={raised} />
          <path className="wi-drop" d="M9 18.4l-.9 2.2M15 18.4l-.9 2.2" />
        </>
      )}

      {kind === "rain" && (
        <>
          <path className="wi-cloud" d={CLOUD} transform={raised} />
          <path
            className="wi-drop"
            d="M8 17.8l-1.4 3.8M12.6 17.8l-1.4 3.8M17.2 17.8l-1.4 3.8"
          />
        </>
      )}

      {kind === "snow" && (
        <>
          <path className="wi-cloud" d={CLOUD} transform={raised} />
          <circle className="wi-flake" cx="8" cy="19" r="1" />
          <circle className="wi-flake" cx="12.5" cy="21.2" r="1" />
          <circle className="wi-flake" cx="17" cy="19" r="1" />
        </>
      )}

      {kind === "storm" && (
        <>
          <path
            className="wi-cloud"
            d={CLOUD}
            transform="translate(1.8 -1.6) scale(0.85)"
          />
          <polygon
            className="wi-bolt"
            points="13.5,15.5 9.5,20 12.3,20 11,23.5 15.5,18.3 12.7,18.3"
          />
        </>
      )}
    </svg>
  );
}

export default WeatherIcon;