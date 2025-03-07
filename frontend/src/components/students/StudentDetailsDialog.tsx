// frontend/src/components/students/StudentDetailsDialog.tsx
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { dashboardApi, Student, Fee, ReportCard } from '@/services/api';
import { 
  User, 
  Mail, 
  Calendar, 
  School, 
  UserPlus, 
  BookOpen, 
  FileText,
  DollarSign
} from 'lucide-react';

interface StudentDetailsDialogProps {
  student: Student;
  parentName: string;
  onClose: () => void;
}

export const StudentDetailsDialog = ({ student, parentName, onClose }: StudentDetailsDialogProps) => {
  const [fees, setFees] = useState<Fee[]>([]);
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      setLoading(true);
      try {
        // Fetch student fees and report cards in parallel
        const [feesData, reportCardsData] = await Promise.all([
          dashboardApi.getStudentFees(student.id),
          dashboardApi.getStudentReportCards(student.id)
        ]);
        
        setFees(feesData);
        setReportCards(reportCardsData);
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [student.id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Calculate total fees data
  const totalFees = fees.reduce((sum, fee) => sum + fee.amount, 0);
  const totalPaid = fees.reduce((sum, fee) => sum + fee.paid, 0);
  const totalDue = totalFees - totalPaid;
  const paymentRate = totalFees > 0 ? (totalPaid / totalFees) * 100 : 0;

  // Calculate age
  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[750px]">
        <DialogHeader>
          <DialogTitle>Student Profile</DialogTitle>
          <DialogDescription>
            Detailed information about {student.first_name} {student.last_name}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="academics">Academics</TabsTrigger>
            <TabsTrigger value="finances">Finances</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <UserPlus className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{student.first_name} {student.last_name}</h3>
                  <p className="text-sm text-gray-500">Student</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <School className="h-4 w-4 text-gray-500" />
                  <span>Admission #: {student.admission_number}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>DOB: {formatDate(student.date_of_birth)} ({calculateAge(student.date_of_birth)} years)</span>
                </div>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium mb-2">Parent/Guardian Information</h4>
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>{parentName}</span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="academics">
            <div className="space-y-4 py-2">
              <h4 className="font-medium">Report Cards</h4>
              
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin h-6 w-6 border-b-2 border-primary rounded-full"></div>
                </div>
              ) : reportCards.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No report cards available</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reportCards.map((reportCard, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{reportCard.term}</CardTitle>
                        <CardDescription>{reportCard.academic_year}</CardDescription>
                      </CardHeader>
                      <CardContent className="text-sm">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span>{formatDate(reportCard.issue_date)}</span>
                          </div>
                          <Button size="sm" variant="outline">View</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              <h4 className="font-medium mt-6">Classes</h4>
              <p className="text-gray-500 text-center py-4">Class information not available</p>
            </div>
          </TabsContent>
          
          <TabsContent value="finances">
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalFees)}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div>
                    <p className="text-xs text-gray-500">{paymentRate.toFixed(1)}% complete</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Balance Due</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalDue)}</div>
                  </CardContent>
                </Card>
              </div>
              
              <h4 className="font-medium">Fee Records</h4>
              
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin h-6 w-6 border-b-2 border-primary rounded-full"></div>
                </div>
              ) : fees.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No fee records available</p>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Paid</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Due Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {fees.map((fee, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-gray-500" />
                              {fee.description}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            {formatCurrency(fee.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            {formatCurrency(fee.paid)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={
                              fee.status === 'paid' ? 'bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium' :
                              fee.status === 'pending' ? 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium' :
                              'bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium'
                            }>
                              {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            {formatDate(fee.due_date)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};