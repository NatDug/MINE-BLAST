import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';
import { User, Token } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      setToken(storedToken);
      // In a real app, you'd validate the token with the backend
      setUser({ id: 1, email: 'user@example.com', full_name: 'User' });
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response: Token = await authAPI.login({ username, password });
      localStorage.setItem('access_token', response.access_token);
      setToken(response.access_token);
      setUser({ id: 1, email: username, full_name: 'User' });
    } catch (error: any) {
      console.error('Login failed:', error);
      
      // Demo mode - allow login with any credentials when backend is not available
      if (error.response?.status === 0 || error.code === 'ERR_NETWORK') {
        console.log('Backend not available, using demo mode');
        const demoToken = 'demo-token-' + Date.now();
        localStorage.setItem('access_token', demoToken);
        setToken(demoToken);
        setUser({ id: 1, email: username, full_name: 'Demo User' });
        return;
      }
      
      // Provide more specific error messages
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      } else {
        throw new Error(error.response?.data?.detail || 'Login failed. Please try again.');
      }
    }
  };

  const signup = async (email: string, password: string, fullName?: string) => {
    try {
      const response: User = await authAPI.signup({ email, password, full_name: fullName });
      // Auto-login after signup
      await login(email, password);
    } catch (error: any) {
      console.error('Signup failed:', error);
      
      // Demo mode - allow signup when backend is not available
      if (error.response?.status === 0 || error.code === 'ERR_NETWORK') {
        console.log('Backend not available, using demo mode for signup');
        await login(email, password);
        return;
      }
      
      // Provide more specific error messages
      if (error.response?.status === 400) {
        throw new Error('Email already registered or invalid data');
      } else {
        throw new Error(error.response?.data?.detail || 'Signup failed. Please try again.');
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    login,
    signup,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
