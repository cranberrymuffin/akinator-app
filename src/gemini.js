import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("Gemini API key is missing from environment variables");
}
const client = new GoogleGenerativeAI(apiKey);
const model = client.getGenerativeModel({
  model: "gemini-pro",
  generationConfig: {
    temperature: 1.5, // Higher diversity
    maxOutputTokens: 100, // Keeps responses concise
    topP: 0.8, // More randomness
    topK: 50, // Selects from a wider set of possibilities
  },
});
const initialHistory = [
  {
    role: "user",
    parts: [
      {
        text: `
You are playing a game similar to Akinator.
You will ask a series of Yes/No questions to narrow down the possibilities.

Rules:
- If you are confident, make a guess, formatted as: "G: I think you are thinking of [character].".
- If you need more information, ask a follow-up question, formatted as: "Q: [Your question here]."
- Keep your responses brief and to the point.
- Do not repeat follow up questions
- Do not break character—stay within the game's role.

Before answering, do think step by step, analyzing what you already know about the character to pose the best next question or provide a guess if you're confident. The response must be formatted as a json with keys "thoughts" containing your though process and "answer" containing your follow-up question or guess.
`,
      },
    ],
  },
  {
    role: "model",
    parts: [
      {
        text: JSON.stringify({
          thoughts:
            "I am asked to play a guessing game. I don't know anything about the character being guessed just yet. To be able to distinguish different characters, I might consider whether they are human or not.",
          answer: "Q: Is the character human?",
        }),
      },
    ],
  },
];

// Store chat sessions per client using session IDs
const chatSessions = new Map();

async function askGemini(sessionId, userMessage) {
  if (!chatSessions.has(sessionId)) {
    chatSessions.set(sessionId, newChat());
  }
  const chat = chatSessions.get(sessionId);
  try {
    const result = await chat.sendMessage(userMessage);
    const history = chat.getHistory();
    history.then((result) => console.log(JSON.stringify(result)));
    return (
      result.response?.text().trim() ?? "Sorry, I could not generate an answer."
    );
  } catch (err) {
    console.error("Error calling Gemini API:", err);
    throw new Error("Error communicating with Gemini");
  }
}

function newChat() {
  return model.startChat({
    history: initialHistory,
  });
}

export { askGemini };
