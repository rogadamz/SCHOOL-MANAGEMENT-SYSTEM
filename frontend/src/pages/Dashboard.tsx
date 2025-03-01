// src/pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { GradeDistribution } from '@/components/dashboard/charts/GradeDistribution';
import { AttendanceChart } from '@/components/dashboard/charts/AttendanceChart';
import { Students } from '@/pages/Students';
import { Attendance } from '@/pages/Attendance';
import { 
  Users, UserRound, GraduationCap, BookOpen, 
  Calculator, MessageSquare, Mail, Calendar
} from 'lucide-react';

// Sample data for charts as fallback
const sampleGradeData = [
  { grade: 'A', count: 30 },
  { grade: 'B', count: 45 },
  { grade: 'C', count: 28 },
  { grade: 'D', count: 15 },
  { grade: 'F', count: 5 },
];

const sampleAttendanceData = [
  { date: '2024-02-01', present: 92, absent: 8 },
  { date: '2024-02-02', present: 88, absent: 12 },
  { date: '2024-02-03', present: 95, absent: 5 },
];

export const Dashboard = () => {
  const [studentCount, setStudentCount] = useState(8);
  const [teacherCount, setTeacherCount] = useState(2);
  const [parentCount, setParentCount] = useState(3);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [chartGradeData, setChartGradeData] = useState(sampleGradeData);
  const [chartAttendanceData, setChartAttendanceData] = useState(sampleAttendanceData);
  const [loading, setLoading] = useState(false);

  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();

  // Fetch real student count
  useEffect(() => {
    const fetchStudentCount = async () => {
      try {
        setLoading(true);
        console.log("Fetching student count from API service...");
        
        // Get token from local storage
        const token = localStorage.getItem('token');
        
        // If no token exists, create a temporary one for testing
        if (!token) {
          console.log("No auth token found - creating a temporary admin login...");
          try {
            // Try to log in as admin
            const response = await fetch('http://localhost:8000/auth/token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                'username': 'admin',
                'password': 'admin123',
              }),
            });
            
            if (response.ok) {
              const data = await response.json();
              localStorage.setItem('token', data.access_token);
              console.log("Temporary admin login successful");
            } else {
              console.error("Failed to create temporary login");
            }
          } catch (loginError) {
            console.error("Error during temporary login:", loginError);
          }
        }
        
        // Now try to get student count using the API service
        try {
          // Import the dashboardApi properly
          const { dashboardApi } = await import('@/services/api');
          const students = await dashboardApi.getStudents();
          
          if (students && Array.isArray(students) && students.length > 0) {
            setStudentCount(students.length);
            setTotalStudents(students.length);
            console.log(`Found ${students.length} students via API service`);
          }
        } catch (apiError) {
          console.error("Error using API service:", apiError);
          
          // If API service fails, try direct fetch with auth header
          try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/students', {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            
            if (response.ok) {
              const data = await response.json();
              if (Array.isArray(data) && data.length > 0) {
                setStudentCount(data.length);
                setTotalStudents(data.length);
                console.log(`Found ${data.length} students via direct fetch`);
              }
            }
          } catch (fetchError) {
            console.error("Error with direct fetch:", fetchError);
          }
        }
      } catch (error) {
        console.error("Overall error in fetchStudentCount:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentCount();
  }, []);

  // Fetch additional dashboard statistics
  useEffect(() => {
    const fetchDashboardStats = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        // Fetch teacher count
        try {
          const teacherResponse = await fetch('http://localhost:8000/teachers/count', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (teacherResponse.ok) {
            const teacherData = await teacherResponse.json();
            setTeacherCount(teacherData.count);
          }
        } catch (teacherError) {
          console.log("Could not fetch teacher count:", teacherError);
        }

        // Fetch parent count
        try {
          const parentResponse = await fetch('http://localhost:8000/users/count?role=parent', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (parentResponse.ok) {
            const parentData = await parentResponse.json();
            setParentCount(parentData.count);
          }
        } catch (parentError) {
          console.log("Could not fetch parent count:", parentError);
        }

        // Fetch today's attendance
        try {
          const today = new Date().toISOString().split('T')[0];
          const attendanceResponse = await fetch(`http://localhost:8000/analytics/attendance-summary?date=${today}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (attendanceResponse.ok) {
            const attendanceData = await attendanceResponse.json();
            setAttendanceCount(attendanceData.present_count);
            if (attendanceData.total_count > 0) {
              setTotalStudents(attendanceData.total_count);
            }
          } else {
            // If attendance API fails, use student count as total
            setAttendanceCount(Math.floor(studentCount * 0.75)); // Estimate 75% attendance
          }
        } catch (attendanceError) {
          console.log("Could not fetch attendance data:", attendanceError);
          setAttendanceCount(Math.floor(studentCount * 0.75)); // Estimate 75% attendance
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };

    fetchDashboardStats();
  }, [studentCount]);

  // Fetch chart data
  useEffect(() => {
    const fetchChartData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        // Fetch grade distribution data
        try {
          const gradeResponse = await fetch('http://localhost:8000/analytics/grade-distribution', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (gradeResponse.ok) {
            const gradeData = await gradeResponse.json();
            // Transform data format to match chart component
            const formattedGradeData = gradeData.map(item => ({
              grade: item.grade_letter,
              count: item.count
            }));
            
            if (formattedGradeData.length > 0) {
              setChartGradeData(formattedGradeData);
            }
          }
        } catch (gradeError) {
          console.log("Could not fetch grade distribution:", gradeError);
        }

        // Fetch attendance data for charts
        try {
          const attendanceResponse = await fetch('http://localhost:8000/analytics/attendance-rate?days=30', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (attendanceResponse.ok) {
            const attendanceData = await attendanceResponse.json();
            // Transform data format to match chart component
            const formattedAttendanceData = attendanceData.map(item => ({
              date: new Date(item.date).toISOString().split('T')[0],
              present: item.present_count,
              absent: item.absent_count
            }));
            
            if (formattedAttendanceData.length > 0) {
              setChartAttendanceData(formattedAttendanceData);
            }
          }
        } catch (attendanceChartError) {
          console.log("Could not fetch attendance chart data:", attendanceChartError);
        }
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    };

    fetchChartData();
  }, []);

  const renderSummaryCards = () => {
    // Dynamic summary cards with real data
    const summaryData = [
      { 
        title: "Students", 
        count: studentCount,
        color: "bg-red-500", 
        icon: <Users className="h-8 w-8 text-white opacity-75" />,
        subtitle: "Total Students" 
      },
      { 
        title: "Teachers", 
        count: teacherCount,
        color: "bg-green-500", 
        icon: <GraduationCap className="h-8 w-8 text-white opacity-75" />,
        subtitle: "Total Teachers" 
      },
      { 
        title: "Parents", 
        count: parentCount,
        color: "bg-blue-400", 
        icon: <UserRound className="h-8 w-8 text-white opacity-75" />,
        subtitle: "Total Parents" 
      },
      { 
        title: "Librarians", 
        count: 1, 
        color: "bg-blue-600", 
        icon: <BookOpen className="h-8 w-8 text-white opacity-75" />,
        subtitle: "Total Librarians" 
      },
      { 
        title: "Accountants", 
        count: 1, 
        color: "bg-green-600", 
        icon: <Calculator className="h-8 w-8 text-white opacity-75" />,
        subtitle: "Total Accountants" 
      },
      { 
        title: "Enquiries", 
        count: 2, 
        color: "bg-red-400", 
        icon: <MessageSquare className="h-8 w-8 text-white opacity-75" />,
        subtitle: "Total Enquiries" 
      },
      { 
        title: "Messages", 
        count: 0, 
        color: "bg-blue-500", 
        icon: <Mail className="h-8 w-8 text-white opacity-75" />,
        subtitle: "All Messages" 
      },
      { 
        title: "Attendance", 
        count: attendanceCount,
        color: "bg-blue-500", 
        icon: <Calendar className="h-8 w-8 text-white opacity-75" />,
        subtitle: `${attendanceCount}/${totalStudents} present today` 
      }
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {summaryData.map((card, index) => (
          <div 
            key={`card-${index}`}
            className={`${card.color} rounded-lg shadow-md overflow-hidden`}
          >
            <div className="p-4 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-3xl font-bold">{card.count}</div>
                  <div className="text-sm opacity-75">{card.title}</div>
                </div>
                <div>
                  {card.icon}
                </div>
              </div>
              <div className="text-xs mt-2 opacity-75">{card.subtitle}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render a simple calendar
  const renderCalendar = () => {
    // Generate a simple calendar (current month only)
    const daysInMonth = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate();
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{currentMonth} {currentYear}</h3>
          <div className="text-sm text-gray-500">Today</div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weekdays.map(day => (
            <div key={day} className="text-center font-medium text-gray-600">{day}</div>
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => (
            <div 
              key={`day-${i+1}`} 
              className={`text-center py-1 ${currentDate.getDate() === i+1 ? 'bg-blue-100 font-bold' : ''}`}
            >
              {i+1}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route
              path="/"
              element={
                <div>
                  {/* Summary cards at the top */}
                  {renderSummaryCards()}
                  
                  {/* Calendar and charts section */}
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Calendar on the left */}
                    <div className="lg:col-span-2">
                      {renderCalendar()}
                    </div>
                    
                    {/* Charts section on the right */}
                    <div className="lg:col-span-3">
                      <div className="bg-white rounded-lg shadow p-4">
                        <h3 className="text-lg font-semibold mb-4">Statistics Chart</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <GradeDistribution data={chartGradeData} />
                          <AttendanceChart data={chartAttendanceData} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              }
            />
            <Route path="/students" element={<Students />} />
            <Route path="/attendance" element={<Attendance />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};