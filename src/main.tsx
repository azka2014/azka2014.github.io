import React from 'react';
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { InventoryProvider } from "./context/InventoryContext.tsx";
import { SessionContextProvider } from '@supabase/auth-ui-react'; // Import SessionContextProvider
import { supabase } from './integrations/supabase/client.ts'; // Import supabase client

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* Wrap with SessionContextProvider */}
    <SessionContextProvider supabaseClient={supabase}>
      <InventoryProvider>
        <App />
      </InventoryProvider>
    </SessionContextProvider>
  </React.StrictMode>
);