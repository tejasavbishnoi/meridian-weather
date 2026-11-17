import { getWeatherInfo } from "./weatherCodes";
import { formatTime } from "./format";

export function buildWeatherContext({ location, weather }) {
  const { current, daily, hourly, current_units: u } = weather;
  const nowHour = Number(current.time.slice(11, 13));

  // Next 12 hours, every second hour
  const nextHours = [];
  for (let i = nowHour + 2; i <= nowHour + 12; i += 2) {
    if (hourly.time[i] === undefined) break;
    nextHours.push({
      time: formatTime(hourly.time[i]),
      temperature: Math.round(hourly.temperature_2m[i]),
      rainChancePercent: hourly.precipitation_probability?.[i] ?? null,
      conditions: getWeatherInfo(hourly.weather_code[i]).label,
    });
  }

  const nextDays = daily.time.slice(1, 4).map((date, i) => ({
    day: new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      timeZone: "UTC",
    }),
    conditions: getWeatherInfo(daily.weather_code[i + 1]).label,
    high: Math.round(daily.temperature_2m_max[i + 1]),
    low: Math.round(daily.temperature_2m_min[i + 1]),
  }));

  return {
    place: [location.name, location.country].filter(Boolean).join(", "),
    date: new Date(current.time).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }),
    localTime: formatTime(current.time),
    isDaytime: current.is_day !== 0,
    units: {
      temperature: u.temperature_2m,
      wind: u.wind_speed_10m,
      precipitation: u.precipitation,
    },
    now: {
      temperature: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      conditions: getWeatherInfo(current.weather_code).label,
      humidityPercent: current.relative_humidity_2m,
      wind: Math.round(current.wind_speed_10m),
      precipitation: current.precipitation,
      uvIndex: Math.round(current.uv_index ?? 0),
    },
    today: {
      high: Math.round(daily.temperature_2m_max[0]),
      low: Math.round(daily.temperature_2m_min[0]),
      sunrise: formatTime(daily.sunrise[0]),
      sunset: formatTime(daily.sunset[0]),
      maxUvIndex: Math.round(daily.uv_index_max[0]),
    },
    nextHours,
    nextDays,
  };
}
function dayName(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "UTC",
  });
}

// Richer data for the chat box: 2 days of hourly data and all 7 days
export function buildChatContext({ location, weather }) {
  const context = buildWeatherContext({ location, weather });
  delete context.nextHours;
  delete context.nextDays;

  const { current, daily, hourly } = weather;
  const nowHour = Number(current.time.slice(11, 13));

  const hourlyForecast = [];
  for (let i = nowHour + 1; i <= nowHour + 48; i += 2) {
    if (hourly.time[i] === undefined) break;
    hourlyForecast.push({
      when: `${dayName(hourly.time[i].slice(0, 10))} ${formatTime(hourly.time[i])}`,
      temperature: Math.round(hourly.temperature_2m[i]),
      rainChancePercent: hourly.precipitation_probability?.[i] ?? null,
      conditions: getWeatherInfo(hourly.weather_code[i]).label,
      isDaytime: hourly.is_day?.[i] !== 0,
    });
  }

  const week = daily.time.map((date, i) => ({
    day: dayName(date),
    date,
    conditions: getWeatherInfo(daily.weather_code[i]).label,
    high: Math.round(daily.temperature_2m_max[i]),
    low: Math.round(daily.temperature_2m_min[i]),
    sunrise: formatTime(daily.sunrise[i]),
    sunset: formatTime(daily.sunset[i]),
    maxUvIndex: Math.round(daily.uv_index_max[i]),
  }));

  return { ...context, hourlyForecast, week };
}