import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("Gemini API key is missing from environment variables");
}
const client = new GoogleGenerativeAI(apiKey);

// Cache for the latest free model
let cachedFreeModel = null;
let modelCacheTime = 0;
const MODEL_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Function to get the latest free Gemini model
async function getLatestFreeModel() {
  // Return cached model if still valid
  if (cachedFreeModel && Date.now() - modelCacheTime < MODEL_CACHE_DURATION) {
    console.log(`Using cached free model: ${cachedFreeModel}`);
    return cachedFreeModel;
  }

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models",
      {
        headers: {
          "x-goog-api-key": apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }

    const data = await response.json();

    // Filter for free-tier friendly Gemini models
    const freeGeminiModels = data.models.filter(
      (model) =>
        model.name.includes("gemini") &&
        model.supportedGenerationMethods.includes("generateContent") &&
        !model.name.includes("preview") &&
        !model.name.includes("exp") &&
        !model.name.includes("embedding") &&
        !model.name.includes("imagen") &&
        !model.name.includes("veo") &&
        !model.name.includes("live") &&
        !model.name.includes("tts") &&
        !model.name.includes("audio") &&
        !model.name.includes("pro") // Avoid Pro models which have stricter limits
    );

    // Sort by version to get the latest Flash model (better for free tier)
    freeGeminiModels.sort((a, b) => {
      const getVersion = (modelObj) => {
        const name = modelObj.baseModelId || modelObj.name || "";
        const match = name.match(/gemini-(\d+\.?\d*)/);
        return match ? parseFloat(match[1]) : 0;
      };
      return getVersion(b) - getVersion(a);
    });

    // Prefer Flash models for free tier usage
    const latestFlash = freeGeminiModels.find((m) =>
      m.baseModelId.includes("flash")
    );
    const latestModel = latestFlash || freeGeminiModels[0];

    if (latestModel) {
      cachedFreeModel = latestModel.baseModelId;
      modelCacheTime = Date.now();
      console.log(`Found latest free model: ${cachedFreeModel}`);
      return cachedFreeModel;
    } else {
      throw new Error("No suitable free models found");
    }
  } catch (error) {
    console.warn(
      "Failed to fetch latest free model, using fallback:",
      error.message
    );
    // Fallback to known free model
    cachedFreeModel = "gemini-1.5-flash";
    modelCacheTime = Date.now();
    return cachedFreeModel;
  }
}
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
- The second question you ask should exactly be "Q: Is the character fictional?",
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
    chatSessions.set(sessionId, await newChat());
  }
  const chat = chatSessions.get(sessionId);

  // Update the session's last active timestamp
  chat.lastActive = Date.now();

  try {
    // Add rate limiting to avoid quota issues
    await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay

    const result = await chat.sendMessage(userMessage);
    let responseText =
      result.response?.text().trim() ??
      "Sorry, I could not generate an answer.";

    // Clean up markdown formatting if present
    if (responseText.startsWith("```json")) {
      responseText = responseText
        .replace(/```json\s*/, "")
        .replace(/\s*```$/, "");
    }

    return responseText;
  } catch (err) {
    if (err.status === 429) {
      // Rate limit hit, wait and retry once
      console.log("Rate limit hit, waiting 5 seconds and retrying...");
      await new Promise((resolve) => setTimeout(resolve, 5000));
      try {
        const result = await chat.sendMessage(userMessage);
        let responseText =
          result.response?.text().trim() ??
          "Sorry, I could not generate an answer.";

        // Clean up markdown formatting if present
        if (responseText.startsWith("```json")) {
          responseText = responseText
            .replace(/```json\s*/, "")
            .replace(/\s*```$/, "");
        }

        return responseText;
      } catch (retryErr) {
        console.error("Retry failed:", retryErr);
        throw new Error(
          "Rate limit exceeded. Please try again in a few minutes."
        );
      }
    }
    console.error("Error calling Gemini API:", err);
    throw new Error("Error communicating with Gemini");
  }
}

async function newChat() {
  // Get the latest free model for each new chat
  const modelName = await getLatestFreeModel();

  const model = client.getGenerativeModel({
    model: modelName,
  });

  const chat = model.startChat({
    history: initialHistory(),
  });
  chat.lastActive = Date.now(); // Set the initial activity timestamp
  console.log(`Created new chat with model: ${modelName}`);
  return chat;
}

async function resetChat(sessionId) {
  chatSessions.set(sessionId, await newChat());
}

export { askGemini, resetChat };
