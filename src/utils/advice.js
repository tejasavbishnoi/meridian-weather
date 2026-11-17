const KMH_PER_MPH = 1.609;

function hourLabel(hour) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12} ${suffix}`;
}

export function getAdvice({ current, daily, hourly, units }) {
  const code = current.weather_code;
  const isDay = current.is_day !== 0;

  // Work in Celsius and km/h whatever units are shown
  const feels =
    units.temperature_2m === "°F"
      ? ((current.apparent_temperature - 32) * 5) / 9
      : current.apparent_temperature;
  const windKmh =
    units.wind_speed_10m === "mph"
      ? current.wind_speed_10m * KMH_PER_MPH
      : current.wind_speed_10m;
  const uvMax = daily.uv_index_max?.[0] ?? 0;

  // Highest rain chance over the next 12 hours
  const nowIndex = Number(current.time.slice(11, 13));
  const chances = (hourly.precipitation_probability ?? []).slice(
    nowIndex + 1,
    nowIndex + 13
  );
  const peak = Math.max(0, ...chances);
  const peakHour = (nowIndex + 1 + chances.indexOf(peak)) % 24;

  if (code >= 95) return "Thunderstorm nearby. Stay indoors if you can.";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return "It's raining. Take an umbrella.";
  }
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return "Snow is falling. Dress warm and watch for ice.";
  }
  if (code === 45 || code === 48) {
    return "Fog is limiting visibility. Take it slow if you're driving.";
  }
  if (peak >= 60) {
    return `Rain is likely around ${hourLabel(peakHour)}. Take an umbrella.`;
  }
  if (peak >= 30) {
    return `There is a ${peak}% chance of rain around ${hourLabel(
      peakHour
    )}. An umbrella is worth carrying.`;
  }
  if (feels >= 38) {
    return "Dangerously hot. Stay in the shade and drink plenty of water.";
  }
  if (feels >= 33) return "Very hot. Drink water and avoid the midday sun.";
  if (uvMax >= 8 && isDay) {
    return "UV is very high today. Wear sunscreen and a hat.";
  }
  if (feels <= 0) return "Freezing. Wear a heavy coat, gloves, and a hat.";
  if (feels <= 10) return "Cold out. Wear a warm jacket.";
  if (feels <= 17) return "A little chilly. A light jacket will do.";
  if (windKmh >= 35) return "Strong wind. Hold on to your hat.";
  if (uvMax >= 6 && isDay) {
    return "The sun is strong. Wear sunscreen if you're out for a while.";
  }
  return isDay
    ? "Comfortable out there. No special gear needed."
    : "A calm night. No special gear needed.";
}