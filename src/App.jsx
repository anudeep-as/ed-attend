import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import AdminDashboard from './pages/AdminDashboard';
import AdminExams from './pages/AdminExams';
import AdminHolidays from './pages/AdminHolidays';
import AdminTimetable from './pages/AdminTimetable';
import AdminUserManagement from './pages/AdminUserManagement';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <MainContent />
      </AuthProvider>
    </Router>
  );
}

// Helper function to determine default route based on user role
function getDefaultRoute(role) {
  switch (role) {
    case 'admin':
      return '/admin-dashboard';
    case 'teacher':
      return '/teacher-dashboard';
    case 'student':
      return '/student-dashboard';
    default:
      return '/login';
  }
}

function MainContent() {
  const { user, loading, signOut, isAuthenticated } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading Ed-Attend...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && <Navbar user={user} onLogout={signOut} />}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen"
      >
        <Toaster 
          position="top-center" 
          toastOptions={{
            duration: 10000,
            style: {
              background: '#363636',
              color: '#fff',
              fontSize: '16px',
            },
            success: {
              duration: 8000,
              style: {
                background: '#10B981',
                color: '#fff',
              },
            },
            error: {
              duration: 10000,
              style: {
                background: '#EF4444',
                color: '#fff',
              },
            },
          }} 
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={getDefaultRoute(user?.role)} replace />} />

          {/* Protected Routes */}
          <Route
            path="/admin-dashboard"
            element={isAuthenticated && user?.role === 'admin' ? <AdminDashboard user={user} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/teacher-dashboard"
            element={isAuthenticated && user?.role === 'teacher' ? <TeacherDashboard user={user} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/student-dashboard"
            element={isAuthenticated && user?.role === 'student' ? <StudentDashboard user={user} /> : <Navigate to="/login" replace />}
          />
          
          {/* Admin Routes */}
          <Route
            path="/admin/exams"
            element={isAuthenticated && user?.role === 'admin' ? <AdminExams user={user} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/admin/holidays"
            element={isAuthenticated && user?.role === 'admin' ? <AdminHolidays user={user} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/admin/timetable"
            element={isAuthenticated && user?.role === 'admin' ? <AdminTimetable /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/admin/users"
            element={isAuthenticated && user?.role === 'admin' ? <AdminUserManagement /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/analytics"
            element={
              loading ? (
                <div>Loading...</div>
              ) : isAuthenticated && (user?.role === 'admin' || user?.role === 'teacher') ? (
                <Analytics user={user} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/reports"
            element={
              loading ? (
                <div>Loading...</div>
              ) : isAuthenticated && (user?.role === 'admin' || user?.role === 'teacher') ? (
                <Reports user={user} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/settings"
            element={isAuthenticated ? <Settings /> : <Navigate to="/login" replace />}
          />

          {/* Default Route */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to={getDefaultRoute(user?.role)} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </motion.div>
    </div>
  );
}

export default App;
