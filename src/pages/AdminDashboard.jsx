import { motion } from 'framer-motion';
import { AlertTriangle, Calendar, Download, Settings, TrendingUp, UserCheck, Users } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import AttendanceChart from '../components/AttendanceChart';
import Leaderboard from '../components/Leaderboard';

const AdminDashboard = ({ user }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [overallStats] = useState({
    totalStudents: 1250,
    totalTeachers: 45,
    averageAttendance: 87,
    lowAttendanceStudents: 23,
    activeClasses: 28,
    pendingODRequests: 12
  });

  const [attendanceData] = useState({
    present: 87,
    absent: 8,
    od: 5,
    total: 100
  });

  const [lowAttendanceStudents] = useState([
    { id: 1, name: 'John Doe', rollNo: 'CS001', attendance: 65, class: 'CS-A' },
    { id: 2, name: 'Mike Johnson', rollNo: 'CS003', attendance: 58, class: 'CS-A' },
    { id: 3, name: 'Sarah Davis', rollNo: 'IT002', attendance: 62, class: 'IT-A' },
    { id: 4, name: 'Alex Wilson', rollNo: 'CS007', attendance: 55, class: 'CS-B' }
  ]);

  const [recentActivities] = useState([
    { id: 1, type: 'attendance', message: 'CS-A marked attendance for Mathematics', time: '10:30 AM' },
    { id: 2, type: 'od', message: 'New OD request from Sarah Wilson', time: '10:15 AM' },
    { id: 3, type: 'achievement', message: 'John Doe earned Consistency Badge', time: '09:45 AM' },
    { id: 4, type: 'alert', message: 'Low attendance alert for IT-B', time: '09:30 AM' }
  ]);

  const [classPerformance] = useState([
    { class: 'CS-A', students: 45, attendance: 92, avgPoints: 156 },
    { class: 'CS-B', students: 42, attendance: 88, avgPoints: 142 },
    { class: 'IT-A', students: 38, attendance: 85, avgPoints: 138 },
    { class: 'IT-B', students: 40, attendance: 79, avgPoints: 125 }
  ]);

  const handleExportReport = () => {
    alert('Generating comprehensive attendance report...');
  };

  const handleSendAlert = (studentId) => {
    alert('Low attendance alert sent to student and parents!');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name || 'Admin'}</p>
            </div>
            <div className="flex space-x-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="semester">This Semester</option>
              </select>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExportReport}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </motion.button>
              <Link to="/admin/exams">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Manage Exams
                </motion.button>
              </Link>
              <Link to="/admin/holidays">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Manage Holidays
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-blue-600">{overallStats.totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Teachers</p>
                <p className="text-2xl font-bold text-green-600">{overallStats.totalTeachers}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
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
                <p className="text-sm font-medium text-gray-600">Avg Attendance</p>
                <p className="text-2xl font-bold text-purple-600">{overallStats.averageAttendance}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
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
                <p className="text-sm font-medium text-gray-600">Low Attendance</p>
                <p className="text-2xl font-bold text-red-600">{overallStats.lowAttendanceStudents}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
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
                <p className="text-sm font-medium text-gray-600">Active Classes</p>
                <p className="text-2xl font-bold text-orange-600">{overallStats.activeClasses}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending ODs</p>
                <p className="text-2xl font-bold text-yellow-600">{overallStats.pendingODRequests}</p>
              </div>
              <Settings className="h-8 w-8 text-yellow-600" />
            </div>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-8">
            {/* Attendance Overview */}
            <AttendanceChart data={attendanceData} title="Overall Attendance Distribution" />

            {/* Class Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100"
            >
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">Class Performance</h2>
              </div>
              <div className="p-4 sm:p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-700 text-xs sm:text-sm">Class</th>
                        <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-700 text-xs sm:text-sm">Students</th>
                        <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-700 text-xs sm:text-sm">Attendance %</th>
                        <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-700 text-xs sm:text-sm">Avg Points</th>
                        <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-700 text-xs sm:text-sm">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classPerformance.map((classData, index) => (
                        <tr key={index} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-3 px-2 sm:px-4 font-medium text-gray-900 text-xs sm:text-sm">{classData.class}</td>
                          <td className="py-3 px-2 sm:px-4 text-gray-600 text-xs sm:text-sm">{classData.students}</td>
                          <td className="py-3 px-2 sm:px-4">
                            <span className={`font-medium text-xs sm:text-sm ${
                              classData.attendance >= 90 ? 'text-green-600' :
                              classData.attendance >= 80 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {classData.attendance}%
                            </span>
                          </td>
                          <td className="py-3 px-2 sm:px-4 text-gray-600 text-xs sm:text-sm">{classData.avgPoints}</td>
                          <td className="py-3 px-2 sm:px-4">
                            <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                              classData.attendance >= 90 ? 'bg-green-100 text-green-800' :
                              classData.attendance >= 80 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {classData.attendance >= 90 ? 'Excellent' :
                               classData.attendance >= 80 ? 'Good' : 'Needs Attention'}
                            </span>
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
            {/* Recent Activities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activities</h2>
              <div className="space-y-2 sm:space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'attendance' ? 'bg-blue-500' :
                      activity.type === 'od' ? 'bg-orange-500' :
                      activity.type === 'achievement' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Top Performers */}
            <Leaderboard title="Top Performers" showTitle={true} />
          </div>
        </div>

        {/* Low Attendance Students */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100"
        >
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Students Requiring Attention</h2>
              <span className="text-sm text-gray-600">Attendance below 70%</span>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
              {lowAttendanceStudents.map((student) => (
                <div key={student.id} className="border border-red-200 rounded-lg p-2 sm:p-4 bg-red-50">
                  <div className="mb-3">
                    <h3 className="font-medium text-gray-900">{student.name}</h3>
                    <p className="text-sm text-gray-600">{student.rollNo} • {student.class}</p>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Attendance</span>
                      <span className="text-sm font-medium text-red-600">{student.attendance}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${student.attendance}%` }}
                      ></div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSendAlert(student.id)}
                    className="w-full bg-red-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Send Alert
                  </motion.button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;