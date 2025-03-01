// src/pages/Students.tsx
import { useEffect, useState } from 'react';
import { StudentList } from '@/components/students/StudentList';
import { dashboardApi, Student } from '@/services/api';

export const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const data = await dashboardApi.getStudents();
        setStudents(data);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Failed to load student data');
        
        // Fallback to sample data
        setStudents([
          {
            id: 1,
            studentId: "STU001",
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@student.com",
            gradeLevel: 10,
            classSection: "10A"
          },
          // ... more sample students
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudents();
  }, []);

  return <StudentList 
    students={students} 
    loading={loading} 
    error={error} 
    onRefresh={() => setLoading(true)}
  />;
};