// Journal.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Journal.css";

function Journal() {
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState("");

  // 📥 Fetch existing journal entries from backend
  useEffect(() => {
    axios
      .get("http://localhost:5000/journal")
      .then((res) => setEntries(res.data))
      .catch((err) => console.error("Error fetching journal:", err));
  }, []);

  // ✍️ Submit a new entry
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newEntry.trim()) return;

    try {
      const res = await axios.post("http://localhost:5000/journal", {
        text: newEntry,
      });
      setEntries([res.data, ...entries]);
      setNewEntry("");
    } catch (error) {
      console.error("Error adding entry:", error);
    }
  };

  return (
    <div className="journal-container">
      <h2>🪶 Mood Journal</h2>
      <p className="subtitle">
        Write a few words about how you feel today. It helps clear your mind 💭
      </p>

      <form className="journal-form" onSubmit={handleSubmit}>
        <textarea
          value={newEntry}
          onChange={(e) => setNewEntry(e.target.value)}
          placeholder="Type your thoughts here..."
        />
        <button type="submit">Save Entry</button>
      </form>

      <div className="journal-entries">
        {entries.length === 0 ? (
          <p className="no-entries">No journal entries yet 🌱</p>
        ) : (
          entries.map((entry) => (
            <div key={entry._id} className="entry-card">
              <p>{entry.text}</p>
              <small>
                {new Date(entry.date).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </small>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Journal;
