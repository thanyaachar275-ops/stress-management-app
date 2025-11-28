import React, { useState } from "react";
import axios from "axios";
import "./MusicSection.css";

export default function MusicSection() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Search via your backend
  const searchMusic = async () => {
    const q = query.trim();
    setError(null);
    setResults([]);
    setCurrentVideo(null);

    if (!q) {
      setError("Type something to search.");
      return;
    }

    try {
      setLoading(true);
      // If you use proxy in client/package.json you can use '/api/search'
      const resp = await axios.get(`http://localhost:5000/api/search?q=${encodeURIComponent(q)}`);
      // resp.data should be { items: [...] }
      const items = resp.data?.items || resp.data; // tolerate both shapes
      if (!items || items.length === 0) {
        setError("No results found.");
        setResults([]);
        return;
      }
      // Normalize items to expected shape
      const normalized = items.map((it) => ({
        videoId: it.videoId || (it.id && it.id.videoId) || it.id,
        title: it.title || it.snippet?.title || "Untitled",
        thumbnail:
          it.thumbnail ||
          it.snippet?.thumbnails?.high?.url ||
          it.snippet?.thumbnails?.default?.url ||
          "",
      })).filter(Boolean);
      setResults(normalized);
    } catch (err) {
      console.error("Search error:", err);
      setError("Search failed — check server console and network.");
    } finally {
      setLoading(false);
    }
  };

  // Play clicked video
  const handlePlay = (videoId) => {
    if (!videoId) {
      setError("Invalid video id.");
      return;
    }
    setCurrentVideo(videoId);
    // Focus for mobile playback
    setTimeout(() => {
      document.querySelector(".player-iframe")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
  };

  return (
    <section className="music-section">
      <h2>🎵 YouTube Music</h2>

      <div className="search-row">
        <input
          value={query}
          placeholder="Search YouTube (e.g. lofi, relaxing piano)"
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") searchMusic(); }}
        />
        <button onClick={searchMusic} disabled={loading}>{loading ? "Searching..." : "Search"}</button>
      </div>

      {error && <div className="ms-error">{error}</div>}

      <div className="results-grid">
        {results.map((it) => (
          <div key={it.videoId} className="result-card" onClick={() => handlePlay(it.videoId)}>
            <img src={it.thumbnail} alt={it.title} />
            <div className="meta">
              <div className="title">{it.title}</div>
            </div>
          </div>
        ))}
      </div>

      {currentVideo && (
        <div className="player-iframe">
          <h3>Now Playing</h3>
          {/* iframe with autoplay=1 and allow autoplay — clicking is a user interaction so autoplay should work */}
          <iframe
            title="yt-player"
            width="100%"
            height="320"
            src={`https://www.youtube.com/embed/${currentVideo}?autoplay=1&rel=0`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
          />
        </div>
      )}
    </section>
  );
}