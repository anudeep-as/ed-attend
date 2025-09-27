import { supabase } from '../lib/supabase';

export const useRegistration = () => {
  const registerUser = async (userData) => {
    try {
      // Check if email already exists in users table
      const { data: existingUser, error: userCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('email', userData.email.toLowerCase())
        .single();

      if (userCheckError && userCheckError.code !== 'PGRST116') { // PGRST116 means no rows found
        throw userCheckError;
      }
      if (existingUser) {
        throw new Error('A user with this email already exists');
      }

      // Create user profile in the users table
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert([
          {
            name: userData.name,
            email: userData.email.toLowerCase(),
            password: userData.password, // Store password in plain text for demo
            role: userData.role,
            roll_no: userData.role === 'student' ? userData.rollNo : null,
            class_id: userData.role === 'student' ? userData.classId : null,
            points: 0,
            badges: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (userError) throw userError;

      return {
        success: true,
        data: newUser,
        message: 'Registration successful!'
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.message || 'Failed to register user'
      };
    }
  };

  return { registerUser };
};
