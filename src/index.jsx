import React from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import App from "./App";

// Ensure the element is in the DOM before creating the root
const rootElement = document.querySelector("#root");

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Root element not found in the DOM.");
}
