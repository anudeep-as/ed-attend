import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }
        if (session?.user) {
          // Get user profile from users table
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('email', session.user.email)
            .single();

          if (profileError) {
            console.error('Error fetching profile:', profileError);
            setLoading(false);
            return;
          }
          setUser(profile);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Session error:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', session.user.email)
            .single();

          if (!error && profile) {
            setUser(profile);
            setIsAuthenticated(true);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    try {
      setLoading(true);

      // Demo credentials validation
      const demoCredentials = {
        'admin@edattend.com': { password: 'demo123', role: 'admin' },
        'student@edattend.com': { password: 'demo123', role: 'student' },
        'teacher@edattend.com': { password: 'demo123', role: 'teacher' }
      };

      const demo = demoCredentials[email];
      if (!demo || demo.password !== password) {
        toast.error('Invalid login credentials');
        return { success: false, error: { message: 'Invalid login credentials' } };
      }

      // For demo purposes, create a mock user object
      const mockUser = {
        id: email.split('@')[0],
        email: email,
        role: demo.role,
        name: demo.role.charAt(0).toUpperCase() + demo.role.slice(1) + ' User',
        avatar_url: null
      };

      // Set the user in the state
      setUser(mockUser);
      setIsAuthenticated(true);
      toast.success('Login successful!');
      
      return { success: true, user: mockUser };

    } catch (error) {
      console.error('Error during sign in:', error);
      toast.error('An error occurred during sign in');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error during sign out:', error);
      toast.error('An error occurred during sign out');
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    isAuthenticated,
    signIn,
    signOut
  };
};