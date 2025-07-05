import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface ExtendedUser {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: ExtendedUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_KEY = 'mock_users';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      setIsLoading(true);
      const storedUser = localStorage.getItem('current_user');
      if (storedUser) {
        const parsedUser: ExtendedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
      const userId = Object.keys(users).find(
        (id) => users[id].email === email && users[id].password === password
      );

      if (!userId) {
        throw new Error('Invalid email or password');
      }

      const user: ExtendedUser = {
        id: userId,
        email,
        name: users[userId].name,
      };

      setUser(user);
      localStorage.setItem('current_user', JSON.stringify(user));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);

    try {
      setUser(null);
      localStorage.removeItem('current_user');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);

    try {
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
      const existingUser = Object.values(users).find(
        (u: any) => u.email === email
      );

      if (existingUser) {
        throw new Error('Email already registered');
      }

      const userId = crypto.randomUUID();
      const newUser: ExtendedUser = {
        id: userId,
        email,
        name,
      };

      users[userId] = { ...newUser, password };
      localStorage.setItem(USERS_KEY, JSON.stringify(users));

      setUser(newUser);
      localStorage.setItem('current_user', JSON.stringify(newUser));
      toast.success('Registration successful! You are now logged in.');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};