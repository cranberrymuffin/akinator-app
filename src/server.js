import express from "express";
import cors from "cors";
import { askGemini } from "./gemini.js";

const app = express();
app.use(express.json());
app.use(cors());

let previousQuestions = []; // Store past questions and answers

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

const port = 5050;
app.listen(port, () => console.log(`Server running on port ${port}`));
