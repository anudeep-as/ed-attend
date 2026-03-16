import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, where, doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp, orderBy, limit } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCCWJtizaPjhKkzu7c7hC8Lauk9ioGbAns",
  authDomain: "ed-attendance.firebaseapp.com",
  projectId: "ed-attendance",
  storageBucket: "ed-attendance.firebasestorage.app",
  messagingSenderId: "423002237315",
  appId: "1:423002237315:web:f337625db42d636acb6eb6",
  measurementId: "G-XRMZNVPTST"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Auth helpers (mirror Supabase structure)
export const authHelpers = {
  signUp: async (email, password, userData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Save profile to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        ...userData,
        uid: user.uid,
        email,
        role: userData.role || 'student',
        created_at: serverTimestamp()
      });
      
      return { data: { user: { uid: user.uid, email, ...userData, role: userData.role || 'student' } }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  signIn: async (email, password) => {
    try {
      // Demo credentials first (keep existing logic)
      const demoUsers = {
        'student@edattend.com': { uid: 'demo-student', role: 'student', name: 'Demo Student', email: 'student@edattend.com', password: 'demo123' },
        'teacher@edattend.com': { uid: 'demo-teacher', role: 'teacher', name: 'Demo Teacher', email: 'teacher@edattend.com', password: 'demo123' },
        'admin@edattend.com': { uid: 'demo-admin', role: 'admin', name: 'Demo Admin', email: 'admin@edattend.com', password: 'demo123' }
      };

      if (demoUsers[email] && demoUsers[email].password === password) {
        return { data: { user: demoUsers[email] }, error: null };
      }

      // Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get profile from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        return { data: { user: { uid: user.uid, ...userDoc.data() } }, error: null };
      }
      
      throw new Error('User profile not found');
    } catch (error) {
      return { data: null, error };
    }
  },

  signOut: async () => {
    try {
      await signOut(auth);
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  getCurrentUser: async () => {
    const user = auth.currentUser;
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        return { user: { uid: user.uid, ...userDoc.data() }, error: null };
      }
    }
    return { user: null, error: null };
  }
};

// Database helpers (mirror Supabase dbHelpers)
export const dbHelpers = {
  // Users
  getUserByEmail: async (email) => {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const userDoc = snapshot.docs[0];
      return { data: userDoc.data(), error: null };
    }
    return { data: null, error: 'User not found' };
  },

  updateUserPoints: async (userId, points) => {
    try {
      await updateDoc(doc(db, 'users', userId), { points });
      return { data: true, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Attendance
  markAttendance: async (attendanceData) => {
    return await addDoc(collection(db, 'attendance'), {
      ...attendanceData,
      timestamp: serverTimestamp()
    });
  },

  getStudentAttendance: async (studentId, startDate, endDate) => {
    let q = query(
      collection(db, 'attendance'), 
      where('student_id', '==', studentId),
      orderBy('timestamp', 'desc')
    );
    
    // Firestore date range queries need timestamp conversion
    if (startDate || endDate) {
      console.warn('Date range filtering client-side for demo');
      const snapshot = await getDocs(q);
      let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (startDate) data = data.filter(item => item.date >= startDate);
      if (endDate) data = data.filter(item => item.date <= endDate);
      return { data, error: null };
    }
    
    const snapshot = await getDocs(q);
    return { data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })), error: null };
  },

  // OD Requests
  createODRequest: async (odData) => {
    return await addDoc(collection(db, 'od_requests'), {
      ...odData,
      timestamp: serverTimestamp()
    });
  },

  getODRequests: async (filters = {}) => {
    let q = query(collection(db, 'od_requests'), orderBy('timestamp', 'desc'));
    
    if (filters.status) q = query(q, where('status', '==', filters.status));
    if (filters.student_id) q = query(q, where('student_id', '==', filters.student_id));
    
    const snapshot = await getDocs(q);
    return { data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })), error: null };
  },

  updateODRequest: async (id, updates) => {
    try {
      await updateDoc(doc(db, 'od_requests', id), updates);
      return { data: true, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Leaderboard
  getLeaderboard: async (limit = 10) => {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'student'),
      orderBy('points', 'desc'),
      limit(limit)
    );
    const snapshot = await getDocs(q);
    return { data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })), error: null };
  },

  // Realtime subscriptions
  subscribeToAttendance: (callback) => {
    return onSnapshot(collection(db, 'attendance'), (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  },

  subscribeToODRequests: (callback) => {
    return onSnapshot(collection(db, 'od_requests'), (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }
};

export default { auth, db, authHelpers, dbHelpers };

