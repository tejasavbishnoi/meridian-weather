import { uvLevel } from "../utils/format";

function Row({ label, children }) {
  return (
    <div className="readout-row">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function Readout({ current, units, daily }) {
  const uv = current.uv_index ?? daily.uv_index_max[0];
  const level = uvLevel(uv);

  // The API always returns visibility in meters, so we convert it ourselves
  const miles = units.wind_speed_10m === "mph";
  const visibility = miles
    ? `${(current.visibility / 1609.34).toFixed(1)} mi`
    : `${(current.visibility / 1000).toFixed(1)} km`;

  return (
    <section className="card readout" aria-label="Current conditions">
      <dl className="readout-list">
        <Row label="Humidity">
          {current.relative_humidity_2m}
          {units.relative_humidity_2m}
        </Row>
        <Row label="Pressure">
          {Math.round(current.surface_pressure)} {units.surface_pressure}
        </Row>
        <Row label="Wind">
          {Math.round(current.wind_speed_10m)} {units.wind_speed_10m}
        </Row>
        <Row label="Visibility">{visibility}</Row>
        <Row label="Precipitation">
          {current.precipitation} {units.precipitation}
        </Row>
        <Row label="UV index">
          <div className="readout-uv">
            <div className="uv-bar" aria-hidden="true">
              <div
                className="uv-fill"
                style={{
                  width: `${Math.min(100, (uv / 11) * 100)}%`,
                  background: level.color,
                }}
              />
            </div>
            <span>
              {Math.round(uv)} <small>{level.label}</small>
            </span>
          </div>
        </Row>
      </dl>
    </section>
  );
}

export default Readout;