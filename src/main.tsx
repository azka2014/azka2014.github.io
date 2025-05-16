import React from 'react';
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { InventoryProvider } from "./context/InventoryContext.tsx";
// Hapus import SessionContextProvider
// import { SessionContextProvider } from '@supabase/auth-ui-react';
// Import supabase client tetap diperlukan
import { supabase } from './integrations/supabase/client.ts';

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* Hapus SessionContextProvider wrapper */}
    {/* <SessionContextProvider supabaseClient={supabase}> */}
      <InventoryProvider>
        <App />
      </InventoryProvider>
    {/* </SessionContextProvider> */}
  </React.StrictMode>
);