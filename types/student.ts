export interface Student {
  id: string;
  name: string;
  totalSessionsThisMonth: number;
}

export interface AttendanceRecord {
  studentId: string;
  date: string; // Format: YYYY-MM-DD
  isAbsent: boolean;
}

export interface StudentAttendance extends Student {
  isAbsentToday: boolean;
  canMarkAbsent: boolean; // Để kiểm tra xem có thể đánh dấu nghỉ không
}

export interface AppSettings {
  dailyFee: number;
  lastUpdated: string;
}