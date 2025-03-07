// frontend/src/components/dashboard/charts/PerformanceTrends.tsx
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PerformanceData {
  subject: string;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  month: string;
}

interface PerformanceTrendsProps {
  data: PerformanceData[];
}

export const PerformanceTrends = ({ data }: PerformanceTrendsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                formatter={(value) => [`${value}%`, '']}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="averageScore" 
                stroke="#2563eb" 
                name="Average Score"
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="highestScore" 
                stroke="#16a34a" 
                name="Highest Score"
              />
              <Line 
                type="monotone" 
                dataKey="lowestScore" 
                stroke="#dc2626" 
                name="Lowest Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}