import { motion } from 'framer-motion';
import { Building, GraduationCap, Hash, Lock, Mail, Phone, Shield, User, UserCheck, X } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useRegistration } from '../hooks/useRegistration';

const UserRegistrationForm = ({ onClose, onSuccess }) => {
  const { registerUser } = useRegistration();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    department: '',
    phone: '',
    rollNo: '',
    classId: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const roleOptions = [
    {
      value: 'student',
      label: 'Student',
      icon: User,
      color: 'from-blue-500 to-blue-600',
      description: 'Regular student account'
    },
    {
      value: 'teacher',
      label: 'Teacher',
      icon: UserCheck,
      color: 'from-green-500 to-green-600',
      description: 'Faculty member account'
    },
    {
      value: 'admin',
      label: 'Admin',
      icon: Shield,
      color: 'from-purple-500 to-purple-600',
      description: 'Administrative account'
    }
  ];

  const departments = [
    'Computer Science',
    'Information Technology',
    'Electronics & Communication',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Mathematics',
    'Physics',
    'Chemistry',
    'English',
    'Administration'
  ];

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Role-specific validations
    if (formData.role === 'student') {
      if (!formData.rollNo.trim()) {
        newErrors.rollNo = 'Roll number is required for students';
      }
      if (!formData.classId.trim()) {
        newErrors.classId = 'Class ID is required for students';
      }
    }

    // Department validation
    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    // Phone validation (optional but if provided, should be valid)
    if (formData.phone && !/^[\d\s\-\+\(\)]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRoleChange = (role) => {
    setFormData(prev => ({
      ...prev,
      role,
      // Clear role-specific fields when role changes
      rollNo: role === 'student' ? prev.rollNo : '',
      classId: role === 'student' ? prev.classId : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      // Check if email already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('email')
        .eq('email', formData.email)
        .single();

      if (existingUser) {
        toast.error('A user with this email already exists');
        setErrors({ email: 'Email already exists' });
        setLoading(false);
        return;
      }

      // Prepare user data
      const userData = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password, // In production, this should be hashed
        role: formData.role,
        department: formData.department,
        phone: formData.phone.trim() || null,
        points: 0,
        badges: []
      };

      // Add role-specific fields
      if (formData.role === 'student') {
        userData.roll_no = formData.rollNo.trim();
        userData.class_id = formData.classId.trim();
      }

      // Insert user into database
      const result = await registerUser({
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        role: formData.role,
        department: formData.department,
        phone: formData.phone.trim() || null,
        rollNo: formData.role === 'student' ? formData.rollNo.trim() : null,
        classId: formData.role === 'student' ? formData.classId.trim() : null
      });

      if (!result.success) {
        console.error('Registration error:', result.error);
        toast.error(result.error.message || 'Failed to register user. Please try again.');
        return;
      }

      // Success
      toast.success(`${formData.role.charAt(0).toUpperCase() + formData.role.slice(1)} registered successfully!`);
      
      if (onSuccess) {
        onSuccess(result.data);
      }

      // Clear form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student',
        department: '',
        phone: '',
        rollNo: '',
        classId: ''
      });
      onSuccess();
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Register New User</h2>
              <p className="text-gray-600 mt-1">Add a new student, teacher, or admin to the system</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </motion.button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Role</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {roleOptions.map((option) => {
                const IconComponent = option.icon;
                const isSelected = formData.role === option.value;
                
                return (
                  <motion.button
                    key={option.value}
                    type="button"
                    onClick={() => handleRoleChange(option.value)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                      isSelected
                        ? `border-purple-500 bg-gradient-to-r ${option.color} text-white shadow-lg`
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md text-gray-700'
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
                      <div>
                        <h3 className="font-semibold">{option.label}</h3>
                        <p className={`text-sm ${
                          isSelected ? 'text-white/80' : 'text-gray-500'
                        }`}>
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`pl-10 w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50 focus:bg-white'
                  }`}
                  placeholder="Enter full name"
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`pl-10 w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50 focus:bg-white'
                  }`}
                  placeholder="Enter email address"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`pl-10 w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                    errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50 focus:bg-white'
                  }`}
                  placeholder="Enter password"
                />
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`pl-10 w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                    errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50 focus:bg-white'
                  }`}
                  placeholder="Confirm password"
                />
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Department and Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Department */}
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className={`pl-10 w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                    errors.department ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50 focus:bg-white'
                  }`}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              {errors.department && <p className="mt-1 text-sm text-red-600">{errors.department}</p>}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`pl-10 w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                    errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50 focus:bg-white'
                  }`}
                  placeholder="Enter phone number"
                />
              </div>
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>
          </div>

          {/* Student-specific fields */}
          {formData.role === 'student' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Roll Number */}
              <div>
                <label htmlFor="rollNo" className="block text-sm font-medium text-gray-700 mb-2">
                  Roll Number *
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="rollNo"
                    name="rollNo"
                    value={formData.rollNo}
                    onChange={handleInputChange}
                    className={`pl-10 w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                      errors.rollNo ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50 focus:bg-white'
                    }`}
                    placeholder="Enter roll number"
                  />
                </div>
                {errors.rollNo && <p className="mt-1 text-sm text-red-600">{errors.rollNo}</p>}
              </div>

              {/* Class ID */}
              <div>
                <label htmlFor="classId" className="block text-sm font-medium text-gray-700 mb-2">
                  Class ID *
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    id="classId"
                    name="classId"
                    value={formData.classId}
                    onChange={handleInputChange}
                    className={`pl-10 w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                      errors.classId ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50 focus:bg-white'
                    }`}
                  >
                    <option value="">Select Class</option>
                    <option value="CS-A">Computer Science A</option>
                    <option value="CS-B">Computer Science B</option>
                    <option value="IT-A">Information Technology A</option>
                    <option value="IT-B">Information Technology B</option>
                    <option value="ECE-A">Electronics & Communication A</option>
                    <option value="ECE-B">Electronics & Communication B</option>
                    <option value="ME-A">Mechanical Engineering A</option>
                    <option value="ME-B">Mechanical Engineering B</option>
                    <option value="CE-A">Civil Engineering A</option>
                    <option value="CE-B">Civil Engineering B</option>
                    <option value="EE-A">Electrical Engineering A</option>
                    <option value="EE-B">Electrical Engineering B</option>
                  </select>
                </div>
                {errors.classId && <p className="mt-1 text-sm text-red-600">{errors.classId}</p>}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <motion.button
              type="button"
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-medium hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Registering...
                </div>
              ) : (
                `Register ${formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}`
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default UserRegistrationForm;