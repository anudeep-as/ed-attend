// Firebase Demo Data Seeder - Client-side
// Run: npm run seed-firebase

import { dbHelpers } from './src/lib/firebase.js';

const seedData = async () => {
  console.log('🌱 Seeding Firebase with demo data...');

  try {
    // 1. Demo Users (already handled by authHelpers demo logic)
    console.log('👥 Users: Using demo credentials (no Firestore needed)');
    
    // 2. Sample Attendance Records
    await dbHelpers.markAttendance({
      student_id: 'demo-student',
      course_id: 'CS101',
      course
