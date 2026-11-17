function uvLevel(uv) {
  if (uv < 3) return { label: "Low", color: "#22c55e" };
  if (uv < 6) return { label: "Moderate", color: "#eab308" };
  if (uv < 8) return { label: "High", color: "#f97316" };
  if (uv < 11) return { label: "Very high", color: "#ef4444" };
  return { label: "Extreme", color: "#a855f7" };
}

// "2026-11-17T06:42" -> "6:42 AM"
function formatTime(timeString) {
  const hour = Number(timeString.slice(11, 13));
  const minutes = timeString.slice(14, 16);
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minutes} ${suffix}`;
}

function formatDuration(ms) {
  const totalMinutes = Math.round(ms / 60000);
  return `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
}

function SunCard({ sunrise, sunset, now }) {
  const rise = new Date(sunrise).getTime();
  const set = new Date(sunset).getTime();
  const current = new Date(now).getTime();

  const progress = (current - rise) / (set - rise);
  const isDaytime = progress >= 0 && progress <= 1;
  const p = Math.min(1, Math.max(0, progress));

  // Point on a semicircle (center 100,100 and radius 90)
  const x = 100 - 90 * Math.cos(Math.PI * p);
  const y = 100 - 90 * Math.sin(Math.PI * p);

  return (
    <div className="card sun-card">
      <p className="muted">Sunrise &amp; sunset</p>

      <svg viewBox="0 0 200 115" className="sun-arc" role="img"
        aria-label={isDaytime ? "Sun position today" : "The sun is down"}>
        {/* Full path of the sun */}
        <path
          d="M 10 100 A 90 90 0 0 1 190 100"
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="3"
          strokeDasharray="5 6"
          strokeLinecap="round"
        />
        {/* Part of the path already travelled */}
        <path
          d="M 10 100 A 90 90 0 0 1 190 100"
          pathLength="1"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${p} 1`}
        />
        {/* Horizon line */}
        <line x1="0" y1="100" x2="200" y2="100" stroke="#94a3b8" strokeWidth="1" />

        {isDaytime ? (
          <circle cx={x} cy={y} r="8" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
        ) : (
          <text x="100" y="70" textAnchor="middle" fontSize="26">🌙</text>
        )}
      </svg>

      <div className="sun-times">
        <div>
          <span className="muted">🌅 Sunrise</span>
          <strong>{formatTime(sunrise)}</strong>
        </div>
        <div>
          <span className="muted">🌇 Sunset</span>
          <strong>{formatTime(sunset)}</strong>
        </div>
      </div>

      <p className="muted sun-length">
        Daylight: {formatDuration(set - rise)}
        {!isDaytime && " · The sun is down right now"}
      </p>
    </div>
  );
}

function ExtraDetails({ current, units, daily }) {
  const uv = current.uv_index ?? daily.uv_index_max[0];
  const level = uvLevel(uv);

  // The API always returns visibility in meters, so we convert it ourselves
  const isMiles = units.wind === "mph";
  const visibility = isMiles
    ? `${(current.visibility / 1609.34).toFixed(1)} mi`
    : `${(current.visibility / 1000).toFixed(1)} km`;

  return (
    <section>
      <h3 className="section-title">More details</h3>

      <div className="details-grid">
        <div className="card detail">
          <p className="muted">UV index</p>
          <p className="metric-value">
            {Math.round(uv)}{" "}
            <span className="uv-label" style={{ color: level.color }}>
              {level.label}
            </span>
          </p>
          <div className="uv-bar" aria-hidden="true">
            <div
              className="uv-fill"
              style={{
                width: `${Math.min(100, (uv / 11) * 100)}%`,
                background: level.color,
              }}
            />
          </div>
        </div>

        <div className="card detail">
          <p className="muted">Visibility</p>
          <p className="metric-value">{visibility}</p>
        </div>

        <div className="card detail">
          <p className="muted">Air pressure</p>
          <p className="metric-value">
            {Math.round(current.surface_pressure)} {units.surface_pressure}
          </p>
        </div>

        <SunCard
          sunrise={daily.sunrise[0]}
          sunset={daily.sunset[0]}
          now={current.time}
        />
      </div>
    </section>
  );
}

export default ExtraDetails;