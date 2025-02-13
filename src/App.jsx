import { useState } from "react";

const App = () => {
  const [answer, setAnswer] = useState("");
  const [question, setQuestion] = useState("Q: Is the character human?");

  const handleSubmit = async () => {
    const response = await fetch("/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer }),
    });

    if (response.ok) {
      const data = await response.json();
      setQuestion(data.question);
    } else {
      console.error("Error fetching question");
    }

    setAnswer("");
  };

  const handleReset = async () => {
    await fetch("/reset", { method: "POST" });
    setQuestion("Are you thinking of someone?");
  };

  return (
    <div className="centered-container">
      <div className="game-box">
        {/* Question */}
        <div className="question">
          <h3>{question}</h3>
        </div>

        {/* Radio options */}
        <div className="options">
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

        {/* Buttons */}
        <div className="buttons">
          <button onClick={handleSubmit}>Submit</button>
          <button onClick={handleReset}>Reset</button>
        </div>
      </div>
    </div>
  );
};

export default App;
