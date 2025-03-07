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

// Add response interceptor to handle errors
api.interceptors.response.use(
  response => response,
  error => {
    // Handle token expiration
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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
  class_id?: number;
  class_name?: string;
}

export interface Teacher {
  id: number;
  specialization: string;
  user_id: number;
  user?: User;
  classes?: ClassData[];
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

export interface PaymentDue {
  id: number;
  student_name: string;
  student_id: number;
  amount: number;
  balance: number;
  description: string;
  due_date: string;
  days_left: number;
  term?: string;
  academic_year?: string;
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
  recent_events: Array<Event>;
  latest_messages: Array<Message>;
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
  events: Array<Event>;
  fees: {
    collected: number;
    pending: number;
  };
  has_data: boolean;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string | null;
  all_day: boolean;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  event_type: string;
  creator_name: string;
}

export interface Message {
  id: number;
  subject: string;
  content: string;
  sent_at: string;
  read: boolean;
  sender_name: string;
  recipient_name: string;
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
  grade_summaries: Array<GradeSummary>;
}

export interface GradeSummary {
  id: number;
  subject: string;
  score: number;
  grade_letter: string;
  teacher_id: number;
  comments: string;
}

export interface TimeSlot {
  id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  class_id: number;
  subject: string;
  teacher_id: number;
}

export interface Attendance {
  id: number;
  student_id: number;
  date: string;
  status: string;
  student_name?: string;
}

export interface ClassAttendance {
  class_id: number;
  class_name: string;
  attendance_rate: number;
  student_count: number;
  present_count: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  role: string;
}

// API service functions organized by domain

// Auth API functions
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    const response = await axios.post(`${BASE_URL}/auth/token`, formData);
    return response.data;
  },
  
  register: async (user: Partial<User>): Promise<User> => {
    const response = await api.post('/auth/register', user);
    return response.data;
  },
  
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// Dashboard API functions
export const dashboardApi = {
  // Dashboard summary endpoint
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    try {
      const response = await api.get('/dashboard/summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      
      // Return mock data if API fails
      return {
        student_count: 120,
        teacher_count: 15,
        parent_count: 95,
        class_count: 8,
        financial_summary: {
          total_amount: 180000,
          total_paid: 135000,
          total_balance: 45000,
          payment_rate: 75.0
        },
        attendance_today: {
          present: 105,
          absent: 10,
          late: 5,
          excused: 0,
          total: 120,
          rate: 87.5
        },
        recent_events: [
          {
            id: 1,
            title: "Parent-Teacher Meeting",
            description: "Regular quarterly parent-teacher meeting",
            start_date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
            end_date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
            all_day: true,
            start_time: null,
            end_time: null,
            location: "School Hall",
            event_type: "meeting",
            creator_name: "Admin"
          },
          {
            id: 2,
            title: "End of Term Assessment",
            description: "Final assessment for Term 1",
            start_date: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(),
            end_date: new Date(new Date().setDate(new Date().getDate() + 16)).toISOString(),
            all_day: false,
            start_time: "09:00",
            end_time: "12:00",
            location: "Classrooms",
            event_type: "academic",
            creator_name: "Academic Head"
          }
        ],
        latest_messages: [
          {
            id: 1,
            subject: "Term Calendar",
            content: "Please find attached the updated term calendar with holiday dates",
            sent_at: new Date(new Date().setHours(new Date().getHours() - 2)).toISOString(),
            read: false,
            sender_name: "Admin",
            recipient_name: "All Staff"
          }
        ],
        resource_count: 45
      };
    }
  },

  getCalendarDaySummary: async (date: string): Promise<CalendarDaySummary> => {
    try {
      const response = await api.get(`/dashboard/calendar-day?day_date=${date}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching calendar day summary for ${date}:`, error);
      
      // Return mock data if API fails
      const dayInMonth = new Date(date).getDate();
      return {
        date: date,
        attendance: {
          present: 105 - (dayInMonth % 10),  // Vary slightly by day
          absent: 5 + (dayInMonth % 10),
          late: 3,
          excused: 2,
          total: 120,
          rate: Math.min(100, Math.max(50, 95 - (dayInMonth % 10)))  // Between 85-95%
        },
        events: dayInMonth % 7 === 0 ? [{
          id: 1,
          title: "School Assembly",
          description: "Weekly school assembly",
          start_date: date, // Add missing required properties
          end_date: date,
          all_day: false,
          start_time: "08:30", // Add missing required properties
          end_time: "09:15",  
          location: "School Hall", // Add missing required properties
          event_type: "activity",
          creator_name: "Admin"
        }] : [],
        fees: {
          collected: 1000 + (dayInMonth * 50),  // More collection later in month
          pending: Math.max(0, 3000 - (1000 + (dayInMonth * 50)))
        },
        has_data: true
      };
    }
  },

  getEvents: async (startDate?: string, endDate?: string, eventType?: string): Promise<Event[]> => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (eventType) params.append('event_type', eventType);
      
      const response = await api.get(`/dashboard/events?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      
      // Return mock data if API fails
      return [
        {
          id: 1,
          title: "Parent-Teacher Meeting",
          description: "Regular quarterly parent-teacher meeting",
          start_date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
          end_date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
          all_day: true,
          start_time: null,
          end_time: null,
          location: "School Hall",
          event_type: "meeting",
          creator_name: "Admin"
        },
        {
          id: 2,
          title: "End of Term Assessment",
          description: "Final assessment for Term 1",
          start_date: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(),
          end_date: new Date(new Date().setDate(new Date().getDate() + 16)).toISOString(),
          all_day: false,
          start_time: "09:00",
          end_time: "12:00",
          location: "Classrooms",
          event_type: "academic",
          creator_name: "Academic Head"
        }
      ];
    }
  },

  // Analytics endpoints
  getGradeDistribution: async (classId?: number, subject?: string): Promise<GradeData[]> => {
    try {
      const params = new URLSearchParams();
      if (classId) params.append('class_id', classId.toString());
      if (subject) params.append('subject', subject);
      
      const response = await api.get(`/analytics/grade-distribution?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching grade distribution:', error);
      
      // Return mock data if API fails
      return [
        { grade: 'A', count: 30 },
        { grade: 'B', count: 45 },
        { grade: 'C', count: 28 },
        { grade: 'D', count: 15 },
        { grade: 'F', count: 5 },
      ];
    }
  },

  getAttendanceData: async (period?: string, classId?: number, startDate?: string, endDate?: string): Promise<AttendanceData[]> => {
    try {
      const params = new URLSearchParams();
      if (period) params.append('period', period);
      if (classId) params.append('class_id', classId.toString());
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const response = await api.get(`/analytics/attendance-data?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      
      // Return mock data if API fails
      return [
        { date: 'Mon', present: 85, absent: 15 },
        { date: 'Tue', present: 90, absent: 10 },
        { date: 'Wed', present: 88, absent: 12 },
        { date: 'Thu', present: 92, absent: 8 },
        { date: 'Fri', present: 95, absent: 5 },
      ];
    }
  },

  getPerformanceData: async (studentId?: number, classId?: number, subject?: string, period?: string): Promise<PerformanceData[]> => {
    try {
      const params = new URLSearchParams();
      if (studentId) params.append('student_id', studentId.toString());
      if (classId) params.append('class_id', classId.toString());
      if (subject) params.append('subject', subject);
      if (period) params.append('period', period);
      
      const response = await api.get(`/analytics/performance-trends?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching performance data:', error);
      
      // Return mock data if API fails
      return [
        { month: 'Jan', averageScore: 75, highestScore: 95, lowestScore: 55, subject: subject || 'Overall' },
        { month: 'Feb', averageScore: 78, highestScore: 98, lowestScore: 58, subject: subject || 'Overall' },
        { month: 'Mar', averageScore: 80, highestScore: 96, lowestScore: 62, subject: subject || 'Overall' },
        { month: 'Apr', averageScore: 82, highestScore: 97, lowestScore: 65, subject: subject || 'Overall' },
        { month: 'May', averageScore: 83, highestScore: 99, lowestScore: 68, subject: subject || 'Overall' },
      ];
    }
  },

  getAttendancePatterns: async (date?: string, classId?: number): Promise<AttendancePatternData[]> => {
    try {
      const params = new URLSearchParams();
      if (date) params.append('date', date);
      if (classId) params.append('class_id', classId.toString());
      
      const response = await api.get(`/analytics/attendance-patterns?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance patterns:', error);
      
      // Return mock data if API fails
      return [
        { name: 'Present', value: 85 },
        { name: 'Absent', value: 10 },
        { name: 'Late', value: 3 },
        { name: 'Excused', value: 2 },
      ];
    }
  },

  getSubjectComparison: async (studentId?: number, classId?: number): Promise<SubjectData[]> => {
    try {
      const params = new URLSearchParams();
      if (studentId) params.append('student_id', studentId.toString());
      if (classId) params.append('class_id', classId.toString());
      
      const response = await api.get(`/analytics/subject-comparison?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching subject comparison:', error);
      
      // Return mock data if API fails
      return [
        { subject: 'Math', average: 78, classAverage: 75 },
        { subject: 'English', average: 82, classAverage: 80 },
        { subject: 'Science', average: 85, classAverage: 79 },
        { subject: 'Art', average: 90, classAverage: 88 },
        { subject: 'Music', average: 88, classAverage: 85 },
        { subject: 'PE', average: 92, classAverage: 90 },
      ];
    }
  },
  
  getClassAttendance: async (date?: string): Promise<ClassAttendance[]> => {
    try {
      const params = new URLSearchParams();
      if (date) params.append('date', date);
      
      const response = await api.get(`/dashboard/class-attendance?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching class attendance:', error);
      
      // Return mock data if API fails
      return [
        { class_id: 1, class_name: 'Pre-K A', attendance_rate: 92, student_count: 15, present_count: 14 },
        { class_id: 2, class_name: 'Pre-K B', attendance_rate: 88, student_count: 16, present_count: 14 },
        { class_id: 3, class_name: 'Kindergarten A', attendance_rate: 78, student_count: 18, present_count: 14 },
        { class_id: 4, class_name: 'Kindergarten B', attendance_rate: 94, student_count: 17, present_count: 16 },
      ];
    }
  },

  // Student endpoints
  getStudents: async (search?: string): Promise<Student[]> => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      
      const response = await api.get(`/students?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching students:', error);
      
      // Return mock data if API fails
      return Array(15).fill(0).map((_, index) => ({
        id: index + 1,
        first_name: ['John', 'Emma', 'Michael', 'Olivia', 'William'][index % 5],
        last_name: ['Smith', 'Johnson', 'Brown', 'Davis', 'Wilson'][index % 5],
        date_of_birth: new Date(2018 - (index % 3), index % 12, 10 + (index % 20)).toISOString(),
        admission_number: `ST-${2022}-${100 + index}`,
        parent_id: Math.floor(index / 2) + 1,
        class_id: (index % 4) + 1,
        class_name: ['Pre-K A', 'Pre-K B', 'Kindergarten A', 'Kindergarten B'][index % 4]
      }));
    }
  },

  getStudent: async (studentId: number): Promise<Student> => {
    try {
      const response = await api.get(`/students/${studentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching student ${studentId}:`, error);
      throw error;
    }
  },

  createStudent: async (student: Partial<Student>): Promise<Student> => {
    try {
      const response = await api.post('/students', student);
      return response.data;
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  },

  updateStudent: async (studentId: number, student: Partial<Student>): Promise<Student> => {
    try {
      const response = await api.put(`/students/${studentId}`, student);
      return response.data;
    } catch (error) {
      console.error(`Error updating student ${studentId}:`, error);
      throw error;
    }
  },

  deleteStudent: async (studentId: number): Promise<void> => {
    try {
      await api.delete(`/students/${studentId}`);
    } catch (error) {
      console.error(`Error deleting student ${studentId}:`, error);
      throw error;
    }
  },

  recordAttendance: async (studentId: number, date: string, status: string): Promise<Attendance> => {
    try {
      const response = await api.post(`/attendance`, {
        student_id: studentId,
        date: date,
        status: status
      });
      return response.data;
    } catch (error) {
      console.error('Error recording attendance:', error);
      throw error;
    }
  },

  recordBatchAttendance: async (attendances: { student_id: number, date: string, status: string }[]): Promise<Attendance[]> => {
    try {
      const response = await api.post('/attendance/batch', attendances);
      return response.data;
    } catch (error) {
      console.error('Error recording batch attendance:', error);
      throw error;
    }
  },

  // Teacher endpoints
  getTeachers: async (search?: string): Promise<Teacher[]> => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      
      const response = await api.get(`/teachers?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching teachers:', error);
      
      // Return mock data if API fails
      return Array(5).fill(0).map((_, index) => ({
        id: index + 1,
        specialization: ['Math', 'Language', 'Science', 'Art', 'Music'][index],
        user_id: index + 20,
        user: {
          id: index + 20,
          username: `teacher${index + 1}`,
          email: `teacher${index + 1}@school.com`,
          full_name: ['Sarah Johnson', 'James Wilson', 'Emily Davis', 'Robert Brown', 'Jessica Miller'][index],
          role: 'teacher',
          is_active: true
        }
      }));
    }
  },

  getTeacher: async (teacherId: number): Promise<Teacher> => {
    try {
      const response = await api.get(`/teachers/${teacherId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching teacher ${teacherId}:`, error);
      throw error;
    }
  },

  createTeacher: async (teacher: Partial<Teacher>): Promise<Teacher> => {
    try {
      const response = await api.post('/teachers', teacher);
      return response.data;
    } catch (error) {
      console.error('Error creating teacher:', error);
      throw error;
    }
  },

  updateTeacher: async (teacherId: number, teacher: Partial<Teacher>): Promise<Teacher> => {
    try {
      const response = await api.put(`/teachers/${teacherId}`, teacher);
      return response.data;
    } catch (error) {
      console.error(`Error updating teacher ${teacherId}:`, error);
      throw error;
    }
  },

  deleteTeacher: async (teacherId: number): Promise<void> => {
    try {
      await api.delete(`/teachers/${teacherId}`);
    } catch (error) {
      console.error(`Error deleting teacher ${teacherId}:`, error);
      throw error;
    }
  },

  // Parent (User with role=parent) endpoints
  getParents: async (search?: string): Promise<User[]> => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('role', 'parent');
      
      const response = await api.get(`/auth/users?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching parents:', error);
      
      // Return mock data if API fails
      return Array(10).fill(0).map((_, index) => ({
        id: index + 1,
        username: `parent${index + 1}`,
        email: `parent${index + 1}@example.com`,
        full_name: ['John Smith', 'Mary Johnson', 'Robert Brown', 'Patricia Davis', 'James Wilson',
                   'Linda Thompson', 'David Anderson', 'Jennifer Martinez', 'Thomas Taylor', 'Susan Clark'][index],
        role: 'parent',
        is_active: true
      }));
    }
  },

  getParent: async (parentId: number): Promise<User> => {
    try {
      const response = await api.get(`/auth/users/${parentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching parent ${parentId}:`, error);
      throw error;
    }
  },

  createParent: async (parent: Partial<User>): Promise<User> => {
    try {
      const userData = {
        ...parent,
        role: 'parent'
      };
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating parent:', error);
      throw error;
    }
  },

  updateParent: async (parentId: number, parent: Partial<User>): Promise<User> => {
    try {
      const response = await api.put(`/auth/users/${parentId}`, parent);
      return response.data;
    } catch (error) {
      console.error(`Error updating parent ${parentId}:`, error);
      throw error;
    }
  },

  deleteParent: async (parentId: number): Promise<void> => {
    try {
      await api.delete(`/auth/users/${parentId}`);
    } catch (error) {
      console.error(`Error deleting parent ${parentId}:`, error);
      throw error;
    }
  },

  // Fee endpoints
  getFees: async (): Promise<Fee[]> => {
    try {
      const response = await api.get('/fees/all');
      return response.data;
    } catch (error) {
      console.error('Error fetching fees:', error);
      
      // Return mock data if API fails
      return Array(15).fill(0).map((_, index) => ({
        id: index + 1,
        student_id: (index % 10) + 1,
        amount: 1500,
        description: "Tuition Fee",
        due_date: new Date(2024, Math.floor(index / 5), 15).toISOString(),
        paid: [1500, 800, 0][(index + 1) % 3],
        status: ['paid', 'partial', 'pending'][(index + 1) % 3],
        term: `Term ${Math.floor(index / 5) + 1}`,
        academic_year: "2023-2024"
      }));
    }
  },

  getStudentFees: async (studentId: number): Promise<Fee[]> => {
    try {
      const response = await api.get(`/fees/${studentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching fees for student ${studentId}:`, error);
      
      // Return mock data if API fails
      return [
        {
          id: 1,
          student_id: studentId,
          amount: 1500,
          description: "Tuition Fee - Term 1",
          due_date: new Date(2023, 8, 15).toISOString(),
          paid: 1500,
          status: "paid",
          term: "Term 1",
          academic_year: "2023-2024"
        },
        {
          id: 2,
          student_id: studentId,
          amount: 1500,
          description: "Tuition Fee - Term 2",
          due_date: new Date(2024, 0, 15).toISOString(),
          paid: 800,
          status: "partial",
          term: "Term 2",
          academic_year: "2023-2024"
        },
        {
          id: 3,
          student_id: studentId,
          amount: 1500,
          description: "Tuition Fee - Term 3",
          due_date: new Date(2024, 4, 15).toISOString(),
          paid: 0,
          status: "pending",
          term: "Term 3",
          academic_year: "2023-2024"
        }
      ];
    }
  },

  createFee: async (studentId: number, fee: Partial<Fee>): Promise<Fee> => {
    try {
      const response = await api.post(`/fees/${studentId}`, fee);
      return response.data;
    } catch (error) {
      console.error('Error creating fee:', error);
      throw error;
    }
  },

  updateFee: async (feeId: number, fee: Partial<Fee>): Promise<Fee> => {
    try {
      const response = await api.put(`/fees/${feeId}`, fee);
      return response.data;
    } catch (error) {
      console.error(`Error updating fee ${feeId}:`, error);
      throw error;
    }
  },
  
  recordPayment: async (feeId: number, amount: number): Promise<Fee> => {
    try {
      const response = await api.put(`/financial/record-payment/${feeId}?amount=${amount}`);
      return response.data;
    } catch (error) {
      console.error(`Error recording payment for fee ${feeId}:`, error);
      throw error;
    }
  },
  
  getFeeSummary: async (term?: string, academicYear?: string): Promise<FeeSummary> => {
    try {
      const params = new URLSearchParams();
      if (term) params.append('term', term);
      if (academicYear) params.append('academic_year', academicYear);
      
      const response = await api.get(`/financial/summary?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching fee summary:', error);
      
      // Return mock data if API fails
      return {
        total_amount: 45000,
        total_paid: 32500,
        total_balance: 12500,
        payment_rate: 72.2,
        student_count: 50,
        paid_count: 35,
        partial_count: 10,
        unpaid_count: 5
      };
    }
  },
  
  getFeeChartData: async (academicYear?: string): Promise<FeeChartData> => {
    try {
      const params = new URLSearchParams();
      if (academicYear) params.append('academic_year', academicYear);
      
      const response = await api.get(`/financial/chart-data?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching fee chart data:', error);
      
      // Return mock data if API fails
      return {
        monthly_collection: [
          { month: 'Jan', amount: 8500 },
          { month: 'Feb', amount: 7200 },
          { month: 'Mar', amount: 9100 },
          { month: 'Apr', amount: 7800 },
          { month: 'May', amount: 8900 },
          { month: 'Jun', amount: 9500 },
          { month: 'Jul', amount: 6800 },
          { month: 'Aug', amount: 7500 },
          { month: 'Sep', amount: 8200 },
          { month: 'Oct', amount: 7900 },
          { month: 'Nov', amount: 8300 },
          { month: 'Dec', amount: 8700 }
        ],
        status_distribution: [
          { status: 'Paid', count: 35 },
          { status: 'Partial', count: 10 },
          { status: 'Pending', count: 5 }
        ]
      };
    }
  },

  getPaymentsDue: async (days: number = 30): Promise<PaymentDue[]> => {
    try {
      const response = await api.get(`/financial/payments-due?days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payments due:', error);
      
      // Return mock data if API fails
      const today = new Date();
      return [
        {
          id: 1,
          student_name: 'John Smith',
          student_id: 1,
          amount: 1500,
          balance: 1500,
          description: 'Tuition Fee - Term 2',
          due_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5).toISOString(),
          days_left: 5,
          term: 'Term 2',
          academic_year: '2023-2024'
        },
        {
          id: 2,
          student_name: 'Emma Johnson',
          student_id: 2,
          amount: 1200,
          balance: 600,
          description: 'Tuition Fee - Term 2',
          due_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3).toISOString(),
          days_left: 3,
          term: 'Term 2',
          academic_year: '2023-2024'
        },
        {
          id: 3,
          student_name: 'Michael Brown',
          student_id: 3,
          amount: 1500,
          balance: 1500,
          description: 'Tuition Fee - Term 2',
          due_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2).toISOString(),
          days_left: -2,
          term: 'Term 2',
          academic_year: '2023-2024'
        }
      ];
    }
  },

  // Class endpoints
  getClasses: async (): Promise<ClassData[]> => {
    try {
      const response = await api.get('/classes');
      return response.data;
    } catch (error) {
      console.error('Error fetching classes:', error);
      
      // Return mock data if API fails
      return [
        { id: 1, name: 'Pre-K A', grade_level: 'Pre-K', teacher_id: 1, student_count: 15 },
        { id: 2, name: 'Pre-K B', grade_level: 'Pre-K', teacher_id: 1, student_count: 16 },
        { id: 3, name: 'Kindergarten A', grade_level: 'Kindergarten', teacher_id: 2, student_count: 18 },
        { id: 4, name: 'Kindergarten B', grade_level: 'Kindergarten', teacher_id: 2, student_count: 17 },
      ];
    }
  },

  getClass: async (classId: number): Promise<ClassData> => {
    try {
      const response = await api.get(`/classes/${classId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching class ${classId}:`, error);
      throw error;
    }
  },

  // Report Card endpoints
  getStudentReportCards: async (studentId: number, term?: string, academicYear?: string): Promise<ReportCard[]> => {
    try {
      const params = new URLSearchParams();
      if (term) params.append('term', term);
      if (academicYear) params.append('academic_year', academicYear);
      
      const response = await api.get(`/report-cards/${studentId}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching report cards for student ${studentId}:`, error);
      
      // Return mock data if API fails
      return [
        {
          id: 1,
          student_id: studentId,
          term: 'Term 1',
          academic_year: '2023-2024',
          issue_date: new Date(2023, 11, 15).toISOString(),
          teacher_comments: 'John has shown excellent progress this term, particularly in Reading and Math.',
          principal_comments: 'Keep up the good work!',
          attendance_summary: 'Present: 58 days, Absent: 2 days',
          grade_summaries: [
            { id: 1, subject: 'Reading', score: 92, grade_letter: 'A', teacher_id: 1, comments: 'Excellent reading comprehension' },
            { id: 2, subject: 'Writing', score: 88, grade_letter: 'B+', teacher_id: 1, comments: 'Good progress in handwriting' },
            { id: 3, subject: 'Math', score: 95, grade_letter: 'A', teacher_id: 2, comments: 'Outstanding number sense' },
            { id: 4, subject: 'Science', score: 90, grade_letter: 'A-', teacher_id: 3, comments: 'Shows great curiosity' },
            { id: 5, subject: 'Art', score: 94, grade_letter: 'A', teacher_id: 4, comments: 'Very creative' },
            { id: 6, subject: 'Music', score: 89, grade_letter: 'B+', teacher_id: 5, comments: 'Good rhythm and participation' },
          ]
        },
        {
          id: 2,
          student_id: studentId,
          term: 'Term 2',
          academic_year: '2023-2024',
          issue_date: new Date(2024, 3, 15).toISOString(),
          teacher_comments: 'John continues to make good progress across all subjects.',
          principal_comments: undefined, // Changed from null to undefined to fix the type error
          attendance_summary: 'Present: 56 days, Absent: 4 days',
          grade_summaries: [
            { id: 7, subject: 'Reading', score: 94, grade_letter: 'A', teacher_id: 1, comments: 'Reading at above grade level' },
            { id: 8, subject: 'Writing', score: 89, grade_letter: 'B+', teacher_id: 1, comments: 'Improved sentence structure' },
            { id: 9, subject: 'Math', score: 92, grade_letter: 'A-', teacher_id: 2, comments: 'Strong problem-solving skills' },
            { id: 10, subject: 'Science', score: 91, grade_letter: 'A-', teacher_id: 3, comments: 'Excellent participation in experiments' },
            { id: 11, subject: 'Art', score: 95, grade_letter: 'A', teacher_id: 4, comments: 'Outstanding creativity' },
            { id: 12, subject: 'Music', score: 90, grade_letter: 'A-', teacher_id: 5, comments: 'Good progress with instruments' },
          ]
        }
      ];
    }
  },

  // Timetable endpoints
  getClassTimetable: async (classId: number): Promise<TimeSlot[]> => {
    try {
      const response = await api.get(`/timetable/class/${classId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching timetable for class ${classId}:`, error);
      return [];
    }
  },

  getTeacherTimetable: async (teacherId: number): Promise<TimeSlot[]> => {
    try {
      const response = await api.get(`/timetable/teacher/${teacherId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching timetable for teacher ${teacherId}:`, error);
      return [];
    }
  }
};

export default api;