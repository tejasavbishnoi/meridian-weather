import { useEffect, useState } from "react";
import { getForecast } from "../services/api";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { getWeatherInfo } from "../utils/weatherCodes";
import SearchBar from "./SearchBar";
import WeatherIcon from "./WeatherIcon";

const MAX_PLACES = 4;

function placeKey(p) {
  return `${p.latitude.toFixed(2)},${p.longitude.toFixed(2)}`;
}

function CompareLocations({ units, favorites, currentLocation }) {
  const [places, setPlaces] = useLocalStorage("weather-compare", []);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch weather for every place in the list
  useEffect(() => {
        if (places.length === 0) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const results = await Promise.all(
          places.map((p) =>
            getForecast({
              latitude: p.latitude,
              longitude: p.longitude,
              units,
            })
          )
        );
        if (cancelled) return;
        const map = {};
        places.forEach((p, i) => {
          map[placeKey(p)] = results[i];
        });
        setData(map);
        setMessage("");
      } catch {
        if (!cancelled) {
          setMessage("Could not load weather for one or more locations.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [places, units]);

  function addPlace(place) {
    const clean = {
      name: place.name,
      country: place.country,
      latitude: place.latitude,
      longitude: place.longitude,
    };

    if (places.some((p) => placeKey(p) === placeKey(clean))) {
      setMessage(`${clean.name} is already in the comparison.`);
      return;
    }
    if (places.length >= MAX_PLACES) {
      setMessage(`You can compare up to ${MAX_PLACES} locations.`);
      return;
    }
    setMessage("");
    setPlaces([...places, clean]);
  }

  function removePlace(place) {
    setMessage("");
    setPlaces(places.filter((p) => placeKey(p) !== placeKey(place)));
  }

  // Quick-add options: favorites + current location, minus ones already added
  const quickOptions = [
    ...(currentLocation ? [currentLocation] : []),
    ...favorites,
  ].filter(
    (opt, i, arr) =>
      arr.findIndex((o) => placeKey(o) === placeKey(opt)) === i &&
      !places.some((p) => placeKey(p) === placeKey(opt))
  );

  return (
    <section>
      <h2 className="compare-heading">Compare locations</h2>
      <p className="muted compare-sub">
        Add up to {MAX_PLACES} places to see their weather side by side.
      </p>

      <SearchBar onSelect={addPlace} />

      {quickOptions.length > 0 && (
        <div className="quick-add">
          <span className="muted">Quick add:</span>
          {quickOptions.map((opt) => (
            <button
              type="button"
              key={placeKey(opt)}
              className="quick-add-btn"
              onClick={() => addPlace(opt)}
            >
              + {opt.name}
            </button>
          ))}
        </div>
      )}

      {message && <p className="notice">{message}</p>}

      {places.length === 0 && (
        <p className="muted">No locations added yet. Search for a city above.</p>
      )}

      <div className={`compare-grid ${loading ? "refreshing" : ""}`}>
        {places.map((place) => {
          const forecast = data[placeKey(place)];

          return (
            <article className="card compare-card" key={placeKey(place)}>
              <button
                type="button"
                className="compare-remove"
                onClick={() => removePlace(place)}
                aria-label={`Remove ${place.name} from comparison`}
              >
                ✕
              </button>

              <h3>{place.name}</h3>
              <p className="muted">{place.country}</p>

              {!forecast ? (
                <p className="muted">Loading...</p>
              ) : (
                <CompareDetails forecast={forecast} />
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function CompareDetails({ forecast }) {
  const { current, current_units: u, daily } = forecast;
  const info = getWeatherInfo(current.weather_code);

  const rows = [
    ["Feels like", `${Math.round(current.apparent_temperature)}°`],
    ["Humidity", `${current.relative_humidity_2m}${u.relative_humidity_2m}`],
    ["Wind", `${Math.round(current.wind_speed_10m)} ${u.wind_speed_10m}`],
    ["Precipitation", `${current.precipitation} ${u.precipitation}`],
    [
      "High / Low",
      `${Math.round(daily.temperature_2m_max[0])}° / ${Math.round(
        daily.temperature_2m_min[0]
      )}°`,
    ],
  ];

  return (
    <>
      <div className="compare-main">
        <span className="compare-icon"><WeatherIcon
            code={current.weather_code}
            isDay={current.is_day !== 0}
          /></span>
        <span className="compare-temp">
          {Math.round(current.temperature_2m)}°
        </span>
      </div>
      <p className="muted compare-label">{info.label}</p>

      <dl className="compare-rows">
        {rows.map(([label, value]) => (
          <div className="compare-row" key={label}>
            <dt className="muted">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}

export default CompareLocations;