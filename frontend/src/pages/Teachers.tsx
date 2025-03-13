import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { PlusCircle, Search, Loader2, Mail, GraduationCap, UserPlus, Users, Trash2, Edit2, AlertCircle, RefreshCw, Filter, Eye, X } from 'lucide-react';
import { dashboardApi, Teacher, User, ClassData } from '@/services/api';
import { AddTeacherDialog } from '@/components/teachers/AddTeacherDialog';
import { EditTeacherDialog } from '@/components/teachers/EditTeacherDialog';
import { TeacherDetailsDialog } from '@/components/teachers/TeacherDetailsDialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';

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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<EnhancedTeacher | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [specializations, setSpecializations] = useState<Set<string>>(new Set());
  const [totalClasses, setTotalClasses] = useState(0);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Class names mapping for Downtown Nursery School
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

  // Fetch teachers data on component mount and when needed
  useEffect(() => {
    fetchTeachersData();
    
    // Set up interval to refresh data every 30 seconds
    const intervalId = setInterval(() => {
      fetchTeachersData(false); // Silent refresh (no loading indicator)
    }, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const fetchTeachersData = async (showLoadingState = true) => {
    if (showLoadingState) {
      setLoading(true);
    }
    setError(null);
    
    try {
      console.log("Fetching teachers data...");
      
      // Fetch teachers directly from the API endpoint
      const response = await fetch('http://localhost:8000/teachers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching teachers: ${response.statusText}`);
      }
      
      const teachersData = await response.json();
      console.log("Raw teachers data fetched:", teachersData);
      
      // Fetch classes
      const classesData = await dashboardApi.getClasses();
      console.log("Classes data fetched:", classesData);
      
      // Update class names according to our mapping
      const updatedClasses = classesData.map(cls => ({
        ...cls,
        name: getMappedClassName(cls.name),
        original_name: cls.name // Keep original name for reference
      }));
      
      setClasses(updatedClasses);
      setTotalClasses(updatedClasses.length);
      
      // Create a set of unique specializations
      const uniqueSpecializations = new Set<string>();
      teachersData.forEach((teacher: Teacher) => {
        if (teacher.specialization) {
          uniqueSpecializations.add(teacher.specialization);
        }
      });
      setSpecializations(uniqueSpecializations);
      
      // Enhance teachers with user data and classes
      const enhancedTeachers = await Promise.all(
        teachersData.map(async (teacher: Teacher) => {
          try {
            // Fetch user data for each teacher
            const userResponse = await fetch(`http://localhost:8000/auth/users/${teacher.user_id}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });
            
            if (!userResponse.ok) {
              console.warn(`Couldn't fetch user data for teacher ${teacher.id}`);
              return {
                ...teacher,
                class_count: 0
              };
            }
            
            const user = await userResponse.json();
            
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
      
      console.log("Enhanced teachers:", enhancedTeachers);
      setTeachers(enhancedTeachers);
      setFilteredTeachers(enhancedTeachers);
    } catch (err: any) {
      console.error('Error fetching teachers data:', err);
      setError('Failed to load teachers. Please try again later.');
    } finally {
      if (showLoadingState) {
        setLoading(false);
      }
    }
  };

  // Filter teachers based on search and filter criteria
  useEffect(() => {
    let filtered = [...teachers];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(teacher => 
        (teacher.user?.full_name && teacher.user.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (teacher.user?.email && teacher.user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (teacher.specialization && teacher.specialization.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply specialization filter
    if (activeFilter) {
      filtered = filtered.filter(teacher => 
        teacher.specialization === activeFilter
      );
    }
    
    setFilteredTeachers(filtered);
  }, [searchQuery, activeFilter, teachers]);

  const handleAddTeacher = async (newTeacher: any) => {
    setLoading(true);
    setApiError(null);
    
    try {
      console.log("Creating teacher with data:", newTeacher);
      
      // First create the user with required fields
      const userData = {
        username: newTeacher.username,
        email: newTeacher.email,
        full_name: newTeacher.full_name,
        password: newTeacher.password,
        role: 'teacher'
      };
      
      console.log("Sending user creation request:", userData);
      
      // Create user using direct fetch to ensure proper format
      const userResponse = await fetch('http://localhost:8000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(userData)
      });
      
      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        throw new Error(errorData.detail || 'Failed to create user account');
      }
      
      const user = await userResponse.json();
      console.log("User created successfully:", user);
      
      // Then create the teacher profile with the returned user ID
      const teacherData = {
        specialization: newTeacher.specialization === 'custom' ? 
          newTeacher.customSpecialization : newTeacher.specialization,
        user_id: user.id
      };
      
      console.log("Sending teacher profile creation request:", teacherData);
      
      const teacherResponse = await fetch('http://localhost:8000/teachers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(teacherData)
      });
      
      if (!teacherResponse.ok) {
        const errorData = await teacherResponse.json();
        throw new Error(errorData.detail || 'Failed to create teacher profile');
      }
      
      const addedTeacher = await teacherResponse.json();
      console.log("Teacher profile created successfully:", addedTeacher);
      
      // Refresh the teachers list to include the new teacher
      await fetchTeachersData();
      
      // Close the dialog
      setIsAddDialogOpen(false);
    } catch (err: any) {
      console.error('Error adding teacher:', err);
      // Get specific error message from response if available
      const errorMsg = err.message || 'Failed to add teacher. Please try again.';
      
      setApiError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTeacher = async (updatedTeacher: any) => {
    if (!selectedTeacher) return;
    
    setLoading(true);
    setApiError(null);
    
    try {
      console.log("Updating teacher with data:", updatedTeacher);
      
      // Update user information first
      if (updatedTeacher.user) {
        const userData = {
          full_name: updatedTeacher.user.full_name,
          email: updatedTeacher.user.email,
          username: updatedTeacher.user.username
        };
        
        console.log("Updating user data:", userData);
        
        const userResponse = await fetch(`http://localhost:8000/auth/users/${selectedTeacher.user_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(userData)
        });
        
        if (!userResponse.ok) {
          const errorData = await userResponse.json();
          throw new Error(errorData.detail || 'Failed to update user information');
        }
        
        console.log("User updated successfully");
      }
      
      // Update teacher profile
      const teacherData = {
        specialization: updatedTeacher.specialization === 'custom' ? 
          updatedTeacher.customSpecialization : updatedTeacher.specialization,
        user_id: selectedTeacher.user_id
      };
      
      console.log("Updating teacher profile:", teacherData);
      
      const teacherResponse = await fetch(`http://localhost:8000/teachers/${selectedTeacher.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(teacherData)
      });
      
      if (!teacherResponse.ok) {
        const errorData = await teacherResponse.json();
        throw new Error(errorData.detail || 'Failed to update teacher information');
      }
      
      console.log("Teacher profile updated successfully");
      
      // Refresh the teachers list to reflect the changes
      await fetchTeachersData();
      
      // Close the edit dialog
      setIsEditDialogOpen(false);
      setSelectedTeacher(null);
    } catch (err: any) {
      console.error('Error updating teacher:', err);
      const errorMsg = err.message || 'Failed to update teacher. Please try again.';
      setApiError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeacher = async () => {
    if (!selectedTeacher) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Deleting teacher:", selectedTeacher.id);
      
      // Delete teacher using direct fetch to ensure proper handling
      const response = await fetch(`http://localhost:8000/teachers/${selectedTeacher.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete teacher');
      }
      
      console.log("Teacher deleted successfully");
      
      // Refresh the data to reflect the deletion
      await fetchTeachersData();
      
      // Close dialog
      setIsDeleteDialogOpen(false);
      setSelectedTeacher(null);
    } catch (err: any) {
      console.error('Error deleting teacher:', err);
      setError(err.message || 'Failed to delete teacher. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterBySpecialization = (specialization: string | null) => {
    setActiveFilter(specialization);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Teacher Management</h1>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
                {activeFilter && (
                  <span className="ml-2 bg-primary/20 text-primary text-xs rounded-full px-2 py-0.5">
                    1
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter by Specialization</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleFilterBySpecialization(null)}
                className={!activeFilter ? "bg-accent" : ""}
              >
                All Specializations
              </DropdownMenuItem>
              {Array.from(specializations).sort().map(spec => (
                <DropdownMenuItem 
                  key={spec} 
                  onClick={() => handleFilterBySpecialization(spec)}
                  className={activeFilter === spec ? "bg-accent" : ""}
                >
                  {spec}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Teacher
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4 mr-2" />
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
            
            {activeFilter && (
              <div className="ml-2 flex items-center">
                <div className="bg-primary/10 text-primary text-sm rounded-full px-3 py-1 flex items-center">
                  <span>Specialization: {activeFilter}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-5 w-5 p-0 ml-2" 
                    onClick={() => setActiveFilter(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-auto" 
              onClick={() => fetchTeachersData()}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="ml-2">Refresh</span>
            </Button>
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
                        {searchQuery || activeFilter ? 'No teachers found matching your search criteria' : 'No teachers found'}
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
                        <TableCell>
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                            {teacher.specialization || 'Not specified'}
                          </span>
                        </TableCell>
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
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => {
                                    setSelectedTeacher(teacher);
                                    setIsDetailsDialogOpen(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View Details</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => {
                                    setSelectedTeacher(teacher);
                                    setIsEditDialogOpen(true);
                                  }}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit Teacher</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => {
                                    setSelectedTeacher(teacher);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete Teacher</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
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

      {/* Add Teacher Dialog */}
      {isAddDialogOpen && (
        <AddTeacherDialog
          onClose={() => setIsAddDialogOpen(false)}
          onAdd={handleAddTeacher}
          error={apiError}
        />
      )}
      
      {/* Edit Teacher Dialog */}
      {isEditDialogOpen && selectedTeacher && (
        <EditTeacherDialog
          teacher={selectedTeacher}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedTeacher(null);
          }}
          onUpdate={handleEditTeacher}
          error={apiError}
        />
      )}
      
      {/* Teacher Details Dialog */}
      {isDetailsDialogOpen && selectedTeacher && (
        <TeacherDetailsDialog
          teacher={selectedTeacher}
          classes={classes}
          classNameMapping={classNameMapping}
          onClose={() => {
            setIsDetailsDialogOpen(false);
            setSelectedTeacher(null);
          }}
          onEdit={() => {
            setIsDetailsDialogOpen(false);
            setIsEditDialogOpen(true);
          }}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the teacher
              {selectedTeacher?.user?.full_name && ` "${selectedTeacher.user.full_name}"`} 
              and remove all their data from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTeacher} className="bg-red-600 text-white hover:bg-red-700">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Deleting...
                </>
              ) : (
                <>Delete</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};