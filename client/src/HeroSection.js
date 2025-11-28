import React from "react";
import "./HeroSection.css";

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">Breathe. Reflect. Grow. 🌸</h1>
        <p className="hero-subtitle">
          Build emotional resilience through calm habits, mood tracking, and mindfulness.
        </p>
        <a href="#start" className="hero-btn">
          Start Your Journey 🌿
        </a>
      </div>

      {/* Background glow elements */}
      <div className="hero-glow glow1"></div>
      <div className="hero-glow glow2"></div>
    </section>
  );
};

export default HeroSection;
