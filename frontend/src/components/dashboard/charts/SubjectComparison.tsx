import { useState } from 'react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Legend, 
  Tooltip 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from 'lucide-react';

interface SubjectData {
  subject: string;
  average: number;
  classAverage: number;
}

interface SubjectComparisonProps {
  data: SubjectData[];
  loading?: boolean;
  title?: string;
  showFilters?: boolean;
  studentName?: string;
}

export const SubjectComparison = ({ 
  data, 
  loading = false, 
  title = "Subject Performance Comparison", 
  showFilters = false,
  studentName
}: SubjectComparisonProps) => {
  const [studentFilter, setStudentFilter] = useState("current");
  const [termFilter, setTermFilter] = useState("current");
  const [displayMode, setDisplayMode] = useState("radar");

  // Calculate overall averages
  const studentOverallAvg = data.reduce((sum, item) => sum + item.average, 0) / data.length;
  const classOverallAvg = data.reduce((sum, item) => sum + item.classAverage, 0) / data.length;
  
  // Find strongest and weakest subjects
  const sortedByDiff = [...data].sort((a, b) => 
    (b.average - b.classAverage) - (a.average - a.classAverage)
  );
  
  const strongestSubject = sortedByDiff[0];
  const weakestSubject = sortedByDiff[sortedByDiff.length - 1];
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-sm text-xs">
          <p className="font-semibold">{payload[0].payload.subject}</p>
          <p className="text-blue-600">Student: {payload[0].value}</p>
          <p className="text-green-600">Class: {payload[1].value}</p>
          <p className="text-purple-600">Difference: {(payload[0].value - payload[1].value).toFixed(1)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">
          {studentName ? `${studentName}'s Subject Performance` : title}
        </CardTitle>
        {showFilters && (
          <div className="flex items-center space-x-2">
            <Tabs value={displayMode} onValueChange={setDisplayMode} className="h-8">
              <TabsList className="h-7">
                <TabsTrigger value="radar" className="text-xs px-2 py-0 h-6">Radar</TabsTrigger>
                <TabsTrigger value="bar" className="text-xs px-2 py-0 h-6">Bar</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Select value={termFilter} onValueChange={setTermFilter}>
              <SelectTrigger className="w-[100px] h-7 text-xs">
                <SelectValue placeholder="Term" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Term</SelectItem>
                <SelectItem value="previous">Previous Term</SelectItem>
                <SelectItem value="all_year">Full Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            <div className="h-[290px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    stroke="#6b7280" 
                    tickSize={4}
                    tickLine={false}
                    tick={{ fontSize: 11 }}
                  />
                  <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 100]} 
                    tickCount={5}
                    stroke="#9ca3af"
                    tick={{ fontSize: 10 }}
                  />
                  <Radar
                    name={studentName || "Student Average"}
                    dataKey="average"
                    stroke="#2563eb"
                    fill="#2563eb"
                    fillOpacity={0.5}
                  />
                  <Radar
                    name="Class Average"
                    dataKey="classAverage"
                    stroke="#16a34a"
                    fill="#16a34a"
                    fillOpacity={0.3}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    formatter={(value) => <span className="text-xs">{value}</span>}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500">Overall Average</div>
                <div className="flex justify-between items-center">
                  <div className="text-lg font-semibold">{studentOverallAvg.toFixed(1)}</div>
                  <div className={`text-xs font-medium ${
                    studentOverallAvg > classOverallAvg ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {studentOverallAvg > classOverallAvg ? '+' : ''}
                    {(studentOverallAvg - classOverallAvg).toFixed(1)} vs class
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500">Strongest Subject</div>
                <div className="text-lg font-semibold">{strongestSubject.subject}</div>
                <div className="text-xs text-green-600">
                  +{(strongestSubject.average - strongestSubject.classAverage).toFixed(1)} above class average
                </div>
              </div>
              
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500">Needs Improvement</div>
                <div className="text-lg font-semibold">{weakestSubject.subject}</div>
                <div className="text-xs text-red-600">
                  {(weakestSubject.average - weakestSubject.classAverage).toFixed(1)} vs class average
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};