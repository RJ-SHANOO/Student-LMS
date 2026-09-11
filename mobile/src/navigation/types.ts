export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Attendance: undefined;
  Scan: undefined;
  Selfie: { qrToken: string; latitude: number; longitude: number };
  Tasks: undefined;
  InstructorTasks: undefined;
  AssignTask: undefined;
  TaskRoster: { taskId: string };
  Settings: undefined;
  AttendanceHistory: undefined;
};
