import { Student, AttendanceRecord, StudentAttendance } from '../types/student';
import { attendanceApi, settingsApi, StudentWithAttendance, AttendanceRecordWithStudent } from '../lib/api';

// ===== TIMEZONE UTILITIES =====

// Hàm để lấy đối tượng Date theo múi giờ Hồ Chí Minh (GMT+7)
export function getCurrentDateObjectVN(): Date {
  // Lấy thời gian hiện tại theo múi giờ Hồ Chí Minh
  const vnTimeString = new Date().toLocaleString("sv-SE", {
    timeZone: "Asia/Ho_Chi_Minh"
  });
  return new Date(vnTimeString);
}

// Hàm chuyển đổi từ GMT+7 date string sang UTC Date object (để lưu database)
// Đặc biệt: Đối với @db.Date, cần lưu ngày UTC tương ứng với ngày VN
export function convertVNDateToUTC(vnDateString: string): Date {
  // vnDateString format: "YYYY-MM-DD"
  // Thay vì tạo midnight GMT+7 (gây shift sang ngày trước khi convert UTC),
  // chúng ta tạo midnight UTC của cùng ngày đó
  const utcDate = new Date(vnDateString + 'T00:00:00.000Z');
  return utcDate;
}

// Hàm lấy thời điểm hiện tại theo GMT+7 và convert sang UTC (để lưu attendance)
export function getCurrentVNTimeAsUTC(): Date {
  // Lấy thời gian hiện tại theo múi giờ GMT+7
  const now = new Date();
  const vnTimeString = now.toLocaleString("sv-SE", {
    timeZone: "Asia/Ho_Chi_Minh"
  });
  // Convert sang UTC với đúng thời gian hiện tại
  return new Date(vnTimeString + '+07:00');
}

// Hàm chuyển đổi từ UTC Date object sang GMT+7 date string (để hiển thị)
export function convertUTCDateToVN(utcDate: Date): string {
  // Chuyển đổi UTC date thành string YYYY-MM-DD 
  // Đối với @db.Date, UTC date đã được lưu như là ngày VN
  return utcDate.toISOString().split('T')[0];
}

// Hàm chuyển đổi danh sách attendance records từ UTC sang GMT+7
export function convertAttendanceRecordsToVN(records: AttendanceRecordWithStudent[]): AttendanceRecordWithStudent[] {
  return records.map(record => ({
    ...record,
    date: convertUTCDateToVN(new Date(record.date))
  }));
}

// Hàm để lấy ngày hiện tại theo múi giờ Hồ Chí Minh (GMT+7)
export function getCurrentDateVN(): string {
  // Sử dụng múi giờ Asia/Ho_Chi_Minh
  const vnTime = new Date().toLocaleString("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit", 
    day: "2-digit"
  });
  return vnTime; // Format: YYYY-MM-DD
}

// Hàm để lấy tháng hiện tại theo múi giờ Hồ Chí Minh (GMT+7)
export function getCurrentMonthVN(): string {
  // Sử dụng múi giờ Asia/Ho_Chi_Minh
  const vnTime = new Date().toLocaleString("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit"
  });
  return vnTime; // Format: YYYY-MM
}

// Hàm để đếm số buổi học trong tháng (đã đi học, không nghỉ)
export function countSessionsThisMonth(
  studentId: string, 
  attendanceRecords: AttendanceRecord[]
): number {
  const currentMonth = getCurrentMonthVN();
  const studentRecords = attendanceRecords.filter(record => 
    record.studentId === studentId && 
    record.date.startsWith(currentMonth) &&
    !record.isAbsent // Đếm những ngày KHÔNG nghỉ (tức là đi học)
  );
  return studentRecords.length;
}

// Hàm để đếm số buổi học trong tháng từ database records
export function countSessionsThisMonthFromDB(
  studentId: string, 
  attendanceRecords: AttendanceRecordWithStudent[]
): number {
  const currentMonth = getCurrentMonthVN();
  const studentRecords = attendanceRecords.filter(record => {
    const recordDate = new Date(record.date);
    const recordMonth = recordDate.toISOString().slice(0, 7); // YYYY-MM
    return record.studentId === studentId && 
           recordMonth === currentMonth &&
           !record.isAbsent; // Đếm những ngày KHÔNG nghỉ (tức là đi học)
  });
  return studentRecords.length;
}

// Hàm để kiểm tra xem học sinh có đi học hôm nay không
export function isPresentToday(
  studentId: string, 
  attendanceRecords: AttendanceRecord[]
): boolean {
  const today = getCurrentDateVN();
  const todayRecord = attendanceRecords.find(record => 
    record.studentId === studentId && record.date === today
  );
  // Trả về true nếu có record và KHÔNG nghỉ
  return todayRecord ? !todayRecord.isAbsent : false;
}

// Hàm để kiểm tra xem học sinh có đi học hôm nay không từ database records
export function isPresentTodayFromDB(
  studentId: string, 
  attendanceRecords: AttendanceRecordWithStudent[]
): boolean {
  const today = getCurrentDateVN();
  const todayRecord = attendanceRecords.find(record => {
    const recordDate = new Date(record.date);
    const recordDateString = recordDate.toISOString().split('T')[0];
    return record.studentId === studentId && recordDateString === today;
  });
  // Trả về true nếu có record và KHÔNG nghỉ
  return todayRecord ? !todayRecord.isAbsent : false;
}

