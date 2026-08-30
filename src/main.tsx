import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "core-js/actual/map/get-or-insert-computed";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
