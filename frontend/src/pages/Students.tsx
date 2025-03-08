// frontend/src/pages/Students.tsx
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dashboardApi } from '@/services/api';
import { RefreshCw, Search, Download, UserPlus } from 'lucide-react';
import { AddStudentDialog } from '@/components/students/AddStudentDialog';
import { StudentDetailsDialog } from '@/components/students/StudentDetailsDialog';

export const Students = () => {
  const [students, setStudents] = useState([]);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  useEffect(() => {
    fetchStudentsData();
    fetchParentsData();
  }, []);
  
  const fetchStudentsData = async () => {
    try {
      setLoading(true);
      const data = await dashboardApi.getStudents();
      setStudents(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students data');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchParentsData = async () => {
    try {
      const data = await dashboardApi.getParents();
      setParents(data);
    } catch (err) {
      console.error('Error fetching parents:', err);
    }
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    fetchStudentsData();
  };
  
  const handleAddStudent = async (studentData) => {
    try {
      await dashboardApi.createStudent(studentData);
      fetchStudentsData();
    } catch (err) {
      console.error('Error creating student:', err);
    }
  };
  
  const handleViewStudent = (student) => {
    setSelectedStudent(student);
  };
  
  const getParentName = (parentId) => {
    const parent = parents.find(p => p.id === parentId);
    return parent ? parent.full_name : 'Unknown';
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Student Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchStudentsData()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total Students</h3>
          <p className="text-3xl font-bold">{students.length}</p>
          <p className="text-sm text-gray-500">Currently enrolled</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Guardians</h3>
          <p className="text-3xl font-bold">{parents.length}</p>
          <p className="text-sm text-gray-500">Registered parents</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Average Age</h3>
          <p className="text-3xl font-bold">7</p>
          <p className="text-sm text-gray-500">Years</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Attendance Rate</h3>
          <p className="text-3xl font-bold">87%</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '87%' }}></div>
          </div>
        </div>
      </div>
      
      {/* Student Directory */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Student Directory</h2>
        
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="bg-blue-50">All Students</Button>
            <Button variant="outline">Pre-K</Button>
            <Button variant="outline">Kindergarten</Button>
            <Button variant="outline">Elementary</Button>
          </div>
          
          <div className="flex gap-2">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="search"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 sm:w-64"
              />
              <Button type="submit" variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            <div className="flex gap-2">
              <select className="px-3 py-2 bg-white border rounded-md text-sm">
                <option>All Grades</option>
              </select>
              <select className="px-3 py-2 bg-white border rounded-md text-sm">
                <option>All Statuses</option>
              </select>
              <Button variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Students Table */}
        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID / Admission #
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date of Birth
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parent/Guardian
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No students found
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr 
                    key={student.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewStudent(student)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
                          {student.first_name?.charAt(0)}{student.last_name?.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.first_name} {student.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Class: {student.class_name || 'Not assigned'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.id}</div>
                      <div className="text-sm text-gray-500">{student.admission_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(student.date_of_birth)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getParentName(student.parent_id)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-gray-400 hover:text-gray-500">
                        •••
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Add Student Dialog */}
      {isAddDialogOpen && (
        <AddStudentDialog
          parents={parents}
          onClose={() => setIsAddDialogOpen(false)}
          onAdd={handleAddStudent}
        />
      )}
      
      {/* Student Details Dialog */}
      {selectedStudent && (
        <StudentDetailsDialog
          student={selectedStudent}
          parentName={getParentName(selectedStudent.parent_id)}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
};