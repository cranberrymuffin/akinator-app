import { useState } from "react";

const App = () => {
  const [answer, setAnswer] = useState("");
  const [question, setQuestion] = useState("Q: Is the character human?");
  const [thoughts, setThoughts] = useState("");

  const handleSubmit = async () => {
    const response = await fetch("/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data);
      setQuestion(data.answer);
      setThoughts(data.thoughts);
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

        {/* Thoughts */}
        <div className="question">
          <i>{thoughts}</i>
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
              value="I don't know"
              checked={answer === "I don't know"}
              onChange={(e) => setAnswer(e.target.value)}
            />
            I don't know
          </label>
          <label>
            <input
              type="radio"
              value="Probably"
              checked={answer === "Probably"}
              onChange={(e) => setAnswer(e.target.value)}
            />
            Probably
          </label>
          <label>
            <input
              type="radio"
              value="Probably not"
              checked={answer === "Probably not"}
              onChange={(e) => setAnswer(e.target.value)}
            />
            Probably not
          </label>
        </div>

        {/* Buttons */}
        <div className="buttons">
          <button onClick={handleSubmit} disabled={!answer}>
            Submit
          </button>
          <button onClick={handleReset}>Reset</button>
        </div>
      </div>
    </div>
  );
};

export default App;
