import React from 'react';
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { InventoryProvider } from "./context/InventoryContext.tsx";
// Import AuthProvider
import { AuthProvider } from './context/AuthContext.tsx';
// SessionContextProvider is no longer needed if using custom AuthProvider
// import { SessionContextProvider } from '@supabase/auth-ui-react';
// Import supabase client tetap diperlukan
// import { supabase } from './integrations/supabase/client.ts'; // Already imported in AuthContext

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