import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SubjectData {
  subject: string;
  average: number;
  classAverage: number;
}

interface SubjectComparisonProps {
  data: SubjectData[];
}

export const SubjectComparison = ({ data }: SubjectComparisonProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Subject Performance Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar
                name="Student Average"
                dataKey="average"
                stroke="#2563eb"
                fill="#2563eb"
                fillOpacity={0.6}
              />
              <Radar
                name="Class Average"
                dataKey="classAverage"
                stroke="#16a34a"
                fill="#16a34a"
                fillOpacity={0.6}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}