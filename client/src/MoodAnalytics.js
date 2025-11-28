// MoodAnalytics.js
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import "./MoodAnalytics.css";

const data = [
  { day: "Mon", mood: 7 },
  { day: "Tue", mood: 5 },
  { day: "Wed", mood: 8 },
  { day: "Thu", mood: 6 },
  { day: "Fri", mood: 9 },
  { day: "Sat", mood: 7 },
  { day: "Sun", mood: 8 },
];

const MoodAnalytics = () => {
  return (
    <div className="mood-analytics">
      <h2>Your Weekly Mood Overview 🌤️</h2>
      <p className="mood-subtitle">Track how your emotions flow through the week.</p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
          <XAxis dataKey="day" stroke="#666" />
          <YAxis domain={[0, 10]} stroke="#666" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#f9f9f9",
              borderRadius: "10px",
              border: "none",
              boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            }}
          />
          <Line
            type="monotone"
            dataKey="mood"
            stroke="#7D9D9C"
            strokeWidth={3}
            dot={{ r: 6, fill: "#C8DBBE", stroke: "#7D9D9C", strokeWidth: 2 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MoodAnalytics;
