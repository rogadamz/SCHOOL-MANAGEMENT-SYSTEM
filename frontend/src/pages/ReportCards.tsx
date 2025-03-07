// frontend/src/pages/ReportCards.tsx
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Search, Loader2, FileText, Download, Eye } from 'lucide-react';
import { dashboardApi, Student, ReportCard } from '@/services/api';
import { ViewReportCardDialog } from '@/components/report-cards/ViewReportCardDialog';

export const ReportCards = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [selectedReportCard, setSelectedReportCard] = useState<ReportCard | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingReportCards, setLoadingReportCards] = useState(false);
  const [termFilter, setTermFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [availableTerms, setAvailableTerms] = useState<string[]>([]);
  const [availableYears, setAvailableYears] = useState<string[]>([]);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const studentsData = await dashboardApi.getStudents();
        setStudents(studentsData);
        setFilteredStudents(studentsData);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
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

  const handleStudentSelect = async (student: Student) => {
    setSelectedStudent(student);
    setLoadingReportCards(true);
    
    try {
      const reportCardsData = await dashboardApi.getStudentReportCards(student.id);
      setReportCards(reportCardsData);
      
      // Extract available terms and academic years
      const terms = [...new Set(reportCardsData.map(rc => rc.term))];
      const years = [...new Set(reportCardsData.map(rc => rc.academic_year))];
      
      setAvailableTerms(terms);
      setAvailableYears(years);
    } catch (error) {
      console.error('Error fetching report cards:', error);
      setReportCards([]);
    } finally {
      setLoadingReportCards(false);
    }
  };

  const handleViewReportCard = (reportCard: ReportCard) => {
    setSelectedReportCard(reportCard);
    setIsViewDialogOpen(true);
  };

  const getFilteredReportCards = () => {
    return reportCards.filter(rc => {
      if (termFilter !== 'all' && rc.term !== termFilter) return false;
      if (yearFilter !== 'all' && rc.academic_year !== yearFilter) return false;
      return true;
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Report Cards</h1>

        {/* Search and Student Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Student Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
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
            
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Admission #</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                          No students found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStudents.map((student) => (
                        <TableRow 
                          key={student.id} 
                          className={selectedStudent?.id === student.id ? "bg-muted/50" : ""}
                        >
                          <TableCell>{student.admission_number}</TableCell>
                          <TableCell>
                            {student.first_name} {student.last_name}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant={selectedStudent?.id === student.id ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleStudentSelect(student)}
                            >
                              Select
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

        {/* Report Cards List */}
        {selectedStudent && (
          <Card>
            <CardHeader>
              <CardTitle>
                Report Cards for {selectedStudent.first_name} {selectedStudent.last_name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Term:</span>
                  <Select value={termFilter} onValueChange={setTermFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="All Terms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Terms</SelectItem>
                      {availableTerms.map(term => (
                        <SelectItem key={term} value={term}>{term}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Year:</span>
                  <Select value={yearFilter} onValueChange={setYearFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="All Years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {availableYears.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {loadingReportCards ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Academic Year</TableHead>
                        <TableHead>Term</TableHead>
                        <TableHead>Issue Date</TableHead>
                        <TableHead># of Subjects</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredReportCards().length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            No report cards found
                          </TableCell>
                        </TableRow>
                      ) : (
                        getFilteredReportCards().map((reportCard) => (
                          <TableRow key={reportCard.id}>
                            <TableCell>{reportCard.academic_year}</TableCell>
                            <TableCell>{reportCard.term}</TableCell>
                            <TableCell>{new Date(reportCard.issue_date).toLocaleDateString()}</TableCell>
                            <TableCell>{reportCard.grade_summaries?.length || 0} subjects</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleViewReportCard(reportCard)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Export
                                </Button>
                              </div>
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
        )}
      </div>

      {/* View Report Card Dialog */}
      {isViewDialogOpen && selectedReportCard && selectedStudent && (
        <ViewReportCardDialog
          reportCard={selectedReportCard}
          student={selectedStudent}
          onClose={() => {
            setIsViewDialogOpen(false);
            setSelectedReportCard(null);
          }}
        />
      )}
    </DashboardLayout>
  );
};