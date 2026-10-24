import { useState } from "react";
import { PLATFORMS } from "../config";

// Input form: username, interests, platform checkboxes, submit button.
export default function SearchForm({ onSearch, loading }) {
  const [username, setUsername] = useState("");
  const [interests, setInterests] = useState("");
  const [platforms, setPlatforms] = useState(["github"]);

  // Add or remove a platform id from the selected list
  function togglePlatform(id) {
    setPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    // Turn "web, python" into ["web", "python"]
    const list = interests.split(",").map((s) => s.trim()).filter(Boolean);
    onSearch({ username: username.trim(), interests: list, platforms });
  }

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <input
        placeholder="GitHub username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        placeholder="Interests (comma separated, optional)"
        value={interests}
        onChange={(e) => setInterests(e.target.value)}
      />
      <div className="platforms">
        {PLATFORMS.map((p) => (
          <label key={p.id}>
            <input
              type="checkbox"
              checked={platforms.includes(p.id)}
              onChange={() => togglePlatform(p.id)}
            />
            {p.label}
          </label>
        ))}
      </div>
      <button type="submit" disabled={loading || platforms.length === 0}>
        {loading ? "Finding issues..." : "Find issues"}
      </button>
    </form>
  );
}