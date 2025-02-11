import express from "express";
import cors from "cors"; // Allow cross-origin requests
import { askGemini } from "./gemini.js"; // Import the function for communicating with Gemini

const app = express();
app.use(express.json());
app.use(cors()); // Enable CORS for all routes

let previousQuestions = []; // Store previous questions and answers

// Endpoint to receive user answers and return the next question
app.post("/ask", async (req, res) => {
  const { answer } = req.body; // Get user's answer (Yes/No/IDK)

  // Create the prompt for the AI model
  const prompt = `
    You are playing a game similar to Akinator. I will provide a history of past questions and answers.
    Your goal is to guess a character based on the user's responses. If you are confident, make a guess.
    Otherwise, ask a new, relevant question.

    Past questions and answers:
    ${previousQuestions.join("\n")}

    Last user response: ${answer}

    What is your next question or guess?
  `;

  try {
    // Call the Gemini API to get a response
    const response = await askGemini(prompt);

    // Store the new question and answer
    previousQuestions.push(
      `Q: ${
        previousQuestions[previousQuestions.length - 1] || "First Question"
      }\nA: ${answer}`
    );

    // Return the response (question or guess) to the frontend
    res.json({ question: response() });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error interacting with Gemini.");
  }
});

// Start the server
const port = 5050;
app.listen(port, () => {});
