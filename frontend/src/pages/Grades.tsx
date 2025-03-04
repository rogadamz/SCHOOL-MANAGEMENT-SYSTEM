// src/pages/Grades.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, Plus, Edit, FileText, Download, 
  TrendingUp, BarChart, Award, Book
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { dashboardApi, Student } from '@/services/api';

// Define Grade interface (add to api.ts in a real app)
interface Grade {
  id: number;
  student_id: number;
  subject: string;
  score: number;
  grade_letter: string;
  term: string;
  date_recorded: string;
  student_name?: string;
}

export const Grades = () => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTerm, setSelectedTerm] = useState<string>('Term 1');
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isAddGradeModalOpen, setIsAddGradeModalOpen] = useState(false);
  const [isStudentReportModalOpen, setIsStudentReportModalOpen] = useState(false);
  
  // Performance metrics
  const [performanceMetrics, setPerformanceMetrics] = useState({
    classAverage: 0,
    topScore: 0,
    passRate: 0,
    improvementRate: 0
  });

  // Available terms and classes (would come from API in a real app)
  const terms = ['Term 1', 'Term 2', 'Term 3'];
  const classes = ['Butterfly Class (Pre-K)', 'Sunshine Class (Kindergarten)'];
  const subjects = ['Reading', 'Writing', 'Math', 'Science', 'Art', 'Social Skills'];

  useEffect(() => {
    fetchStudents();
    fetchGrades();
  }, [selectedTerm, selectedClass]);

  const fetchStudents = async () => {
    try {
      const data = await dashboardApi.getStudents();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
      // Fallback sample data
      setStudents([
        { id: 1, first_name: 'James', last_name: 'Brown', admission_number: 'ST-2023-001' },
        { id: 2, first_name: 'Emily', last_name: 'Brown', admission_number: 'ST-2023-002' },
        { id: 3, first_name: 'Michael', last_name: 'Davis', admission_number: 'ST-2023-003' }
      ]);
    }
  };

  const fetchGrades = async () => {
    try {
      setLoading(true);
      
      // In a real app, you would fetch grades from API with term and class filters
      // const data = await dashboardApi.getGrades(selectedTerm, selectedClass);
      
      // Sample data for demonstration
      const sampleGrades: Grade[] = [
        {
          id: 1,
          student_id: 1,
          subject: 'Reading',
          score: 92,
          grade_letter: 'A',
          term: 'Term 1',
          date_recorded: '2024-01-15',
          student_name: 'James Brown'
        },
        {
          id: 2,
          student_id: 1,
          subject: 'Math',
          score: 88,
          grade_letter: 'B',
          term: 'Term 1',
          date_recorded: '2024-01-15',
          student_name: 'James Brown'
        },
        {
          id: 3,
          student_id: 2,
          subject: 'Reading',
          score: 95,
          grade_letter: 'A',
          term: 'Term 1',
          date_recorded: '2024-01-15',
          student_name: 'Emily Brown'
        },
        {
          id: 4,
          student_id: 2,
          subject: 'Math',
          score: 90,
          grade_letter: 'A',
          term: 'Term 1',
          date_recorded: '2024-01-15',
          student_name: 'Emily Brown'
        },
        {
          id: 5,
          student_id: 3,
          subject: 'Reading',
          score: 80,
          grade_letter: 'B',
          term: 'Term 1',
          date_recorded: '2024-01-15',
          student_name: 'Michael Davis'
        },
        {
          id: 6,
          student_id: 3,
          subject: 'Math',
          score: 75,
          grade_letter: 'C',
          term: 'Term 1',
          date_recorded: '2024-01-15',
          student_name: 'Michael Davis'
        }
      ];
      
      // Filter grades based on selected term and class (in a real app, this would be done by the API)
      const filteredGrades = sampleGrades.filter(grade => {
        return grade.term === selectedTerm;
      });
      
      setGrades(filteredGrades);
      
      // Calculate performance metrics
      const allScores = filteredGrades.map(grade => grade.score);
      const classAverage = allScores.length > 0 
        ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length 
        : 0;
      
      const topScore = allScores.length > 0 ? Math.max(...allScores) : 0;
      const passRate = allScores.length > 0 
        ? (allScores.filter(score => score >= 70).length / allScores.length) * 100 
        : 0;
      
      // Improvement rate (would be calculated from previous term in a real app)
      const improvementRate = 5.2;  // Sample data
      
      setPerformanceMetrics({
        classAverage,
        topScore,
        passRate,
        improvementRate
      });
      
    } catch (error) {
      console.error('Error fetching grades:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group grades by student_id
  const gradesByStudent: Record<number, Grade[]> = {};
  grades.forEach(grade => {
    if (!gradesByStudent[grade.student_id]) {
      gradesByStudent[grade.student_id] = [];
    }
    gradesByStudent[grade.student_id].push(grade);
  });

  // Filter students based on search query
  const filteredStudentIds = Object.keys(gradesByStudent)
    .map(Number)
    .filter(studentId => {
      const studentGrades = gradesByStudent[studentId];
      const studentName = studentGrades[0]?.student_name?.toLowerCase() || '';
      
      return studentName.includes(searchQuery.toLowerCase());
    });

  const handleShowStudentReport = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setSelectedStudent(student);
      setIsStudentReportModalOpen(true);
    }
  };

  // Calculate student's average score
  const calculateStudentAverage = (studentId: number): number => {
    const studentGrades = gradesByStudent[studentId];
    if (!studentGrades || studentGrades.length === 0) return 0;
    
    const sum = studentGrades.reduce((total, grade) => total + grade.score, 0);
    return sum / studentGrades.length;
  };

  // Export grades to CSV
  const exportGradesToCSV = () => {
    const csvContent = 'Student Name,Subject,Score,Grade,Term,Date Recorded\n' + 
      grades.map(grade => {
        return `"${grade.student_name}","${grade.subject}",${grade.score},"${grade.grade_letter}","${grade.term}","${grade.date_recorded}"`;
      }).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `grades_${selectedTerm.replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Grades & Results</h2>
      </div>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium opacity-90 mb-1">Class Average</p>
                <h3 className="text-3xl font-bold">{performanceMetrics.classAverage.toFixed(1)}%</h3>
                <div className="text-sm mt-2 opacity-75 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {performanceMetrics.improvementRate}% from last term
                </div>
              </div>
              <div className="p-3 rounded-lg bg-blue-400/20">
                <BarChart className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium opacity-90 mb-1">Top Score</p>
                <h3 className="text-3xl font-bold">{performanceMetrics.topScore}%</h3>
                <p className="text-sm mt-2 opacity-75">
                  Highest performance
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-400/20">
                <Award className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium opacity-90 mb-1">Pass Rate</p>
                <h3 className="text-3xl font-bold">{performanceMetrics.passRate.toFixed(1)}%</h3>
                <p className="text-sm mt-2 opacity-75">
                  Students scoring 70% or higher
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-400/20">
                <Book className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium opacity-90 mb-1">Subjects</p>
                <h3 className="text-3xl font-bold">{subjects.length}</h3>
                <p className="text-sm mt-2 opacity-75">
                  Across all classes
                </p>
              </div>
              <div className="p-3 rounded-lg bg-amber-400/20">
                <Book className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
              <select 
                className="rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
              >
                {terms.map(term => (
                  <option key={term} value={term}>{term}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <select 
                className="rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedClass || ''}
                onChange={(e) => setSelectedClass(e.target.value || null)}
              >
                <option value="">All Classes</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search student..."
                className="pl-8 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Button variant="outline" onClick={exportGradesToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            <Button onClick={() => setIsAddGradeModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Grade
            </Button>
          </div>
        </div>
      </div>

      {/* Grades Tabs */}
      <Tabs defaultValue="students">
        <TabsList className="mb-4">
          <TabsTrigger value="students">By Student</TabsTrigger>
          <TabsTrigger value="subjects">By Subject</TabsTrigger>
        </TabsList>
        
        <TabsContent value="students">
          {/* Student Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  {subjects.map(subject => (
                    <th key={subject} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {subject}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Average
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={subjects.length + 3} className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500"></div>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">Loading grades...</p>
                    </td>
                  </tr>
                ) : filteredStudentIds.length === 0 ? (
                  <tr>
                    <td colSpan={subjects.length + 3} className="px-6 py-8 text-center text-gray-500">
                      No grades found matching your filters
                    </td>
                  </tr>
                ) : (
                  filteredStudentIds.map(studentId => {
                    const studentGrades = gradesByStudent[studentId];
                    const studentName = studentGrades[0]?.student_name || 'Unknown Student';
                    const studentAverage = calculateStudentAverage(studentId);
                    
                    return (
                      <tr key={studentId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {studentName}
                        </td>
                        
                        {subjects.map(subject => {
                          const subjectGrade = studentGrades.find(g => g.subject === subject);
                          
                          return (
                            <td key={`${studentId}-${subject}`} className="px-6 py-4 whitespace-nowrap text-center">
                              {subjectGrade ? (
                                <div>
                                  <span className={`font-semibold ${
                                    subjectGrade.score >= 90 ? 'text-green-600' :
                                    subjectGrade.score >= 80 ? 'text-blue-600' :
                                    subjectGrade.score >= 70 ? 'text-amber-600' :
                                    'text-red-600'
                                  }`}>
                                    {subjectGrade.grade_letter}
                                  </span>
                                  <span className="text-xs text-gray-500 ml-1">
                                    ({subjectGrade.score}%)
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">N/A</span>
                              )}
                            </td>
                          );
                        })}
                        
                        <td className="px-6 py-4 whitespace-nowrap text-center font-medium">
                          <span className={`${
                            studentAverage >= 90 ? 'text-green-600' :
                            studentAverage >= 80 ? 'text-blue-600' :
                            studentAverage >= 70 ? 'text-amber-600' :
                            'text-red-600'
                          }`}>
                            {studentAverage.toFixed(1)}%
                          </span>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleShowStudentReport(studentId)}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Report
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
        
        <TabsContent value="subjects">
          {/* Subject View */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map(subject => {
              // Get all grades for this subject
              const subjectGrades = grades.filter(g => g.subject === subject);
              
              // Calculate average for this subject
              const subjectAverage = subjectGrades.length > 0
                ? subjectGrades.reduce((sum, g) => sum + g.score, 0) / subjectGrades.length
                : 0;
              
              // Get grade distribution
              const gradeDistribution = {
                A: subjectGrades.filter(g => g.grade_letter === 'A').length,
                B: subjectGrades.filter(g => g.grade_letter === 'B').length,
                C: subjectGrades.filter(g => g.grade_letter === 'C').length,
                D: subjectGrades.filter(g => g.grade_letter === 'D').length,
                F: subjectGrades.filter(g => g.grade_letter === 'F').length,
              };
              
              return (
                <Card key={subject}>
                  <CardHeader>
                    <CardTitle>{subject}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="text-3xl font-bold mb-1">{subjectAverage.toFixed(1)}%</div>
                      <div className="text-sm text-gray-500">Class Average</div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Grade Distribution</h4>
                      <div className="grid grid-cols-5 gap-1">
                        {Object.entries(gradeDistribution).map(([grade, count]) => (
                          <div key={grade} className="text-center">
                            <div className={`text-sm font-semibold ${
                              grade === 'A' ? 'text-green-600' :
                              grade === 'B' ? 'text-blue-600' :
                              grade === 'C' ? 'text-amber-600' :
                              grade === 'D' ? 'text-orange-600' :
                              'text-red-600'
                            }`}>
                              {grade}
                            </div>
                            <div className="text-xs text-gray-500">{count}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between text-sm">
                        <div>
                          <div className="font-medium">Highest</div>
                          <div>{subjectGrades.length > 0 ? Math.max(...subjectGrades.map(g => g.score)) : 'N/A'}%</div>
                        </div>
                        <div>
                          <div className="font-medium">Lowest</div>
                          <div>{subjectGrades.length > 0 ? Math.min(...subjectGrades.map(g => g.score)) : 'N/A'}%</div>
                        </div>
                        <div>
                          <div className="font-medium">Pass Rate</div>
                          <div>
                            {subjectGrades.length > 0
                              ? ((subjectGrades.filter(g => g.score >= 70).length / subjectGrades.length) * 100).toFixed(0)
                              : 'N/A'}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Grade Modal */}
      {isAddGradeModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Add New Grade</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Student</label>
                <select className="w-full rounded-md border border-input p-2">
                  <option value="">Select Student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.first_name} {student.last_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <select className="w-full rounded-md border border-input p-2">
                  <option value="">Select Subject</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Score</label>
                <Input 
                  type="number" 
                  min="0"
                  max="100"
                  placeholder="Enter score (0-100)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Term</label>
                <select className="w-full rounded-md border border-input p-2" defaultValue={selectedTerm}>
                  {terms.map(term => (
                    <option key={term} value={term}>{term}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsAddGradeModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                // In a real app, save the grade to the API
                setIsAddGradeModalOpen(false);
              }}>
                Save Grade
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Student Report Modal */}
      {isStudentReportModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold">Student Report Card</h3>
                <p className="text-gray-500">
                  {selectedStudent.first_name} {selectedStudent.last_name} - {selectedTerm}
                </p>
              </div>
              
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Download className="h-4 w-4 mr-2" />
                Print Report
              </Button>
            </div>
            
            <div className="border-t border-b py-4 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Student ID</p>
                  <p className="font-medium">{selectedStudent.admission_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Class</p>
                  <p className="font-medium">
                    {selectedStudent.id === 1 || selectedStudent.id === 2 
                      ? 'Butterfly Class (Pre-K)' 
                      : 'Sunshine Class (Kindergarten)'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="font-medium mb-3">Academic Performance</h4>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Grade</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Comments</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {gradesByStudent[selectedStudent.id]?.map(grade => (
                    <tr key={grade.id}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                        {grade.subject}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-center">
                        {grade.score}%
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-center">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          grade.grade_letter === 'A' ? 'bg-green-100 text-green-800' :
                          grade.grade_letter === 'B' ? 'bg-blue-100 text-blue-800' :
                          grade.grade_letter === 'C' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {grade.grade_letter}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {grade.grade_letter === 'A' ? 'Excellent understanding of concepts.' :
                         grade.grade_letter === 'B' ? 'Good progress, consistent effort shown.' :
                         grade.grade_letter === 'C' ? 'Satisfactory performance, needs more practice.' :
                         'Needs improvement, requires additional support.'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-bold">Average</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-center font-bold">
                      {calculateStudentAverage(selectedStudent.id).toFixed(1)}%
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-center font-bold">
                      {(() => {
                        const avg = calculateStudentAverage(selectedStudent.id);
                        let letter = '';
                        if (avg >= 90) letter = 'A';
                        else if (avg >= 80) letter = 'B';
                        else if (avg >= 70) letter = 'C';
                        else if (avg >= 60) letter = 'D';
                        else letter = 'F';
                        
                        return (
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            letter === 'A' ? 'bg-green-100 text-green-800' :
                            letter === 'B' ? 'bg-blue-100 text-blue-800' :
                            letter === 'C' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {letter}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div className="mb-6">
              <h4 className="font-medium mb-3">Teacher's Comments</h4>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-700">
                  {calculateStudentAverage(selectedStudent.id) >= 90 
                    ? `${selectedStudent.first_name} is an exceptional student who consistently demonstrates a strong understanding of all subjects. Keep up the excellent work!` 
                    : calculateStudentAverage(selectedStudent.id) >= 80 
                    ? `${selectedStudent.first_name} is making good progress in all areas. Continues to be engaged and enthusiastic about learning.` 
                    : calculateStudentAverage(selectedStudent.id) >= 70 
                    ? `${selectedStudent.first_name} is performing satisfactorily across subjects. With more focused effort, scores could improve.` 
                    : `${selectedStudent.first_name} requires additional support in several areas. We recommend scheduling a parent-teacher conference to discuss strategies for improvement.`}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={() => setIsStudentReportModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};