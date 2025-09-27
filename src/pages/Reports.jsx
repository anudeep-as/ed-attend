import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Download, Filter, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

const Reports = ({ user }) => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const mockStudents = [
    { id: 1, name: 'John Doe', rollNo: 'CS001', department: 'CSE', attendance: 45, totalClasses: 50, percentage: 90 },
    { id: 2, name: 'Jane Smith', rollNo: 'CS002', department: 'CSE', attendance: 35, totalClasses: 50, percentage: 70 },
    { id: 3, name: 'Mike Johnson', rollNo: 'EC001', department: 'ECE', attendance: 30, totalClasses: 50, percentage: 60 },
    { id: 4, name: 'Sarah Wilson', rollNo: 'ME001', department: 'MECH', attendance: 48, totalClasses: 50, percentage: 96 },
    { id: 5, name: 'David Brown', rollNo: 'CS003', department: 'CSE', attendance: 25, totalClasses: 50, percentage: 50 }
  ];

  useEffect(() => {
    fetchReportsData();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, filterType]);

  const fetchReportsData = async () => {
    try {
      setLoading(true);

      // Use mock data for demo
      setStudents(mockStudents);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports data');
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply attendance filter
    switch (filterType) {
      case 'low':
        filtered = filtered.filter(student => student.percentage < 75);
        break;
      case 'good':
        filtered = filtered.filter(student => student.percentage >= 75 && student.percentage < 90);
        break;
      case 'excellent':
        filtered = filtered.filter(student => student.percentage >= 90);
        break;
      default:
        break;
    }

    setFilteredStudents(filtered);
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Name', 'Roll No', 'Department', 'Attendance', 'Total Classes', 'Percentage'],
      ...filteredStudents.map(student => [
        student.name,
        student.rollNo,
        student.department,
        student.attendance,
        student.totalClasses,
        `${student.percentage}%`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance_report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report exported successfully!');
  };

  const getAttendanceStatus = (percentage) => {
    if (percentage >= 90) return { status: 'Excellent', color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle };
    if (percentage >= 75) return { status: 'Good', color: 'text-blue-600', bg: 'bg-blue-100', icon: CheckCircle };
    return { status: 'Low', color: 'text-red-600', bg: 'bg-red-100', icon: AlertTriangle };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-mint-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-mint-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900 font-nunito">Attendance Reports</h1>
            <button
              onClick={exportToCSV}
              className="flex items-center space-x-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search by name, roll no, or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="all">All Students</option>
                  <option value="low">Low Attendance (&lt;75%)</option>
                  <option value="good">Good Attendance (75-89%)</option>
                  <option value="excellent">Excellent Attendance (≥90%)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Total Students</h3>
              <p className="text-3xl font-bold text-teal-600">{students.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Low Attendance</h3>
              <p className="text-3xl font-bold text-red-600">
                {students.filter(s => s.percentage < 75).length}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Good Attendance</h3>
              <p className="text-3xl font-bold text-blue-600">
                {students.filter(s => s.percentage >= 75 && s.percentage < 90).length}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Excellent Attendance</h3>
              <p className="text-3xl font-bold text-green-600">
                {students.filter(s => s.percentage >= 90).length}
              </p>
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 font-nunito">Student Attendance Report</h3>
              <p className="text-sm text-gray-600 mt-1">Showing {filteredStudents.length} of {students.length} students</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student, index) => {
                    const statusInfo = getAttendanceStatus(student.percentage);
                    const StatusIcon = statusInfo.icon;
                    
                    return (
                      <motion.tr
                        key={student.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">{student.rollNo}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.attendance}/{student.totalClasses}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                              <div 
                                className={`h-2 rounded-full ${
                                  student.percentage >= 90 ? 'bg-green-500' :
                                  student.percentage >= 75 ? 'bg-blue-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${student.percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{student.percentage}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo.status}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Reports;