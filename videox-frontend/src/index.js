// Entry point for React app
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // Global styles
import App from "./App"; // Main App component
import { Provider } from "react-redux"; // Redux provider for global state
import reportWebVitals from "./reportWebVitals"; // Performance reporting
import store from "./store/store"; // Redux store

// Create React root and render the app
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    {/* Provide Redux store to all components */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

reportWebVitals();
