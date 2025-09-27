import { supabase } from '../lib/supabase';

export const useAuth = () => {

  useEffect(() => {
    // Check active session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('email', session.user.email)
            .single();

          if (!profileError && profile) {
            setUser(profile);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Session error:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
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
        navigate('/', { replace: true });
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [navigate]);

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      
      // Demo mode credentials
      const demoCredentials = {
        'admin@edattend.com': { password: 'demo123', role: 'admin' },
        'student@edattend.com': { password: 'demo123', role: 'student' },
        'teacher@edattend.com': { password: 'demo123', role: 'teacher' }
      };

      // Check for demo credentials first
      const demo = demoCredentials[email];
      if (demo && demo.password === password) {
        const mockUser = {
          id: email.split('@')[0],
          email,
          role: demo.role,
          name: demo.role.charAt(0).toUpperCase() + demo.role.slice(1) + ' User',
          avatar_url: null
        };

        await Promise.all([
          new Promise(resolve => {
            setUser(mockUser);
            setIsAuthenticated(true);
            resolve();
          })
        ]);

        const dashboardPath = `/${mockUser.role}-dashboard`;
        console.log('Navigating to:', dashboardPath);
        
        toast.success('Login successful!');
        navigate(dashboardPath, { replace: true });
        return { success: true, user: mockUser };
      }

      // If not demo, try Supabase auth
      const { data: { user: supaUser }, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) throw authError;

      // Get user profile from users table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('email', supaUser.email)
        .single();

      if (profileError) throw profileError;

      await Promise.all([
        new Promise(resolve => {
          setUser(profile);
          setIsAuthenticated(true);
          resolve();
        })
      ]);

      const dashboardPath = `/${profile.role}-dashboard`;
      console.log('Navigating to:', dashboardPath);
      
      toast.success('Login successful!');
      navigate(dashboardPath, { replace: true });
      return { success: true, user: profile };
    } catch (error) {
      console.error('Sign in error:', error.message);
      setUser(null);
      setIsAuthenticated(false);
      toast.error(error.message || 'Login failed. Please try again.');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        toast.error('Error signing out');
      } else {
        setUser(null);
        setIsAuthenticated(false);
        toast.success('Signed out successfully');
      }
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Error signing out');
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    isAuthenticated,
    signIn,
    signOut,
    setUser,
    setIsAuthenticated
  };
};