# Gemini AI Powered Akinator Game

This project combines a powerful backend, a smooth front end, and AI to create an interactive experience. It's an AI-powered version of the classic "Akinator" game, where the AI dynamically asks yes/no questions to guess what you're thinking.

## Tech Stack

### 1. **React Frontend, Node Backend, and Express Delivery**
- The front end of the app is built with **React**, providing a dynamic and responsive user interface.
- The React app is bundled into production-ready static files using `npm run build`, and served through an **Express** backend. The backend handles communication with the Gemini AI API to send user input and retrieve AI-generated responses.
- The static React files are served via `node server.js`.

You can view the **React app's main component** [here](https://github.com/cranberrymuffin/akinator-app/blob/main/src/App.jsx).

The **server code** that handles routing and communication with the Gemini AI API can be found [here](https://github.com/cranberrymuffin/akinator-app/blob/main/server.js).

### 2. **Disco Hosting**
- The app is deployed using **Disco**, a platform for hosting full-stack applications, ensuring a scalable, fast, and reliable environment.
- **Docker** is used for managing the deployment process:
  - The Dockerfile automates building the front end with `npm run build` and serving the static files via Express using `node server.js`.
  - The app is hosted on Disco for a seamless full-stack deployment.

You can check out the **Dockerfile** [here](https://github.com/cranberrymuffin/akinator-app/blob/main/Dockerfile).

### 3. **Gemini AI Chat Conversation API**
- The **Gemini API** by Google powers the AI's ability to ask intelligent yes/no questions and process the user's answers dynamically.
- Using the **Chat** feature of the Gemini API, the AI can adjust its questions based on previous responses, creating a dynamic, engaging experience.

For more details on how the Gemini AI works, you can explore the **create a chat** section in the [Gemini API documentation](https://developers.google.com/gemini-ai).

## Features
- Dynamic question flow based on the user's answers, powered by the Gemini AI.
- Front end built with React for a smooth and interactive UI.
- Full-stack deployment with Docker and Disco for efficient hosting.
- Server-side routing and communication between the front end and Gemini AI using Node.js and Express.

## Running the Project Locally
To get started with this project locally, follow these steps:

1. Clone the repository:

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the project:
   ```bash
   npm run build && node server.js
   ```

This will start the local development server and open the app in your browser.

## License
This project is licensed under the MIT License. For details, see the [LICENSE](LICENSE) file.
