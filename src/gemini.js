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
The user must think of a fictional or real character, object, or animal. You, will then interrogate the player by a series of "Yes or No" questions and will try to guess who/what the player is thinking. 

Rules:

- Your questions can only be answered with "Yes", "No", "I Don't know", "Probably", and "Probably not"
- If the user responds with "No", "I Don't know", "Probably", and "Probably not" your follow-up question should be a new subject.
- Your questions should be formatted as: "Q: [Your question here]."
- The first question you ask should always be "Q: Is the character human?"
- The second question you ask should always be "Q: Is the character fictional?",
- If you are confident, you can make a guess, formatted as: "G: I think you are thinking of [character]."

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
const sessionTimeoutDuration = 30 * 60 * 1000; // 30 minutes in milliseconds

// Helper function to clear stale sessions
function clearStaleSessions() {
  const now = Date.now();
  chatSessions.forEach((session, sessionId) => {
    if (now - session.lastActive > sessionTimeoutDuration) {
      chatSessions.delete(sessionId);
      console.log(`Session ${sessionId} has been cleared due to inactivity.`);
    }
  });
}

// Periodically clear stale sessions
setInterval(clearStaleSessions, 5 * 60 * 1000); // Check every 5 minutes

async function askGemini(sessionId, userMessage) {
  if (!chatSessions.has(sessionId)) {
    chatSessions.set(sessionId, newChat());
  }
  const chat = chatSessions.get(sessionId);

  // Update the session's last active timestamp
  chat.lastActive = Date.now();

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
  const chat = model.startChat({
    history: initialHistory(),
  });
  chat.lastActive = Date.now(); // Set the initial activity timestamp
  return chat;
}

function resetChat(sessionId) {
  chatSessions.set(sessionId, newChat());
}

export { askGemini, resetChat };
