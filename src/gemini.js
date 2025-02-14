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
});
const initialHistory = () => [
  {
    role: "user",
    parts: [
      {
        text: `
The user must think of a fictional or real character, object, or animal. You, will then interrogate the player by a series of questions and will try to guess who/what the player is thinking. 

Rules:

- Your questions can only be answered with "Yes", "No", "Don't know", "Probably", and "Probably not"
- If the answer
- Your questions should be formatted as: "Q: [Your question here]."
- If you are confident, you can make a guess, formatted as: "G: I think you are thinking of [character]."
- The topics of your questions should be diverse and non-repetitive.
- Do not break character—stay within the game's role.
- Change the topic of the question with every turn.

The response must be under 50 words and formatted as a json with keys "thoughts" containing your though process and "answer" containing your follow-up question or guess.
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
    history: initialHistory(),
  });
}

function resetChat(sessionId) {
  chatSessions.set(sessionId, newChat());
}

export { askGemini, resetChat };
