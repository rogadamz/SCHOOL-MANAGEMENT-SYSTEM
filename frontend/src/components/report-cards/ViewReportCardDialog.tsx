// frontend/src/components/report-cards/ViewReportCardDialog.tsx
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReportCard, Student } from '@/services/api';
import { Calendar, User, BookOpen, Download, Printer } from 'lucide-react';

interface ViewReportCardDialogProps {
  reportCard: ReportCard;
  student: Student;
  onClose: () => void;
}

export const ViewReportCardDialog = ({ reportCard, student, onClose }: ViewReportCardDialogProps) => {
  const [activeTab, setActiveTab] = useState('grades');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'text-green-600';
      case 'B':
        return 'text-blue-600';
      case 'C':
        return 'text-yellow-600';
      case 'D':
        return 'text-orange-600';
      case 'F':
        return 'text-red-600';
      default:
        return '';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[750px]">
        <DialogHeader>
          <DialogTitle>Report Card</DialogTitle>
          <DialogDescription>
            {student.first_name} {student.last_name} - {reportCard.term}, {reportCard.academic_year}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Report Card Header */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold">Downtown Nursery School</h2>
              <p className="text-sm text-gray-500">Academic Report Card</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Student:</span>
                <span>{student.first_name} {student.last_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Issue Date:</span>
                <span>{formatDate(reportCard.issue_date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Term:</span>
                <span>{reportCard.term}, {reportCard.academic_year}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Admission Number:</span>
                <span>{student.admission_number}</span>
              </div>
            </div>
          </div>
          
          {/* Report Card Content */}
          <Tabs defaultValue="grades" className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="grades">Grades</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
            </TabsList>
            
            <TabsContent value="grades">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                      <TableHead className="text-right">Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportCard.grade_summaries && reportCard.grade_summaries.length > 0 ? (
                      reportCard.grade_summaries.map((grade, index) => (
                        <TableRow key={index}>
                          <TableCell>{grade.subject}</TableCell>
                          <TableCell className="text-right">{grade.score.toFixed(1)}</TableCell>
                          <TableCell className={`text-right font-bold ${getGradeColor(grade.grade_letter)}`}>
                            {grade.grade_letter}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                          No grade information available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="attendance">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">Attendance Summary</h3>
                <p className="text-sm">{reportCard.attendance_summary}</p>
              </div>
            </TabsContent>
            
            <TabsContent value="comments">
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">Teacher's Comments</h3>
                  <p className="text-sm whitespace-pre-line">{reportCard.teacher_comments}</p>
                </div>
                
                {reportCard.principal_comments && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium mb-2">Principal's Comments</h3>
                    <p className="text-sm whitespace-pre-line">{reportCard.principal_comments}</p>
                  </div>
                )}
                
                {reportCard.grade_summaries && reportCard.grade_summaries.some(gs => gs.comments) && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium mb-2">Subject Comments</h3>
                    <div className="space-y-2">
                      {reportCard.grade_summaries
                        .filter(gs => gs.comments)
                        .map((gs, index) => (
                          <div key={index}>
                            <span className="font-medium">{gs.subject}:</span> {gs.comments}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};