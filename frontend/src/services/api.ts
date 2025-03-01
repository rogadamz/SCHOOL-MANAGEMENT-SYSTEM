// src/services/api.ts
import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Define types
export interface GradeData {
  grade: string;
  count: number;
}

export interface AttendanceData {
  date: string;
  present: number;
  absent: number;
}

export interface PerformanceData {
  subject: string;
  month: string;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
}

export interface AttendancePatternData {
  name: string;
  value: number;
}

export interface SubjectData {
  subject: string;
  average: number;
  classAverage: number;
}

export interface Student {
  id: number;
  first_name: string;
  last_name: string;
  admission_number: string;
}

export interface AttendanceRecord {
  id?: number;
  student_id: number;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  student_name?: string;
}
export interface DashboardStats {
  studentCount: number;
  teacherCount: number;
  parentCount: number;
  librarianCount: number;
  accountantCount: number;
  enquiryCount: number;
  messageCount: number;
  attendanceToday: number;
  totalStudents: number;
}

// Dashboard API functions
export const dashboardApi = {
  // Analytics endpoints
  getGradeDistribution: async (): Promise<GradeData[]> => {
    const response = await api.get('/analytics/grade-distribution');
    return response.data;
  },

  getAttendanceData: async (): Promise<AttendanceData[]> => {
    const response = await api.get('/analytics/attendance-data');
    return response.data;
  },

  getPerformanceData: async (): Promise<PerformanceData[]> => {
    const response = await api.get('/analytics/performance-trends');
    return response.data;
  },

  getAttendancePatterns: async (): Promise<AttendancePatternData[]> => {
    const response = await api.get('/analytics/attendance-patterns');
    return response.data;
  },

  getSubjectComparison: async (): Promise<SubjectData[]> => {
    const response = await api.get('/analytics/subject-comparison');
    return response.data;
  },

  // Student endpoints
  getStudents: async (
    search?: string,
    gradeLevel?: number,
    classSection?: string
  ): Promise<Student[]> => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (gradeLevel) params.append('grade_level', gradeLevel.toString());
      if (classSection) params.append('class_section', classSection);
  
      const query = params.toString() ? `?${params.toString()}` : '';
      
      // Log the request URL for debugging
      console.log(`Requesting: ${BASE_URL}/students${query}`);
      
      const response = await api.get(`/students${query}`);
      console.log("Student API response:", response.data);
      
      // If the API returns an object with items property, extract it
      if (response.data && response.data.items) {
        return response.data.items;
      }
      
      // If API returns array directly
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      // Return empty array if no valid data format
      console.warn("Unexpected students data format:", response.data);
      return [];
    } catch (error) {
      console.error("Error in getStudents API call:", error);
      throw error;
    }
  },
  getStudentCount: async (): Promise<number> => {
    try {
      // Try specific count endpoint first
      try {
        const response = await api.get('/students/count');
        return response.data.count || 0;
      } catch (e) {
        // Fall back to counting all students
        const students = await api.get('/students');
        if (Array.isArray(students.data)) {
          return students.data.length;
        } else if (students.data && Array.isArray(students.data.items)) {
          return students.data.items.length;
        }
        return 0;
      }
    } catch (error) {
      console.error("Error getting student count:", error);
      return 0;
    }
  },
  getStudent: async (studentId: string): Promise<Student> => {
    const response = await api.get(`/students/${studentId}`);
    return response.data;
  },
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/analytics/dashboard-stats');
    return response.data;
  },
  
  getAttendanceSummary: async (date: string): Promise<{ present: number, total: number }> => {
    const response = await api.get(`/analytics/attendance-summary?date=${date}`);
    return response.data;
  },

  createStudent: async (student: Omit<Student, 'id'>): Promise<Student> => {
    const response = await api.post('/students', student);
    return response.data;
  },

  updateStudent: async (studentId: string, student: Partial<Student>): Promise<Student> => {
    const response = await api.put(`/students/${studentId}`, student);
    return response.data;
  },

  deleteStudent: async (studentId: string): Promise<void> => {
    await api.delete(`/students/${studentId}`);
  },

  // Attendance endpoints
  getStudentsByClass: async (classId: number): Promise<Student[]> => {
    const response = await api.get(`/attendance/classes/${classId}/students`);
    return response.data;
  },

  getAttendanceRecords: async (date: string, classId: number): Promise<AttendanceRecord[]> => {
    const response = await api.get(`/attendance?date=${date}&class_id=${classId}`);
    return response.data;
  },

  getAttendanceHistory: async (classId: number, startDate?: string, endDate?: string): Promise<AttendanceRecord[]> => {
    let url = `/attendance/history?class_id=${classId}`;
    if (startDate) url += `&start_date=${startDate}`;
    if (endDate) url += `&end_date=${endDate}`;
    const response = await api.get(url);
    return response.data;
  },

  saveAttendanceRecord: async (record: AttendanceRecord): Promise<AttendanceRecord> => {
    // If record has ID, update; otherwise create
    if (record.id) {
      const response = await api.put(`/attendance/${record.id}`, record);
      return response.data;
    } else {
      const response = await api.post('/attendance', record);
      return response.data;
    }
  },

  saveAttendanceRecords: async (records: AttendanceRecord[]): Promise<AttendanceRecord[]> => {
    const response = await api.post('/attendance/batch', records);
    return response.data;
  }
};

export default api;