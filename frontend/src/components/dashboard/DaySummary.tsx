// frontend/src/components/dashboard/DaySummary.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDaySummary } from '@/services/api';
import { 
  Users, 
  DollarSign, 
  Calendar,
  Clock,
  BookOpen,
  Info,
  MapPin,
  AlertCircle,
  Check,
  X,
  UserCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface DaySummaryProps {
  date: string;
  summary: CalendarDaySummary;
}

export const DaySummary: React.FC<DaySummaryProps> = ({ date, summary }) => {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const getAttendanceStatusColor = (rate: number) => {
    if (rate >= 90) return 'text-green-500';
    if (rate >= 75) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'absent':
        return <X className="h-4 w-4 text-red-500" />;
      case 'late':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'excused':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <UserCheck className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'holiday':
        return 'bg-red-100 text-red-800';
      case 'meeting':
        return 'bg-blue-100 text-blue-800';
      case 'activity':
        return 'bg-green-100 text-green-800';
      case 'academic':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Summary for {formattedDate}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Attendance Summary */}
        <div>
          <h3 className="text-base font-medium mb-3 flex items-center">
            <Users className="h-4 w-4 mr-1" />
            Attendance
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-xs text-gray-500">Present</div>
              <div className="text-xl font-semibold">{summary.attendance.present}</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="text-xs text-gray-500">Absent</div>
              <div className="text-xl font-semibold">{summary.attendance.absent}</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="text-xs text-gray-500">Late</div>
              <div className="text-xl font-semibold">{summary.attendance.late || 0}</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-xs text-gray-500">Excused</div>
              <div className="text-xl font-semibold">{summary.attendance.excused || 0}</div>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between items-center mb-1 text-sm">
              <span>Attendance Rate</span>
              <span className={getAttendanceStatusColor(summary.attendance.rate)}>
                {summary.attendance.rate.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={cn(
                  "h-2 rounded-full",
                  summary.attendance.rate >= 90 ? "bg-green-500" :
                  summary.attendance.rate >= 75 ? "bg-yellow-500" :
                  "bg-red-500"
                )}
                style={{ width: `${summary.attendance.rate}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div>
          <h3 className="text-base font-medium mb-3 flex items-center">
            <DollarSign className="h-4 w-4 mr-1" />
            Financial
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-xs text-gray-500">Collected</div>
              <div className="text-xl font-semibold">${summary.fees.collected.toFixed(2)}</div>
            </div>
            <div className="bg-amber-50 p-3 rounded-lg">
              <div className="text-xs text-gray-500">Pending</div>
              <div className="text-xl font-semibold">${summary.fees.pending.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Events for the day */}
        <div>
          <h3 className="text-base font-medium mb-3 flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            Events
          </h3>
          {summary.events && summary.events.length > 0 ? (
            <div className="space-y-2">
              {summary.events.map((event, index) => (
                <div 
                  key={index} 
                  className="p-2 bg-gray-50 border border-gray-100 rounded-lg"
                >
                  <div className="flex justify-between">
                    <div className="font-medium">{event.title}</div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getEventTypeColor(event.event_type)}`}>
                      {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    {event.all_day ? (
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        All Day
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Time TBD
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-4 bg-gray-50 rounded-lg text-gray-500">
              No events scheduled for this day
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="pt-2 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Users className="h-4 w-4 mr-2" />
            Record Attendance
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <DollarSign className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};