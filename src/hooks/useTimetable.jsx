
import { useEffect, useState } from 'react';
import { dbHelpers } from '../lib/firebase.js';

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

  const fetchHolidays = async () => {
    // Demo holidays
    const demoHolidays = [];
    setHolidays(demoHolidays);
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const periodToStartTime = {
    '1': '09:00:00',
    '2': '09:50:00',
    '3': '11:00:00',
    '4': '11:50:00',
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
    '5': '14:15:00',
    '6': '15:00:00',
    '7': '15:45:00',
    '8': '16:30:00'
  };

  const getStartTime = (period) => periodToStartTime[period] || null;
  const getEndTime = (period) => periodToEndTime[period] || null;

  const classMap = {
    'CS-A': 'CSE A',
    'CS-B': 'CSE B',
    'IT-A': 'IT A',
    'IT-B': 'IT B'
  };

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

  const addTimetableEntry = async (entry) => {
    try {
      setAddLoading(true);
      console.log('Adding timetable entry:', entry);
      // Demo: Add to OD requests for demo
      await dbHelpers.createODRequest({
        student_id: 'demo-student',
        teacher_id: 'demo-teacher',
        reason: `Timetable: ${entry.classId} - ${entry.subject}`,
        start_date: '2025-01-01',
        end_date: '2025-01-02',
        status: 'approved'
      });
      return { success: true };
    } catch (error) {
      console.error('Error:', error);
      return { success: false, error: error.message };
    } finally {
      setAddLoading(false);
    }
  };

  const fetchTimetable = async (classId) => {
    try {
      setFetchLoading(true);
      console.log('Fetching timetable for class:', classId);
      
      // Demo data for class
      const demoData = [
        {
          id: '1',
          classId,
          className: classMap[classId] || classId,
          subject: 'Mathematics',
          teacher: 'Mr. Smith',
          day: 'monday',
          period: '1'
        },
        {
          id: '2',
          classId,
          className: classMap[classId] || classId,
          subject: 'Science',
          teacher: 'Mrs. Johnson',
          day: 'tuesday',
          period: '2'
        }
      ];
      
      return { success: true, data: demoData };
    } catch (error) {
      console.error('Error:', error);
      return { success: false, error: 'Demo timetable loaded' };
    } finally {
      setFetchLoading(false);
    }
  };

  const timeSlots = [
    { id: '1', time: '9:00 - 9:50 AM' },
    { id: '2', time: '9:50 - 10:40 AM' },
    { id: '3', time: '11:00 - 11:50 AM' },
    { id: '4', time: '11:50 AM - 12:40 PM' },
    { id: '5', time: '1:30 - 2:15 PM' },
    { id: '6', time: '2:15 - 3:00 PM' },
    { id: '7', time: '3:00 - 3:45 PM' },
    { id: '8', time: '3:45 - 4:30 PM' }
  ];

  return {
    addLoading,
    fetchLoading,
    timeSlots,
    holidays,
    addTimetableEntry,
    fetchTimetable
  };
};

