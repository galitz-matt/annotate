import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./polyfills/readable-stream";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
