import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { authHelpers } from '../lib/supabase';

const AuthContext = createContext(null);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Handle auth state changes
  useEffect(() => {
    // Check localStorage for persisted user
    const persistedUser = localStorage.getItem('user');
    if (persistedUser) {
      try {
        const userData = JSON.parse(persistedUser);
        // Ensure user has a name
        if (!userData.name) {
          userData.name = `${userData.role.charAt(0).toUpperCase() + userData.role.slice(1)} User`;
        }
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing persisted user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email, password, role) => {
    try {
      setLoading(true);
      console.log('Attempting login with:', { email, role });

      // Use authHelpers for demo authentication
      const { data, error } = await authHelpers.signIn(email, password);

      if (error) {
        throw error;
      }

      if (!data?.user) {
        throw new Error('No user data received');
      }

      // Check if selected role matches user's actual role
      if (data.user.role !== role) {
        throw new Error('incorrect_role');
      }

      // Ensure user has a name
      if (!data.user.name) {
        data.user.name = `${data.user.role.charAt(0).toUpperCase() + data.user.role.slice(1)} User`;
      }

      setUser(data.user);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Welcome back!', { duration: 5000, id: 'login-success' });
      navigate(`/${data.user.role}-dashboard`);
    } catch (error) {
      console.error('Login error:', error);
      if (error.message === 'incorrect_role') {
        toast.error('Please select the correct role for your account', { duration: 8000, id: 'role-error' });
      } else {
        toast.error(error.message || 'Login failed', { duration: 8000, id: 'login-error' });
      }
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await authHelpers.signOut();
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      toast.success('Signed out successfully', { duration: 5000, id: 'logout-success' });
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out', { duration: 5000, id: 'logout-error' });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    signIn,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
