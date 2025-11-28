// Affirmation.js
import React, { useEffect, useState } from "react";
import "./Affirmation.css";

const affirmations = [
  "You are doing better than you think 🌸",
  "Breathe. Relax. You’ve got this 💪",
  "Small steps count too 🌿",
  "You are stronger than your stress 🌤️",
  "Today is a new chance to shine 🌞",
  "Your peace matters 🕊️",
  "Be kind to yourself 💚",
];

const Affirmation = () => {
  const [quote, setQuote] = useState("");

  useEffect(() => {
    // Pick a random affirmation each day
    const today = new Date().getDate();
    setQuote(affirmations[today % affirmations.length]);
  }, []);

  return (
    <div className="affirmation">
      <h2>💬 Daily Affirmation</h2>
      <p>{quote}</p>
    </div>
  );
};

export default Affirmation;
