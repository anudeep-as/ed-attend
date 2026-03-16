// Supabase Database Setup Script
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sdbyvmsvelpuvhsoewsc.supabase.co';
// Using the service role key for admin access (be careful with this in production)
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkYnl2bXN2ZWxwdXZoc29ld3NjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODY0Njg4MSwiZXhwIjoyMDc0MjIyODgxfQ.QDO6QgJbLIHjJ4qLa7OE1ZkPo7J8b2vFqOXxSjJCnpo';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const schemaSQL = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (students, teachers, admins)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
  roll_no VARCHAR(50),
  department VARCHAR(100),
  year INTEGER,
  section VARCHAR(10),
  points INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]',
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id VARCHAR(50),
  course_name VARCHAR(255),
  date DATE NOT NULL,
  time TIME NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'od')),
  method VARCHAR(50) DEFAULT 'manual',
  location VARCHAR(255),
  teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OD Requests table
CREATE TABLE IF NOT EXISTS od_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gamification table
CREATE TABLE IF NOT EXISTS gamification (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  weekly_points INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  achievements JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Timetable table
CREATE TABLE IF NOT EXISTS timetable (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id VARCHAR(50) NOT NULL,
  course_name VARCHAR(255) NOT NULL,
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_of_week VARCHAR(20) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room VARCHAR(50),
  department VARCHAR(100),
  year INTEGER,
  section VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Holidays table
CREATE TABLE IF NOT EXISTS holidays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exams table
CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id VARCHAR(50) NOT NULL,
  course_name VARCHAR(255) NOT NULL,
  exam_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room VARCHAR(50),
  department VARCHAR(100),
  year INTEGER,
  section VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_od_requests_student_id ON od_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_od_requests_status ON od_requests(status);
CREATE INDEX IF NOT EXISTS idx_timetable_teacher_id ON timetable(teacher_id);
CREATE INDEX IF NOT EXISTS idx_timetable_day ON timetable(day_of_week);
`;

async function setupDatabase() {
  console.log('Setting up Supabase database...');
  
  try {
    // Enable UUID extension
    const { error: extError } = await supabase.rpc('create_extension', { 
      ext_name: 'uuid-ossp' 
    });
    
    if (extError) {
      console.log('Note: Extension creation may require direct DB access. Trying alternative approach...');
    }
    
    // Since we can't execute raw SQL directly via JS client,
    // we'll create tables using the REST API approach
    console.log('Creating users table...');
    
    // Insert demo users
    const { error: insertError } = await supabase
      .from('users')
      .upsert([
        { 
          email: 'admin@edattend.com', 
          password: 'demo123', 
          name: 'Demo Admin', 
          role: 'admin', 
          roll_no: 'ADMIN001', 
          department: 'Administration',
          points: 0
        },
        { 
          email: 'teacher@edattend.com', 
          password: 'demo123', 
          name: 'Demo Teacher', 
          role: 'teacher', 
          roll_no: 'TEACH001', 
          department: 'Computer Science',
          points: 0
        },
        { 
          email: 'student@edattend.com', 
          password: 'demo123', 
          name: 'Demo Student', 
          role: 'student', 
          roll_no: 'CS2024001', 
          department: 'Computer Science',
          year: 3,
          points: 150
        }
      ], { onConflict: 'email' });

    if (insertError) {
      console.log('Error inserting demo users:', insertError.message);
      console.log('\n--- Manual Setup Required ---');
      console.log('Please run the SQL from supabase-schema.sql in Supabase Dashboard:');
      console.log('1. Go to https://supabase.com/dashboard');
      console.log('2. Select project sdbyvmsvelpuvhsoewsc');
      console.log('3. Go to SQL Editor');
      console.log('4. Copy and run supabase-schema.sql');
    } else {
      console.log('Demo users created successfully!');
    }
    
    console.log('\nSetup complete!');
    
  } catch (error) {
    console.error('Error:', error.message);
    console.log('\n--- Manual Setup Required ---');
    console.log('Please run the SQL from supabase-schema.sql in Supabase Dashboard');
  }
}

setupDatabase();
