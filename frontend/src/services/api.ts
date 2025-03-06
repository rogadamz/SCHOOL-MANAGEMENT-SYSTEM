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
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  gradeLevel: number;
  classSection: string;
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
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (gradeLevel) params.append('grade_level', gradeLevel.toString());
    if (classSection) params.append('class_section', classSection);

    const response = await api.get(`/students?${params.toString()}`);
    return response.data.items;
  },

  getStudent: async (studentId: string): Promise<Student> => {
    const response = await api.get(`/students/${studentId}`);
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
  }
};

export default api;