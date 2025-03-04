// src/components/dashboard/SummaryCalendar.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDaySummary, dashboardApi } from '@/services/api';
import { Calendar, ChevronsLeft, ChevronsRight, Info } from 'lucide-react';

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
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  // Function to generate calendar days for the month
  const getDaysInMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // Add empty slots for days before the 1st of the month (Sunday is 0)
    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
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
          
      for (let day = 1; day <= daysToFetch; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        try {
          const summary = await dashboardApi.getCalendarDaySummary(dateStr);
          summaries[dateStr] = summary;
        } catch (error) {
          console.error(`Error fetching summary for ${dateStr}:`, error);
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
  
  // Handle day selection
  const handleDayClick = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Check if it's a future date or if we have summary data
    const selectedDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate > today) {
      return; // Don't select future dates
    }
    
    setSelectedDate(dateStr);
    
    // If we have a summary, notify the parent component
    if (daySummaries[dateStr] && onDaySelect) {
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
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Calendar</CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePreviousMonth}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleNextMonth}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="text-center font-medium text-sm text-gray-500 p-2">
              {day}
            </div>
          ))}
          
          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="p-2 bg-gray-50 rounded-md"></div>;
            }
            
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            const isSelected = dateStr === selectedDate;
            const hasSummary = !!daySummaries[dateStr];
            const isPastOrToday = new Date(dateStr) <= new Date();
            
            // Style classes based on day state
            const baseClasses = "p-1 rounded-md transition-colors";
            const dayClasses = [
              baseClasses,
              isToday ? "bg-blue-100 font-bold border border-blue-300" : "",
              isSelected ? "bg-blue-500 text-white" : "",
              !isToday && !isSelected && hasSummary ? "bg-gray-100" : "",
              isPastOrToday && !isToday && !isSelected && !hasSummary ? "bg-gray-50" : "",
              !isPastOrToday ? "text-gray-300 bg-gray-50" : "",
              isPastOrToday ? "cursor-pointer hover:bg-gray-200" : ""
            ].filter(Boolean).join(" ");
            
            return (
              <div 
                key={`day-${day}`} 
                className={dayClasses}
                onClick={() => isPastOrToday && handleDayClick(day)}
              >
                <div className="text-center py-1">{day}</div>
                
                {hasSummary && (
                  <div className="flex justify-center mt-1 space-x-1">
                    {daySummaries[dateStr].attendance.rate > 0 && (
                      <div 
                        className={`w-2 h-2 rounded-full ${
                          daySummaries[dateStr].attendance.rate >= 90 ? 'bg-green-400' :
                          daySummaries[dateStr].attendance.rate >= 75 ? 'bg-yellow-400' :
                          'bg-red-400'
                        }`}
                        title={`Attendance: ${daySummaries[dateStr].attendance.rate.toFixed(0)}%`}
                      ></div>
                    )}
                    
                    {daySummaries[dateStr].fees.collected > 0 && (
                      <div 
                        className="w-2 h-2 rounded-full bg-blue-400"
                        title={`Fees collected: $${daySummaries[dateStr].fees.collected}`}
                      ></div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 flex justify-center items-center text-xs text-gray-500">
          <div className="flex items-center mr-3">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
            <span>Good Attendance</span>
          </div>
          <div className="flex items-center mr-3">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mr-1"></div>
            <span>Average Attendance</span>
          </div>
          <div className="flex items-center mr-3">
            <div className="w-2 h-2 bg-red-400 rounded-full mr-1"></div>
            <span>Poor Attendance</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-400 rounded-full mr-1"></div>
            <span>Fee Payments</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};