import { motion } from 'framer-motion';
import { GraduationCap, Lock, Shield, User, UserCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student'
  });
  const { signIn, loading, isAuthenticated, user } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user?.role) {
      const path = `/${user.role}-dashboard`;
      console.log('User is authenticated, redirecting to:', path);
      navigate(path, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.role) {
      toast.error('Please fill in all fields', { duration: 5000 });
      return;
    }

    try {
      console.log('Submitting login with role:', formData.role);
      await signIn(formData.email, formData.password, formData.role);
    } catch (error) {
      // Error toasts are handled in AuthContext
      console.error('Error during login:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRoleSelect = (role) => {
    setFormData({
      ...formData,
      role
    });
  };

  const handleUseDemo = (role) => {
    const demoCredentials = {
      student: { email: 'student@edattend.com', password: 'demo123' },
      teacher: { email: 'teacher@edattend.com', password: 'demo123' },
      admin: { email: 'admin@edattend.com', password: 'demo123' }
    };

    setFormData({
      ...formData,
      role,
      email: demoCredentials[role].email,
      password: demoCredentials[role].password
    });
  };

  const roleOptions = [
    {
      value: 'student',
      label: 'Student',
      icon: User,
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      description: 'Access your attendance and earn rewards'
    },
    {
      value: 'teacher',
      label: 'Teacher',
      icon: UserCheck,
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700',
      description: 'Manage classes and approve requests'
    },
    {
      value: 'admin',
      label: 'Admin',
      icon: Shield,
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
      description: 'System administration and analytics'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
          >
            <GraduationCap className="h-8 w-8 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-bold text-gray-900 mb-2"
          >
            Ed-Attend
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-600 text-lg"
          >
            Smart Student Engagement Platform
          </motion.p>
        </div>

        {/* Role Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
        >
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">Select Your Role</h2>
            <div className="grid grid-cols-1 gap-2 sm:gap-3">
              {roleOptions.map((option) => {
                const IconComponent = option.icon;
                const isSelected = formData.role === option.value;
                
                return (
                  <motion.button
                    key={option.value}
                    type="button"
                    onClick={() => handleRoleSelect(option.value)}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                      isSelected
                        ? `border-blue-500 bg-gradient-to-r ${option.color} text-white shadow-lg`
                        : `border-gray-200 bg-white hover:border-gray-300 hover:shadow-md text-gray-700 ${option.hoverColor} hover:text-white`
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        isSelected ? 'bg-white/20' : 'bg-gray-100'
                      }`}>
                        <IconComponent className={`h-5 w-5 ${
                          isSelected ? 'text-white' : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{option.label}</h3>
                        <p className={`text-sm ${
                          isSelected ? 'text-white/80' : 'text-gray-500'
                        }`}>
                          {option.description}
                        </p>
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 bg-white rounded-full flex items-center justify-center"
                        >
                          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white touch-manipulation"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white touch-manipulation"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 sm:py-4 px-6 border border-transparent rounded-xl shadow-lg text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 touch-manipulation"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center">
                  <span>Sign In as {roleOptions.find(r => r.value === formData.role)?.label}</span>
                </div>
              )}
            </motion.button>
          </form>

          {/* Demo Credentials */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200"
          >
            <p className="text-center text-sm font-medium text-gray-700 mb-3">Demo Credentials</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600"><strong>Student:</strong> student@edattend.com | demo123</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleUseDemo('student')}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors"
                >
                  Use
                </motion.button>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600"><strong>Teacher:</strong> teacher@edattend.com | demo123</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleUseDemo('teacher')}
                  className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors"
                >
                  Use
                </motion.button>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600"><strong>Admin:</strong> admin@edattend.com | demo123</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleUseDemo('admin')}
                  className="px-3 py-1 bg-purple-600 text-white rounded text-xs font-medium hover:bg-purple-700 transition-colors"
                >
                  Use
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;