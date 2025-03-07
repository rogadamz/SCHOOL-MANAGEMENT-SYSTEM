// frontend/src/components/dashboard/charts/AttendanceChart.tsx
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AttendanceData {
  date: string
  present: number
  absent: number
}

interface AttendanceChartProps {
  data: AttendanceData[]
}

export const AttendanceChart = ({ data }: AttendanceChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  value, 
                  name === "present" ? "Present" : "Absent"
                ]}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="present" 
                stroke="#2563eb" 
                name="Present"
                activeDot={{ r: 6 }} 
              />
              <Line 
                type="monotone" 
                dataKey="absent" 
                stroke="#dc2626" 
                name="Absent" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}