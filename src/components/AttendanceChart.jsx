import { motion } from 'framer-motion';
import { Calendar, TrendingUp, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const AttendanceChart = ({ data, title = "Attendance Overview" }) => {
  const pieData = [
    { name: 'Present', value: data.present, color: '#10B981' },
    { name: 'Absent', value: data.absent, color: '#EF4444' },
    { name: 'On Duty', value: data.od, color: '#F59E0B' }
  ];

  const weeklyData = [
    { day: 'Mon', present: 42, absent: 3, od: 2 },
    { day: 'Tue', present: 45, absent: 1, od: 1 },
    { day: 'Wed', present: 44, absent: 2, od: 1 },
    { day: 'Thu', present: 43, absent: 3, od: 1 },
    { day: 'Fri', present: 46, absent: 1, od: 0 },
    { day: 'Sat', present: 41, absent: 4, od: 2 }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-sm font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100"
    >
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <TrendingUp className="h-5 w-5 text-blue-600" />
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pie Chart */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Distribution</h3>
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                            <p className="font-medium text-gray-900">{data.name}</p>
                            <p className="text-sm text-gray-600">{data.value}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex justify-center space-x-6 mt-4">
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bar Chart */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Trend</h3>
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="present" fill="#10B981" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="absent" fill="#EF4444" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="od" fill="#F59E0B" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-100">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="text-center p-4 bg-green-50 rounded-lg border border-green-200"
          >
            <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{data.present}%</div>
            <div className="text-sm text-green-700 font-medium">Present</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="text-center p-4 bg-red-50 rounded-lg border border-red-200"
          >
            <Calendar className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">{data.absent}%</div>
            <div className="text-sm text-red-700 font-medium">Absent</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200"
          >
            <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">{data.od}%</div>
            <div className="text-sm text-orange-700 font-medium">On Duty</div>
          </motion.div>
        </div>

        {/* Insights */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200"
        >
          <h4 className="font-medium text-blue-900 mb-2">📊 Insights</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• Attendance rate is {data.present >= 85 ? 'excellent' : data.present >= 75 ? 'good' : 'needs improvement'} at {data.present}%</p>
            <p>• {data.present >= 90 ? 'Keep up the great work!' : 'Consider strategies to improve attendance'}</p>
            <p>• OD requests are {data.od <= 5 ? 'within normal range' : 'higher than average'}</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AttendanceChart;