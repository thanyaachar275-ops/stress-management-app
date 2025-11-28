import React, { useState, useEffect } from "react";
import "./DailyQuest.css";

const QUESTS = [
  "Take 3 deep breaths and smile 🌸",
  "Write down one thing you’re grateful for 🙏",
  "Stretch for 2 minutes 💪",
  "Spend 5 minutes without your phone ☀️",
  "Drink a glass of water slowly 💧",
  "Compliment yourself today 💖",
  "Sit quietly and count your breaths to 10 🧘",
];

const DailyQuest = ({ onComplete }) => {
  const [todayQuest, setTodayQuest] = useState("");
  const [completed, setCompleted] = useState(false);

  // Pick a quest for the day
  useEffect(() => {
    const storedQuest = localStorage.getItem("todayQuest");
    const storedDate = localStorage.getItem("questDate");
    const today = new Date().toDateString();

    if (storedQuest && storedDate === today) {
      setTodayQuest(storedQuest);
      setCompleted(localStorage.getItem("questCompleted") === "true");
    } else {
      const randomQuest = QUESTS[Math.floor(Math.random() * QUESTS.length)];
      setTodayQuest(randomQuest);
      localStorage.setItem("todayQuest", randomQuest);
      localStorage.setItem("questDate", today);
      localStorage.setItem("questCompleted", "false");
    }
  }, []);

  const handleComplete = () => {
    setCompleted(true);
    localStorage.setItem("questCompleted", "true");
    onComplete(); // Give XP reward
  };

  return (
    <div className="daily-quest">
      <h2>🌞 Daily Mindfulness Quest</h2>
      <p className="quest-text">{todayQuest}</p>
      {completed ? (
        <p className="completed">✅ Quest Completed! You earned +50 XP!</p>
      ) : (
        <button className="quest-btn" onClick={handleComplete}>
          Complete Quest
        </button>
      )}
    </div>
  );
};

export default DailyQuest;
