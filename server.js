import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { askGemini, resetChat } from "./src/gemini.js";

const app = express();
app.use(express.json());
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const buildPath = path.join(__dirname, "build");
app.use(express.static(buildPath));

app.post("/ask", async (req, res) => {
  const { answer } = req.body;

  try {
    const aiResponse = await askGemini(answer);
    res.json({ question: aiResponse });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: err });
  }
});

// Reset game session
app.post("/reset", (req, res) => {
  resetChat();
  res.json({ message: "Game reset successful." });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

const port = 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
