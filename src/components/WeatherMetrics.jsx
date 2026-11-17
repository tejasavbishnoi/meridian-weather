function WeatherMetrics({ current, units }) {
  const metrics = [
    {
      label: "Feels like",
      value: `${Math.round(current.apparent_temperature)}°`,
    },
    {
      label: "Humidity",
      value: `${current.relative_humidity_2m}${units.relative_humidity_2m}`,
    },
    {
      label: "Wind",
      value: `${Math.round(current.wind_speed_10m)} ${units.wind_speed_10m}`,
    },
    {
      label: "Precipitation",
      value: `${current.precipitation} ${units.precipitation}`,
    },
  ];

  return (
    <section className="metrics">
      {metrics.map((m) => (
        <div className="card metric" key={m.label}>
          <p className="muted">{m.label}</p>
          <p className="metric-value">{m.value}</p>
        </div>
      ))}
    </section>
  );
}

export default WeatherMetrics;