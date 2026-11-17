import { useState } from "react";
import { requestAI } from "../services/ai";
import { buildWeatherContext } from "../utils/aiContext";

// Remembers briefings so switching back to a city doesn't call the AI again
const cache = new Map();

function Briefing({ location, weather }) {
  const key = `${location.latitude},${location.longitude}|${weather.current.time.slice(
    0,
    13
  )}|${weather.current_units.temperature_2m}${weather.current_units.wind_speed_10m}`;

  const [entry, setEntry] = useState({ key: null });

  let view = { status: "idle" };
  if (entry.key === key) view = entry;
  else if (cache.has(key)) view = { status: "done", text: cache.get(key) };

  async function generate() {
    setEntry({ key, status: "loading" });
    try {
      const text = await requestAI({
        mode: "briefing",
        context: buildWeatherContext({ location, weather }),
      });
      cache.set(key, text);
      setEntry({ key, status: "done", text });
    } catch (err) {
      setEntry({ key, status: "error", error: err.message });
    }
  }

  return (
    <section className="card briefing" aria-live="polite">
      <h3 className="sheet-title">Daily briefing</h3>

      {view.status === "idle" && (
        <button type="button" className="retry-btn" onClick={generate}>
          Write my briefing
        </button>
      )}

      {view.status === "loading" && (
        <div className="loading" role="status">
          <div className="spinner" />
          <p className="muted">Reading the forecast...</p>
        </div>
      )}

      {view.status === "done" && (
        <>
          <p className="briefing-text">{view.text}</p>
          <div className="briefing-foot">
            <span className="muted">Written by AI from the forecast on this page.</span>
            <button type="button" className="briefing-link" onClick={generate}>
              Rewrite
            </button>
          </div>
        </>
      )}

      {view.status === "error" && (
        <>
          <p className="briefing-error">{view.error}</p>
          <div className="briefing-foot">
            <span className="muted">The advice line above still works.</span>
            <button type="button" className="briefing-link" onClick={generate}>
              Try again
            </button>
          </div>
        </>
      )}
    </section>
  );
}

export default Briefing;