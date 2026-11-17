const CLOUDS = [1, 2, 3, 4, 5];

const DROPS = Array.from({ length: 70 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  duration: 0.6 + ((i * 7) % 5) * 0.12,
  delay: ((i * 13) % 10) / 10,
}));

const FLAKES = Array.from({ length: 40 }, (_, i) => ({
  left: (i * 29 + 7) % 100,
  size: 3 + (i % 4) * 1.5,
  duration: 7 + (i % 6) * 1.2,
  delay: (i * 17) % 10,
}));

const STARS = Array.from({ length: 45 }, (_, i) => ({
  left: (i * 47 + 5) % 100,
  top: (i * 31 + 3) % 60,
  delay: (i % 7) * 0.5,
}));

function SkyBackground({ sky, isNight, theme }) {
  const dark = isNight || theme === "dark";
  const showSun = sky === "clear" && !dark;
  const showMoon = sky === "clear" && dark;
  const showStars = dark && (sky === "clear" || sky === "cloudy");
  const showRain = sky === "rain" || sky === "storm";

  return (
    <div className="sky" aria-hidden="true">
      {showSun && <div className="sun-glow" />}
      {showMoon && <div className="moon" />}

      {showStars &&
        STARS.map((s, i) => (
          <span
            key={i}
            className="star"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}

      {CLOUDS.map((n) => (
        <div key={n} className={`cloud cloud-${n}`} />
      ))}

      {showRain &&
        DROPS.map((d, i) => (
          <span
            key={i}
            className="drop"
            style={{
              left: `${d.left}%`,
              animationDuration: `${d.duration}s`,
              animationDelay: `-${d.delay}s`,
            }}
          />
        ))}

      {sky === "snow" &&
        FLAKES.map((f, i) => (
          <span
            key={i}
            className="flake"
            style={{
              left: `${f.left}%`,
              width: `${f.size}px`,
              height: `${f.size}px`,
              animationDuration: `${f.duration}s`,
              animationDelay: `-${f.delay}s`,
            }}
          />
        ))}

      {sky === "storm" && <div className="lightning" />}
    </div>
  );
}

export default SkyBackground;