import { useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

export const useAttendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);

  const markAttendance = async (studentId, location, subject = 'Current Class') => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('attendance')
        .insert({
          student_id: studentId,
          date: new Date().toISOString().split('T')[0],
          status: 'Present',
          location: JSON.stringify(location),
          subject,
          marked_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error marking attendance:', error);
        toast.error('Failed to mark attendance');
        return { error };
      }

      toast.success('Attendance marked successfully!');
      return { data };
    } catch (error) {
      console.error('Mark attendance error:', error);
      toast.error('Failed to mark attendance');
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const getAttendance = async (studentId, startDate, endDate) => {
    try {
      setLoading(true);
      let query = supabase
        .from('attendance')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false });

      if (startDate) query = query.gte('date', startDate);
      if (endDate) query = query.lte('date', endDate);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching attendance:', error);
        return { error };
      }

      setAttendanceData(data);
      return { data };
    } catch (error) {
      console.error('Get attendance error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  return {
    attendanceData,
    loading,
    markAttendance,
    getAttendance
  };
};