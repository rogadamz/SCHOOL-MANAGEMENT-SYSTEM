import { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttendancePatternData {
  name: string;
  value: number;
}

interface AttendancePatternsProps {
  data: AttendancePatternData[];
  loading?: boolean;
  title?: string;
  showFilters?: boolean;
}

const COLORS = ['#2563eb', '#dc2626', '#eab308', '#84cc16'];
const RADIAN = Math.PI / 180;

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  // Only show label if segment is significant enough (greater than 8%)
  if (percent < 0.08) return null;
  
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor="middle" 
      dominantBaseline="middle"
      className="text-xs font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export const AttendancePatterns = ({ 
  data, 
  loading = false, 
  title = "Attendance Distribution", 
  showFilters = false 
}: AttendancePatternsProps) => {
  const [periodFilter, setPeriodFilter] = useState("today");

  // Calculate total students
  const totalStudents = data.reduce((sum, item) => sum + item.value, 0);

  // Calculate attendance percentage
  const presentData = data.find(item => item.name.toLowerCase() === "present");
  const attendanceRate = presentData 
    ? (presentData.value / totalStudents * 100) 
    : 0;

  const getAttendanceRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-500';
    if (rate >= 75) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        {showFilters && (
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="term">This Term</SelectItem>
            </SelectContent>
          </Select>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : totalStudents === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            No attendance data available
          </div>
        ) : (
          <div className="h-[300px]">
            <div className="mb-4 text-center">
              <div className="text-sm text-gray-500">Attendance Rate</div>
              <div className={cn("text-2xl font-bold", getAttendanceRateColor(attendanceRate))}>
                {attendanceRate.toFixed(1)}%
              </div>
              <div className="max-w-[80%] mx-auto mt-1">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={cn(
                      "h-2 rounded-full",
                      attendanceRate >= 90 ? "bg-green-500" :
                      attendanceRate >= 75 ? "bg-yellow-500" :
                      "bg-red-500"
                    )}
                    style={{ width: `${attendanceRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={CustomLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        entry.name.toLowerCase() === 'present' ? '#2563eb' :
                        entry.name.toLowerCase() === 'absent' ? '#dc2626' :
                        entry.name.toLowerCase() === 'late' ? '#eab308' :
                        entry.name.toLowerCase() === 'excused' ? '#84cc16' :
                        COLORS[index % COLORS.length]
                      } 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any, name: any) => [
                    `${value} students (${((value / totalStudents) * 100).toFixed(1)}%)`, 
                    name
                  ]} 
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  formatter={(value) => <span className="text-xs">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};