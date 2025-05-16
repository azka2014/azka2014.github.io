import React, { createContext, useContext } from 'react';
import { Session } from '@supabase/supabase-js';
// Import useSessionContext from the auth-ui library
import { useSessionContext } from '@supabase/auth-ui-react';

interface AuthContextType {
  session: Session | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use the session and isLoading from the official provider hook
  const { session, isLoading } = useSessionContext();

  // The custom provider just passes these values down
  return (
    <AuthContext.Provider value={{ session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider (which should be inside SessionContextProvider)');
  }
  return context;
};