import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Calendar from 'react-calendar';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import 'react-calendar/dist/Calendar.css';

const AdminExams = ({ user }) => {
  const [exams, setExams] = useState([]);
  const [formData, setFormData] = useState({
    classId: '',
    subject: '',
    date: '',
    startTime: '',
    endTime: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .order('date');

      if (error) throw error;
      setExams(data || []);
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast.error('Failed to load exams');
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
    if (!formData.classId || !formData.subject || !formData.date || !formData.startTime || !formData.endTime) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('exams')
        .insert([{
          class_id: formData.classId,
          subject: formData.subject,
          date: formData.date,
          start_time: formData.startTime,
          end_time: formData.endTime,
          created_by: user.id
        }]);

      if (error) throw error;

      toast.success('Exam scheduled successfully');
      setFormData({ classId: '', subject: '', date: '', startTime: '', endTime: '' });
      fetchExams();
    } catch (error) {
      console.error('Error scheduling exam:', error);
      toast.error('Failed to schedule exam: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteExam = async (id) => {
    if (!confirm('Are you sure you want to delete this exam?')) return;

    try {
      const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Exam deleted successfully');
      fetchExams();
    } catch (error) {
      console.error('Error deleting exam:', error);
      toast.error('Failed to delete exam');
    }
  };

  const examDates = exams.map(exam => new Date(exam.date));

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const examOnDate = exams.filter(exam => new Date(exam.date).toDateString() === date.toDateString());
      if (examOnDate.length > 0) {
        return <div className="text-xs text-blue-600 font-bold">{examOnDate.length} exam{examOnDate.length > 1 ? 's' : ''}</div>;
      }
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
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Exam Management</h1>

          {/* Add Exam Form */}
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class *
                </label>
                <select
                  name="classId"
                  value={formData.classId}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select class</option>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="e.g., Mathematics"
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time *
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {loading ? 'Scheduling...' : 'Schedule Exam'}
            </button>
          </form>

          {/* Calendar View */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Exam Calendar</h2>
            <div className="bg-white p-4 rounded-lg shadow">
              <Calendar
                tileContent={tileContent}
                className="react-calendar"
              />
            </div>
          </div>

          {/* Exams List */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Scheduled Exams</h2>
            {exams.length === 0 ? (
              <p className="text-gray-500">No exams scheduled.</p>
            ) : (
              <div className="space-y-3">
                {exams.map(exam => (
                  <div key={exam.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                    <div>
                      <span className="font-medium">{exam.subject}</span>
                      <span className="text-gray-600 ml-2">- {exam.class_id} on {new Date(exam.date).toLocaleDateString()} from {exam.start_time} to {exam.end_time}</span>
                    </div>
                    <button
                      onClick={() => deleteExam(exam.id)}
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

export default AdminExams;
