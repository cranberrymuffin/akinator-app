import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Ensure the API key is loaded from environment variables
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Gemini API key is missing from environment variables");
}

const client = new GoogleGenerativeAI(apiKey);

// Function to interact with the Gemini model
async function askGemini(prompt) {
  try {
    // Use the correct method based on Gemini API documentation (e.g., `generateText`)
    const model = await client.getGenerativeModel({
      model: "gemini-pro", // Use the correct model name
    });

    const result = await model.generateContent(prompt);

    return result.response?.text ?? "Sorry, I could not generate an answer.";
  } catch (err) {
    console.error("Error calling Gemini API:", err);
    throw new Error("Error communicating with Gemini");
  }
}

export { askGemini };
