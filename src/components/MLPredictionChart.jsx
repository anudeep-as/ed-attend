import { motion } from 'framer-motion';
import {
    Activity,
    AlertCircle,
    ShieldCheck,
    TrendingUp,
    Zap
} from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

const MLPredictionChart = ({ mlData, anomalyData, isLoading }) => {
  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 flex items-center justify-center h-80"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-600">Analyzing with SVM + XGBoost...</p>
        </div>
      </motion.div>
    );
  }

  if (!mlData && !anomalyData) {
    return (
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 text-center border-2 border-dashed border-gray-300 h-80"
      >
        <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">ML Insights</h3>
        <p className="text-gray-500">Prediction ready - recent data needed</p>
      </motion.div>
    );
  }

  const predictionData = mlData ? [
    { name: 'Current', value: 85, predicted: mlData.predicted_attendance_pct || 0 },
    { name: 'Predicted', value: mlData.predicted_attendance_pct || 0, predicted: mlData.predicted_attendance_pct || 0 }
  ] : [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-2xl p-6 shadow-xl border border-indigo-100"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              ML Predictions (SIH)
            </h3>
            <p className="text-sm text-gray-600">XGBoost + SVM Analysis</p>
          </div>
        </div>
        {anomalyData?.is_anomaly && (
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            className="flex items-center space-x-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium"
          >
            <AlertCircle className="h-4 w-4" />
            <span>ANOMALY DETECTED</span>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* XGBoost Prediction */}
        <div>
          <div className="flex items-center mb-4">
            <ShieldCheck className="h-5 w-5 text-green-500 mr-2" />
            <span className="font-semibold text-green-700 text-sm">Next Attendance Prediction</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={predictionData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis type="number" domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="predicted" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {mlData && (
            <div className="mt-3 p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">
                {mlData.predicted_attendance_pct?.toFixed(1)}%
              </div>
              <div className="text-sm text-green-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                Confidence: {(mlData.confidence || 0).toFixed(1)}%
              </div>
            </div>
          )}
        </div>

        {/* Key Features */}
        <div className="space-y-3">
          {mlData?.features_used && (
            <>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-blue-800">Avg Attendance</span>
                <span className="font-bold text-blue-600">{(mlData.features_used[0] * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium text-purple-800">Variability</span>
                <span className="font-bold text-purple-600">{mlData.features_used[1]?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                <span className="text-sm font-medium text-indigo-800">Method Diversity</span>
                <span className="font-bold text-indigo-600">{mlData.features_used[3]?.toFixed(1)}</span>
              </div>
            </>
          )}
          
          {anomalyData && (
            <div className={`p-3 rounded-lg ${anomalyData.is_anomaly ? 'bg-red-50 border-2 border-red-200' : 'bg-emerald-50 border-2 border-emerald-200'}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {anomalyData.is_anomaly ? 'SVM Anomaly Score' : 'Normal Pattern'}
                </span>
                <span className={`font-bold px-2 py-1 rounded-full text-xs ${
                  anomalyData.is_anomaly 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {anomalyData.anomaly_score?.toFixed(3)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-indigo-100">
        <div className="flex space-x-4 text-xs text-gray-500">
          <span>🎓 XGBoost Regressor</span>
          <span>•</span>
          <span>🔍 SVM Anomaly Detection</span>
          <span>•</span>
          <span>⚡ Real-time Firebase sync</span>
        </div>
      </div>
    </motion.div>
  );
};

export default MLPredictionChart;

