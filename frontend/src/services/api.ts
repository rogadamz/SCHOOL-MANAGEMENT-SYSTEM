// src/services/api.ts - Comprehensive API service
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

// Define interfaces for all database tables
export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: 'admin' | 'teacher' | 'parent';
  is_active: boolean;
}

export interface Teacher {
  id: number;
  user_id: number;
  specialization: string;
  user?: User;
  classes?: Class[];
}

export interface Class {
  id: number;
  name: string;
  grade_level: string;
  teacher_id: number;
  teacher?: Teacher;
  students?: Student[];
}

export interface Student {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  admission_number: string;
  parent_id: number;
  classes?: Class[];
  grades?: Grade[];
  attendance?: Attendance[];
  fees?: Fee[];
  parent?: User;
}

export interface Grade {
  id: number;
  student_id: number;
  subject: string;
  score: number;
  grade_letter: string;
  term: string;
  date_recorded: string;
  student?: Student;
}

export interface Attendance {
  id: number;
  student_id: number;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  student?: Student;
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
  student?: Student;
}

export interface DashboardStats {
  studentCount: number;
  teacherCount: number;
  parentCount: number;
  classCount: number;
  financialSummary: {
    totalAmount: number;
    totalPaid: number;
    totalBalance: number;
    paymentRate: number;
  };
  attendanceToday: {
    present: number;
    absent: number;
    late: number;
    excused: number;
    total: number;
    rate: number;
  };
}

// Comprehensive API service
export const dashboardApi = {
  // Authentication
  login: async (username: string, password: string): Promise<{ token: string; user: User }> => {
    try {
      const response = await api.post('/auth/token', {
        username,
        password,
      });
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  // Dashboard summary
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const response = await api.get('/analytics/dashboard-stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // User management
  getUsers: async (role?: string): Promise<User[]> => {
    try {
      const params = role ? `?role=${role}` : '';
      const response = await api.get(`/users${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Teacher management
  getTeachers: async (): Promise<Teacher[]> => {
    try {
      const response = await api.get('/teachers');
      return response.data;
    } catch (error) {
      console.error('Error fetching teachers:', error);
      throw error;
    }
  },

  getTeacherById: async (id: number): Promise<Teacher> => {
    try {
      const response = await api.get(`/teachers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching teacher ${id}:`, error);
      throw error;
    }
  },

  // Class management
  getClasses: async (): Promise<Class[]> => {
    try {
      const response = await api.get('/classes');
      return response.data;
    } catch (error) {
      console.error('Error fetching classes:', error);
      throw error;
    }
  },

  getClassById: async (id: number): Promise<Class> => {
    try {
      const response = await api.get(`/classes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching class ${id}:`, error);
      throw error;
    }
  },

  // Student management
  getStudents: async (
    search?: string,
    classId?: number,
    parentId?: number
  ): Promise<Student[]> => {
    try {
      let url = '/students';
      const params = new URLSearchParams();
      
      if (search) params.append('search', search);
      if (classId) params.append('class_id', classId.toString());
      if (parentId) params.append('parent_id', parentId.toString());
      
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;
      
      const response = await api.get(url);
      
      // Handle different response formats
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.items)) {
        return response.data.items;
      } else if (response.data && typeof response.data === 'object') {
        return [response.data];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  },

  getStudentById: async (id: number): Promise<Student> => {
    try {
      const response = await api.get(`/students/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching student ${id}:`, error);
      throw error;
    }
  },

  // Grade management
  getGrades: async (
    studentId?: number,
    term?: string,
    subject?: string
  ): Promise<Grade[]> => {
    try {
      let url = '/grades';
      const params = new URLSearchParams();
      
      if (studentId) params.append('student_id', studentId.toString());
      if (term) params.append('term', term);
      if (subject) params.append('subject', subject);
      
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;
      
      const response = await api.get(url);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching grades:', error);
      throw error;
    }
  },

  // Attendance management
  getAttendance: async (
    date?: string,
    classId?: number,
    studentId?: number
  ): Promise<Attendance[]> => {
    try {
      let url = '/attendance';
      const params = new URLSearchParams();
      
      if (date) params.append('date', date);
      if (classId) params.append('class_id', classId.toString());
      if (studentId) params.append('student_id', studentId.toString());
      
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;
      
      const response = await api.get(url);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching attendance:', error);
      throw error;
    }
  },

  getAttendanceSummary: async (date: string): Promise<{
    present: number;
    absent: number;
    late: number;
    excused: number;
    total: number;
    rate: number;
  }> => {
    try {
      const response = await api.get(`/analytics/attendance-summary?date=${date}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching attendance summary for ${date}:`, error);
      throw error;
    }
  },

  // Fee management
  getAllFees: async (): Promise<Fee[]> => {
    try {
      const response = await api.get('/fees/all');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching all fees:', error);
      throw error;
    }
  },

  getStudentFees: async (studentId: number): Promise<Fee[]> => {
    try {
      const response = await api.get(`/fees/${studentId}`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error(`Error fetching fees for student ${studentId}:`, error);
      throw error;
    }
  },

  getFeeSummary: async (): Promise<{
    totalAmount: number;
    totalPaid: number;
    totalBalance: number;
    paymentRate: number;
  }> => {
    try {
      const response = await api.get('/fees/summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching fee summary:', error);
      throw error;
    }
  },

  // Fee Charts data
  getFeeChartData: async (): Promise<{
    monthlyCollection: Array<{ month: string; amount: number }>;
    statusDistribution: Array<{ status: string; count: number }>;
  }> => {
    try {
      const response = await api.get('/fees/chart-data');
      return response.data;
    } catch (error) {
      console.error('Error fetching fee chart data:', error);
      
      // Return fallback data
      return {
        monthlyCollection: [
          { month: 'Jan', amount: 1800 },
          { month: 'Feb', amount: 2200 },
          { month: 'Mar', amount: 1900 },
          { month: 'Apr', amount: 2400 },
          { month: 'May', amount: 1200 }
        ],
        statusDistribution: [
          { status: 'Paid', count: 35 },
          { status: 'Pending', count: 12 },
          { status: 'Overdue', count: 8 }
        ]
      };
    }
  }
};

export default api;