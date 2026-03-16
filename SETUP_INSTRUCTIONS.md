
# Database Setup Instructions

## Quick Setup - Copy and Run This SQL

Go to: https://supabase.com/dashboard/project/sdbyvmsvelpuvhsoewsc/sql

Copy and run the following SQL:

```
sql
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_od_requests_student_id ON od_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_od_requests_status ON od_requests(status);

-- Insert demo users
INSERT INTO users (email, password, name, role, roll_no, department, year, points) VALUES
('admin@edattend.com', 'demo123', 'Demo Admin', 'admin', 'ADMIN001', 'Administration', NULL, 0),
('teacher@edattend.com', 'demo123', 'Demo Teacher', 'teacher', 'TEACH001', 'Computer Science', NULL, 0),
('student@edattend.com', 'demo123', 'Demo Student', 'student', 'CS2024001', 'Computer Science', 3, 150)
ON CONFLICT (email) DO NOTHING;

-- Insert sample holidays
INSERT INTO holidays (name, date, description, is_recurring) VALUES
('Independence Day', '2025-08-15', 'National Independence Day', TRUE),
('Republic Day', '2025-01-26', 'National Republic Day', TRUE),
('Diwali', '2025-10-20', 'Festival of Lights', FALSE),
('Christmas', '2025-12-25', 'Christmas Day', TRUE)
ON CONFLICT DO NOTHING;
```

## Steps:
1. Go to https://supabase.com/dashboard/project/sdbyvmsvelpuvhsoewsc/sql
2. Paste the SQL above
3. Click **Run**
4. Done!

## Demo Credentials:
- **Admin:** admin@edattend.com / demo123
- **Teacher:** teacher@edattend.com / demo123  
- **Student:** student@edattend.com / demo123
