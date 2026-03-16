# Firebase Migration Plan for React Attendance App

## Status: READY TO IMPLEMENT (User Confirmed)

### 1. ✅ Information Gathered (Complete)
- Current: Supabase client + custom demo auth
- Biometrics: Client-side simulation only
- Database: 7 tables (users, attendance, od_requests, etc.)
- Auth files analyzed: AuthContext.jsx, Login.jsx, supabase.js

### 2. Plan: File-by-file Firebase Integration
```
Phase 1: Setup & Auth (3 files)
- package.json → Add firebase, remove supabase
- src/lib/firebase.js → NEW Firebase config
- src/contexts/AuthContext.jsx → Firebase Auth

Phase 2: Database Hooks (4 files)
- src/lib/supabase.js → firebase.js (replace)
- src/hooks/useSupabase.jsx → useFirebase.jsx  
- Update attendance.jsx, odRequests.jsx, etc.

Phase 3: Components (3 files)
- src/pages/Login.jsx → Firebase signIn
- UserRegistrationForm.jsx → Firestore students
- ODForm.jsx → Firestore od_requests

Phase 4: Realtime + Biometrics (2 files)
- Realtime subscriptions → Firestore onSnapshot
- Face/Fingerprint → Already Firebase compatible
```

### 3. Dependent Files (12 total)
```
CRITICAL: src/lib/supabase.js, AuthContext.jsx, Login.jsx
HOOKS: useSupabase.jsx → useFirebase.jsx
COMPONENTS: ODForm.jsx, UserRegistrationForm.jsx
PAGES: All dashboards query via new hooks
```

### 4. Follow-up Steps
```
✅ Phase 1: Firebase installed, firebase.js created
[ ] Phase 2: Update AuthContext.jsx  
[ ] Phase 3: Convert hooks
[ ] Phase 4: Update components
[ ] Test full app: npm run dev
```

**Next Step:** Phase 1 - Package.json + Firebase config creation

**Approve to start editing?**

