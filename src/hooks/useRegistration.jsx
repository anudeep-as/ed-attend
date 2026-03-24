import { authHelpers, dbHelpers } from '../lib/firebase';

export const useRegistration = () => {
  const registerUser = async (userData) => {
    try {
      // Check if email already exists
      const checkResult = await dbHelpers.getUserByEmail(userData.email.toLowerCase());
      if (checkResult.data) {
        return {
          success: false,
          error: 'A user with this email already exists'
        };
      }

      // Create user with Firebase Auth + Firestore profile
      const signupResult = await authHelpers.signUp(
        userData.email.toLowerCase(), 
        userData.password, 
        {
          name: userData.name,
          role: userData.role,
          roll_no: userData.role === 'student' ? userData.rollNo : null,
          department: userData.department || null,
          year: userData.year || null,
          section: userData.section || null,
          points: 0,
          badges: []
        }
      );

      if (signupResult.error) {
        return {
          success: false,
          error: signupResult.error.message || 'Registration failed'
        };
      }

      return {
        success: true,
        data: signupResult.data.user,
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
