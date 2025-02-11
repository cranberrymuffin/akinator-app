import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { askGemini } from "./src/gemini.js";

const app = express();
app.use(express.json());
app.use(cors());

let previousQuestions = []; // Store past questions and answers

// Fix __dirname in ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve the React static files
const buildPath = path.join(__dirname, "build"); // Adjust if necessary
app.use(express.static(buildPath));

app.post("/ask", async (req, res) => {
  const { answer } = req.body;

  // Construct the AI prompt with history
  const prompt = `
    You are playing a game similar to Akinator. I will provide a history of past questions and answers.
    Your goal is to guess a character based on the user's responses. If you are confident, make a guess.
    Otherwise, ask a new, relevant question.

    Preface guess with "G:" and answer with "A:"

    Past questions and answers:
    ${previousQuestions.join("\n")}

    Last user response: ${answer}

    What is your next question or guess?
  `;

  try {
    // Query the Gemini model
    const aiResponse = await askGemini(prompt);

    // Store the new question and answer properly
    previousQuestions.push(
      `Q: ${previousQuestions.at(-1) || "First Question"}\nA: ${answer}`
    );
    previousQuestions.push(`Q: ${aiResponse}`); // Store the AI-generated question

    // Send the AI's next question/guess to the frontend
    res.json({ question: aiResponse });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Error interacting with Gemini." });
  }
});

// Serve React's index.html for all unknown routes (SPA support)
app.get("*", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

const port = 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
