import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("Gemini API key is missing from environment variables");
}

const client = new GoogleGenerativeAI(apiKey);
const model = client.getGenerativeModel({ model: "gemini-pro" });

// Initial system message to guide Gemini's behavior
const initialPrompt = `
You are playing a game similar to Akinator.
Your goal is to guess a character based on the user's responses.
You will ask a series of Yes/No questions to narrow down the possibilities.

Rules:
- If you are confident, make a guess, formatted as: "G: I think you are thinking of [character].".
- If you need more information, ask a follow-up question, formatted as: "Q: [Your question here]."
- Keep your responses brief and to the point.
- Do not break character—stay within the game's role.

Before answering, do think step by step, analyzing what you already know about the character to pose the best next question or provide a guess if you're confident. Once you have thought a bit, wrap your guess or question in <answer> tag, eg.:
your thinking steps
<answer>
Q: Is the character male?
</answer>

Let's start! First, ask a broad question to begin the game.
`;

// Start chat session with initial context
let chat = model.startChat({
  history: [
    { role: "user", parts: [{ text: initialPrompt }] },
    {
      role: "model",
      parts: [
        {
          text: `I am asked to play a guessing game. I don't know anything about the character being guessed just yet. To be able to distinguish different characters, I might consider whether they are human or not.
<answer>
Q: Is the character human?
</answer>`,
        },
      ],
    },
  ], // Preserve context
});

async function askGemini(userMessage) {
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

function resetChat() {
  chat = model.startChat({
    history: [{ role: "user", parts: [{ text: initialPrompt }] }], // Reset with original context
  });
}

export { askGemini, resetChat };
