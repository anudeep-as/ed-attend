import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export const useMLAnalytics = (studentId) => {
  const [mlData, setMlData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMLPrediction = async (attendanceHistory) => {
    setLoading(true);
    setError(null);
    
    try {
      try {
        const response = await fetch('http://localhost:8001/predict-attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: studentId,
            historical_attendance: attendanceHistory || [
              {"date": "2025-01-20", "status": 1.0, "method": 1},
              {"date": "2025-01-21", "status": 1.0, "method": 2},
              {"date": "2025-01-22", "status": 0.0, "method": 0}
            ]
          })
        });
        if (!response.ok) throw new Error();
        return await response.json();
      } catch {
        // Fallback to Firebase ML simulation for Vercel
        const { getMLPrediction } = await import('../lib/firebase_ml.js');
        return await getMLPrediction(studentId, attendanceHistory || []);
      }

      if (!response.ok) throw new Error('ML API unavailable');
      
      const result = await response.json();
      setMlData(result);
      toast.success(`Predicted: ${result.predicted_attendance_pct?.toFixed(1)}%`);
      
    } catch (err) {
      setError(err.message);
      toast.error('ML prediction failed - train models first');
    } finally {
      setLoading(false);
    }
  };

  const checkAnomaly = async (attendanceHistory) => {
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:8001/detect-anomalies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          historical_attendance: attendanceHistory
        })
      });

      const result = await response.json();
      if (result.is_anomaly) {
        toast.error(`⚠️ Anomaly detected (Score: ${result.anomaly_score.toFixed(2)})`);
      }
      return result;
    } catch (err) {
      console.warn('Anomaly check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) fetchMLPrediction();
  }, [studentId]);

  return { mlData, loading, error, fetchMLPrediction, checkAnomaly };
};

