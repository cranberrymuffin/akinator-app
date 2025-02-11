import { useState } from "react";

const App = () => {
  const [answer, setAnswer] = useState("");
  const [question, setQuestion] = useState("Are you thinking of someone?");
  const [isStarted, setIsStarted] = useState(false); // Track if the game has started

  // Function to send the answer to the backend and get a new question or guess
  const handleSubmit = async () => {
    if (!isStarted) {
      if (answer === "yes") {
        setIsStarted(true); // Start the game after the first "Yes" answer
        // Proceed with submitting the answer and fetching the next question
      } else {
        // If the user doesn't answer "Yes", we prevent the game from continuing
        alert("Please answer 'Yes' to start the game.");
      }
    }

    // Send the answer to the backend API and get the AI's response
    const response = await fetch("/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer }),
    });

    if (response.ok) {
      const data = await response.json();

      setQuestion(data.question); // Set the next question or guess
    } else {
      console.error("Error fetching question");
    }

    setAnswer(""); // Clear the answer after submission
  };

  return (
    <div>
      <h3>{question}</h3>
      <div>
        <label>
          <input
            type="radio"
            value="yes"
            checked={answer === "yes"}
            onChange={(e) => setAnswer(e.target.value)}
          />
          Yes
        </label>
        <label>
          <input
            type="radio"
            value="no"
            checked={answer === "no"}
            onChange={(e) => setAnswer(e.target.value)}
          />
          No
        </label>
        <label>
          <input
            type="radio"
            value="idk"
            checked={answer === "idk"}
            onChange={(e) => setAnswer(e.target.value)}
          />
          I don't know
        </label>
      </div>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default App;
