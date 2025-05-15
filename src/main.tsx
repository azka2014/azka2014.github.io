import React from 'react'; // Import React
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { InventoryProvider } from "./context/InventoryContext.tsx";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <InventoryProvider>
      <App />
    </InventoryProvider>
  </React.StrictMode>
);