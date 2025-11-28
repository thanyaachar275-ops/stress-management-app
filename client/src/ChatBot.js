import React, { useState } from "react";
import "./ChatBot.css";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi there! 🌸 How are you feeling today?", sender: "bot" },
  ]);
  const [input, setInput] = useState("");

  // Toggle chatbot open/close
  const toggleChat = () => setIsOpen(!isOpen);

  // Handle sending messages
  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Basic chatbot responses
    setTimeout(() => {
      const botReply = generateBotReply(input);
      setMessages((prev) => [...prev, { text: botReply, sender: "bot" }]);
    }, 800);
  };

  // Simple response generator
  const generateBotReply = (msg) => {
    const lower = msg.toLowerCase();
  // --- NEGATIVE FEELINGS ---
  if (
    lower.includes("sad") ||
    lower.includes("down") ||
    lower.includes("depressed") ||
    lower.includes("not good") ||
    lower.includes("dont feel good") ||
    lower.includes("don't feel good") ||
    lower.includes("bad") ||
    lower.includes("upset") ||
    lower.includes("hurt")
  ) {
    return (
      "I’m really sorry you're feeling this way 💛.\n" +
      "You deserve kindness. Want to tell me what made you feel this way?"
    );
  }
  // --- ANXIETY ---
  if (
    lower.includes("anxious") ||
    lower.includes("anxiety") ||
    lower.includes("scared") ||
    lower.includes("worried") ||
    lower.includes("panic")
  ) {
    return (
      "Anxiety can be overwhelming 💚.\n" +
      "Let's ground together: name 5 things you can see around you."
    );
  }
   // --- ANGER ---
  if (
    lower.includes("angry") ||
    lower.includes("irritated") ||
    lower.includes("frustrated") ||
    lower.includes("mad")
  ) {
    return (
      "It’s okay to feel angry 🔥.\n" +
      "Try this: inhale for 4 seconds, hold for 4, exhale slowly for 6."
    );
  }

    // --- STRESS / OVERWHELM ---
  if (
    lower.includes("stress") ||
    lower.includes("overwhelmed") ||
    lower.includes("pressure") ||
    lower.includes("tired")
  ) {
    return (
      "You’re carrying a lot right now 🌿.\n" +
      "Take one deep breath with me… inhale slowly… and exhale gently."
    );
  }

  // --- PHYSICAL FEELINGS ---
  if (
    lower.includes("headache") ||
    lower.includes("pain") ||
    lower.includes("sick") ||
    lower.includes("weak")
  ) {
    return (
      "I’m sorry you’re feeling unwell 💗.\n" +
      "Have you taken rest or had some water recently?"
    );
  }

  // --- POSITIVE EMOTIONS ---
  if (
    lower.includes("good") ||
    lower.includes("happy") ||
    lower.includes("better") ||
    lower.includes("great") ||
    lower.includes("fine")
  ) {
    return (
      "That’s lovely to hear 🌸.\n" +
      "What’s one small thing that made your day better?"
    );
  }

  // --- LONELINESS ---
  if (
    lower.includes("alone") ||
    lower.includes("lonely") ||
    lower.includes("nobody") ||
    lower.includes("no one")
  ) {
    return (
      "I’m here with you 💛.\n" +
      "You’re not alone. Do you want to talk about what's making you feel this way?"
    );
  }

  // --- GENERAL SUPPORT ---
  return (
    "I’m here for you 🌼.\n" +
    "Tell me more — what’s on your mind?"
  );

};

  return (
    <>
      {/* Floating Icon */}
      <div className="chatbot-button" onClick={toggleChat}>
        💬
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-popup">
          <div className="chatbot-header">
            <h4>Mindful ChatBot 🌸</h4>
            <button className="close-btn" onClick={toggleChat}>
              ✕
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chat-message ${
                  msg.sender === "user" ? "user" : "bot"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <form className="chatbot-input" onSubmit={handleSend}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
            />
            <button type="submit">➤</button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatBot;