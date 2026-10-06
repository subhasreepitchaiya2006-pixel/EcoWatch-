import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Global error listener to capture uncaught errors and show a banner
window.addEventListener('error', (event) => {
  const alertDiv = document.createElement('div');
  alertDiv.style.cssText = 'position:fixed;top:0;left:0;width:100%;background:red;color:white;z-index:99999;padding:15px;font-family:monospace;font-size:14px;white-space:pre-wrap;';
  alertDiv.innerText = `[ANTIGRAVITY FILE TRACE]\nFile: ${event.filename}\nLine: ${event.lineno}\nError: ${event.message}\nStack: ${event.error?.stack}`;
  document.body.appendChild(alertDiv);
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
