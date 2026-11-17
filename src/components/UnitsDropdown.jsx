import { useEffect, useRef, useState } from "react";

import { METRIC, IMPERIAL } from "../utils/units";

const GROUPS = [
  {
    key: "temperature",
    label: "Temperature",
    options: [
      { value: "celsius", label: "Celsius (°C)" },
      { value: "fahrenheit", label: "Fahrenheit (°F)" },
    ],
  },
  {
    key: "wind",
    label: "Wind speed",
    options: [
      { value: "kmh", label: "km/h" },
      { value: "mph", label: "mph" },
    ],
  },
  {
    key: "precipitation",
    label: "Precipitation",
    options: [
      { value: "mm", label: "Millimeters (mm)" },
      { value: "inch", label: "Inches (in)" },
    ],
  },
];

function UnitsDropdown({ units, onChange }) {
  const [open, setOpen] = useState(false);
    const ref = useRef(null);

  // Close the panel on outside click or Escape
  useEffect(() => {
    if (!open) return;

    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function handleKey(e) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const isImperial = GROUPS.every((g) => units[g.key] === IMPERIAL[g.key]);

  return (
    <div className="units" ref={ref}>
      <button
        type="button"
        className="units-toggle"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        ⚙️ Units
      </button>

      {open && (
        <div className="units-panel card">
          <button
            type="button"
            className="units-switch"
            onClick={() => onChange(isImperial ? METRIC : IMPERIAL)}
          >
            Switch to {isImperial ? "Metric" : "Imperial"}
          </button>

          {GROUPS.map((group) => (
            <div className="units-group" key={group.key}>
              <p className="units-label">{group.label}</p>
              {group.options.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  className={`units-option ${
                    units[group.key] === opt.value ? "active" : ""
                  }`}
                  onClick={() =>
                    onChange({ ...units, [group.key]: opt.value })
                  }
                >
                  {opt.label}
                  {units[group.key] === opt.value && <span>✓</span>}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UnitsDropdown;