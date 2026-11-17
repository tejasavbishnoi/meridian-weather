import { useState } from "react";

export const METRIC = {
  temperature: "celsius",
  wind: "kmh",
  precipitation: "mm",
};

export const IMPERIAL = {
  temperature: "fahrenheit",
  wind: "mph",
  precipitation: "inch",
};

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

  const isImperial = GROUPS.every((g) => units[g.key] === IMPERIAL[g.key]);

  return (
    <div className="units">
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