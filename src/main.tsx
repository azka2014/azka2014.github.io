import React from 'react';
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { InventoryProvider } from "./context/InventoryContext.tsx";
// Import AuthProvider
import { AuthProvider } from './context/AuthContext.tsx';
// SessionContextProvider is not needed with custom AuthProvider
// import { SessionContextProvider } from '@supabase/auth-ui-react';
// Import supabase client is not needed here as it's imported in AuthContext

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* Wrap with AuthProvider */}
    <AuthProvider>
      <InventoryProvider>
        <App />
      </InventoryProvider>
    </AuthProvider>
  </React.StrictMode>
);