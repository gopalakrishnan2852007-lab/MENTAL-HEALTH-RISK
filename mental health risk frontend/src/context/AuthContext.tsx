import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Role = 'student' | 'counselor' | null;

interface User {
  email: string;
  role: Role;
  name: string;
  id: string;
}

interface AuthContextType {
  user: User | null;
  role: Role;
  login: (email: string, role: Role) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for persistent session (demo)
    const savedUser = localStorage.getItem('mindguard_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, role: Role) => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Demo credentials
    const isStudent = email === 'student@example.com' && role === 'student';
    const isCounselor = email === 'counselor@example.com' && role === 'counselor';

    if (isStudent || isCounselor) {
      const newUser: User = {
        email,
        role,
        name: isStudent ? 'Alex Johnson' : 'Dr. Sarah Jenkins',
        id: isStudent ? 'ST-2024-001' : 'C-001',
      };
      setUser(newUser);
      localStorage.setItem('mindguard_user', JSON.stringify(newUser));
    } else {
      throw new Error('Invalid credentials or role mismatch for demo.');
    }
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mindguard_user');
  };

  return (
    <AuthContext.Provider value={{ user, role: user?.role || null, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
