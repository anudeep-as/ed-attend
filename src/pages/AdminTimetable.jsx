import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTimetable } from '../hooks/useTimetable';
import toast from 'react-hot-toast';

const AdminTimetable = ({ user }) => {
  const [formData, setFormData] = useState({
    classId: '',
    subject: '',
    teacherId: '',
    day: '',
    period: ''
  });
  const { addLoading, addTimetableEntry, fetchTimetable, holidays } = useTimetable();
  const [timetableData, setTimetableData] = useState([]);

  const dayMap = {
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
    sunday: 7
  };

  useEffect(() => {
    if (formData.classId) {
      const loadTimetable = async () => {
        const result = await fetchTimetable(formData.classId);
        if (result.success) {
          setTimetableData(result.data);
        } else {
          console.error('Failed to load timetable:', result.error);
          setTimetableData([]);
        }
      };
      loadTimetable();
    } else {
      setTimetableData([]);
    }
  }, [formData.classId, fetchTimetable]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!formData.classId || !formData.subject || !formData.teacherId || !formData.day || !formData.period) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const result = await addTimetableEntry(formData);
      if (result.success) {
        toast.success('Timetable entry added successfully');
        const currentClassId = formData.classId;
        setFormData({
          classId: currentClassId,
          subject: '',
          teacherId: '',
          day: '',
          period: ''
        });
        // Refresh timetable data
        const fetchResult = await fetchTimetable(currentClassId);
        if (fetchResult.success) {
          setTimetableData(fetchResult.data);
        } else {
          toast.error(fetchResult.error || 'Failed to refresh timetable');
        }
      } else {
        toast.error(result.error || 'Failed to add timetable entry');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to add timetable entry: ' + error.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Timetable Management</h1>
          
          {/* Timetable Management Interface */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Class Selection */}
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h3 className="font-semibold mb-2">Select Class</h3>
                  <select
                    name="classId"
                    value={formData.classId}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select a class...</option>
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

                {/* Subject Selection */}
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h3 className="font-semibold mb-2">Select Subject</h3>
                  <select 
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select a subject...</option>
                    <option value="math">Mathematics</option>
                    <option value="science">Science</option>
                    <option value="english">English</option>
                  </select>
                </div>

                {/* Teacher Selection */}
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h3 className="font-semibold mb-2">Assign Teacher</h3>
                  <select
                    name="teacherId"
                    value={formData.teacherId}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select a teacher...</option>
                    <option value="teacher_1">Mr. Smith (Computer Science)</option>
                    <option value="teacher_2">Mrs. Johnson (Mathematics)</option>
                    <option value="teacher_3">Dr. Williams (Physics)</option>
                  </select>
                </div>
              </div>

              {/* Time Slot Selection */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Schedule Time Slots</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Day</label>
                    <select
                      name="day"
                      value={formData.day}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Select day...</option>
                      {Object.keys(dayMap).map(day => (
                        <option
                          key={day}
                          value={day}
                          disabled={holidays.includes(dayMap[day])}
                        >
                          {day.charAt(0).toUpperCase() + day.slice(1)} {holidays.includes(dayMap[day]) ? '(Holiday)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Period</label>
                    <select 
                      name="period"
                      value={formData.period}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Select period...</option>
                      <option value="1">1. 9:00 - 9:50 AM</option>
                      <option value="2">2. 9:50 - 10:40 AM</option>
                      <option value="3">3. 11:00 - 11:50 AM</option>
                      <option value="4">4. 11:50 AM - 12:40 PM</option>
                      <option value="5">5. 1:30 - 2:15 PM</option>
                      <option value="6">6. 2:15 - 3:00 PM</option>
                      <option value="7">7. 3:00 - 3:45 PM</option>
                      <option value="8">8. 3:45 - 4:30 PM</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                >
                  {addLoading ? 'Adding...' : 'Add to Timetable'}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({
                    classId: formData.classId,
                    subject: '',
                    teacherId: '',
                    day: '',
                    period: ''
                  })}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </form>

          {/* Current Timetable View */}
          <div className="mt-8">
            <h3 className="font-semibold mb-4">Current Timetable {formData.classId && `for ${formData.classId.replace('_', ' ').toUpperCase()}`}</h3>
            {formData.classId ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-3">Time</th>
                      <th className="border p-3">Monday</th>
                      <th className="border p-3">Tuesday</th>
                      <th className="border p-3">Wednesday</th>
                      <th className="border p-3">Thursday</th>
                      <th className="border p-3">Friday</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { period: '1', time: '1. 9:00 - 9:50 AM' },
                      { period: '2', time: '2. 9:50 - 10:40 AM' },
                      { period: '3', time: '3. 11:00 - 11:50 AM' },
                      { period: '4', time: '4. 11:50 AM - 12:40 PM' },
                      { period: 'lunch', time: 'LUNCH 12:40 - 1:30 PM', isLunch: true },
                      { period: '5', time: '5. 1:30 - 2:15 PM' },
                      { period: '6', time: '6. 2:15 - 3:00 PM' },
                      { period: '7', time: '7. 3:00 - 3:45 PM' },
                      { period: '8', time: '8. 3:45 - 4:30 PM' }
                    ].map((slot) => (
                      <tr key={slot.period}>
                        <td className={`border p-3 font-semibold ${slot.isLunch ? 'bg-gray-100' : ''}`}>{slot.time}</td>
                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map((day) => {
                          const entry = timetableData.find(e => e.day === day && e.period === slot.period);
                          return (
                            <td key={day} className={`border p-3 ${slot.isLunch ? 'bg-gray-100' : ''}`}>
                              {entry ? (
                                <div className="text-sm">
                                  <div className="font-medium">{entry.subject}</div>
                                  <div className="text-gray-600">{entry.teacher}</div>
                                </div>
                              ) : (
                                ''
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">Select a class to view the timetable.</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminTimetable;
