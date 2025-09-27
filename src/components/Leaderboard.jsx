import { motion } from 'framer-motion';
import { Award, Medal, TrendingUp, Trophy } from 'lucide-react';

const Leaderboard = ({ currentUser, title = "Leaderboard", showTitle = false }) => {
  const leaderboardData = [
    { id: 1, name: 'Alice Johnson', points: 245, rank: 1, badge: 'Gold', attendance: 98, streak: 15 },
    { id: 2, name: 'Bob Smith', points: 230, rank: 2, badge: 'Silver', attendance: 96, streak: 12 },
    { id: 3, name: 'Carol Davis', points: 215, rank: 3, badge: 'Bronze', attendance: 94, streak: 10 },
    { id: 4, name: 'David Wilson', points: 200, rank: 4, badge: 'Achiever', attendance: 92, streak: 8 },
    { id: 5, name: 'Emma Brown', points: 185, rank: 5, badge: 'Rising Star', attendance: 90, streak: 6 },
    { id: 6, name: 'Frank Miller', points: 170, rank: 6, badge: 'Consistent', attendance: 88, streak: 5 },
    { id: 7, name: 'Grace Lee', points: 155, rank: 7, badge: 'Dedicated', attendance: 86, streak: 4 },
    { id: 8, name: 'Henry Taylor', points: 140, rank: 8, badge: 'Committed', attendance: 84, streak: 3 }
  ];

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200';
      default:
        return 'bg-white border-gray-100';
    }
  };

  const getBadgeColor = (badge) => {
    const colors = {
      'Gold': 'bg-yellow-100 text-yellow-800',
      'Silver': 'bg-gray-100 text-gray-800',
      'Bronze': 'bg-amber-100 text-amber-800',
      'Achiever': 'bg-blue-100 text-blue-800',
      'Rising Star': 'bg-purple-100 text-purple-800',
      'Consistent': 'bg-green-100 text-green-800',
      'Dedicated': 'bg-indigo-100 text-indigo-800',
      'Committed': 'bg-pink-100 text-pink-800'
    };
    return colors[badge] || 'bg-gray-100 text-gray-800';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <TrendingUp className="h-5 w-5 text-blue-600" />
      </div>

      <div className="space-y-3">
        {leaderboardData.slice(0, 8).map((student, index) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-3 sm:p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
              getRankColor(student.rank)
            } ${
              currentUser && student.name === currentUser.name ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8">
                  {getRankIcon(student.rank)}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                    {student.name}
                    {currentUser && student.name === currentUser.name && (
                      <span className="ml-2 text-xs text-blue-600 font-medium">(You)</span>
                    )}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                      getBadgeColor(student.badge)
                    }`}>
                      {student.badge}
                    </span>
                    <span className="text-xs text-gray-500">
                      {student.streak} day streak
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-lg font-bold text-blue-600">{student.points}</div>
                <div className="text-xs text-gray-500">points</div>
                <div className="text-xs text-green-600 font-medium">
                  {student.attendance}% attendance
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Current User Position (if not in top 8) */}
      {currentUser && !leaderboardData.slice(0, 8).some(student => student.name === currentUser.name) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 pt-4 border-t border-gray-200"
        >
          <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8">
                  <span className="text-sm font-bold text-blue-600">#12</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                    {currentUser.name} <span className="text-xs text-blue-600 font-medium">(You)</span>
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="inline-block px-2 py-1 text-xs rounded-full font-medium bg-blue-100 text-blue-800">
                      Climber
                    </span>
                    <span className="text-xs text-gray-500">3 day streak</span>
                  </div>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-lg font-bold text-blue-600">{currentUser.points || 150}</div>
                <div className="text-xs text-gray-500">points</div>
                <div className="text-xs text-green-600 font-medium">85% attendance</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Motivational Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100"
      >
        <p className="text-sm text-center text-gray-700">
          <span className="font-medium">Keep it up!</span> Maintain your attendance streak to climb the leaderboard! 🚀
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Leaderboard;