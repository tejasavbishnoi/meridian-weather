import { useState } from "react";
import { searchLocations } from "../services/api";

function SearchBar({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!query.trim()) return;
    try {
      const places = await searchLocations(query.trim());
      setResults(places);
      setMessage(places.length === 0 ? "No results found" : "");
    } catch {
      setMessage("Search failed. Try again.");
    }
  }

  function pick(place) {
    onSelect(place);
    setQuery("");
    setResults([]);
    setMessage("");
  }

  return (
    <div className="search"
    onKeyDown={(e) => {
        if (e.key === "Escape") {
          setResults([]);
          setMessage("");
        }
      }}>
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          placeholder="Search for a city..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search location"
        />
        <button type="submit">Search</button>
      </form>

      {message && <p className="search-message">{message}</p>}

      {results.length > 0 && (
        <ul className="search-results">
          {results.map((place) => (
            <li key={place.id}>
              <button type="button" onClick={() => pick(place)}>
                {place.name}
                {place.admin1 ? `, ${place.admin1}` : ""}, {place.country}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchBar;