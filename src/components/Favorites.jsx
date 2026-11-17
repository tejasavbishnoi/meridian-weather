function Favorites({ favorites, onSelect, onRemove }) {
  if (favorites.length === 0) {
    return (
      <p className="muted favorites-empty">
        No favorites yet. Tap ☆ on a city to save it.
      </p>
    );
  }

  return (
    <section className="favorites" aria-label="Favorite locations">
      <h3 className="favorites-title">Favorites</h3>
      <ul className="favorites-list">
        {favorites.map((place) => (
          <li className="favorite-chip" key={`${place.latitude},${place.longitude}`}>
            <button
              type="button"
              className="favorite-name"
              onClick={() => onSelect(place)}
            >
              {place.name}
            </button>
            <button
              type="button"
              className="favorite-remove"
              onClick={() => onRemove(place)}
              aria-label={`Remove ${place.name} from favorites`}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Favorites;