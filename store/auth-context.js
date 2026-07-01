'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load and verify user session cookie on startup
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get('/api/auth');
        if (response.data?.success && response.data?.user) {
          setUser(response.data.user);
          localStorage.setItem('user_session_local', JSON.stringify(response.data.user));
        } else {
          localStorage.removeItem('user_session_local');
          setUser(null);
        }
      } catch (e) {
        localStorage.removeItem('user_session_local');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (email, password, name, isSignUp = false) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth', { 
        email, 
        password, 
        name, 
        isSignUp 
      });
      const userData = response.data.user;
      
      localStorage.setItem('user_session_local', JSON.stringify(userData));
      setUser(userData);
      router.push('/dashboard');
    } catch (error) {
      localStorage.removeItem('user_session_local');
      setUser(null);
      throw error.response?.data?.error || 'Authentication failed. Please try again.';
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await axios.delete('/api/auth');
    } catch (err) {
      console.error('Logout API failure:', err);
    } finally {
      localStorage.removeItem('user_session_local');
      setUser(null);
      setLoading(false);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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
