import React from 'react'; // Import React
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { InventoryProvider } from "./context/InventoryContext.tsx"; // Import the provider

createRoot(document.getElementById("root")!).render(
  <React.StrictMode> {/* Keep StrictMode */}
    <InventoryProvider> {/* Wrap App with InventoryProvider */}
      <App />
    </InventoryProvider>
  </React.StrictMode>
);