import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = {
  id: number;
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = 'http://localhost:3001'; // Update this to your backend URL

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    console.log('Attempting login...');
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log('Login response:', data);

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    console.log('Setting user:', data.user);
    setUser(data.user);
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
    console.log('User set successfully');
  };

  const signup = async (name: string, email: string, password: string) => {
    console.log('Attempting signup...');
    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    console.log('Signup response:', data);

    if (!response.ok) {
      throw new Error(data.error || 'Signup failed');
    }

    console.log('Setting user:', data.user);
    setUser(data.user);
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
    console.log('User set successfully');
  };

  const logout = async () => {
    console.log('Logout function called');
    setUser(null);
    await AsyncStorage.removeItem('user');
    console.log('User cleared from storage');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}