import { motion } from 'framer-motion';
import { Award, Calendar, CheckCircle, Clock, FileText, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import AttendanceChart from '../components/AttendanceChart';
import FaceRecognition from '../components/FaceRecognition';
import Leaderboard from '../components/Leaderboard';
import ODForm from '../components/ODForm';
import { useAttendance } from '../hooks/attendance';
import { useTimetable } from '../hooks/useTimetable';
import { supabase } from '../lib/supabase';

const StudentDashboard = ({ user }) => {
  const { markAttendance } = useAttendance();
  const { fetchTimetable, fetchExams } = useTimetable();
  const [attendanceStatus, setAttendanceStatus] = useState('not-marked');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [showODForm, setShowODForm] = useState(false);
  const [showFaceRecognition, setShowFaceRecognition] = useState(false);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [timetableData, setTimetableData] = useState([]);
  const [examsData, setExamsData] = useState([]);

  const [attendanceData] = useState({
    present: 85,
    absent: 10,
    od: 5,
    total: 100
  });

  // School location for GPS verification (Bangalore coordinates for demo)
  const SCHOOL_LOCATION = { lat: 12.9716, lng: 77.5946 };

  // Calculate distance between two coordinates using Haversine formula
  const getDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };

  const isWithinSchoolPremises = (lat, lng) => {
    const distance = getDistance(lat, lng, SCHOOL_LOCATION.lat, SCHOOL_LOCATION.lng);
    return distance <= 1; // Within 1km of school
  };

  useEffect(() => {
    // Simulate getting current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied');
        }
      );
    }

    // Fetch timetable for student's class
    const loadTimetable = async () => {
      if (user?.class_id) {
        const { data } = await fetchTimetable(user.class_id);
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
            teacher: entry.teacher,
            status: 'upcoming' // Could be calculated based on current time
          })));
        }
      }
    };

    // Fetch exams for student's class
    const loadExams = async () => {
      if (user?.class_id) {
        const { data } = await fetchExams(user.class_id);
        if (data) {
          setExamsData(data);
        }
      }
    };

    loadTimetable();
    loadExams();

    // Real-time subscription for timetable changes
    let timetableSubscription;
    if (user?.class_id) {
      timetableSubscription = supabase
        .channel('timetable-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'timetable'
          },
          (payload) => {
            console.log('Timetable change detected:', payload);
            // Check if the change affects this student's class
            if (payload.new?.class_id === user.class_id || payload.old?.class_id === user.class_id) {
              loadTimetable(); // Refetch on any change for this class
            }
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);
        });
    }

    // Cleanup subscription
    return () => {
      if (timetableSubscription) {
        supabase.removeChannel(timetableSubscription);
      }
    };
  }, [user, fetchTimetable, fetchExams]);

  const handleMarkAttendance = () => {
    if (!currentLocation) {
      alert('Please enable location access to mark attendance');
      return;
    }

    if (!isWithinSchoolPremises(currentLocation.lat, currentLocation.lng)) {
      alert('You must be within school premises to mark attendance');
      return;
    }

    // Open face recognition modal
    setShowFaceRecognition(true);
  };

  const handleFaceVerificationSuccess = async () => {
    // Mark attendance using the hook
    const result = await markAttendance(user.id, currentLocation);
    if (result.error) {
      alert('Failed to mark attendance. Please try again.');
      return;
    }

    // Update user points
    const { error: pointsError } = await supabase
      .from('users')
      .update({ points: user.points + 10 })
      .eq('id', user.id);

    if (pointsError) {
      console.error('Error updating points:', pointsError);
    }

    setAttendanceStatus('marked');
    setShowFaceRecognition(false);
    alert('Attendance marked successfully! +10 points earned');
  };

  const handleODSubmit = (odData) => {
    console.log('OD Request submitted:', odData);
    setShowODForm(false);
    alert('OD request submitted successfully!');
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.name || 'Student'}!</h1>
          <p className="text-gray-600">Roll No: {user?.roll_no || 'N/A'} | Class: {user?.class_id || 'N/A'}</p>
          <p className="text-gray-600">Track your attendance and earn rewards</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Points</p>
                <p className="text-2xl font-bold text-blue-600">{user.points}</p>
              </div>
              <Award className="h-8 w-8 text-blue-600" />
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
                <p className="text-sm font-medium text-gray-600">Attendance</p>
                <p className="text-2xl font-bold text-green-600">{attendanceData.present}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
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
                <p className="text-sm font-medium text-gray-600">Badges</p>
                <p className="text-2xl font-bold text-purple-600">{user.badges?.length || 0}</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
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
                <p className="text-sm font-medium text-gray-600">Rank</p>
                <p className="text-2xl font-bold text-orange-600">#3</p>
              </div>
              <Award className="h-8 w-8 text-orange-600" />
            </div>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Attendance Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Mark Attendance</h2>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  {currentLocation ? 'Location detected' : 'Getting location...'}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  {new Date().toLocaleTimeString()}
                </div>
              </div>
              
              {attendanceStatus === 'not-marked' ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleMarkAttendance}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                >
                  Mark Attendance
                </motion.button>
              ) : (
                <div className="text-center py-3 px-4 bg-green-50 text-green-700 rounded-lg font-medium">
                  ✓ Attendance marked for today
                </div>
              )}
            </motion.div>

            {/* Today's Schedule */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Schedule</h2>
              <div className="space-y-3">
                {todaySchedule.length > 0 ? todaySchedule.map((class_item) => (
                  <div key={class_item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{class_item.subject}</h3>
                      <p className="text-sm text-gray-600">{class_item.teacher}</p>
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
              transition={{ delay: 0.7 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
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
                                  <div className="text-gray-600 text-xs">{entry.teacher}</div>
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

            {/* Exam Schedule */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Exam Schedule</h2>
              <div className="space-y-3">
                {examsData.length > 0 ? examsData.map((exam) => (
                  <div key={exam.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div>
                      <h3 className="font-medium text-gray-900">{exam.subject}</h3>
                      <p className="text-sm text-gray-600">{new Date(exam.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{exam.start_time} - {exam.end_time}</p>
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                        Exam
                      </span>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500">No exams scheduled.</p>
                )}
              </div>
            </motion.div>

            {/* Attendance Chart */}
            <AttendanceChart data={attendanceData} />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowODForm(true)}
                  className="w-full flex items-center justify-center py-3 px-4 bg-orange-50 text-orange-700 rounded-lg font-medium hover:bg-orange-100 transition-colors duration-200"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Apply for OD
                </motion.button>
              </div>
            </motion.div>

            {/* Badges */}
            {user.badges && user.badges.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">My Badges</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {user.badges.map((badge, index) => (
                    <div key={index} className="text-center p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                      <Award className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
                      <p className="text-xs font-medium text-yellow-800">{badge}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Leaderboard */}
            <Leaderboard currentUser={user} />
          </div>
        </div>
      </div>

      {/* OD Form Modal */}
      {showODForm && (
        <ODForm
          onSubmit={handleODSubmit}
          onClose={() => setShowODForm(false)}
        />
      )}

      {/* Face Recognition Modal */}
      {showFaceRecognition && (
        <FaceRecognition
          user={user}
          location={currentLocation}
          onSuccess={handleFaceVerificationSuccess}
          onCancel={() => setShowFaceRecognition(false)}
        />
      )}
    </div>
  );
};

export default StudentDashboard;