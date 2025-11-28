// server/server.js (ESM) - Updated and hardened
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import axios from "axios";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// CONFIG
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || ""; // optional (Gemini / Generative API)
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || "";

// ------------------------
// MONGOOSE - connect if URI provided
// ------------------------
if (MONGO_URI) {
  (async () => {
    try {
      // modern mongoose.connect - do not pass useNewUrlParser / useUnifiedTopology
      await mongoose.connect(MONGO_URI);
      console.log("✅ MongoDB connected");
    } catch (err) {
      console.error("❌ MongoDB connection error:", err?.message || err);
    }
  })();

  mongoose.connection.on("connected", () => console.log("Mongoose: connected"));
  mongoose.connection.on("error", (err) => console.error("Mongoose error:", err));
  mongoose.connection.on("disconnected", () => console.log("Mongoose: disconnected"));
} else {
  console.warn("⚠️  MONGO_URI not set — DB features will be disabled (user/journal stored only when DB present).");
}

// ------------------------
// SCHEMAS (only created if mongoose connected)
// ------------------------
let User = null;
let Journal = null;
if (MONGO_URI) {
  const userSchema = new mongoose.Schema({
    username: { type: String, default: "guest" },
    xp: { type: Number, default: 0 },
    moods: { type: [String], default: [] },
    avatar: { type: String, default: "" },
  });

  const journalSchema = new mongoose.Schema({
    text: { type: String, required: true },
    date: { type: Date, default: Date.now },
  });

  User = mongoose.models.User || mongoose.model("User", userSchema);
  Journal = mongoose.models.Journal || mongoose.model("Journal", journalSchema);
}

// ------------------------
// AI CLIENTS / HELPERS
//  - Priority: Google Generative (if GOOGLE_API_KEY) -> OpenAI -> fallback
// ------------------------
let openaiClient = null;
if (OPENAI_API_KEY) {
  openaiClient = new OpenAI({ apiKey: OPENAI_API_KEY });
  console.log("✅ OpenAI client configured");
} else {
  console.warn("⚠️  OPENAI_API_KEY not set");
}

if (!GOOGLE_API_KEY && !OPENAI_API_KEY) {
  console.warn("⚠️  No AI API key configured (GOOGLE_API_KEY or OPENAI_API_KEY). Chat will use local fallback replies.");
}

/** Call Google Generative API (text-bison or configured model)
 *  Returns string or throws.
 */
async function callGoogleGenerative(message, model = "models/text-bison-001") {
  if (!GOOGLE_API_KEY) throw new Error("Google API key not configured");
  const url = `https://generativelanguage.googleapis.com/v1beta2/${model}:generate?key=${GOOGLE_API_KEY}`;

  const payload = {
    prompt: { text: `You are MindfulBot. Empathetic, brief, actionable support for stress/anxiety.\nUser: ${message}\nAssistant:` },
    maxOutputTokens: 300,
  };

  const r = await axios.post(url, payload, { timeout: 15000 });
  // variety of shapes - be defensive
  if (r?.data?.candidates && r.data.candidates.length) {
    const c = r.data.candidates[0];
    if (c.output) return c.output;
    if (c.content) {
      // content array -> join text pieces
      const txt = c.content.map((it) => it.text || it).join(" ");
      return txt;
    }
    if (typeof c === "string") return c;
  }
  // older shapes:
  if (r?.data?.output && Array.isArray(r.data.output)) {
    const text = r.data.output.map((o) => (o?.content || []).map((c) => c.text || c).join(" ")).join("\n");
    if (text) return text;
  }
  // last resort stringify
  return typeof r.data === "string" ? r.data : JSON.stringify(r.data);
}

/** Call OpenAI chat via official client */
async function callOpenAI(message, model = "gpt-4o-mini") {
  if (!openaiClient) throw new Error("OpenAI client not configured");

  // Some OpenAI Node SDKs use different methods; this code mirrors earlier usage
  // If your SDK version uses a different API, adapt accordingly.
  // We'll attempt chat.completions.create if present, else use client.responses.create fallback.
  if (openaiClient.chat && openaiClient.chat.completions && openaiClient.chat.completions.create) {
    const result = await openaiClient.chat.completions.create({
      model,
      messages: [
        { role: "system", content: "You are MindfulBot, an empathetic calm assistant. Keep replies short and helpful." },
        { role: "user", content: message },
      ],
      max_tokens: 200,
    });
    return result?.choices?.[0]?.message?.content ?? null;
  }

  // Fallback: some clients expose responses.create
  if (openaiClient.responses && openaiClient.responses.create) {
    const res = await openaiClient.responses.create({
      model,
      input: `You are MindfulBot. Reply empathetically and briefly.\nUser: ${message}\nAssistant:`,
      max_output_tokens: 200,
    });
    // Try to extract text from common places
    const out = res?.output;
    if (Array.isArray(out)) {
      return out.map((o) => (o?.content || []).map((c) => c.text || c).join(" ")).join("\n");
    }
    return res?.output?.[0]?.content?.[0]?.text ?? JSON.stringify(res);
  }

  throw new Error("OpenAI client does not support known methods in this environment");
}

