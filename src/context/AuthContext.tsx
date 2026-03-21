import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { useUserPreferences } from '../hooks/useUserPreferences';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  preferences: { languages: string[] };
  prefLoading: boolean;
  updateLanguages: (langs: string[]) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { preferences, loading: prefLoading, updateLanguages } = useUserPreferences();

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    }, () => setIsLoading(false));
  }, []);

  const signOut = async () => { await firebaseSignOut(auth); };

  return (
    <AuthContext.Provider value={{ user, isLoading, preferences, prefLoading, updateLanguages, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
