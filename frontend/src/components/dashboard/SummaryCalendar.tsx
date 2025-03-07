// frontend/src/components/dashboard/SummaryCalendar.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDaySummary, dashboardApi } from '@/services/api';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  DollarSign, 
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SummaryCalendarProps {
  onDaySelect?: (date: string, summary: CalendarDaySummary) => void;
}

export const SummaryCalendar: React.FC<SummaryCalendarProps> = ({ onDaySelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(
    new Date().toISOString().split('T')[0]
  );
  const [daySummaries, setDaySummaries] = useState<Record<string, CalendarDaySummary>>({});
  const [loading, setLoading] = useState(false);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  // Function to generate calendar days for the month
  const getDaysInMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // Add empty slots for days before the 1st of the month (Monday is 1, Sunday is 0/7)
    const startDay = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };
  
  const days = getDaysInMonth(currentYear, currentMonth);
  
  // Fetch summary data for days in the current month
  useEffect(() => {
    const fetchMonthSummaries = async () => {
      setLoading(true);
      const summaries: Record<string, CalendarDaySummary> = {};
      
      // Only fetch past dates and today, not future dates
      const today = new Date();
      const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear;
      const daysToFetch = isCurrentMonth 
        ? today.getDate() 
        : (currentMonth < today.getMonth() || currentYear < today.getFullYear())
          ? new Date(currentYear, currentMonth + 1, 0).getDate() 
          : 0;
          
      // Fetch data for all days in parallel
      const fetchPromises: Promise<[string, CalendarDaySummary | null]>[] = [];
      for (let day = 1; day <= daysToFetch; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        fetchPromises.push(
          dashboardApi.getCalendarDaySummary(dateStr)
            .then(summary => [dateStr, summary] as [string, CalendarDaySummary])
            .catch(error => {
              console.error(`Error fetching summary for ${dateStr}:`, error);
              return [dateStr, null] as [string, null];
            })
        );
      }
      
      // Wait for all fetches to complete
      const results = await Promise.all(fetchPromises);
      
      // Process results
      for (const [dateStr, summary] of results) {
        if (summary !== null) {
          summaries[dateStr] = summary;
        }
      }
      
      setDaySummaries(summaries);
      setLoading(false);
    };
    
    fetchMonthSummaries();
  }, [currentMonth, currentYear]);
  
  // Handle navigation between months
  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  // Jump to today
  const handleGoToToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    const dateStr = today.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    
    // If we have a summary for today, notify the parent
    if (dateStr && daySummaries[dateStr] && onDaySelect) {
      onDaySelect(dateStr, daySummaries[dateStr]);
    } else if (onDaySelect) {
      // Fetch the summary if we don't have it yet
      dashboardApi.getCalendarDaySummary(dateStr)
        .then(summary => {
          setDaySummaries(prev => ({ ...prev, [dateStr]: summary }));
          onDaySelect(dateStr, summary);
        })
        .catch(error => console.error(`Error fetching summary for ${dateStr}:`, error));
    }
  };
  
  // Handle day selection
  const handleDayClick = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Check if it's a future date
    const selectedDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate > today) {
      return; // Don't select future dates
    }
    
    setSelectedDate(dateStr);
    
    // If we have a summary, notify the parent component
    if (dateStr && daySummaries[dateStr] && onDaySelect) {
      onDaySelect(dateStr, daySummaries[dateStr]);
    } else if (onDaySelect) {
      // Fetch the summary if we don't have it yet
      dashboardApi.getCalendarDaySummary(dateStr)
        .then(summary => {
          setDaySummaries(prev => ({ ...prev, [dateStr]: summary }));
          onDaySelect(dateStr, summary);
        })
        .catch(error => console.error(`Error fetching summary for ${dateStr}:`, error));
    }
  };
  
  const isToday = (year: number, month: number, day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Calendar</CardTitle>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePreviousMonth}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleGoToToday}
            className="h-8 text-xs"
          >
            Today
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleNextMonth}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center font-medium mb-4">
          {monthNames[currentMonth]} {currentYear}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="text-center font-medium text-xs text-gray-500 p-1">
              {day}
            </div>
          ))}
          
          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square p-1 bg-gray-50 rounded-md"></div>;
            }
            
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const todayFlag = isToday(currentYear, currentMonth, day);
            const isSelected = dateStr === selectedDate;
            const hasSummary = !!(dateStr && daySummaries[dateStr]);
            const isPastOrToday = new Date(dateStr) <= new Date();
            const isHovered = dateStr === hoveredDate;
            
            // Get attendance rate and financial status if available
            const attendanceRate = hasSummary && dateStr && daySummaries[dateStr] 
              ? daySummaries[dateStr].attendance.rate 
              : 0;
            const feesCollected = hasSummary && dateStr && daySummaries[dateStr] 
              ? daySummaries[dateStr].fees.collected 
              : 0;
            
            // Style classes based on day state
            const baseClasses = "relative aspect-square p-1 rounded-md transition-colors";
            const dayClasses = cn(
              baseClasses,
              todayFlag ? "bg-blue-100 border border-blue-300" : "",
              isSelected ? "bg-blue-500 text-white" : "",
              !todayFlag && !isSelected && hasSummary ? "bg-gray-100" : "",
              !todayFlag && !isSelected && !hasSummary && isPastOrToday ? "bg-gray-50" : "",
              !isPastOrToday ? "text-gray-300 bg-gray-50" : "",
              isPastOrToday ? "cursor-pointer hover:bg-gray-200" : "",
              isHovered && !isSelected ? "ring-2 ring-offset-2 ring-blue-500" : ""
            );
            
            return (
              <div 
                key={`day-${day}`} 
                className={dayClasses}
                onClick={() => isPastOrToday && handleDayClick(day)}
                onMouseEnter={() => setHoveredDate(dateStr)}
                onMouseLeave={() => setHoveredDate(null)}
              >
                <div className={cn(
                  "flex items-center justify-center h-6 w-6 mx-auto",
                  todayFlag ? "rounded-full border-2 border-blue-400 font-semibold" : ""
                )}>
                  {day}
                </div>
                
                {hasSummary && dateStr && (
                  <div className="flex justify-center mt-1 space-x-1">
                    {attendanceRate > 0 && (
                      <div 
                        className={cn(
                          "w-2 h-2 rounded-full", 
                          attendanceRate >= 90 ? 'bg-green-500' :
                          attendanceRate >= 75 ? 'bg-yellow-500' :
                          'bg-red-500'
                        )}
                        title={`Attendance: ${attendanceRate.toFixed(0)}%`}
                      ></div>
                    )}
                    
                    {feesCollected > 0 && (
                      <div 
                        className="w-2 h-2 rounded-full bg-blue-500"
                        title={`Fees collected: $${feesCollected.toFixed(2)}`}
                      ></div>
                    )}
                  </div>
                )}
                
                {isHovered && hasSummary && !isSelected && dateStr && daySummaries[dateStr] && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{daySummaries[dateStr].attendance.rate.toFixed(0)}% attendance</span>
                    </div>
                    {daySummaries[dateStr].fees.collected > 0 && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span>${daySummaries[dateStr].fees.collected} collected</span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs text-gray-500">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
            <span>Good Attendance</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
            <span>Average Attendance</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
            <span>Poor Attendance</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
            <span>Fee Payments</span>
          </div>
        </div>
        
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};