/** Local rule-based fallback reply */
function fallbackReply(message) {
  const txt = String(message || "").toLowerCase();
  if (txt.includes("sad") || txt.includes("depress")) {
    return "I'm sorry you're feeling sad. Try 4 slow, deep breaths with me: 4 in, hold 4, 4 out.";
  }
  if (txt.includes("anxious") || txt.includes("worried")) {
    return "Grounding can help: name 5 things you see, 4 you can touch, 3 you can hear.";
  }
  if (txt.includes("angry")) {
    return "Anger is valid. Try stepping away and counting slowly to 10, focusing on your breath.";
  }
  if (txt.includes("happy") || txt.includes("good")) {
    return "That's lovely to hear — what's one small reason you're feeling good today?";
  }
  return "I'm here to listen — describe how your body feels right now or what happened.";
}

// ------------------------
// ROUTES
// ------------------------
app.get("/", (req, res) => res.send("Stress Management App Backend 🚀"));

// --- user route
app.get("/user", async (req, res) => {
  if (!User) return res.json({ username: "guest", xp: 0, moods: [] });
  try {
    let user = await User.findOne({ username: "guest" });
    if (!user) { user = new User(); await user.save(); }
    return res.json(user);
  } catch (err) {
    console.error("/user error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// --- mood route
app.post("/mood", async (req, res) => {
  const { mood } = req.body || {};
  if (!mood) return res.status(400).json({ error: "mood required" });

  if (!User) {
    // no DB - return simulated guest update
    return res.json({ username: "guest", xp: 10, moods: [mood] });
  }

  try {
    let user = await User.findOne({ username: "guest" });
    if (!user) user = new User();
    user.moods.push(mood);
    user.xp += 10;
    await user.save();
    return res.json(user);
  } catch (err) {
    console.error("/mood error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// --- chat route (AI selection: Google -> OpenAI -> fallback)
app.post("/chat", async (req, res) => {
  const { message } = req.body || {};
  if (!message || !String(message).trim()) return res.status(400).json({ reply: "Please send a message." });

  // Prefer Google Generative if key present
  if (GOOGLE_API_KEY) {
    try {
      const reply = await callGoogleGenerative(message);
      return res.json({ reply: String(reply).trim() });
    } catch (err) {
      console.error("Google Generative error:", err?.response?.data || err?.message || err);
      // fall through to OpenAI or fallback
    }
  }

  // Next prefer OpenAI if configured
  if (openaiClient) {
    try {
      const reply = await callOpenAI(message);
      if (reply && String(reply).trim().length) return res.json({ reply: String(reply).trim() });
    } catch (err) {
      console.error("OpenAI error:", err?.response?.data || err?.message || err);
      // fallthrough to fallback
    }
  }

  // Fallback
  const fallback = fallbackReply(message);
  return res.json({ reply: fallback });
});

// --- journal routes
app.get("/journal", async (req, res) => {
  if (!Journal) return res.json([]);
  try {
    const entries = await Journal.find().sort({ date: -1 }).limit(200);
    return res.json(entries);
  } catch (err) {
    console.error("/journal GET error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

app.post("/journal", async (req, res) => {
  const { text } = req.body || {};
  if (!text || !String(text).trim()) return res.status(400).json({ error: "text required" });
  if (!Journal) return res.status(500).json({ error: "DB not configured" });

  try {
    const newEntry = new Journal({ text: String(text).trim() });
    await newEntry.save();
    return res.status(201).json(newEntry);
  } catch (err) {
    console.error("/journal POST error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// --- youtube search proxy
app.get("/api/search", async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ message: "Missing query param 'q'" });
  if (!YOUTUBE_API_KEY) return res.status(500).json({ message: "YOUTUBE_API_KEY not configured on server" });

  try {
    const ytUrl = "https://www.googleapis.com/youtube/v3/search";
    const r = await axios.get(ytUrl, {
      params: { key: YOUTUBE_API_KEY, q, part: "snippet", type: "video", maxResults: 8 },
      timeout: 10000,
    });

    const items = (r.data.items || []).map((it) => ({
      videoId: it.id?.videoId,
      title: it.snippet?.title,
      channel: it.snippet?.channelTitle,
      thumbnail: it.snippet?.thumbnails?.high?.url || it.snippet?.thumbnails?.default?.url,
    }));

    return res.json({ items });
  } catch (err) {
    console.error("/api/search error:", err?.response?.data || err?.message || err);
    return res.status(500).json({ message: "YouTube search failed" });
  }
});

// --- save avatar
app.post("/user/avatar", async (req, res) => {
  const { avatarUrl } = req.body || {};
  if (!avatarUrl) return res.status(400).json({ error: "avatarUrl required" });
  if (!User) return res.json({ avatarUrl });

  try {
    let user = await User.findOne({ username: "guest" });
    if (!user) user = new User({ username: "guest", avatar: avatarUrl });
    else user.avatar = avatarUrl;
    await user.save();
    return res.json(user);
  } catch (err) {
    console.error("/user/avatar error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// catch-all 404
app.use((req, res) => res.status(404).json({ message: "Not found" }));

// START
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));