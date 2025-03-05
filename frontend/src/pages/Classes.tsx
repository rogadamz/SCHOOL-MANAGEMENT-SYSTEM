// src/pages/Classes.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, Plus, Edit, BookOpen, Users, 
  GraduationCap, Trash2, RotateCw
} from 'lucide-react';
import { dashboardApi } from '@/services/api';

// Define Class interface (add to api.ts in a real app)
interface Class {
  id: number;
  name: string;
  grade_level: string;
  teacher_id: number;
  teacher?: {
    id: number;
    specialization: string;
    user_id: number;
    user_full_name: string;
  };
  students?: { id: number; first_name: string; last_name: string; admission_number: string; }[];
  student_count?: number;
}

export const Classes = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [classStats, setClassStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    avgClassSize: 0,
    gradeDistribution: [
      { grade: 'Pre-K', count: 1 },
      { grade: 'Kindergarten', count: 1 }
    ]
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      
      // In a real app, you would call your API
      // const data = await dashboardApi.getClasses();
      
      // For demo purposes, using sample data
      const sampleClasses: Class[] = [
        {
          id: 1,
          name: 'Butterfly Class',
          grade_level: 'Pre-K',
          teacher_id: 1,
          teacher: {
            id: 1,
            specialization: 'Early Childhood Education',
            user_id: 2,
            user_full_name: 'John Smith'
          },
          students: [
            { id: 1, first_name: 'James', last_name: 'Brown', admission_number: 'ST-2023-001' },
            { id: 2, first_name: 'Emily', last_name: 'Brown', admission_number: 'ST-2023-002' }
          ],
          student_count: 2
        },
        {
          id: 2,
          name: 'Sunshine Class',
          grade_level: 'Kindergarten',
          teacher_id: 2,
          teacher: {
            id: 2,
            specialization: 'Special Education',
            user_id: 3,
            user_full_name: 'Mary Johnson'
          },
          students: [
            { id: 3, first_name: 'Michael', last_name: 'Davis', admission_number: 'ST-2023-003' }
          ],
          student_count: 1
        }
      ];
      
      setClasses(sampleClasses);
      
      // Calculate class statistics
      const totalClasses = sampleClasses.length;
      const totalStudents = sampleClasses.reduce((total, cls) => total + (cls.student_count || 0), 0);
      const avgClassSize = totalClasses > 0 ? totalStudents / totalClasses : 0;
      
      setClassStats({
        totalClasses,
        totalStudents,
        avgClassSize,
        gradeDistribution: [
          { grade: 'Pre-K', count: 1 },
          { grade: 'Kindergarten', count: 1 }
        ]
      });
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter classes based on search query
  const filteredClasses = classes.filter(cls => {
    const className = cls.name.toLowerCase();
    const gradeLevel = cls.grade_level.toLowerCase();
    const teacherName = cls.teacher?.user_full_name.toLowerCase() || '';
    
    return className.includes(searchQuery.toLowerCase()) || 
           gradeLevel.includes(searchQuery.toLowerCase()) ||
           teacherName.includes(searchQuery.toLowerCase());
  });

  const handleViewClass = (cls: Class) => {
    setSelectedClass(cls);
    setIsDetailModalOpen(true);
  };

  const handleEditClass = (cls: Class) => {
    setSelectedClass(cls);
    setIsEditModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Classes Management</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium opacity-90 mb-1">Total Classes</p>
                <h3 className="text-3xl font-bold">{classStats.totalClasses}</h3>
                <p className="text-sm mt-2 opacity-75">
                  Active class sections
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-400/20">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium opacity-90 mb-1">Total Students</p>
                <h3 className="text-3xl font-bold">{classStats.totalStudents}</h3>
                <p className="text-sm mt-2 opacity-75">
                  Enrolled across all classes
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-400/20">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium opacity-90 mb-1">Average Class Size</p>
                <h3 className="text-3xl font-bold">{classStats.avgClassSize.toFixed(1)}</h3>
                <p className="text-sm mt-2 opacity-75">
                  Students per class
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-400/20">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border text-gray-800">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Grade Distribution</p>
                <h3 className="font-medium mt-2">
                  {classStats.gradeDistribution.map(item => (
                    <div key={item.grade} className="flex justify-between text-sm mb-1">
                      <span>{item.grade}</span>
                      <span className="font-bold">{item.count}</span>
                    </div>
                  ))}
                </h3>
              </div>
              <div className="p-3 rounded-lg bg-gray-100">
                <BookOpen className="h-6 w-6 text-gray-600" />
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
            placeholder="Search classes..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchClasses}>
            <RotateCw className="h-4 w-4" />
          </Button>
          
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Class
          </Button>
        </div>
      </div>

      {/* Classes Grid */}
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
        ) : filteredClasses.length === 0 ? (
          <div className="col-span-3 p-8 text-center text-gray-500">
            No classes found matching your search criteria
          </div>
        ) : (
          filteredClasses.map((cls) => (
            <Card key={cls.id} className="shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div className="bg-blue-500 rounded-full h-12 w-12 flex items-center justify-center text-white font-bold text-lg mr-4">
                      {cls.name.substring(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{cls.name}</h3>
                      <p className="text-sm text-gray-500">Grade: {cls.grade_level}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Teacher: {cls.teacher?.user_full_name || 'Unassigned'}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    Students: {cls.student_count || 0}
                  </div>
                </div>
                
                {cls.students && cls.students.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Students</h4>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {cls.students.slice(0, 3).map(student => (
                        <div key={student.id} className="text-sm bg-gray-100 rounded px-2 py-1">
                          {student.first_name} {student.last_name}
                        </div>
                      ))}
                      {cls.students.length > 3 && (
                        <div className="text-sm text-gray-500">
                          +{cls.students.length - 3} more students
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end mt-4 space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleViewClass(cls)}
                  >
                    View
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEditClass(cls)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Class Detail Modal */}
      {isDetailModalOpen && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">{selectedClass.name}</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Grade Level</h4>
                <p className="text-sm">{selectedClass.grade_level}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Teacher</h4>
                <p className="text-sm">{selectedClass.teacher?.user_full_name || 'Unassigned'}</p>
                {selectedClass.teacher && (
                  <p className="text-xs text-gray-500">Specialization: {selectedClass.teacher.specialization}</p>
                )}
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Students</h4>
                {selectedClass.students && selectedClass.students.length > 0 ? (
                  <ul className="text-sm list-disc pl-5">
                    {selectedClass.students.map(student => (
                      <li key={student.id}>
                        {student.first_name} {student.last_name} ({student.admission_number})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm">No students enrolled</p>
                )}
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

      {/* Class Edit Modal */}
      {isEditModalOpen && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Edit Class</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Class Name</label>
                <Input 
                  type="text" 
                  defaultValue={selectedClass.name}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Grade Level</label>
                <Input 
                  type="text" 
                  defaultValue={selectedClass.grade_level}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Teacher</label>
                <select className="w-full rounded-md border border-input p-2">
                  <option value="">Select Teacher</option>
                  <option value="1" selected={selectedClass.teacher_id === 1}>John Smith</option>
                  <option value="2" selected={selectedClass.teacher_id === 2}>Mary Johnson</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                // In a real app, call API to update class
                setIsEditModalOpen(false);
              }}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Class Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Add New Class</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Class Name</label>
                <Input 
                  type="text" 
                  placeholder="Enter class name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Grade Level</label>
                <Input 
                  type="text" 
                  placeholder="Enter grade level"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Teacher</label>
                <select className="w-full rounded-md border border-input p-2">
                  <option value="">Select Teacher</option>
                  <option value="1">John Smith</option>
                  <option value="2">Mary Johnson</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                // In a real app, call API to create class
                setIsAddModalOpen(false);
              }}>
                Create Class
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};