import { supabase } from './supabase';

export const authenticateUser = async (email, password) => {
  // First check if user exists and get their role
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, role, email, password_hash')
    .eq('email', email.toLowerCase())
    .single();

  if (userError) {
    if (userError.code === 'PGRST116') {
      throw new Error('Account not found');
    }
    throw userError;
  }

  // Now try to authenticate
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase(),
    password: password
  });

  if (authError) {
    throw new Error('Invalid password');
  }

  return {
    user: authData.user,
    role: user.role
  };
};

export const registerUser = async (userData) => {
  const { email, password, name, role, department, phone, rollNo, classId } = userData;

  try {
    // First create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password: password,
      options: {
        data: {
          name,
          role
        }
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create user account');

    // Then create the user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email: email.toLowerCase(),
          name,
          role,
          department,
          phone: phone || null,
          roll_no: role === 'student' ? rollNo : null,
          class_id: role === 'student' ? classId : null,
          points: 0,
          badges: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);

    if (profileError) throw profileError;

    return authData.user;
  } catch (error) {
    // Clean up if profile creation fails
    if (error.message !== 'User already registered') {
      // Try to delete the auth user if it was created
      await supabase.auth.admin.deleteUser(authData?.user?.id);
    }
    throw error;
  }
};