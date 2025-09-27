import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sdbyvmsvelpuvhsoewsc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkYnl2bXN2ZWxwdXZoc29ld3NjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NDY4ODEsImV4cCI6MjA3NDIyMjg4MX0.xgUReAaYXvrJcZMOsS1R3Hd47bwe8H5Z4lNi-_hDhuQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Auth helpers with email/password simulation
export const authHelpers = {
  signUp: async (email, password, userData) => {
    try {
      // Create user in database directly
      const { data, error } = await supabase
        .from('users')
        .insert([{
          ...userData,
          email,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return { data: { user: data }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  signIn: async (email, password) => {
    try {
      // Quick demo credential check for instant response
      const demoUsers = {
        'student@edattend.com': { id: 'demo-student', role: 'student', name: 'Demo Student', email: 'student@edattend.com', password: 'demo123' },
        'teacher@edattend.com': { id: 'demo-teacher', role: 'teacher', name: 'Demo Teacher', email: 'teacher@edattend.com', password: 'demo123' },
        'admin@edattend.com': { id: 'demo-admin', role: 'admin', name: 'Demo Admin', email: 'admin@edattend.com', password: 'demo123' }
      };

      if (demoUsers[email] && demoUsers[email].password === password) {
        return { data: { user: demoUsers[email] }, error: null };
      }

      // Fallback to database query for other users
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (error || !user) {
        throw new Error('Invalid login credentials');
      }

      return { data: { user }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  signOut: async () => {
    // Simulate sign out
    return { error: null };
  },

  getCurrentUser: async () => {
    // This would normally get the current authenticated user
    // For demo purposes, return null
    return { user: null, error: null };
  }
};

// Database helpers
export const dbHelpers = {
  // User operations
  createUser: async (userData) => {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();
    return { data, error };
  },

  getUserByEmail: async (email) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    return { data, error };
  },

  updateUserPoints: async (userId, points) => {
    const { data, error } = await supabase
      .from('users')
      .update({ points })
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  },

  // Attendance operations
  markAttendance: async (attendanceData) => {
    const { data, error } = await supabase
      .from('attendance')
      .insert([attendanceData])
      .select()
      .single();
    return { data, error };
  },

  getStudentAttendance: async (studentId, startDate, endDate) => {
    let query = supabase
      .from('attendance')
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: false });

    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);

    const { data, error } = await query;
    return { data, error };
  },

  getTodayAttendance: async (studentId) => {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', studentId)
      .eq('date', today)
      .single();
    return { data, error };
  },

  // OD Request operations
  createODRequest: async (odData) => {
    const { data, error } = await supabase
      .from('od_requests')
      .insert([odData])
      .select()
      .single();
    return { data, error };
  },

  getODRequests: async (filters = {}) => {
    let query = supabase
      .from('od_requests')
      .select(`
        *,
        student:users!student_id(name, email, roll_no),
        teacher:users!teacher_id(name, email)
      `)
      .order('created_at', { ascending: false });

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.student_id) query = query.eq('student_id', filters.student_id);
    if (filters.teacher_id) query = query.eq('teacher_id', filters.teacher_id);

    const { data, error } = await query;
    return { data, error };
  },

  updateODRequest: async (id, updates) => {
    const { data, error } = await supabase
      .from('od_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  // Gamification operations
  getLeaderboard: async (limit = 10) => {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, points, badges, role')
      .eq('role', 'student')
      .order('points', { ascending: false })
      .limit(limit);
    return { data, error };
  },

  updateGamification: async (studentId, gamificationData) => {
    const { data, error } = await supabase
      .from('gamification')
      .upsert([{ student_id: studentId, ...gamificationData }])
      .select()
      .single();
    return { data, error };
  },

  // Real-time subscriptions
  subscribeToAttendance: (callback) => {
    return supabase
      .channel('attendance_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'attendance'
      }, callback)
      .subscribe();
  },

  subscribeToODRequests: (callback) => {
    return supabase
      .channel('od_requests_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'od_requests'
      }, callback)
      .subscribe();
  },

  subscribeToLeaderboard: (callback) => {
    return supabase
      .channel('leaderboard_changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'users',
        filter: 'role=eq.student'
      }, callback)
      .subscribe();
  }
};

export default supabase;