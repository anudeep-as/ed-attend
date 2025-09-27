import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

export const useTimetable = () => {
  const [addLoading, setAddLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [holidays, setHolidays] = useState([]);

  const dayMap = {
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
    sunday: 7
  };

  const mapDayToNumber = (day) => dayMap[day];
  const mapNumberToDay = (num) => Object.keys(dayMap).find(key => dayMap[key] === num);

  const fetchHolidays = async () => {
    try {
      const { data, error } = await supabase
        .from('holidays')
        .select('day_of_week');

      if (error) throw error;
      setHolidays(data.map(h => h.day_of_week));
    } catch (error) {
      console.error('Error fetching holidays:', error);
    }
  };

  // Fetch holidays on hook init
  useEffect(() => {
    fetchHolidays();
  }, []);

  const periodToStartTime = {
    '1': '09:00:00',
    '2': '09:50:00',
    '3': '11:00:00',
    '4': '11:50:00',
    'lunch': '12:40:00',
    '5': '13:30:00',
    '6': '14:15:00',
    '7': '15:00:00',
    '8': '15:45:00'
  };

  const periodToEndTime = {
    '1': '09:50:00',
    '2': '10:40:00',
    '3': '11:50:00',
    '4': '12:40:00',
    'lunch': '13:30:00',
    '5': '14:15:00',
    '6': '15:00:00',
    '7': '15:45:00',
    '8': '16:30:00'
  };

  const getStartTime = (period) => periodToStartTime[period] || null;
  const getEndTime = (period) => periodToEndTime[period] || null;

  const subjectMap = {
    'math': 'Mathematics',
    'science': 'Science',
    'english': 'English'
  };

  const teacherMap = {
    'teacher_1': 'Mr. Smith',
    'teacher_2': 'Mrs. Johnson',
    'teacher_3': 'Dr. Williams'
  };

  const timeSlots = [
    { id: 1, time: '9:00 - 9:50 AM' },
    { id: 2, time: '9:50 - 10:40 AM' },
    { id: 3, time: '11:00 - 11:50 AM' },
    { id: 4, time: '11:50 AM - 12:40 PM' },
    { id: 'lunch', time: '12:40 - 1:30 PM' },
    { id: 5, time: '1:30 - 2:15 PM' },
    { id: 6, time: '2:15 - 3:00 PM' },
    { id: 7, time: '3:00 - 3:45 PM' },
    { id: 8, time: '3:45 - 4:30 PM' }
  ];

  const addTimetableEntry = async (entry) => {
    try {
      setAddLoading(true);

      // Check if the day is a holiday
      const dayNumber = mapDayToNumber(entry.day.toLowerCase());
      if (holidays.includes(dayNumber)) {
        throw new Error('Cannot schedule classes on holidays');
      }

      // Check if all required fields are present
      if (!entry.classId || !entry.subject || !entry.teacherId || !entry.day || !entry.period) {
        throw new Error('All fields are required');
      }

      // Check for existing entry in the same slot
      const { data: existingEntry, error: checkError } = await supabase
        .from('timetable')
        .select('*')
        .eq('class_id', entry.classId)
        .eq('day_of_week', mapDayToNumber(entry.day))
        .eq('period', entry.period)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingEntry) {
        throw new Error('This time slot is already occupied');
      }

      // Check if teacher is available
      const { data: teacherConflict, error: teacherCheckError } = await supabase
        .from('timetable')
        .select('*')
        .eq('teacher_id', entry.teacherId)
        .eq('day_of_week', mapDayToNumber(entry.day))
        .eq('period', entry.period)
        .single();

      if (teacherCheckError && teacherCheckError.code !== 'PGRST116') {
        throw teacherCheckError;
      }

      if (teacherConflict) {
        throw new Error('Teacher is already assigned to another class in this time slot');
      }

      // Add the entry
      const { error: insertError } = await supabase
        .from('timetable')
        .insert([{
          class_id: entry.classId,
          subject: entry.subject,
          teacher_id: entry.teacherId,
          day_of_week: mapDayToNumber(entry.day),
          period: entry.period,
          start_time: getStartTime(entry.period),
          end_time: getEndTime(entry.period),
          created_at: new Date().toISOString()
        }]);

      if (insertError) throw insertError;

      return { success: true };
    } catch (error) {
      console.error('Error adding timetable entry:', error);
      return {
        success: false,
        error: error.message || 'Failed to add timetable entry'
      };
    } finally {
      setAddLoading(false);
    }
  };

  const fetchTimetable = async (classId) => {
    try {
      setFetchLoading(true);

      if (!classId) {
        throw new Error('Class ID is required');
      }

      const { data, error } = await supabase
        .from('timetable')
        .select('*')
        .eq('class_id', classId)
        .order('day_of_week', { ascending: true })
        .order('period', { ascending: true });

      if (error) throw error;

      // Transform data into a more useful format
      const formattedData = data.map(entry => ({
        id: entry.id,
        classId: entry.class_id,
        subject: subjectMap[entry.subject] || entry.subject,
        teacher: teacherMap[entry.teacher_id] || entry.teacher_id,
        day: mapNumberToDay(entry.day_of_week),
        period: entry.period,
        start_time: entry.start_time,
        end_time: entry.end_time,
        createdAt: entry.created_at
      }));

      return { success: true, data: formattedData };
    } catch (error) {
      console.error('Error fetching timetable:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to fetch timetable'
      };
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchTeacherTimetable = async (teacherId) => {
    try {
      setFetchLoading(true);

      if (!teacherId) {
        throw new Error('Teacher ID is required');
      }

      const { data, error } = await supabase
        .from('timetable')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('day_of_week', { ascending: true })
        .order('period', { ascending: true });

      if (error) throw error;

      // Transform data into a more useful format
      const formattedData = data.map(entry => ({
        id: entry.id,
        classId: entry.class_id,
        subject: subjectMap[entry.subject] || entry.subject,
        teacher: teacherMap[entry.teacher_id] || entry.teacher_id,
        day: mapNumberToDay(entry.day_of_week),
        period: entry.period,
        start_time: entry.start_time,
        end_time: entry.end_time,
        createdAt: entry.created_at
      }));

      return { success: true, data: formattedData };
    } catch (error) {
      console.error('Error fetching teacher timetable:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to fetch teacher timetable'
      };
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchExams = async (classId) => {
    try {
      setFetchLoading(true);

      if (!classId) {
        throw new Error('Class ID is required');
      }

      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('class_id', classId)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;

      // Transform data into a more useful format
      const formattedData = data.map(entry => ({
        id: entry.id,
        classId: entry.class_id,
        subject: subjectMap[entry.subject] || entry.subject,
        date: entry.date,
        start_time: entry.start_time,
        end_time: entry.end_time,
        createdAt: entry.created_at
      }));

      return { success: true, data: formattedData };
    } catch (error) {
      console.error('Error fetching exams:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to fetch exams'
      };
    } finally {
      setFetchLoading(false);
    }
  };

  const deleteTimetableEntry = async (entryId) => {
    try {
      setLoading(true);

      if (!entryId) {
        throw new Error('Entry ID is required');
      }

      // Check if entry exists
      const { data: existingEntry, error: checkError } = await supabase
        .from('timetable')
        .select('*')
        .eq('id', entryId)
        .single();

      if (checkError) {
        if (checkError.code === 'PGRST116') {
          throw new Error('Timetable entry not found');
        }
        throw checkError;
      }

      // Delete the entry
      const { error: deleteError } = await supabase
        .from('timetable')
        .delete()
        .eq('id', entryId);

      if (deleteError) throw deleteError;

      return { success: true };
    } catch (error) {
      console.error('Error deleting timetable entry:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to delete timetable entry'
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    addLoading,
    fetchLoading,
    timeSlots,
    holidays,
    fetchHolidays,
    addTimetableEntry,
    fetchTimetable,
    fetchTeacherTimetable,
    fetchExams,
    deleteTimetableEntry
  };
};