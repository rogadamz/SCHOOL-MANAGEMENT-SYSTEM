// frontend/src/pages/Students.tsx
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Eye,
  Download,
  Filter,
  RefreshCw,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  BookOpen,
  FileText,
  DollarSign
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { dashboardApi, Student, User, Fee, ReportCard } from '@/services/api';
import { AddStudentDialog } from '@/components/students/AddStudentDialog';
import { StudentDetailsDialog } from '@/components/students/StudentDetailsDialog';
import { SubjectComparison } from '@/components/dashboard/charts/SubjectComparison';
import { AttendanceChart } from '@/components/dashboard/charts/AttendanceChart';

export const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [gradeFilter, setGradeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [studentData, setStudentData] = useState<{
    fees: Fee[],
    reportCards: ReportCard[]
  }>({
    fees: [],
    reportCards: []
  });

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
    // Filter students based on search query, grade filter and status filter
    let filtered = students;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(student => 
        `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.admission_number.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply grade filter (assuming the property exists)
    if (gradeFilter !== 'all') {
      filtered = filtered.filter(student => 
        student.class_name?.toLowerCase().includes(gradeFilter.toLowerCase())
      );
    }
    
    // Apply status filter (this would need attendance or enrollment status data)
    if (statusFilter === 'active') {
      // This is a placeholder - in a real app, you'd filter by actual status
      filtered = filtered.filter(student => true);
    } else if (statusFilter === 'inactive') {
      // Just for demo, exclude a few students randomly
      filtered = filtered.filter(student => student.id % 10 !== 0);
    }
    
    setFilteredStudents(filtered);
  }, [searchQuery, gradeFilter, statusFilter, students]);

  const getStudentDetailsData = async (student: Student) => {
    try {
      // Fetch fees and report cards in parallel
      const [feesData, reportCardsData] = await Promise.all([
        dashboardApi.getStudentFees(student.id),
        dashboardApi.getStudentReportCards(student.id)
      ]);
      
      setStudentData({
        fees: feesData,
        reportCards: reportCardsData
      });
    } catch (error) {
      console.error('Error fetching student details:', error);
      // Set empty data
      setStudentData({
        fees: [],
        reportCards: []
      });
    }
  };

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
    getStudentDetailsData(student);
    setIsDetailsDialogOpen(true);
  };

  const handleExportStudents = () => {
    // Create CSV content
    let csv = 'Student ID,First Name,Last Name,Date of Birth,Admission Number,Parent/Guardian\n';
    
    filteredStudents.forEach(student => {
      const parentName = getParentName(student.parent_id);
      csv += `${student.id},"${student.first_name}","${student.last_name}","${student.date_of_birth}","${student.admission_number}","${parentName}"\n`;
    });
    
    // Create and trigger download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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

  // Calculate pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

  const studentGradeOptions = [
    { value: 'all', label: 'All Grades' },
    { value: 'pre-k', label: 'Pre-K' },
    { value: 'kindergarten', label: 'Kindergarten' },
    { value: '1st', label: '1st Grade' },
    { value: '2nd', label: '2nd Grade' },
  ];

  const studentStatusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-2">
          <h1 className="text-2xl font-bold">Student Management</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportStudents}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87%</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '87%' }}></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Students List */}
        <Card>
          <CardHeader>
            <CardTitle>Student Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-4">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
                <TabsList>
                  <TabsTrigger value="all">All Students</TabsTrigger>
                  <TabsTrigger value="pre-k">Pre-K</TabsTrigger>
                  <TabsTrigger value="kindergarten">Kindergarten</TabsTrigger>
                  <TabsTrigger value="elementary">Elementary</TabsTrigger>
                </TabsList>
                
                <div className="flex flex-wrap gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="text"
                      placeholder="Search students..."
                      className="pl-8 md:w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Select value={gradeFilter} onValueChange={setGradeFilter}>
                      <SelectTrigger className="h-9 w-[130px]">
                        <SelectValue placeholder="Grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {studentGradeOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="h-9 w-[130px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {studentStatusOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Button variant="outline" size="icon">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Tabs>
            
            {loading ? (
              <div className="flex justify-center items-center py-10 text-primary">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>ID / Admission #</TableHead>
                        <TableHead>Date of Birth</TableHead>
                        <TableHead>Parent/Guardian</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedStudents.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                            No students match your search criteria
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedStudents.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="bg-primary/10 p-2 rounded-full">
                                  <UserPlus className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <div className="font-medium">{student.first_name} {student.last_name}</div>
                                  <div className="text-xs text-gray-500">{student.class_name || 'Class not assigned'}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{student.id}</div>
                              <div className="text-xs text-gray-500">{student.admission_number}</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span>{formatDate(student.date_of_birth)}</span>
                              </div>
                            </TableCell>
                            <TableCell>{getParentName(student.parent_id)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {/* Just for demo, make most students active */}
                                {student.id % 10 !== 0 ? (
                                  <>
                                    <span className="flex h-2 w-2 rounded-full bg-green-600"></span>
                                    <span className="text-sm">Active</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="flex h-2 w-2 rounded-full bg-gray-300"></span>
                                    <span className="text-sm">Inactive</span>
                                  </>
                                )}
                              </div>
                            </TableCell>
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
                                  <DropdownMenuItem>
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Record Attendance
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <BookOpen className="h-4 w-4 mr-2" />
                                    View Report Cards
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <FileText className="h-4 w-4 mr-2" />
                                    View Grades
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <DollarSign className="h-4 w-4 mr-2" />
                                    View Fees
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
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-500">
                      Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredStudents.length)} of {filteredStudents.length} students
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="text-sm">
                        Page {page} of {totalPages}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Quick Stats */}
        {!loading && students.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <AttendanceChart 
                  data={[
                    { date: 'Mon', present: 85, absent: 15 },
                    { date: 'Tue', present: 90, absent: 10 },
                    { date: 'Wed', present: 88, absent: 12 },
                    { date: 'Thu', present: 92, absent: 8 },
                    { date: 'Fri', present: 95, absent: 5 },
                  ]} 
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Performance by Subject</CardTitle>
              </CardHeader>
              <CardContent>
                <SubjectComparison 
                  data={[
                    { subject: 'Reading', average: 82, classAverage: 78 },
                    { subject: 'Writing', average: 78, classAverage: 75 },
                    { subject: 'Math', average: 85, classAverage: 80 },
                    { subject: 'Science', average: 80, classAverage: 76 },
                    { subject: 'Art', average: 90, classAverage: 88 },
                    { subject: 'Music', average: 88, classAverage: 85 },
                  ]}
                />
              </CardContent>
            </Card>
          </div>
        )}
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