'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export type UserRole = 'admin' | 'user' | 'guest';

interface User {
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): React.ReactElement {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on mount
    const isLoggedIn = Cookies.get('isLoggedIn') === 'true';
    const userRole = Cookies.get('userRole') as UserRole;
    const userEmail = Cookies.get('userEmail');

    if (isLoggedIn && userRole && userEmail) {
      setUser({ email: userEmail, role: userRole });
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Login failed');
      }

      const data = await response.json();
      
      // Store user data in cookies
      Cookies.set('isLoggedIn', 'true', { secure: true, sameSite: 'lax' });
      Cookies.set('userRole', data.role, { secure: true, sameSite: 'lax' });
      Cookies.set('userEmail', email, { secure: true, sameSite: 'lax' });
      
      setUser({ email, role: data.role });
      // Redirect to dashboard after successful login
      router.push('/en/protected/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    Cookies.remove('isLoggedIn');
    Cookies.remove('userRole');
    Cookies.remove('userEmail');
    setUser(null);
    router.push('/en/login');
  };

  const contextValue: AuthContextType = {
    user,
    isLoading,
    error,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
