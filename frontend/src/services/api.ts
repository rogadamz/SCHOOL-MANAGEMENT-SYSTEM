// frontend/src/services/api.ts
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
  date_of_birth: string;
  admission_number: string;
  parent_id: number;
}

export interface Teacher {
  id: number;
  specialization: string;
  user_id: number;
  user?: User;
}

export interface Parent {
  id: number;
  username: string;
  email: string;
  full_name: string;
  children: Student[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
}

export interface Fee {
  id: number;
  student_id: number;
  amount: number;
  description: string;
  due_date: string;
  paid: number;
  status: string;
  term: string;
  academic_year: string;
  student_name?: string;
}

export interface DashboardSummary {
  student_count: number;
  teacher_count: number;
  parent_count: number;
  class_count: number;
  financial_summary: {
    total_amount: number;
    total_paid: number;
    total_balance: number;
    payment_rate: number;
  };
  attendance_today: {
    present: number;
    absent: number;
    late: number;
    excused: number;
    total: number;
    rate: number;
  };
  recent_events: Array<any>;
  latest_messages: Array<any>;
  resource_count: number;
}

export interface CalendarDaySummary {
  date: string;
  attendance: {
    present: number;
    absent: number;
    late: number;
    excused: number;
    total: number;
    rate: number;
  };
  events: Array<any>;
  fees: {
    collected: number;
    pending: number;
  };
  has_data: boolean;
}

export interface FeeSummary {
  total_amount: number;
  total_paid: number;
  total_balance: number;
  payment_rate: number;
  student_count: number;
  paid_count: number;
  partial_count: number;
  unpaid_count: number;
}

export interface FeeChartData {
  monthly_collection: Array<{month: string; amount: number}>;
  status_distribution: Array<{status: string; count: number}>;
}

export interface ClassData {
  id: number;
  name: string;
  grade_level: string;
  teacher_id: number;
  teacher?: Teacher;
  students?: Student[];
  student_count?: number;
}

export interface ReportCard {
  id: number;
  student_id: number;
  term: string;
  academic_year: string;
  issue_date: string;
  teacher_comments: string;
  principal_comments?: string;
  attendance_summary: string;
  grade_summaries: Array<any>;
}

// Dashboard API functions
export const dashboardApi = {
  // Dashboard summary endpoint
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    const response = await api.get('/dashboard/summary');
    return response.data;
  },

  getCalendarDaySummary: async (date: string): Promise<CalendarDaySummary> => {
    const response = await api.get(`/dashboard/calendar-day?day_date=${date}`);
    return response.data;
  },

  getEvents: async (startDate?: string, endDate?: string, eventType?: string): Promise<any[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (eventType) params.append('event_type', eventType);
    
    const response = await api.get(`/dashboard/events?${params.toString()}`);
    return response.data;
  },

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
  getStudents: async (search?: string): Promise<Student[]> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    
    const response = await api.get(`/students?${params.toString()}`);
    return response.data;
  },

  getStudent: async (studentId: number): Promise<Student> => {
    const response = await api.get(`/students/${studentId}`);
    return response.data;
  },

  createStudent: async (student: Partial<Student>): Promise<Student> => {
    const response = await api.post('/students', student);
    return response.data;
  },

  updateStudent: async (studentId: number, student: Partial<Student>): Promise<Student> => {
    const response = await api.put(`/students/${studentId}`, student);
    return response.data;
  },

  deleteStudent: async (studentId: number): Promise<void> => {
    await api.delete(`/students/${studentId}`);
  },

  // Teacher endpoints
  getTeachers: async (search?: string): Promise<Teacher[]> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    
    const response = await api.get(`/teachers?${params.toString()}`);
    return response.data;
  },

  getTeacher: async (teacherId: number): Promise<Teacher> => {
    const response = await api.get(`/teachers/${teacherId}`);
    return response.data;
  },

  createTeacher: async (teacher: Partial<Teacher>): Promise<Teacher> => {
    const response = await api.post('/teachers', teacher);
    return response.data;
  },

  updateTeacher: async (teacherId: number, teacher: Partial<Teacher>): Promise<Teacher> => {
    const response = await api.put(`/teachers/${teacherId}`, teacher);
    return response.data;
  },

  deleteTeacher: async (teacherId: number): Promise<void> => {
    await api.delete(`/teachers/${teacherId}`);
  },

  // Parent (User with role=parent) endpoints
  getParents: async (search?: string): Promise<User[]> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('role', 'parent');
    
    const response = await api.get(`/auth/users?${params.toString()}`);
    return response.data;
  },

  getParent: async (parentId: number): Promise<User> => {
    const response = await api.get(`/auth/users/${parentId}`);
    return response.data;
  },

  createParent: async (parent: Partial<User>): Promise<User> => {
    const userData = {
      ...parent,
      role: 'parent'
    };
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  updateParent: async (parentId: number, parent: Partial<User>): Promise<User> => {
    const response = await api.put(`/auth/users/${parentId}`, parent);
    return response.data;
  },

  deleteParent: async (parentId: number): Promise<void> => {
    await api.delete(`/auth/users/${parentId}`);
  },

  // Fee endpoints
  getFees: async (): Promise<Fee[]> => {
    const response = await api.get('/fees/all');
    return response.data;
  },

  getStudentFees: async (studentId: number): Promise<Fee[]> => {
    const response = await api.get(`/fees/${studentId}`);
    return response.data;
  },

  createFee: async (studentId: number, fee: Partial<Fee>): Promise<Fee> => {
    const response = await api.post(`/fees/${studentId}`, fee);
    return response.data;
  },

  updateFee: async (feeId: number, fee: Partial<Fee>): Promise<Fee> => {
    const response = await api.put(`/fees/${feeId}`, fee);
    return response.data;
  },
  
  getFeeSummary: async (): Promise<FeeSummary> => {
    const response = await api.get('/financial/summary');
    return response.data;
  },
  
  getFeeChartData: async (): Promise<FeeChartData> => {
    const response = await api.get('/financial/chart-data');
    return response.data;
  },

  // Class endpoints
  getClasses: async (): Promise<ClassData[]> => {
    const response = await api.get('/classes');
    return response.data;
  },

  getClass: async (classId: number): Promise<ClassData> => {
    const response = await api.get(`/classes/${classId}`);
    return response.data;
  },

  // Report Card endpoints
  getStudentReportCards: async (studentId: number, term?: string, academicYear?: string): Promise<ReportCard[]> => {
    const params = new URLSearchParams();
    if (term) params.append('term', term);
    if (academicYear) params.append('academic_year', academicYear);
    
    const response = await api.get(`/report-cards/${studentId}?${params.toString()}`);
    return response.data;
  }
};

export default api;