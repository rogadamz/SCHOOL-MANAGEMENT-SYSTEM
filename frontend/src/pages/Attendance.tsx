// src/pages/Attendance.tsx
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Check, X, Clock, FileText, Download } from 'lucide-react';
import { dashboardApi } from '@/services/api';

// Define types
interface Student {
  id: number;
  first_name: string;
  last_name: string;
  admission_number: string;
}

interface Class {
  id: number;
  name: string;
  grade_level: string;
}

interface AttendanceRecord {
  id?: number;
  student_id: number;
  student_name?: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
}

// Helper to generate dates for the calendar view
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getMonthData = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = getDaysInMonth(year, month);
  
  const days = [];
  // Add empty slots for days before the 1st of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  
  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  
  return days;
};

export const Attendance = () => {
  const [date, setDate] = useState(new Date());
  const [classes, setClasses] = useState<Class[]>([
    { id: 1, name: 'Butterfly Class', grade_level: 'Pre-K' },
    { id: 2, name: 'Sunshine Class', grade_level: 'Kindergarten' }
  ]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [activeTab, setActiveTab] = useState<'daily' | 'history' | 'calendar'>('daily');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<number, AttendanceRecord>>({});
  const [historyRecords, setHistoryRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [attendanceStats, setAttendanceStats] = useState<Record<string, {present: number, absent: number, late: number, excused: number}>>({});
  
  // Format date as YYYY-MM-DD
  const formattedDate = date.toISOString().split('T')[0];

  // Get month name
  const monthNames = ["January", "February", "March", "April", "May", "June", 
                      "July", "August", "September", "October", "November", "December"];

  // Fetch students when a class is selected
  useEffect(() => {
    if (!selectedClass) return;
    
    const fetchStudents = async () => {
      setLoading(true);
      try {
        // Fetch students by class from API
        const students = await dashboardApi.getStudentsByClass(selectedClass.id);
        setStudents(students);
        
        // Fetch attendance records for today
        const records = await dashboardApi.getAttendanceRecords(formattedDate, selectedClass.id);
        
        // Convert to record object format
        const recordsMap: Record<number, AttendanceRecord> = {};
        records.forEach(record => {
          recordsMap[record.student_id] = record;
        });
        
        // Make sure all students have a record
        students.forEach(student => {
          if (!recordsMap[student.id]) {
            recordsMap[student.id] = {
              student_id: student.id,
              date: formattedDate,
              status: 'present' // Default status
            };
          }
        });
        
        setAttendanceRecords(recordsMap);
        
        // Fetch attendance history
        if (activeTab === 'history' || activeTab === 'calendar') {
          fetchAttendanceHistory();
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        
        // Fallback to sample data if API fails
        if (students.length === 0) {
          const sampleStudents = selectedClass.id === 1 
            ? [
                { id: 1, first_name: 'James', last_name: 'Brown', admission_number: 'ST-2023-001' },
                { id: 2, first_name: 'Emily', last_name: 'Brown', admission_number: 'ST-2023-002' }
              ]
            : [
                { id: 3, first_name: 'Michael', last_name: 'Davis', admission_number: 'ST-2023-003' }
              ];
          
          setStudents(sampleStudents);
          
          // Initialize sample attendance records
          const records: Record<number, AttendanceRecord> = {};
          sampleStudents.forEach(student => {
            records[student.id] = {
              student_id: student.id,
              date: formattedDate,
              status: 'present'
            };
          });
          
          setAttendanceRecords(records);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudents();
  }, [selectedClass, formattedDate, activeTab]);

  // Fetch attendance history
  const fetchAttendanceHistory = async () => {
    try {
      // Get 30 days of history
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      const startDate = thirtyDaysAgo.toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];
      
      const history = await dashboardApi.getAttendanceHistory(
        selectedClass!.id,
        startDate,
        endDate
      );
      
      setHistoryRecords(history);
      
      // Calculate attendance stats for calendar view
      const stats: Record<string, {present: number, absent: number, late: number, excused: number}> = {};
      
      history.forEach(record => {
        if (!stats[record.date]) {
          stats[record.date] = { present: 0, absent: 0, late: 0, excused: 0 };
        }
        
        // Increment the appropriate counter
        stats[record.date][record.status as keyof typeof stats[string]]++;
      });
      
      setAttendanceStats(stats);
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      
      // Generate sample history if API fails
      const history: AttendanceRecord[] = [];
      const stats: Record<string, {present: number, absent: number, late: number, excused: number}> = {};
      const today = new Date();
      
      // Get last 10 days (excluding weekends)
      for (let i = 0; i < 10; i++) {
        const historyDate = new Date();
        historyDate.setDate(today.getDate() - i);
        
        // Skip weekends
        if (historyDate.getDay() === 0 || historyDate.getDay() === 6) continue;
        
        const dateString = historyDate.toISOString().split('T')[0];
        
        // Initialize stats for this date
        stats[dateString] = { present: 0, absent: 0, late: 0, excused: 0 };
        
        // Add a record for each student
        students.forEach(student => {
          // Random status
          const statuses: ('present' | 'absent' | 'late' | 'excused')[] = ['present', 'absent', 'late', 'excused'];
          const status = statuses[Math.floor(Math.random() * (i === 0 ? 1 : statuses.length))]; // Today always present
          
          history.push({
            id: history.length + 1,
            student_id: student.id,
            student_name: `${student.first_name} ${student.last_name}`,
            date: dateString,
            status
          });
          
          // Update stats
          stats[dateString][status]++;
        });
      }
      
      setHistoryRecords(history);
      setAttendanceStats(stats);
    }
  };

  const handlePreviousDay = () => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() - 1);
    setDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + 1);
    setDate(newDate);
  };

  const updateAttendanceStatus = (studentId: number, status: 'present' | 'absent' | 'late' | 'excused') => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const saveAttendance = async () => {
    try {
      // Convert records object to array
      const recordsToSave = Object.values(attendanceRecords);
      
      // Save to database
      await dashboardApi.saveAttendanceRecords(recordsToSave);
      
      alert('Attendance saved successfully!');
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Failed to save attendance. Please try again.');
    }
  };

  const exportAttendance = (format: 'csv' | 'pdf') => {
    try {
      if (format === 'csv') {
        // Generate CSV content
        let csv = 'Date,Student ID,Student Name,Status\n';
        
        historyRecords.forEach(record => {
          csv += `${record.date},${record.student_id},${record.student_name},${record.status}\n`;
        });
        
        // Create download link
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_${selectedClass?.name}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        // For PDF, in a real app you'd use a library like jsPDF
        alert('PDF export would be implemented here with a library like jsPDF');
      }
    } catch (error) {
      console.error('Error exporting attendance:', error);
      alert('Failed to export attendance. Please try again.');
    }
  };

  const previousMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(calendarYear - 1);
    } else {
      setCalendarMonth(calendarMonth - 1);
    }
  };

  const nextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(calendarYear + 1);
    } else {
      setCalendarMonth(calendarMonth + 1);
    }
  };

  // Calculate the attendance rate for a given date
  const getAttendanceRate = (dateStr: string) => {
    if (!attendanceStats[dateStr]) return null;
    
    const stats = attendanceStats[dateStr];
    const total = stats.present + stats.absent + stats.late + stats.excused;
    if (total === 0) return null;
    
    return (stats.present / total) * 100;
  };

  // Get color based on attendance rate
  const getAttendanceColor = (rate: number | null) => {
    if (rate === null) return 'bg-gray-100';
    if (rate >= 90) return 'bg-green-100 text-green-800';
    if (rate >= 75) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  // Render daily attendance tab
  const renderDailyAttendance = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      );
    }

    return (
      <div>
        <div className="flex justify-end mb-4">
          <Button onClick={saveAttendance}>
            Save Attendance
          </Button>
        </div>
        
        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Present
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Absent
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Late
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Excused
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map(student => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.admission_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.first_name} {student.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button 
                      className={`rounded-full p-2 ${attendanceRecords[student.id]?.status === 'present' ? 'bg-green-100' : 'bg-gray-100'}`}
                      onClick={() => updateAttendanceStatus(student.id, 'present')}
                    >
                      <Check className={`h-5 w-5 ${attendanceRecords[student.id]?.status === 'present' ? 'text-green-600' : 'text-gray-400'}`} />
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button 
                      className={`rounded-full p-2 ${attendanceRecords[student.id]?.status === 'absent' ? 'bg-red-100' : 'bg-gray-100'}`}
                      onClick={() => updateAttendanceStatus(student.id, 'absent')}
                    >
                      <X className={`h-5 w-5 ${attendanceRecords[student.id]?.status === 'absent' ? 'text-red-600' : 'text-gray-400'}`} />
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button 
                      className={`rounded-full p-2 ${attendanceRecords[student.id]?.status === 'late' ? 'bg-yellow-100' : 'bg-gray-100'}`}
                      onClick={() => updateAttendanceStatus(student.id, 'late')}
                    >
                      <Clock className={`h-5 w-5 ${attendanceRecords[student.id]?.status === 'late' ? 'text-yellow-600' : 'text-gray-400'}`} />
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button 
                      className={`rounded-full p-2 ${attendanceRecords[student.id]?.status === 'excused' ? 'bg-blue-100' : 'bg-gray-100'}`}
                      onClick={() => updateAttendanceStatus(student.id, 'excused')}
                    >
                      <FileText className={`h-5 w-5 ${attendanceRecords[student.id]?.status === 'excused' ? 'text-blue-600' : 'text-gray-400'}`} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render attendance history tab
  const renderAttendanceHistory = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      );
    }

    // Group records by date
    const recordsByDate: Record<string, AttendanceRecord[]> = {};
    historyRecords.forEach(record => {
      if (!recordsByDate[record.date]) {
        recordsByDate[record.date] = [];
      }
      recordsByDate[record.date].push(record);
    });
    
    // Sort dates in descending order
    const sortedDates = Object.keys(recordsByDate).sort().reverse();

    return (
      <div className="space-y-6">
        <div className="flex justify-between">
          <h3 className="text-lg font-semibold">Attendance History</h3>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => exportAttendance('csv')}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => exportAttendance('pdf')}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
        
        {sortedDates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No attendance history found for this class.
          </div>
        ) : (
          sortedDates.map(date => (
            <div key={date} className="border rounded-lg overflow-hidden">
              <div className="bg-gray-100 p-3 font-medium">
                {new Date(date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recordsByDate[date].map(record => (
                    <tr key={`${record.date}-${record.student_id}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.student_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.status === 'present' ? 'bg-green-100 text-green-800' :
                          record.status === 'absent' ? 'bg-red-100 text-red-800' :
                          record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    );
  };

  // Render calendar view tab
  const renderCalendarView = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      );
    }

    const days = getMonthData(calendarYear, calendarMonth);
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={previousMonth}>
            Previous Month
          </Button>
          <h3 className="text-lg font-semibold">
            {monthNames[calendarMonth]} {calendarYear}
          </h3>
          <Button variant="outline" onClick={nextMonth}>
            Next Month
          </Button>
        </div>
        
        <div className="border rounded-lg p-4">
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center font-semibold">
                {day}
              </div>
            ))}
            
            {days.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="p-2 bg-gray-50"></div>;
              }
              
              // Format the date to check stats
              const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const attendanceRate = getAttendanceRate(dateStr);
              const colorClass = getAttendanceColor(attendanceRate);
              
              return (
                <div 
                  key={`day-${day}`} 
                  className={`p-2 text-center ${colorClass} cursor-pointer hover:opacity-80`}
                  onClick={() => {
                    setDate(new Date(calendarYear, calendarMonth, day));
                    setActiveTab('daily');
                  }}
                >
                  <div>{day}</div>
                  {attendanceRate !== null && (
                    <div className="text-xs mt-1">{Math.round(attendanceRate)}%</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="flex justify-center space-x-4 pt-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-100 rounded-full mr-2"></div>
            <span className="text-sm">90%+ Present</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-100 rounded-full mr-2"></div>
            <span className="text-sm">75-90% Present</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-100 rounded-full mr-2"></div>
            <span className="text-sm">&lt;75% Present</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Attendance Management</h2>
        {selectedClass && activeTab === 'daily' && (
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              onClick={handlePreviousDay}
            >
              Previous Day
            </Button>
            <div className="px-4 py-2 bg-gray-100 rounded-md flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formattedDate}</span>
            </div>
            <Button 
              variant="outline"
              onClick={handleNextDay}
            >
              Next Day
            </Button>
          </div>
        )}
      </div>

      {!selectedClass ? (
        <Card>
          <CardHeader>
            <CardTitle>Class Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center py-8 text-gray-500">
              Select a class to manage attendance
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {classes.map(classItem => (
                <Button 
                  key={classItem.id}
                  className="h-24 text-lg bg-gray-900 hover:bg-gray-800" 
                  onClick={() => setSelectedClass(classItem)}
                >
                  {classItem.name} ({classItem.grade_level})
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{selectedClass.name} ({selectedClass.grade_level})</CardTitle>
              <Button 
                variant="outline" 
                onClick={() => setSelectedClass(null)}
              >
                Change Class
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border-b mb-6">
              <div className="flex">
                <button
                  className={`px-4 py-2 ${activeTab === 'daily' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
                  onClick={() => setActiveTab('daily')}
                >
                  Daily Attendance
                </button>
                <button
                  className={`px-4 py-2 ${activeTab === 'history' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
                  onClick={() => setActiveTab('history')}
                >
                  Attendance History
                </button>
                <button
                  className={`px-4 py-2 ${activeTab === 'calendar' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
                  onClick={() => setActiveTab('calendar')}
                >
                  Calendar View
                </button>
              </div>
            </div>
            
            {activeTab === 'daily' && renderDailyAttendance()}
            {activeTab === 'history' && renderAttendanceHistory()}
            {activeTab === 'calendar' && renderCalendarView()}
          </CardContent>
        </Card>
      )}
    </div>
  );
};