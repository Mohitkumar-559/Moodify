import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import * as authApi from '../api/auth';
import { ApiError } from '../api/client';
import { User } from '../api/types';

const TOKEN_STORAGE_KEY = 'moodify.auth.token';

type AuthContextValue = {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
        if (storedToken) {
          const me = await authApi.getMe(storedToken);
          setToken(storedToken);
          setUser(me);
        }
      } catch {
        await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  async function persistSession(accessToken: string) {
    const me = await authApi.getMe(accessToken);
    await AsyncStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
    setToken(accessToken);
    setUser(me);
  }

  async function signup(email: string, password: string, displayName: string) {
    setError(null);
    try {
      const { access_token } = await authApi.signup(email, password, displayName);
      await persistSession(access_token);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Sign up failed');
      throw e;
    }
  }

  async function login(email: string, password: string) {
    setError(null);
    try {
      const { access_token } = await authApi.login(email, password);
      await persistSession(access_token);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Login failed');
      throw e;
    }
  }

  async function logout() {
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, isLoading, error, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
