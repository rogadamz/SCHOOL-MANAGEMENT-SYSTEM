// src/pages/Attendance.tsx
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Check, X, Clock, FileText, Download, AlertCircle } from 'lucide-react';
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
  present: boolean;
  // We'll handle these UI statuses internally
  uiStatus?: 'present' | 'absent' | 'late' | 'excused';
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
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [activeTab, setActiveTab] = useState<'daily' | 'history' | 'calendar'>('daily');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<number, AttendanceRecord>>({});
  const [historyRecords, setHistoryRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [attendanceStats, setAttendanceStats] = useState<Record<string, {present: number, absent: number, late: number, excused: number}>>({});
  
  // Format date as YYYY-MM-DD
  const formattedDate = date.toISOString().split('T')[0];

  // Get month name
  const monthNames = ["January", "February", "March", "April", "May", "June", 
                      "July", "August", "September", "October", "November", "December"];

  // Fetch classes when component mounts
  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Try to fetch classes from API
        const response = await fetch('http://localhost:8000/classes', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setClasses(data);
        } else {
          // Fallback to sample classes if API fails
          console.warn("Using fallback class data - API request failed");
          setClasses([
            { id: 1, name: 'Butterfly Class', grade_level: 'Pre-K' },
            { id: 2, name: 'Sunshine Class', grade_level: 'Kindergarten' }
          ]);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
        // Fallback to sample classes
        setClasses([
          { id: 1, name: 'Butterfly Class', grade_level: 'Pre-K' },
          { id: 2, name: 'Sunshine Class', grade_level: 'Kindergarten' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchClasses();
  }, []);

  // Fetch students when a class is selected
  useEffect(() => {
    if (!selectedClass) return;
    
    const fetchStudents = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch students by class from API
        const students = await dashboardApi.getStudentsByClass(selectedClass.id);
        
        if (students && students.length > 0) {
          setStudents(students);
          console.log(`Loaded ${students.length} students for ${selectedClass.name}`);
          
          // Fetch attendance records for today
          await fetchAttendanceRecords();
        } else {
          throw new Error("No students found for this class");
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
        setError("Could not load students. Using sample data instead.");
        
        // Fallback to sample data if API fails
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
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudents();
  }, [selectedClass]);

  // Fetch attendance records when date changes
  useEffect(() => {
    if (!selectedClass || !students.length) return;
    
    fetchAttendanceRecords();
  }, [formattedDate]);

  // Fetch attendance records for the selected date
  const fetchAttendanceRecords = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch attendance records for selected date
      const records = await dashboardApi.getAttendanceRecords(formattedDate, selectedClass!.id);
      
      // Convert to record object format
      const recordsMap: Record<number, AttendanceRecord> = {};
      
      // Ensure all students have a record
      students.forEach(student => {
        // Find existing record for this student, if any
        const existingRecord = records.find(r => r.student_id === student.id);
        
        if (existingRecord) {
          // Add UI status based on the present boolean
          recordsMap[student.id] = {
            ...existingRecord,
            uiStatus: existingRecord.present ? 'present' : 'absent'
          };
        } else {
          // Create a default record if none exists
          recordsMap[student.id] = {
            student_id: student.id,
            date: formattedDate,
            present: true, // Default to present
            uiStatus: 'present' // Default UI status
          };
        }
      });
      
      setAttendanceRecords(recordsMap);
      console.log(`Loaded attendance records for ${formattedDate}`);
      
      // If current tab is history or calendar, fetch the history data
      if (activeTab === 'history' || activeTab === 'calendar') {
        await fetchAttendanceHistory();
      }
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      setError("Could not load attendance records. Using default values.");
      
      // Create default records if API fails
      const recordsMap: Record<number, AttendanceRecord> = {};
      students.forEach(student => {
        recordsMap[student.id] = {
          student_id: student.id,
          date: formattedDate,
          present: true, // Default to present (true)
          uiStatus: 'present' // Default UI status
        };
      });
      
      setAttendanceRecords(recordsMap);
    } finally {
      setLoading(false);
    }
  };

  // Tab change handler
  useEffect(() => {
    if (selectedClass && (activeTab === 'history' || activeTab === 'calendar')) {
      fetchAttendanceHistory();
    }
  }, [activeTab]);

  // Fetch attendance history
  const fetchAttendanceHistory = async () => {
    if (!selectedClass) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get 30 days of history
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      const startDate = thirtyDaysAgo.toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];
      
      const history = await dashboardApi.getAttendanceHistory(
        selectedClass.id,
        startDate,
        endDate
      );
      
      setHistoryRecords(history);
      console.log(`Loaded ${history.length} attendance history records`);
      
      // Calculate attendance stats for calendar view
      const stats: Record<string, {present: number, absent: number, late: number, excused: number}> = {};
      
      history.forEach(record => {
        if (!stats[record.date]) {
          stats[record.date] = { present: 0, absent: 0, late: 0, excused: 0 };
        }
        
        // Determine which counter to increment based on present boolean
        // In the real data we only have present/absent
        if (record.present) {
          stats[record.date].present++;
        } else {
          stats[record.date].absent++;
        }
      });
      
      setAttendanceStats(stats);
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      setError("Could not load attendance history. Using sample data.");
      
      // Generate sample history if API fails
      generateSampleHistoryData();
    } finally {
      setLoading(false);
    }
  };

  // Generate sample history data when API fails
  const generateSampleHistoryData = () => {
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
        // Random status, biased toward present
        const rand = Math.random();
        const isPresent = rand < 0.75; // 75% chance of being present
        
        // For UI purposes we'll create a richer status
        const uiStatus = 
          rand < 0.75 ? 'present' : 
          rand < 0.85 ? 'absent' : 
          rand < 0.95 ? 'late' : 'excused';
        
        history.push({
          id: history.length + 1,
          student_id: student.id,
          student_name: `${student.first_name} ${student.last_name}`,
          date: dateString,
          present: isPresent,
          uiStatus: uiStatus as 'present' | 'absent' | 'late' | 'excused'
        });
        
        // Update stats - in sample data we can still show rich status types
        stats[dateString][uiStatus as keyof typeof stats[string]]++;
      });
    }
    
    setHistoryRecords(history);
    setAttendanceStats(stats);
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

  const updateAttendanceStatus = (studentId: number, uiStatus: 'present' | 'absent' | 'late' | 'excused') => {
    // In the actual database, we only have a boolean "present" field
    // Map the UI status to the appropriate boolean value
    const present = uiStatus === 'present';
    
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        present,
        uiStatus // Store UI status for display purposes only
      }
    }));
    
    // Clear any success message when a new change is made
    if (successMessage) setSuccessMessage(null);
  };

  const saveAttendance = async () => {
    if (!selectedClass) return;
    
    setSaveLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Convert records object to array, mapping our UI statuses to the backend model
      // which only has a boolean 'present' field
      const recordsToSave = Object.values(attendanceRecords).map(record => {
        // Simplify the record to match the backend schema
        return {
          id: record.id,
          student_id: record.student_id,
          date: formattedDate, // Ensure date is correct
          present: record.present // This is the only status field in our DB schema
        };
      });
      
      // Save to database
      await dashboardApi.saveAttendanceRecords(recordsToSave);
      
      // Refresh records to get the updated IDs
      await fetchAttendanceRecords();
      
      // Update history data if in history or calendar tab
      if (activeTab === 'history' || activeTab === 'calendar') {
        await fetchAttendanceHistory();
      }
      
      setSuccessMessage("Attendance saved successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error saving attendance:', error);
      setError("Failed to save attendance. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  };

  const exportAttendance = (format: 'csv' | 'pdf') => {
    if (!selectedClass || !historyRecords.length) {
      setError("No attendance data to export");
      return;
    }
    
    try {
      if (format === 'csv') {
        // Generate CSV content
        let csv = 'Date,Student ID,Student Name,Present\n';
        
        historyRecords.forEach(record => {
          csv += `${record.date},${record.student_id},${record.student_name || ''},${record.present ? 'Yes' : 'No'}\n`;
        });
        
        // Create download link
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_${selectedClass.name}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        setSuccessMessage("CSV exported successfully!");
        
        // Clean up
        URL.revokeObjectURL(url);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        // For PDF, in a real app you'd use a library like jsPDF
        alert('PDF export would be implemented here with a library like jsPDF');
      }
    } catch (error) {
      console.error('Error exporting attendance:', error);
      setError("Failed to export attendance. Please try again.");
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
        <div className="flex justify-between items-center mb-4">
          <div>
            {error && (
              <div className="flex items-center text-red-500 text-sm mb-4">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
              </div>
            )}
            {successMessage && (
              <div className="flex items-center text-green-500 text-sm mb-4">
                <Check className="h-4 w-4 mr-2" />
                {successMessage}
              </div>
            )}
          </div>
          <Button onClick={saveAttendance} disabled={saveLoading}>
            {saveLoading ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              'Save Attendance'
            )}
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
              {students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No students found for this class
                  </td>
                </tr>
              ) : (
                students.map(student => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.admission_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.first_name} {student.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button 
                        className={`rounded-full p-2 ${attendanceRecords[student.id]?.uiStatus === 'present' ? 'bg-green-100' : 'bg-gray-100'}`}
                        onClick={() => updateAttendanceStatus(student.id, 'present')}
                      >
                        <Check className={`h-5 w-5 ${attendanceRecords[student.id]?.uiStatus === 'present' ? 'text-green-600' : 'text-gray-400'}`} />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button 
                        className={`rounded-full p-2 ${attendanceRecords[student.id]?.uiStatus === 'absent' ? 'bg-red-100' : 'bg-gray-100'}`}
                        onClick={() => updateAttendanceStatus(student.id, 'absent')}
                      >
                        <X className={`h-5 w-5 ${attendanceRecords[student.id]?.uiStatus === 'absent' ? 'text-red-600' : 'text-gray-400'}`} />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button 
                        className={`rounded-full p-2 ${attendanceRecords[student.id]?.uiStatus === 'late' ? 'bg-yellow-100' : 'bg-gray-100'}`}
                        onClick={() => updateAttendanceStatus(student.id, 'late')}
                        disabled={true} // Disabled because database only supports present/absent
                        title="Late status not supported in database schema"
                      >
                        <Clock className={`h-5 w-5 ${attendanceRecords[student.id]?.uiStatus === 'late' ? 'text-yellow-600' : 'text-gray-400'}`} />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button 
                        className={`rounded-full p-2 ${attendanceRecords[student.id]?.uiStatus === 'excused' ? 'bg-blue-100' : 'bg-gray-100'}`}
                        onClick={() => updateAttendanceStatus(student.id, 'excused')}
                        disabled={true} // Disabled because database only supports present/absent
                        title="Excused status not supported in database schema"
                      >
                        <FileText className={`h-5 w-5 ${attendanceRecords[student.id]?.uiStatus === 'excused' ? 'text-blue-600' : 'text-gray-400'}`} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
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
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Attendance History</h3>
          <div className="space-x-2">
            {error && (
              <div className="flex items-center text-red-500 text-sm mr-4">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
              </div>
            )}
            {successMessage && (
              <div className="flex items-center text-green-500 text-sm mr-4">
                <Check className="h-4 w-4 mr-2" />
                {successMessage}
              </div>
            )}
            <Button 
              variant="outline" 
              onClick={() => exportAttendance('csv')}
              disabled={!historyRecords.length}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button 
              variant="outline" 
              onClick={() => exportAttendance('pdf')}
              disabled={!historyRecords.length}
            >
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
              <div className="bg-gray-100 p-3 font-medium flex justify-between items-center">
                <span>
                  {new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setDate(new Date(date));
                    setActiveTab('daily');
                  }}
                >
                  View/Edit
                </Button>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student ID
                    </th>
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
                        {
                          students.find(s => s.id === record.student_id)?.admission_number ||
                          `STU-${record.student_id}`
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.student_name || 
                         (students.find(s => s.id === record.student_id) 
                           ? `${students.find(s => s.id === record.student_id)?.first_name} ${students.find(s => s.id === record.student_id)?.last_name}`
                           : `Student ${record.student_id}`)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.present ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {record.present ? 'Present' : 'Absent'}
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
        
        {error && (
          <div className="flex items-center text-red-500 text-sm mb-4">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </div>
        )}
        
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
              
              // Check if this is today
              const isToday = 
                new Date().getDate() === day && 
                new Date().getMonth() === calendarMonth && 
                new Date().getFullYear() === calendarYear;
              
              return (
                <div 
                  key={`day-${day}`} 
                  className={`p-2 text-center ${colorClass} ${isToday ? 'ring-2 ring-blue-500' : ''} cursor-pointer hover:opacity-80`}
                  onClick={() => {
                    setDate(new Date(calendarYear, calendarMonth, day));
                    setActiveTab('daily');
                  }}
                >
                  <div className={`${isToday ? 'font-bold' : ''}`}>{day}</div>
                  {attendanceRate !== null && (
                    <div className="text-xs mt-1">{Math.round(attendanceRate)}%</div>
                  )}
                  {attendanceStats[dateStr] && (
                    <div className="flex justify-center space-x-1 mt-1">
                      {attendanceStats[dateStr].present > 0 && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" title={`${attendanceStats[dateStr].present} present`}></div>
                      )}
                      {attendanceStats[dateStr].absent > 0 && (
                        <div className="w-2 h-2 bg-red-500 rounded-full" title={`${attendanceStats[dateStr].absent} absent`}></div>
                      )}
                      {attendanceStats[dateStr].late > 0 && (
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" title={`${attendanceStats[dateStr].late} late`}></div>
                      )}
                      {attendanceStats[dateStr].excused > 0 && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" title={`${attendanceStats[dateStr].excused} excused`}></div>
                      )}
                    </div>
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
        
        <div className="flex justify-center space-x-4">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm">Present</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            <span className="text-sm">Absent</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-sm">Late</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm">Excused</span>
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
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                {error && (
                  <div className="flex items-center text-red-500 text-sm mb-4">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {error}
                  </div>
                )}
                <p className="text-center py-4 text-gray-500">
                  Select a class to manage attendance
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {classes.length === 0 ? (
                    <div className="col-span-2 text-center py-8 text-gray-500">
                      No classes found. Please add classes first.
                    </div>
                  ) : (
                    classes.map(classItem => (
                      <Button 
                        key={classItem.id}
                        className="h-24 text-lg bg-gray-900 hover:bg-gray-800" 
                        onClick={() => setSelectedClass(classItem)}
                      >
                        {classItem.name} ({classItem.grade_level})
                      </Button>
                    ))
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{selectedClass.name} ({selectedClass.grade_level})</CardTitle>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedClass(null);
                  setAttendanceRecords({});
                  setHistoryRecords([]);
                  setAttendanceStats({});
                  setError(null);
                  setSuccessMessage(null);
                }}
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