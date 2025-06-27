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
  const { sessionId, answer } = req.body;

  try {
    const aiResponse = await askGemini(sessionId, answer);

    // Clean up the response and parse JSON safely
    let cleanResponse = aiResponse.trim();

    // Remove markdown formatting if present
    if (cleanResponse.startsWith("```json")) {
      cleanResponse = cleanResponse
        .replace(/```json\s*/, "")
        .replace(/\s*```$/, "");
    }

    // Additional cleanup for any stray markdown
    cleanResponse = cleanResponse.replace(/^```\s*/, "").replace(/\s*```$/, "");

    try {
      const parsedResponse = JSON.parse(cleanResponse);
      res.json(parsedResponse);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Raw response:", aiResponse);
      console.error("Cleaned response:", cleanResponse);

      // Fallback response if JSON parsing fails
      res.json({
        thoughts: "I'm having trouble processing the response format.",
        answer: "Q: Is the character human?",
      });
    }
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

app.post("/reset", (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ error: "Missing sessionId" });
  }

  resetChat(sessionId);
  res.json({ message: "Chat history reset successfully." });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

const port = 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
