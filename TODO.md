# BLE Attendance Integration Tasks

## Information Gathered
- React app with Supabase backend
- Existing attendance system uses GPS + face recognition
- useAttendance hook handles marking attendance
- StudentDashboard has "Mark Attendance" button
- Need to integrate Web Bluetooth API for BLE beacon detection

## Plan
- [x] Create useBLEAttendance hook for BLE scanning logic
- [x] Update useAttendance hook to support beaconId parameter
- [x] Modify StudentDashboard to add BLE attendance option
- [x] Add UI components for BLE scanning status
- [x] Handle Web Bluetooth API permissions and browser compatibility

## Dependent Files to be edited
- [x] src/hooks/attendance.jsx - Add beaconId support
- [x] src/pages/StudentDashboard.jsx - Add BLE button and logic
- [x] src/hooks/useBLEAttendance.jsx - New hook for BLE functionality

## Followup steps
- [x] Simplified to BLE + Face only (removed GPS option)
- [x] Added BLE beacon broadcasting for teachers
- [ ] Test in Chrome/Edge browser (Web Bluetooth supported)
- [ ] Handle permission denied scenarios
- [ ] Add error handling for unsupported browsers
- [ ] Update database schema if beacon_id column needed
- [ ] Run the app and verify BLE functionality
- [x] Test teacher beacon broadcasting and student detection
- [x] Implement localStorage-based beacon simulation for demo purposes
- [x] Update error messages to reflect simulation mode
