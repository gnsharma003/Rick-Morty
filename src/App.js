import React, { useState, useEffect } from "react";

const speciesOptions = ["Human", "Humanoid", "Cronenberg"];
const genderOptions = ["female", "male", "genderless", "unknown"];

export default function RickAndMortyCharacters() {
  const [characters, setCharacters] = useState([]);
  const [nameFilter, setNameFilter] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCharacters() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (nameFilter) params.append("name", nameFilter);
        if (speciesFilter) params.append("species", speciesFilter);
        if (genderFilter) params.append("gender", genderFilter);

        const res = await fetch(
          `https://rickandmortyapi.com/api/character?${params.toString()}`
        );
        if (!res.ok) {
          if (res.status === 404) {
            // No results found
            setCharacters([]);
            setLoading(false);
            return;
          }
          throw new Error("Failed to fetch characters");
        }
        const data = await res.json();

        const firstEpisodeUrls = data.results.map((char) => char.episode[0]);
        const uniqueEpisodeUrls = [...new Set(firstEpisodeUrls)];

        const episodeMap = {};
        await Promise.all(
          uniqueEpisodeUrls.map(async (url) => {
            const epRes = await fetch(url);
            const epData = await epRes.json();
            episodeMap[url] = epData.name;
          })
        );

        const charactersWithEpisode = data.results.map((char) => ({
          ...char,
          firstEpisodeName: episodeMap[char.episode[0]] || "Unknown",
        }));

        setCharacters(charactersWithEpisode);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCharacters();
  }, [nameFilter, speciesFilter, genderFilter]);

  return (
    <div className="container" role="main">
      <h1>Rick and Morty Characters</h1>

      <form
        className="filters"
        onSubmit={(e) => e.preventDefault()}
        aria-label="Search and filter characters"
      >
        <input
          type="text"
          placeholder="Search by name"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          aria-label="Search characters by name"
        />
        <select
          value={speciesFilter}
          onChange={(e) => setSpeciesFilter(e.target.value)}
          aria-label="Filter by species"
        >
          <option value="">All Species</option>
          {speciesOptions.map((sp) => (
            <option key={sp} value={sp}>
              {sp}
            </option>
          ))}
        </select>
        <select
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
          aria-label="Filter by gender"
        >
          <option value="">All Genders</option>
          {genderOptions.map((g) => (
            <option key={g} value={g}>
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </option>
          ))}
        </select>
      </form>

      {loading && <div className="loading">Loading characters...</div>}
      {error && <div className="error">Error: {error}</div>}
      {!loading && !error && characters.length === 0 && (
        <div className="no-results">No characters found.</div>
      )}

      <section className="grid" aria-live="polite">
        {characters.map((char) => (
          <article key={char.id} className="card" tabIndex={0}>
            <img src={char.image} alt={`${char.name} thumbnail`} />
            <div className="card-details">
              <h2>{char.name}</h2>
              <p>
                <strong>Gender:</strong> {char.gender}
              </p>
              <p>
                <strong>Species:</strong> {char.species}
              </p>
              <p>
                <strong>Location:</strong> {char.location.name}
              </p>
              <p>
                <strong>First episode:</strong> {char.firstEpisodeName}
              </p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
