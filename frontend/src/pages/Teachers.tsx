// src/pages/Teachers.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, Plus, Edit, Trash2, RotateCw, 
  Mail, Phone, GraduationCap, Book 
} from 'lucide-react';
import { dashboardApi } from '@/services/api';

// Define Teacher interface (add to api.ts in a real app)
interface Teacher {
  id: number;
  user_id: number;
  specialization: string;
  user?: {
    id: number;
    username: string;
    email: string;
    full_name: string;
    role: string;
    is_active: boolean;
  };
  classes?: { id: number; name: string; grade_level: string; }[];
}

export const Teachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [teacherStats, setTeacherStats] = useState({
    totalTeachers: 0,
    activeTeachers: 0,
    specializations: 0,
    classesAssigned: 0
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      
      // In a real app, you would call your API
      // const data = await dashboardApi.getTeachers();
      
      // For demo purposes, using sample data
      const sampleTeachers: Teacher[] = [
        {
          id: 1,
          user_id: 2,
          specialization: "Early Childhood Education",
          user: {
            id: 2,
            username: "teacher1",
            email: "teacher1@downtown.edu",
            full_name: "John Smith",
            role: "teacher",
            is_active: true
          },
          classes: [
            { id: 1, name: "Butterfly Class", grade_level: "Pre-K" }
          ]
        },
        {
          id: 2,
          user_id: 3,
          specialization: "Special Education",
          user: {
            id: 3,
            username: "teacher2",
            email: "teacher2@downtown.edu",
            full_name: "Mary Johnson",
            role: "teacher",
            is_active: true
          },
          classes: [
            { id: 2, name: "Sunshine Class", grade_level: "Kindergarten" }
          ]
        }
      ];
      
      setTeachers(sampleTeachers);
      
      // Calculate teacher statistics
      const totalTeachers = sampleTeachers.length;
      const activeTeachers = sampleTeachers.filter(t => t.user?.is_active).length;
      const uniqueSpecializations = new Set(sampleTeachers.map(t => t.specialization)).size;
      const totalClasses = sampleTeachers.reduce((count, teacher) => {
        return count + (teacher.classes?.length || 0);
      }, 0);
      
      setTeacherStats({
        totalTeachers,
        activeTeachers,
        specializations: uniqueSpecializations,
        classesAssigned: totalClasses
      });
      
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter teachers based on search query
  const filteredTeachers = teachers.filter(teacher => {
    const fullName = teacher.user?.full_name || '';
    const email = teacher.user?.email || '';
    const specialization = teacher.specialization || '';
    
    return fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
           email.toLowerCase().includes(searchQuery.toLowerCase()) || 
           specialization.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleViewTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsDetailModalOpen(true);
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsEditModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Teachers Management</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium opacity-90 mb-1">Total Teachers</p>
                <h3 className="text-3xl font-bold">{teacherStats.totalTeachers}</h3>
                <p className="text-sm mt-2 opacity-75">
                  {teacherStats.activeTeachers} active teachers
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-400/20">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium opacity-90 mb-1">Classes Assigned</p>
                <h3 className="text-3xl font-bold">{teacherStats.classesAssigned}</h3>
                <p className="text-sm mt-2 opacity-75">
                  {(teacherStats.classesAssigned / Math.max(1, teacherStats.activeTeachers)).toFixed(1)} per teacher
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-400/20">
                <Book className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium opacity-90 mb-1">Specializations</p>
                <h3 className="text-3xl font-bold">{teacherStats.specializations}</h3>
                <p className="text-sm mt-2 opacity-75">
                  Unique areas of expertise
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-400/20">
                <Book className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border text-gray-800">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Teacher-Student Ratio</p>
                <h3 className="text-3xl font-bold">1:4</h3>
                <p className="text-sm mt-2 text-gray-500">
                  Optimal for nursery education
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gray-100">
                <GraduationCap className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search teachers..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchTeachers}>
            <RotateCw className="h-4 w-4" />
          </Button>
          
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Teacher
          </Button>
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          // Loading placeholders
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={`loading-${index}`} className="shadow-sm">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="rounded-full bg-gray-200 h-12 w-12 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredTeachers.length === 0 ? (
          <div className="col-span-3 p-8 text-center text-gray-500">
            No teachers found matching your search criteria
          </div>
        ) : (
          filteredTeachers.map((teacher) => (
            <Card key={teacher.id} className="shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div className="bg-purple-500 rounded-full h-12 w-12 flex items-center justify-center text-white font-bold text-lg mr-4">
                      {teacher.user?.full_name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{teacher.user?.full_name}</h3>
                      <p className="text-sm text-gray-500">{teacher.specialization}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {teacher.user?.is_active ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Inactive</span>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {teacher.user?.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    (555) 123-4567
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Classes</h4>
                  <div className="space-y-1">
                    {teacher.classes?.map(classItem => (
                      <div key={classItem.id} className="text-sm bg-gray-100 rounded px-2 py-1 inline-block mr-2">
                        {classItem.name} ({classItem.grade_level})
                      </div>
                    ))}
                    {!teacher.classes?.length && (
                      <p className="text-sm text-gray-500">No classes assigned</p>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end mt-4 space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleViewTeacher(teacher)}
                  >
                    View
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEditTeacher(teacher)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Teacher Detail Modal */}
      {isDetailModalOpen && selectedTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">{selectedTeacher.user?.full_name}</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Contact Information</h4>
                <p className="text-sm">{selectedTeacher.user?.email}</p>
                <p className="text-sm">(555) 123-4567</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Specialization</h4>
                <p className="text-sm">{selectedTeacher.specialization}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Classes</h4>
                <ul className="text-sm list-disc pl-5">
                  {selectedTeacher.classes?.map(classItem => (
                    <li key={classItem.id}>
                      {classItem.name} ({classItem.grade_level})
                    </li>
                  ))}
                  {!selectedTeacher.classes?.length && <li>No classes assigned</li>}
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Account Status</h4>
                <p className="text-sm">
                  {selectedTeacher.user?.is_active ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Edit Modal (simplified) */}
      {isEditModalOpen && selectedTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Edit Teacher</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <Input 
                  type="text" 
                  defaultValue={selectedTeacher.user?.full_name}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input 
                  type="email" 
                  defaultValue={selectedTeacher.user?.email}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <Input 
                  type="tel" 
                  defaultValue="(555) 123-4567"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Specialization</label>
                <Input 
                  type="text" 
                  defaultValue={selectedTeacher.specialization}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select className="w-full rounded-md border border-input px-3 py-2">
                  <option value="active" selected={!!selectedTeacher.user?.is_active}>Active</option>
                  <option value="inactive" selected={!selectedTeacher.user?.is_active}>Inactive</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                // In a real app, call API to update teacher
                setIsEditModalOpen(false);
              }}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};