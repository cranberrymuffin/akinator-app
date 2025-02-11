import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("Gemini API key is missing from environment variables");
}

const client = new GoogleGenerativeAI(apiKey);
const model = client.getGenerativeModel({ model: "gemini-pro" });

async function askGemini(prompt) {
  try {
    const result = await model.generateContent(prompt);
    return (
      result.response?.text().trim() ?? "Sorry, I could not generate an answer."
    );
  } catch (err) {
    console.error("Error calling Gemini API:", err);
    throw new Error("Error communicating with Gemini");
  }
}

export { askGemini };
