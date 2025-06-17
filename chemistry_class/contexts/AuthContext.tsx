import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { API_BASE_URL, API_ENDPOINTS, JWT_CONFIG } from '@/constants/config';
import { setAuthToken, removeAuthToken } from '@/utils/auth';

interface AuthContextType {
  user: any;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: (idToken: string, user: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const loadUser = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync(JWT_CONFIG.TOKEN_KEY);
        if (storedToken) {
          // Verify token with backend
          const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.VERIFY_TOKEN}`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });

          if (response.ok) {
            const userData = await response.json();
            setToken(storedToken);
            setUser(userData);
          } else {
            // Token is invalid, clear it
            await SecureStore.deleteItemAsync(JWT_CONFIG.TOKEN_KEY);
          }
        }
      } catch (error) {
        console.error('Failed to load user', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);
  const loginWithGoogle = async (idToken: string, user: any) => {
    try {
      console.log('Google ID Token:', idToken);
      console.log('Google User:', JSON.stringify(user, null, 2));

      if (!user) throw new Error('User object is undefined');

      const safeUser = {
        id: user.id || user.email || 'unknown',
        name: user.name || `${user.givenName ?? ''} ${user.familyName ?? ''}`.trim(),
        email: user.email || 'unknown@email.com',
        photo: user.photo ?? null,
      };

      setUser(safeUser);
      router.replace('/(tabs)');

    } catch (err) {
      console.error('Mock Google login failed', err);
      throw new Error('Google login failed');
    }
  };




  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If we have a custom error message from the server, use it
        if (data && data.message) {
          throw new Error(data.message);
        }
        throw new Error(`Login failed with status ${response.status}`);
      }

      if (!data.token) {
        throw new Error('No token received from server');
      }

      // Store the token and user ID
      await SecureStore.setItemAsync(JWT_CONFIG.TOKEN_KEY, data.token);
      await setAuthToken(data.token, data.user.id);

      setToken(data.token);
      setUser(data.user);

      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Login error:', error);
      // Make sure to re-throw the error with a user-friendly message
      throw new Error(error.message || 'An error occurred during login');
    }
  };

  const logout = async () => {
    try {
      // Call logout API if needed
      if (token) {
        await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGOUT}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }

      // Clear secure storage and auth data
      await SecureStore.deleteItemAsync(JWT_CONFIG.TOKEN_KEY);
      await removeAuthToken();

      // Reset state
      setToken(null);
      setUser(null);

      // Navigate to login
      router.replace('/(auth)/sign-in');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout API fails, we still want to clear the local state
      await SecureStore.deleteItemAsync(JWT_CONFIG.TOKEN_KEY);
      await removeAuthToken();
      setToken(null);
      setUser(null);
      router.replace('/(auth)/sign-in');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, loginWithGoogle }}>
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
