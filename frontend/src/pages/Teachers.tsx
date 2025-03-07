// frontend/src/pages/Teachers.tsx
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { PlusCircle, Search, Loader2, Mail, Phone, GraduationCap } from 'lucide-react';
import { dashboardApi, Teacher, User } from '@/services/api';
import { AddTeacherDialog } from '@/components/teachers/AddTeacherDialog';
import { TeacherDetailsDialog } from '@/components/teachers/TeacherDetailsDialog';

interface TeacherWithUser extends Teacher {
  user_fullname?: string;
  user_email?: string;
}

export const Teachers = () => {
  const [teachers, setTeachers] = useState<TeacherWithUser[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<TeacherWithUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherWithUser | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeachers = async () => {
      setLoading(true);
      try {
        const teachersData = await dashboardApi.getTeachers();
        
        // Fetch user details for each teacher
        const teachersWithUsers = await Promise.all(
          teachersData.map(async (teacher) => {
            try {
              const user = await dashboardApi.getParent(teacher.user_id); // Using getParent as it gets any user
              return {
                ...teacher,
                user_fullname: user.full_name,
                user_email: user.email
              };
            } catch (error) {
              console.error(`Error fetching user for teacher ${teacher.id}:`, error);
              return {
                ...teacher,
                user_fullname: 'Unknown',
                user_email: 'N/A'
              };
            }
          })
        );
        
        setTeachers(teachersWithUsers);
        setFilteredTeachers(teachersWithUsers);
      } catch (error) {
        console.error('Error fetching teachers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = teachers.filter(teacher => 
        (teacher.user_fullname && teacher.user_fullname.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (teacher.user_email && teacher.user_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        teacher.specialization.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTeachers(filtered);
    } else {
      setFilteredTeachers(teachers);
    }
  }, [searchQuery, teachers]);

  const handleAddTeacher = async (newTeacher: any) => {
    setLoading(true);
    try {
      // First create the user
      const userData = {
        username: newTeacher.username,
        email: newTeacher.email,
        full_name: newTeacher.full_name,
        password: newTeacher.password,
        role: 'teacher'
      };
      
      const user = await dashboardApi.createParent(userData); // Using createParent as it's a general user creation
      
      // Then create the teacher profile
      const teacherData = {
        specialization: newTeacher.specialization,
        user_id: user.id
      };
      
      const addedTeacher = await dashboardApi.createTeacher(teacherData);
      
      // Add to the list with user details
      const teacherWithUser = {
        ...addedTeacher,
        user_fullname: user.full_name,
        user_email: user.email
      };
      
      setTeachers([...teachers, teacherWithUser]);
      setFilteredTeachers([...teachers, teacherWithUser]);
    } catch (error) {
      console.error('Error adding teacher:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Teacher Management</h1>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Teacher
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teachers.length}</div>
              <p className="text-xs text-gray-500">Active faculty members</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Specializations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(teachers.map(t => t.specialization)).size}
              </div>
              <p className="text-xs text-gray-500">Different teaching areas</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Classes Taught</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-gray-500">Across grade levels</p>
            </CardContent>
          </Card>
        </div>

        {/* Teachers List */}
        <Card>
          <CardHeader>
            <CardTitle>Faculty Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Input
                  type="search"
                  placeholder="Search teachers..."
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
                      <TableHead>Email</TableHead>
                      <TableHead>Specialization</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTeachers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                          No teachers found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTeachers.map((teacher) => (
                        <TableRow key={teacher.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="bg-primary/10 p-2 rounded-full">
                                <GraduationCap className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium">{teacher.user_fullname}</div>
                                <div className="text-xs text-gray-500">ID: {teacher.id}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-500" />
                              {teacher.user_email}
                            </div>
                          </TableCell>
                          <TableCell>{teacher.specialization}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedTeacher(teacher);
                                setIsDetailsDialogOpen(true);
                              }}
                            >
                              View Details
                            </Button>
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
        <AddTeacherDialog
          onClose={() => setIsAddDialogOpen(false)}
          onAdd={handleAddTeacher}
        />
      )}
      
      {isDetailsDialogOpen && selectedTeacher && (
        <TeacherDetailsDialog
          teacher={selectedTeacher}
          onClose={() => {
            setIsDetailsDialogOpen(false);
            setSelectedTeacher(null);
          }}
        />
      )}
    </DashboardLayout>
  );
};