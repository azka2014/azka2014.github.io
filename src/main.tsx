import React from 'react';
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { InventoryProvider } from "./context/InventoryContext.tsx";
// Import AuthProvider
import { AuthProvider } from './context/AuthContext.tsx';
// Import SessionContextProvider
import { SessionContextProvider } from '@supabase/auth-ui-react';
// Import supabase client
import { supabase } from './integrations/supabase/client.ts';

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* SessionContextProvider should wrap everything that needs session context */}
    <SessionContextProvider supabaseClient={supabase}>
      {/* AuthProvider can wrap the rest, using the session from SessionContextProvider */}
      <AuthProvider>
        <InventoryProvider>
          <App />
        </InventoryProvider>
      </AuthProvider>
    </SessionContextProvider>
  </React.StrictMode>
);