// Hàm để kiểm tra xem có thể đánh dấu học không
export function canMarkPresent(
  studentId: string, 
  attendanceRecords: AttendanceRecord[]
): boolean {
  const today = getCurrentDateVN();
  const todayRecord = attendanceRecords.find(record => 
    record.studentId === studentId && record.date === today
  );
  
  // Có thể đánh dấu học nếu:
  // 1. Chưa có record nào cho hôm nay, hoặc
  // 2. Đã có record nhưng đang ở trạng thái nghỉ (để toggle thành học)
  return !todayRecord || todayRecord.isAbsent;
}

// Hàm để kiểm tra xem có thể đánh dấu học không từ database records
export function canMarkPresentFromDB(
  studentId: string, 
  attendanceRecords: AttendanceRecordWithStudent[]
): boolean {
  const today = getCurrentDateVN();
  const todayRecord = attendanceRecords.find(record => {
    const recordDate = new Date(record.date);
    const recordDateString = recordDate.toISOString().split('T')[0];
    return record.studentId === studentId && recordDateString === today;
  });
  
  // Có thể đánh dấu học nếu:
  // 1. Chưa có record nào cho hôm nay, hoặc
  // 2. Đã có record nhưng đang ở trạng thái nghỉ (để toggle thành học)
  return !todayRecord || todayRecord.isAbsent;
}

// Hàm để chuyển đổi từ Student[] thành StudentAttendance[]
export function convertToStudentAttendance(
  students: Student[], 
  attendanceRecords: AttendanceRecord[]
): StudentAttendance[] {
  return students.map(student => ({
    ...student,
    totalSessionsThisMonth: countSessionsThisMonth(student.id, attendanceRecords),
    isAbsentToday: isPresentToday(student.id, attendanceRecords), // Đổi logic: true = đã học
    canMarkAbsent: canMarkPresent(student.id, attendanceRecords) // Đổi logic: có thể đánh dấu học
  }));
}

// Hàm để chuyển đổi từ database students thành StudentAttendance[]
export function convertDBStudentsToStudentAttendance(
  students: StudentWithAttendance[]
): StudentAttendance[] {
  return students.map(student => ({
    id: student.id,
    name: student.name,
    totalSessionsThisMonth: countSessionsThisMonthFromDB(student.id, student.attendanceRecords),
    isAbsentToday: isPresentTodayFromDB(student.id, student.attendanceRecords),
    canMarkAbsent: canMarkPresentFromDB(student.id, student.attendanceRecords)
  }));
}

// Hàm để đánh dấu học (thay vì nghỉ) - sử dụng API
export async function markPresent(studentId: string): Promise<void> {
  const today = getCurrentDateVN();
  
  try {
    await attendanceApi.markAttendance(studentId, today, false); // false = không nghỉ = đi học
  } catch (error) {
    console.error('Error marking student present:', error);
    throw error;
  }
}

// Hàm để đánh dấu nghỉ học - sử dụng API
export async function markAbsent(studentId: string): Promise<void> {
  const today = getCurrentDateVN();
  
  try {
    await attendanceApi.markAttendance(studentId, today, true); // true = nghỉ học
  } catch (error) {
    console.error('Error marking student absent:', error);
    throw error;
  }
}

// Hàm tính học phí (legacy - nên sử dụng calculateTuitionFeeFromDB)
export function calculateTuitionFee(
  studentId: string,
  attendanceRecords: AttendanceRecord[],
  dailyFee?: number
): number {
  console.warn('calculateTuitionFee is deprecated. Use calculateTuitionFeeFromDB for accurate pricing.');
  
  let fee = dailyFee;
  
  // Nếu không truyền dailyFee, sử dụng default
  if (fee === undefined) {
    fee = 70000; // Default daily fee
  }
  
  const sessionsThisMonth = countSessionsThisMonth(studentId, attendanceRecords);
  return sessionsThisMonth * fee;
}

// Hàm tính học phí từ database records (sử dụng dailyFee trong từng record)
export function calculateTuitionFeeFromDB(
  studentId: string,
  attendanceRecords: AttendanceRecordWithStudent[]
): number {
  const currentMonth = getCurrentMonthVN();
  const studentRecords = attendanceRecords.filter(record => {
    const recordDate = new Date(record.date);
    const recordMonth = recordDate.toISOString().slice(0, 7); // YYYY-MM
    return record.studentId === studentId && 
           recordMonth === currentMonth &&
           !record.isAbsent; // Đếm những ngày KHÔNG nghỉ (tức là đi học)
  });
  
  // Tính tổng tiền dựa trên dailyFee của từng record
  return studentRecords.reduce((total, record) => total + record.dailyFee, 0);
}

// Hàm lấy giá tiền từ API settings
export async function getDailyFeeFromAPI(): Promise<number> {
  try {
    return await settingsApi.getDailyFee();
  } catch (error) {
    console.error('Error fetching daily fee from API:', error);
    return 70000; // Fallback to default
  }
}