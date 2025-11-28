import React, { useState, useEffect } from "react";
import axios from "axios";
import HeroSection from "./HeroSection";
import BreathingExercise from "./BreathingExercise";
import Affirmation from "./Affirmation";
import MoodAnalytics from "./MoodAnalytics";
import MusicSection from "./MusicSection";
import Journal from "./Journal";
import DailyQuest from "./DailyQuest";
import ChatBot from "./ChatBot";
import "./App.css";

function App() {
  const [mood, setMood] = useState("");
  const [message, setMessage] = useState("Loading...");
  const [points, setPoints] = useState(0);
  const [levelUp, setLevelUp] = useState(false);
  


  // Level system: 100 XP = 1 Level
  const level = Math.floor(points / 100);
  const progress = points % 100;

  // 🎖 Badge titles by level
  const getBadge = (lvl) => {
    if (lvl < 1) return "🌱 Calm Beginner";
    if (lvl < 3) return "🍃 Peace Explorer";
    if (lvl < 5) return "🌸 Mindful Warrior";
    if (lvl < 8) return "🔥 Stress Slayer";
    return "🌈 Zen Master";
  };

  // 🧠 Fetch user data
  useEffect(() => {
    axios
      .get("http://localhost:5000/user")
      .then((response) => {
        setMessage("Welcome back 🌿");
        setPoints(response.data.xp);
      })
      .catch(() => setMessage("Failed to connect to backend 😢"));
  }, []);

  // 😄 Handle mood selection
  const handleMood = async (selectedMood) => {
    const oldLevel = level;
    setMood(selectedMood);

    try {
      const response = await axios.post("http://localhost:5000/mood", {
        mood: selectedMood,
      });
      const newXP = response.data.xp;
      setPoints(newXP);

      const newLevel = Math.floor(newXP / 100);
      if (newLevel > oldLevel) {
        setLevelUp(true);
        setTimeout(() => setLevelUp(false), 3000);
      }
    } catch (error) {
      console.error("Error updating mood:", error);
    }
  };

  // 🎯 Handle quest completion (+50 XP)
  const handleQuestComplete = () => {
    setPoints((prev) => prev + 50);
  };

  return (
    <div className="app">
      {/* 🌅 Hero Section */}
      <HeroSection />

      <div className="content">
        <h1>🧘 Stress Management Game</h1>
        <p>{message}</p>

        {/* 🧾 Stats */}
        <div className="stats">
          <h2>XP: {points}</h2>
          <h3>Level: {level}</h3>
          <h4 className="badge">{getBadge(level)}</h4>
        </div>

        {/* 🌈 Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}>
            {progress}%
          </div>
        </div>

        {/* 😊 Mood Buttons */}
        <div className="mood-buttons">
          <button onClick={() => handleMood("happy")}>😊 Happy</button>
          <button onClick={() => handleMood("sad")}>😢 Sad</button>
          <button onClick={() => handleMood("angry")}>😠 Angry</button>
          <button onClick={() => handleMood("calm")}>😌 Calm</button>
        </div>
        <p className="tip">Each mood adds +10 XP 🌟</p>

        {/* 🎉 Level Up Animation */}
        {levelUp && <div className="celebration">🎉 LEVEL UP! 🎉</div>}

        {/* 🌬️ Breathing Exercise */}
        <BreathingExercise />

        {/* 📊 Mood Analytics */}
        <MoodAnalytics />
        
        {/* 🎶 Music Section */}
        <MusicSection mood={mood} />

        {/* 📓 Mood Journal */}
        <Journal />
        
        {/* 💬 Daily Affirmation */}
        <Affirmation />
        
        {/* 🪷 Daily Mindfulness Quest */}
        <DailyQuest onComplete={handleQuestComplete} />
      </div>
      {/* 💬 Floating ChatBot */}
      <ChatBot />
    </div>
  );
}

export default App;
