// frontend/src/components/dashboard/charts/GradeDistribution.tsx
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface GradeData {
  grade: string;
  count: number;
}

interface GradeDistributionProps {
  data: GradeData[];
}

export const GradeDistribution = ({ data }: GradeDistributionProps) => {
  // Ensure grades are in the right order
  const sortedData = [...data].sort((a, b) => {
    const gradeOrder = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'F': 5 };
    return (gradeOrder[a.grade as keyof typeof gradeOrder] || 99) - 
           (gradeOrder[b.grade as keyof typeof gradeOrder] || 99);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grade Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="grade" />
              <YAxis />
              <Tooltip 
                formatter={(value, name, props) => [`${value} students`, `Grade ${props.payload.grade}`]}
              />
              <Legend />
              <Bar 
                dataKey="count" 
                fill="#2563eb" 
                name="Students"
                radius={[4, 4, 0, 0]}  
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}