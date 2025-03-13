// frontend/src/pages/Teachers.tsx
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { PlusCircle, Search, Loader2, Mail, GraduationCap, UserPlus, Users } from 'lucide-react';
import { dashboardApi, Teacher, User, ClassData } from '@/services/api';
import { AddTeacherDialog } from '@/components/teachers/AddTeacherDialog';
import { TeacherDetailsDialog } from '@/components/teachers/TeacherDetailsDialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EnhancedTeacher extends Teacher {
  user?: User;
  classes?: ClassData[];
  class_count?: number;
}

export const Teachers = () => {
  const [teachers, setTeachers] = useState<EnhancedTeacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<EnhancedTeacher[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<EnhancedTeacher | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [specializations, setSpecializations] = useState<Set<string>>(new Set());
  const [totalClasses, setTotalClasses] = useState(0);

  // Updated class names mapping
  const classNameMapping: Record<string, string> = {
    'Pre-K A': 'Baby Class',
    'Pre-K B': 'Baby Class',
    'Kindergarten A': 'Middle Class',
    'Kindergarten B': 'Middle Class',
    'Butterfly Class': 'Baby Class',
    'Sunshine Class': 'Middle Class',
    'Grade 1': 'Upper Class',
    'Grade 2': 'Upper Class'
  };

  // Function to get the mapped class name
  const getMappedClassName = (originalName: string): string => {
    return classNameMapping[originalName] || originalName;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch classes first
        const classesData = await dashboardApi.getClasses();
        
        // Update class names according to our mapping
        const updatedClasses = classesData.map(cls => ({
          ...cls,
          name: getMappedClassName(cls.name),
          original_name: cls.name // Keep original name for reference
        }));
        
        setClasses(updatedClasses);
        setTotalClasses(updatedClasses.length);

        // Fetch teachers
        const teachersData = await dashboardApi.getTeachers();
        
        // Create a set of unique specializations
        const specializations = new Set<string>();
        teachersData.forEach(teacher => {
          if (teacher.specialization) {
            specializations.add(teacher.specialization);
          }
        });
        setSpecializations(specializations);
        
        // Enhance teachers with user data and classes
        const enhancedTeachers = await Promise.all(
          teachersData.map(async (teacher) => {
            try {
              // Get user data
              const user = teacher.user || await dashboardApi.getParent(teacher.user_id);
              
              // Find classes taught by this teacher
              const teacherClasses = updatedClasses.filter(cls => cls.teacher_id === teacher.id);
              
              return {
                ...teacher,
                user,
                classes: teacherClasses,
                class_count: teacherClasses.length
              };
            } catch (err) {
              console.error(`Error enhancing teacher ${teacher.id}:`, err);
              return {
                ...teacher,
                class_count: 0
              };
            }
          })
        );
        
        setTeachers(enhancedTeachers);
        setFilteredTeachers(enhancedTeachers);
      } catch (err: any) {
        console.error('Error fetching teachers data:', err);
        setError('Failed to load teachers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = teachers.filter(teacher => 
        (teacher.user?.full_name && teacher.user.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (teacher.user?.email && teacher.user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (teacher.specialization && teacher.specialization.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredTeachers(filtered);
    } else {
      setFilteredTeachers(teachers);
    }
  }, [searchQuery, teachers]);

  const handleAddTeacher = async (newTeacher: any) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Creating new teacher with data:", newTeacher);
      
      // First create the user
      const userData = {
        username: newTeacher.username,
        email: newTeacher.email,
        full_name: newTeacher.full_name,
        password: newTeacher.password,
        role: 'teacher'
      };
      
      console.log("Creating user account:", userData);
      const user = await dashboardApi.createParent(userData);
      console.log("User created successfully:", user);
      
      // Then create the teacher profile
      const teacherData = {
        specialization: newTeacher.specialization,
        user_id: user.id
      };
      
      console.log("Creating teacher profile:", teacherData);
      const addedTeacher = await dashboardApi.createTeacher(teacherData);
      console.log("Teacher profile created successfully:", addedTeacher);
      
      // Add to the list with user details
      const enhancedTeacher: EnhancedTeacher = {
        ...addedTeacher,
        user,
        classes: [],
        class_count: 0
      };
      
      // Update specializations set
      setSpecializations(prev => {
        const updated = new Set(prev);
        updated.add(newTeacher.specialization);
        return updated;
      });
      
      setTeachers(prevTeachers => [...prevTeachers, enhancedTeacher]);
      setFilteredTeachers(prevTeachers => [...prevTeachers, enhancedTeacher]);
      
      // Close the dialog
      setIsAddDialogOpen(false);
    } catch (err: any) {
      console.error('Error adding teacher:', err);
      setError(err.message || 'Failed to add teacher. Please try again.');
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
            <UserPlus className="h-4 w-4 mr-2" />
            Add Teacher
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

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
                {specializations.size}
              </div>
              <p className="text-xs text-gray-500">Different teaching areas</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Classes Taught</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClasses}</div>
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
            <div className="flex items-center mb-4">
              <div className="relative w-64">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search teachers..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
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
                      <TableHead>Classes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTeachers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          {searchQuery ? 'No teachers found matching your search' : 'No teachers found'}
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
                                <div className="font-medium">
                                  {teacher.user?.full_name || 'Unknown'}
                                </div>
                                <div className="text-xs text-gray-500">ID: {teacher.id}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-500" />
                              {teacher.user?.email || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>{teacher.specialization || 'Not specified'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-gray-500" />
                              {teacher.classes && teacher.classes.length > 0 ? (
                                <div className="space-y-1">
                                  {teacher.classes.slice(0, 2).map((cls, index) => (
                                    <div key={index} className="text-xs">
                                      {cls.name}
                                    </div>
                                  ))}
                                  {teacher.classes.length > 2 && (
                                    <div className="text-xs text-gray-500">
                                      +{teacher.classes.length - 2} more
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-500">No classes assigned</span>
                              )}
                            </div>
                          </TableCell>
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
          classes={classes}
          classNameMapping={classNameMapping}
          onClose={() => {
            setIsDetailsDialogOpen(false);
            setSelectedTeacher(null);
          }}
        />
      )}
    </DashboardLayout>
  );
};