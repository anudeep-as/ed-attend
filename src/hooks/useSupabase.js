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
        setLoading(false);
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

      // Commented out actual Supabase check for demo
      /*const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (userError || !userData) {*/
        // Create user if doesn't exist
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([{
            name: demo.role.charAt(0).toUpperCase() + demo.role.slice(1) + ' User',
            email,
            password,
            role: demo.role,
            points: demo.role === 'admin' ? 100 : (demo.role === 'teacher' ? 75 : 50),
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (createError) {
          console.error('Error creating user:', createError);
          toast.error('Failed to create user account');
          setLoading(false);
          return { error: createError };
        }

        setUser(newUser);
        setIsAuthenticated(true);
        toast.success(`Welcome, ${newUser.name}!`);
        setLoading(false);
        return { success: true, user: newUser };

      }

      // User exists, validate password
      if (userData.password !== password) {
        toast.error('Invalid login credentials');
        setLoading(false);
        return { error: { message: 'Invalid login credentials' } };
      }

      setUser(userData);
      setIsAuthenticated(true);
      toast.success(`Welcome back, ${userData.name}!`);
      setLoading(false);
      return { success: true, user: userData };

    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Login failed. Please try again.');
      setLoading(false);
      return { error };
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

  const createUser = async (userData) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();

      if (error) {
        console.error('Error creating user:', error);
        toast.error('Failed to create user');
        return { error };
      }

      toast.success('User created successfully');
      return { data };
    } catch (error) {
      console.error('Create user error:', error);
      toast.error('Failed to create user');
      return { error };
    }
  };

  return {
    user,
    loading,
    isAuthenticated,
    user,
    loading,
    isAuthenticated,
    signIn,
    signOut
  };
};

export const useAttendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);

  const markAttendance = async (studentId, location, subject = 'Current Class') => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('attendance')
        .insert({
          student_id: studentId,
          date: new Date().toISOString().split('T')[0],
          status: 'Present',
          location: JSON.stringify(location),
          subject: subject,
          marked_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error marking attendance:', error);
        toast.error('Failed to mark attendance');
        return { error };
      }

      toast.success('Attendance marked successfully!');
      return { data };
    } catch (error) {
      console.error('Mark attendance error:', error);
      toast.error('Failed to mark attendance');
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const getAttendance = async (studentId, startDate, endDate) => {
    try {
      setLoading(true);

      let query = supabase
        .from('attendance')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false });

      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching attendance:', error);
        return { error };
      }

      setAttendanceData(data);
      return { data };
    } catch (error) {
      console.error('Get attendance error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  return {
    attendanceData,
    loading,
    markAttendance,
    getAttendance
  };
};

export const useODRequests = () => {
  const [odRequests, setODRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const submitODRequest = async (requestData) => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('od_requests')
        .insert([requestData])
        .select()
        .single();

      if (error) {
        console.error('Error submitting OD request:', error);
        toast.error('Failed to submit OD request');
        return { error };
      }

      toast.success('OD request submitted successfully!');
      return { data };
    } catch (error) {
      console.error('Submit OD request error:', error);
      toast.error('Failed to submit OD request');
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const getODRequests = async (studentId) => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('od_requests')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching OD requests:', error);
        return { error };
      }

      setODRequests(data);
      return { data };
    } catch (error) {
      console.error('Get OD requests error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const approveODRequest = async (requestId, teacherId) => {
    try {
      const { data, error } = await supabase
        .from('od_requests')
        .update({
          status: 'Approved',
          teacher_id: teacherId,
          approved_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) {
        console.error('Error approving OD request:', error);
        toast.error('Failed to approve OD request');
        return { error };
      }

      toast.success('OD request approved!');
      return { data };
    } catch (error) {
      console.error('Approve OD request error:', error);
      toast.error('Failed to approve OD request');
      return { error };
    }
  };

  return {
    odRequests,
    loading,
    submitODRequest,
    getODRequests,
    approveODRequest
  };
};