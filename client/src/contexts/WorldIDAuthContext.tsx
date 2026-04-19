import React, { createContext, useContext, useState, useCallback } from 'react';

interface WorldIDUser {
  nullifier_hash: string;
  verification_level: 'orb' | 'phone';
  verified_at: string;
}

interface WorldIDAuthContextType {
  user: WorldIDUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: WorldIDUser | null) => void;
  logout: () => void;
}

const WorldIDAuthContext = createContext<WorldIDAuthContextType | undefined>(undefined);

export function WorldIDAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<WorldIDUser | null>(() => {
    // Try to load from localStorage on mount
    const stored = localStorage.getItem('world-id-user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSetUser = useCallback((newUser: WorldIDUser | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('world-id-user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('world-id-user');
    }
  }, []);

  const logout = useCallback(() => {
    handleSetUser(null);
    localStorage.removeItem('world-id-user');
  }, [handleSetUser]);

  const value: WorldIDAuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    setUser: handleSetUser,
    logout,
  };

  return (
    <WorldIDAuthContext.Provider value={value}>
      {children}
    </WorldIDAuthContext.Provider>
  );
}

export function useWorldIDAuth() {
  const context = useContext(WorldIDAuthContext);
  if (context === undefined) {
    throw new Error('useWorldIDAuth must be used within WorldIDAuthProvider');
  }
  return context;
}
