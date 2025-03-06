// src/components/students/StudentList.tsx
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw } from 'lucide-react';
import { dashboardApi, Student } from '@/services/api';

interface StudentListProps {
  students: Student[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export const StudentList = ({ 
  students: initialStudents, 
  loading, 
  error, 
  onRefresh 
}: StudentListProps) => {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSearchLoading(true);
      const results = await dashboardApi.getStudents(searchQuery);
      setStudents(results);
    } catch (err) {
      console.error('Error searching students:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleRefresh = async () => {
    onRefresh();
    setSearchQuery('');
    
    try {
      const results = await dashboardApi.getStudents();
      setStudents(results);
    } catch (err) {
      console.error('Error refreshing students:', err);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  if (error) {
    return <div className="text-red-500 p-8 flex flex-col items-center">
      <p className="mb-4">{error}</p>
      <Button onClick={handleRefresh}>Try Again</Button>
    </div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Students</h2>
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="search"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
            <Button type="submit" disabled={searchLoading}>
              {searchLoading ? (
                <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full"></div>
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </form>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grade Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Class Section
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No students found
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.studentId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.firstName} {student.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.gradeLevel}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.classSection}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {/* View details handler */}}
                    >
                      View Details
                    </Button>
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