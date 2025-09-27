import { motion } from 'framer-motion';
import { Award, Calendar, CheckCircle, FileText, Users, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import AttendanceChart from '../components/AttendanceChart';
import { useTimetable } from '../hooks/useTimetable';
import { supabase } from '../lib/supabase';

const TeacherDashboard = ({ user }) => {
  const { fetchTeacherTimetable } = useTimetable();
  const [selectedClass, setSelectedClass] = useState('CS-A');
  const [timetableData, setTimetableData] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [attendanceList, setAttendanceList] = useState([
    { id: 1, name: 'John Doe', rollNo: 'CS001', status: 'Present', time: '09:15 AM' },
    { id: 2, name: 'Jane Smith', rollNo: 'CS002', status: 'Present', time: '09:12 AM' },
    { id: 3, name: 'Mike Johnson', rollNo: 'CS003', status: 'Absent', time: '-' },
    { id: 4, name: 'Sarah Wilson', rollNo: 'CS004', status: 'OD', time: '09:10 AM' },
    { id: 5, name: 'David Brown', rollNo: 'CS005', status: 'Present', time: '09:18 AM' }
  ]);

  const [odRequests, setOdRequests] = useState([
    { id: 1, studentName: 'Sarah Wilson', rollNo: 'CS004', date: '2024-01-15', reason: 'Medical appointment', status: 'Pending', proofUrl: '#' },
    { id: 2, studentName: 'Alex Davis', rollNo: 'CS006', date: '2024-01-16', reason: 'Family emergency', status: 'Pending', proofUrl: '#' }
  ]);

  const [classStats] = useState({
    totalStudents: 45,
    presentToday: 38,
    absentToday: 5,
    odToday: 2,
    attendancePercentage: 84
  });

  const handleODApproval = (requestId, action) => {
    setOdRequests(prev => 
      prev.map(request => 
        request.id === requestId 
          ? { ...request, status: action === 'approve' ? 'Approved' : 'Rejected' }
          : request
      )
    );
  };

  const handleAwardPoints = (studentId, points) => {
    alert(`Awarded ${points} points to student!`);
  };

  useEffect(() => {
    const loadTimetable = async () => {
      if (user?.id) {
        const { data } = await fetchTeacherTimetable(user.id);
        if (data) {
          setTimetableData(data);
          // Filter for today's schedule
          const today = new Date().getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
          const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          const todayEntries = data.filter(entry => entry.day === dayNames[today]);
          setTodaySchedule(todayEntries.map(entry => ({
            id: entry.id,
            subject: entry.subject,
            time: `${entry.start_time} - ${entry.end_time}`,
            class: entry.classId,
            status: 'upcoming' // Could be calculated based on current time
          })));
        }
      }
    };
    loadTimetable();

    // Real-time subscription for timetable changes
    let timetableSubscription;
    if (user?.id) {
      timetableSubscription = supabase
        .channel('teacher-timetable-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'timetable'
          },
          (payload) => {
            console.log('Teacher timetable change detected:', payload);
            // Check if the change affects this teacher
            if (payload.new?.teacher_id === user.id || payload.old?.teacher_id === user.id) {
              loadTimetable(); // Refetch on any change for this teacher
            }
          }
        )
        .subscribe((status) => {
          console.log('Teacher subscription status:', status);
        });
    }

    // Cleanup subscription
    return () => {
      if (timetableSubscription) {
        supabase.removeChannel(timetableSubscription);
      }
    };
  }, [user, fetchTeacherTimetable]);

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Teacher Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name || 'Teacher'}</p>
        </motion.div>

        {/* Class Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <label htmlFor="class-select" className="block text-sm font-medium text-gray-700 mb-2">
            Select Class
          </label>
          <select
            id="class-select"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="CS-A">Computer Science - Section A</option>
            <option value="CS-B">Computer Science - Section B</option>
            <option value="IT-A">Information Technology - Section A</option>
          </select>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-blue-600">{classStats.totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Present Today</p>
                <p className="text-2xl font-bold text-green-600">{classStats.presentToday}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Absent Today</p>
                <p className="text-2xl font-bold text-red-600">{classStats.absentToday}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Attendance %</p>
                <p className="text-2xl font-bold text-purple-600">{classStats.attendancePercentage}%</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Attendance List */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100"
            >
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">Today's Attendance - {selectedClass}</h2>
                <p className="text-sm text-gray-600 mt-1">{new Date().toLocaleDateString()}</p>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Student</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Roll No</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Time</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceList.map((student) => (
                        <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900">{student.name}</div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{student.rollNo}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                              student.status === 'Present' ? 'bg-green-100 text-green-800' :
                              student.status === 'Absent' ? 'bg-red-100 text-red-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {student.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{student.time}</td>
                          <td className="py-3 px-4">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleAwardPoints(student.id, 10)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Award Points
                            </motion.button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* OD Requests */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">OD Requests</h2>
              <div className="space-y-4">
                {odRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="mb-3">
                      <h3 className="font-medium text-gray-900">{request.studentName}</h3>
                      <p className="text-sm text-gray-600">{request.rollNo} • {request.date}</p>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{request.reason}</p>
                    {request.status === 'Pending' && (
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleODApproval(request.id, 'approve')}
                          className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          Approve
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleODApproval(request.id, 'reject')}
                          className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </motion.button>
                      </div>
                    )}
                    {request.status !== 'Pending' && (
                      <div className={`text-center py-2 px-3 rounded text-sm font-medium ${
                        request.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {request.status}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center py-3 px-4 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition-colors duration-200"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center py-3 px-4 bg-purple-50 text-purple-700 rounded-lg font-medium hover:bg-purple-100 transition-colors duration-200"
                >
                  <Award className="h-4 w-4 mr-2" />
                  Bulk Award Points
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center py-3 px-4 bg-green-50 text-green-700 rounded-lg font-medium hover:bg-green-100 transition-colors duration-200"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Update Timetable
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Today's Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mt-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Schedule</h2>
          <div className="space-y-3">
            {todaySchedule.length > 0 ? todaySchedule.map((class_item) => (
              <div key={class_item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{class_item.subject}</h3>
                  <p className="text-sm text-gray-600">{class_item.class}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{class_item.time}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    class_item.status === 'completed' ? 'bg-green-100 text-green-800' :
                    class_item.status === 'current' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {class_item.status}
                  </span>
                </div>
              </div>
            )) : (
              <p className="text-gray-500">No classes scheduled for today.</p>
            )}
          </div>
        </motion.div>

        {/* Weekly Timetable */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mt-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Weekly Timetable</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-2 font-medium text-gray-700 text-sm">Time</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700 text-sm">Monday</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700 text-sm">Tuesday</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700 text-sm">Wednesday</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700 text-sm">Thursday</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700 text-sm">Friday</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700 text-sm">Saturday</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { period: '1', time: '9:00 - 9:50 AM' },
                  { period: '2', time: '9:50 - 10:40 AM' },
                  { period: '3', time: '11:00 - 11:50 AM' },
                  { period: '4', time: '11:50 AM - 12:40 PM' },
                  { period: 'lunch', time: '12:40 - 1:30 PM', isLunch: true },
                  { period: '5', time: '1:30 - 2:15 PM' },
                  { period: '6', time: '2:15 - 3:00 PM' },
                  { period: '7', time: '3:00 - 3:45 PM' },
                  { period: '8', time: '3:45 - 4:30 PM' }
                ].map((slot) => (
                  <tr key={slot.period}>
                    <td className={`border-b border-gray-50 py-3 px-2 font-semibold text-sm ${slot.isLunch ? 'bg-gray-100' : ''}`}>{slot.time}</td>
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map((day) => {
                      const entry = timetableData.find(e => e.day === day && e.period === slot.period);
                      return (
                        <td key={day} className={`border-b border-gray-50 py-3 px-2 text-sm ${slot.isLunch ? 'bg-gray-100' : ''}`}>
                          {entry ? (
                            <div>
                              <div className="font-medium">{entry.subject}</div>
                              <div className="text-gray-600 text-xs">{entry.classId}</div>
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
        </motion.div>

        {/* Attendance Chart */}
        <div className="mt-8">
          <AttendanceChart data={{ present: 85, absent: 10, od: 5, total: 100 }} title="Class Attendance Overview" />
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;