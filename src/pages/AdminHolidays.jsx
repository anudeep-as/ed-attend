import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Calendar from 'react-calendar';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import 'react-calendar/dist/Calendar.css';

const AdminHolidays = ({ user }) => {
  const [holidays, setHolidays] = useState([]);
  const [formData, setFormData] = useState({
    dayOfWeek: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);

  const dayOptions = [
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
    { value: 7, label: 'Sunday' }
  ];

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const { data, error } = await supabase
        .from('holidays')
        .select('*')
        .order('day_of_week');

      if (error) throw error;
      setHolidays(data || []);
    } catch (error) {
      console.error('Error fetching holidays:', error);
      toast.error('Failed to load holidays');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.dayOfWeek || !formData.reason.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    // Check if day is already marked as holiday
    const existing = holidays.find(h => h.day_of_week === parseInt(formData.dayOfWeek));
    if (existing) {
      toast.error('This day is already marked as a holiday');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('holidays')
        .insert([{
          day_of_week: parseInt(formData.dayOfWeek),
          reason: formData.reason.trim(),
          created_by: user.id
        }]);

      if (error) throw error;

      toast.success('Holiday added successfully');
      setFormData({ dayOfWeek: '', reason: '' });
      fetchHolidays();
    } catch (error) {
      console.error('Error adding holiday:', error);
      toast.error('Failed to add holiday: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteHoliday = async (id) => {
    if (!confirm('Are you sure you want to delete this holiday?')) return;

    try {
      const { error } = await supabase
        .from('holidays')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Holiday deleted successfully');
      fetchHolidays();
    } catch (error) {
      console.error('Error deleting holiday:', error);
      toast.error('Failed to delete holiday');
    }
  };

  const isHolidayDay = (date) => {
    const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
    return holidays.some(h => h.day_of_week === dayOfWeek);
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month' && isHolidayDay(date)) {
      return 'holiday-tile';
    }
    return null;
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Holiday Management</h1>

          {/* Add Holiday Form */}
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Day of Week *
                </label>
                <select
                  name="dayOfWeek"
                  value={formData.dayOfWeek}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select day</option>
                  {dayOptions.map(day => (
                    <option key={day.value} value={day.value}>{day.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason *
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  placeholder="e.g., National Holiday, Maintenance Day"
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows="3"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:bg-purple-400"
            >
              {loading ? 'Adding...' : 'Add Holiday'}
            </button>
          </form>

          {/* Calendar View */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Holiday Calendar</h2>
            <div className="bg-white p-4 rounded-lg shadow">
              <Calendar
                tileClassName={tileClassName}
                className="react-calendar"
              />
            </div>
          </div>

          {/* Holidays List */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Current Holidays</h2>
            {holidays.length === 0 ? (
              <p className="text-gray-500">No holidays configured.</p>
            ) : (
              <div className="space-y-3">
                {holidays.map(holiday => (
                  <div key={holiday.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                    <div>
                      <span className="font-medium">
                        {dayOptions.find(d => d.value === holiday.day_of_week)?.label}
                      </span>
                      <span className="text-gray-600 ml-2">- {holiday.reason}</span>
                    </div>
                    <button
                      onClick={() => deleteHoliday(holiday.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminHolidays;
