// MoodJournal.js
import React, { useState, useEffect } from "react";
import "./MoodJournal.css";

const MoodJournal = () => {
  const [notes, setNotes] = useState([]);
  const [entry, setEntry] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("moodJournal");
    if (saved) setNotes(JSON.parse(saved));
  }, []);

  const addEntry = () => {
    if (!entry.trim()) return;
    const newNotes = [
      ...notes,
      { text: entry, date: new Date().toLocaleDateString() },
    ];
    setNotes(newNotes);
    localStorage.setItem("moodJournal", JSON.stringify(newNotes));
    setEntry("");
  };

  return (
    <div className="journal">
      <h2>📝 Mood Journal</h2>
      <p>Write a short note about your day or mood.</p>
      <textarea
        placeholder="Type your thoughts..."
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
      />
      <button onClick={addEntry}>Add Entry</button>

      <div className="entries">
        {notes.length === 0 ? (
          <p>No journal entries yet 🌿</p>
        ) : (
          notes.map((note, i) => (
            <div key={i} className="note">
              <span>{note.date}</span>
              <p>{note.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MoodJournal;
