// API utility functions for database operations

// Types for API responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface StudentWithAttendance {
  id: string;
  name: string;
  deletedAt: string | null; // Soft delete field
  createdAt: string;
  updatedAt: string;
  attendanceRecords: AttendanceRecordWithStudent[];
}

export interface AttendanceRecordWithStudent {
  id: string;
  studentId: string;
  date: string;
  isAbsent: boolean;
  dailyFee: number; // Giá tiền tại thời điểm điểm danh
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    name: string;
  };
}

export interface AppSettings {
  [key: string]: string;
}

// Students API
export const studentsApi = {
  // Lấy tất cả học sinh
  async getAll(): Promise<StudentWithAttendance[]> {
    const response = await fetch('/api/students');
    const result: ApiResponse<StudentWithAttendance[]> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch students');
    }
    
    return result.data || [];
  },

  // Lấy một học sinh theo ID
  async getById(id: string): Promise<StudentWithAttendance> {
    const response = await fetch(`/api/students/${id}`);
    const result: ApiResponse<StudentWithAttendance> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch student');
    }
    
    if (!result.data) {
      throw new Error('Student not found');
    }
    
    return result.data;
  },

  // Tạo học sinh mới
  async create(name: string): Promise<StudentWithAttendance> {
    const response = await fetch('/api/students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });
    
    const result: ApiResponse<StudentWithAttendance> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create student');
    }
    
    if (!result.data) {
      throw new Error('No data returned from create student');
    }
    
    return result.data;
  },

  // Cập nhật tên học sinh
  async updateName(id: string, name: string): Promise<StudentWithAttendance> {
    const response = await fetch(`/api/students/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });
    
    const result: ApiResponse<StudentWithAttendance> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update student');
    }
    
    if (!result.data) {
      throw new Error('No data returned from update student');
    }
    
    return result.data;
  },

  // Xóa học sinh
  async delete(id: string): Promise<void> {
    const response = await fetch(`/api/students/${id}`, {
      method: 'DELETE',
    });
    
    const result: ApiResponse<void> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete student');
    }
  },
};

// Attendance API
export const attendanceApi = {
  // Lấy bản ghi điểm danh
  async getRecords(params?: {
    studentId?: string;
    month?: string; // YYYY-MM
    date?: string; // YYYY-MM-DD
  }): Promise<AttendanceRecordWithStudent[]> {
    const searchParams = new URLSearchParams();
    
    if (params?.studentId) {
      searchParams.append('studentId', params.studentId);
    }
    if (params?.month) {
      searchParams.append('month', params.month);
    }
    if (params?.date) {
      searchParams.append('date', params.date);
    }
    
    const response = await fetch(`/api/attendance?${searchParams.toString()}`);
    const result: ApiResponse<AttendanceRecordWithStudent[]> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch attendance records');
    }
    
    return result.data || [];
  },

  // Đánh dấu học/nghỉ
  async markAttendance(
    studentId: string,
    date: string,
    isAbsent: boolean
  ): Promise<AttendanceRecordWithStudent> {
    const response = await fetch('/api/attendance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentId,
        date,
        isAbsent,
      }),
    });
    
    const result: ApiResponse<AttendanceRecordWithStudent> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to mark attendance');
    }
    
    if (!result.data) {
      throw new Error('No data returned from mark attendance');
    }
    
    return result.data;
  },
};

// Settings API
export const settingsApi = {
  // Lấy tất cả settings
  async getAll(): Promise<AppSettings> {
    const response = await fetch('/api/settings');
    const result: ApiResponse<AppSettings> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch settings');
    }
    
    return result.data || {};
  },

  // Cập nhật setting
  async updateSetting(
    key: string,
    value: string,
    description?: string
  ): Promise<void> {
    const response = await fetch('/api/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key,
        value,
        description,
      }),
    });
    
    const result: ApiResponse<void> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update setting');
    }
  },

  // Get daily fee
  async getDailyFee(): Promise<number> {
    const settings = await this.getAll();
    const dailyFee = settings.daily_fee;
    return dailyFee ? parseInt(dailyFee, 10) : 70000;
  },

  // Update daily fee
  async updateDailyFee(amount: number): Promise<void> {
    await this.updateSetting(
      'daily_fee',
      amount.toString(),
      'Học phí hàng ngày (VND)'
    );
  },
};