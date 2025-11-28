import React, { useState, useEffect } from "react";
import "./BreathingExercise.css";

function BreathingExercise() {
  const [isBreathing, setIsBreathing] = useState(false);
  const [text, setText] = useState("Ready to Breathe?");

  useEffect(() => {
    let interval;
    if (isBreathing) {
      setText("Breathe In...");
      interval = setInterval(() => {
        setText((prev) =>
          prev === "Breathe In..." ? "Breathe Out..." : "Breathe In..."
        );
      }, 4000);
    } else {
      clearInterval(interval);
      setText("Ready to Breathe?");
    }
    return () => clearInterval(interval);
  }, [isBreathing]);

  return (
    <div className="breathing-exercise">
      <h2>{text}</h2>
      <div className={`circle ${isBreathing ? "animate" : ""}`} />
      <button onClick={() => setIsBreathing(!isBreathing)}>
        {isBreathing ? "Stop" : "Start Breathing"}
      </button>
    </div>
  );
}

export default BreathingExercise;
