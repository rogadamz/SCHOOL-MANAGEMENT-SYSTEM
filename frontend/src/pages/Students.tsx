// frontend/src/pages/Students.tsx
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { 
  PlusCircle, 
  Search, 
  Loader2, 
  UserPlus, 
  Calendar, 
  School, 
  MoreHorizontal, 
  Edit, 
  Trash, 
  Eye
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { dashboardApi, Student, User } from '@/services/api';
import { AddStudentDialog } from '@/components/students/AddStudentDialog';
import { StudentDetailsDialog } from '@/components/students/StudentDetailsDialog';

export const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch students and parents in parallel
        const [studentsData, parentsData] = await Promise.all([
          dashboardApi.getStudents(),
          dashboardApi.getParents()
        ]);
        
        setStudents(studentsData);
        setFilteredStudents(studentsData);
        setParents(parentsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = students.filter(student => 
        `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.admission_number.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [searchQuery, students]);

  const handleAddStudent = async (newStudent: any) => {
    setLoading(true);
    try {
      const addedStudent = await dashboardApi.createStudent(newStudent);
      
      setStudents([...students, addedStudent]);
      setFilteredStudents([...students, addedStudent]);
    } catch (error) {
      console.error('Error adding student:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setIsDetailsDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getParentName = (parentId: number) => {
    const parent = parents.find(p => p.id === parentId);
    return parent ? parent.full_name : 'Unknown';
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Student Management</h1>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
              <p className="text-xs text-gray-500">Currently enrolled</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Guardians</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{parents.length}</div>
              <p className="text-xs text-gray-500">Registered parents</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Age</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {students.length > 0 
                  ? Math.round(students.reduce((sum, student) => {
                      const birthDate = new Date(student.date_of_birth);
                      const ageInYears = (new Date().getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
                      return sum + ageInYears;
                    }, 0) / students.length) 
                  : '--'}
              </div>
              <p className="text-xs text-gray-500">Years</p>
            </CardContent>
          </Card>
        </div>

        {/* Students List */}
        <Card>
          <CardHeader>
            <CardTitle>Student Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Input
                  type="search"
                  placeholder="Search students..."
                  className="w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button variant="outline" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Admission #</TableHead>
                      <TableHead>Date of Birth</TableHead>
                      <TableHead>Parent/Guardian</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          No students found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="bg-primary/10 p-2 rounded-full">
                                <UserPlus className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium">{student.first_name} {student.last_name}</div>
                                <div className="text-xs text-gray-500">ID: {student.id}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <School className="h-4 w-4 text-gray-500" />
                              {student.admission_number}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              {formatDate(student.date_of_birth)}
                            </div>
                          </TableCell>
                          <TableCell>{getParentName(student.parent_id)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleViewDetails(student)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Student
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <Trash className="h-4 w-4 mr-2" />
                                  Delete Student
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      {isAddDialogOpen && (
        <AddStudentDialog
          parents={parents}
          onClose={() => setIsAddDialogOpen(false)}
          onAdd={handleAddStudent}
        />
      )}
      
      {isDetailsDialogOpen && selectedStudent && (
        <StudentDetailsDialog
          student={selectedStudent}
          parentName={getParentName(selectedStudent.parent_id)}
          onClose={() => {
            setIsDetailsDialogOpen(false);
            setSelectedStudent(null);
          }}
        />
      )}
    </DashboardLayout>
  );
};