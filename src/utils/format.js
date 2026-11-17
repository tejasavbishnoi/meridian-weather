// "2026-11-17T06:42" -> "6:42 AM"
export function formatTime(timeString) {
  const hour = Number(timeString.slice(11, 13));
  const minutes = timeString.slice(14, 16);
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minutes} ${suffix}`;
}

export function formatDuration(ms) {
  const totalMinutes = Math.round(ms / 60000);
  return `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
}

export function uvLevel(uv) {
  if (uv < 3) return { label: "Low", color: "#22c55e" };
  if (uv < 6) return { label: "Moderate", color: "#eab308" };
  if (uv < 8) return { label: "High", color: "#f97316" };
  if (uv < 11) return { label: "Very high", color: "#ef4444" };
  return { label: "Extreme", color: "#a855f7" };
}

// Maps -5°C..40°C onto the font's weight and width axes.
// Cold = thin and wide, hot = heavy and condensed.
export function tempToType(celsius) {
  const t = Math.min(1, Math.max(0, (celsius + 5) / 45));
  return {
    wght: Math.round(200 + t * 600),
    wdth: Math.round(100 - t * 25),
  };
}