// frontend/src/pages/Accounts.tsx
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  DollarSign, CreditCard, Calendar, Search, 
  Filter, Download, Plus, Edit, Trash2, RotateCw, 
  AlertCircle, TrendingUp, CheckCircle, ChevronDown
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddFeeDialog } from '@/components/accounts/AddFeeDialog';
import { RecordPaymentDialog } from '@/components/accounts/RecordPaymentDialog';
import { dashboardApi, Fee, Student } from '@/services/api';

export const Accounts = () => {
  const [fees, setFees] = useState<Fee[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [isAddFeeModalOpen, setIsAddFeeModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [financialSummary, setFinancialSummary] = useState({
    totalAmount: 0,
    totalPaid: 0,
    totalBalance: 0,
    paymentRate: 0,
    studentCount: 0,
    paidCount: 0,
    partialCount: 0,
    unpaidCount: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch fees, students, and financial summary in parallel
      const [feesData, studentsData, summaryData] = await Promise.all([
        dashboardApi.getFees(),
        dashboardApi.getStudents(),
        dashboardApi.getFeeSummary()
      ]);
      
      setFees(feesData);
      setStudents(studentsData);
      setFinancialSummary({
        totalAmount: summaryData.total_amount,
        totalPaid: summaryData.total_paid,
        totalBalance: summaryData.total_balance,
        paymentRate: summaryData.payment_rate,
        studentCount: summaryData.student_count,
        paidCount: summaryData.paid_count,
        partialCount: summaryData.partial_count,
        unpaidCount: summaryData.unpaid_count
      });
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get student name by student_id
  const getStudentName = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.first_name} ${student.last_name}` : 'Unknown Student';
  };

  // Filter fees based on search query and status filter
  const filteredFees = fees.filter(fee => {
    const matchesSearch = searchQuery === '' || 
      getStudentName(fee.student_id).toLowerCase().includes(searchQuery.toLowerCase()) ||
      fee.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = !statusFilter || fee.status === statusFilter;
    const matchesTab = activeTab === 'all' || fee.status === activeTab;
    
    return matchesSearch && matchesStatus && matchesTab;
  });

  // Handle adding a new fee
  const handleAddFee = async (feeData: any) => {
    try {
      await dashboardApi.createFee(feeData.student_id, {
        amount: feeData.amount,
        description: feeData.description,
        due_date: feeData.due_date,
        paid: feeData.paid || 0,
        status: feeData.paid >= feeData.amount ? 'paid' : feeData.paid > 0 ? 'partial' : 'pending',
        term: feeData.term,
        academic_year: feeData.academic_year
      });
      
      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Error adding fee:', error);
    }
  };

  // Handle payment record
  const handleRecordPayment = (fee: Fee) => {
    setSelectedFee(fee);
    setIsPaymentModalOpen(true);
  };

  // Process payment
  const recordPayment = async (feeId: number, amount: number) => {
    try {
      await dashboardApi.recordPayment(feeId, amount);
      fetchData();
      setIsPaymentModalOpen(false);
    } catch (error) {
      console.error('Error recording payment:', error);
    }
  };

  // Export fees data to CSV
  const exportToCSV = () => {
    // Create CSV content
    let csv = 'Student,Description,Amount,Paid,Balance,Due Date,Status,Term\n';
    
    filteredFees.forEach(fee => {
      const studentName = getStudentName(fee.student_id);
      const balance = fee.amount - fee.paid;
      
      csv += `"${studentName}","${fee.description}",${fee.amount},${fee.paid},${balance},"${fee.due_date}","${fee.status}","${fee.term}"\n`;
    });
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fees_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Get status badge style based on status
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate if a fee is overdue
  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'paid') return false;
    
    const today = new Date();
    const due = new Date(dueDate);
    return due < today;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Fees Management</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium opacity-90 mb-1">Total Collected</p>
                <h3 className="text-3xl font-bold">{formatCurrency(financialSummary.totalPaid)}</h3>
                <p className="text-sm mt-2 opacity-75">
                  {financialSummary.paymentRate.toFixed(1)}% of total fees
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-400/20">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium opacity-90 mb-1">Balance Due</p>
                <h3 className="text-3xl font-bold">{formatCurrency(financialSummary.totalBalance)}</h3>
                <p className="text-sm mt-2 opacity-75">
                  Remaining to be collected
                </p>
              </div>
              <div className="p-3 rounded-lg bg-red-400/20">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium opacity-90 mb-1">Total Fees</p>
                <h3 className="text-3xl font-bold">{formatCurrency(financialSummary.totalAmount)}</h3>
                <p className="text-sm mt-2 opacity-75">
                  Expected revenue
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-400/20">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border text-gray-800">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Payment Rate</p>
                <h3 className="text-3xl font-bold">{financialSummary.paymentRate.toFixed(1)}%</h3>
                <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${financialSummary.paymentRate}%` }}
                  ></div>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-gray-100">
                <TrendingUp className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Paid Fees</p>
              <p className="text-xl font-bold">{financialSummary.paidCount} students</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Partial Payments</p>
              <p className="text-xl font-bold">{financialSummary.partialCount} students</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Unpaid Fees</p>
              <p className="text-xl font-bold">{financialSummary.unpaidCount} students</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Filters */}
      <div className="mb-6">
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
            <TabsList>
              <TabsTrigger value="all">All Fees</TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
              <TabsTrigger value="partial">Partial</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search student or description..."
                  className="pl-8 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              
              <Button variant="outline" onClick={fetchData}>
                <RotateCw className="h-4 w-4" />
              </Button>
              
              <Button onClick={() => setIsAddFeeModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Fee
              </Button>
            </div>
          </div>

          <TabsContent value="all" className="mt-0">
            <FeesTable 
              fees={filteredFees} 
              students={students}
              getStudentName={getStudentName}
              getStatusBadgeClass={getStatusBadgeClass}
              onRecordPayment={handleRecordPayment}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
              isOverdue={isOverdue}
              loading={loading}
            />
          </TabsContent>
          
          <TabsContent value="paid" className="mt-0">
            <FeesTable 
              fees={filteredFees.filter(fee => fee.status === 'paid')} 
              students={students}
              getStudentName={getStudentName}
              getStatusBadgeClass={getStatusBadgeClass}
              onRecordPayment={handleRecordPayment}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
              isOverdue={isOverdue}
              loading={loading}
            />
          </TabsContent>
          
          <TabsContent value="partial" className="mt-0">
            <FeesTable 
              fees={filteredFees.filter(fee => fee.status === 'partial')} 
              students={students}
              getStudentName={getStudentName}
              getStatusBadgeClass={getStatusBadgeClass}
              onRecordPayment={handleRecordPayment}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
              isOverdue={isOverdue}
              loading={loading}
            />
          </TabsContent>
          
          <TabsContent value="pending" className="mt-0">
            <FeesTable 
              fees={filteredFees.filter(fee => fee.status === 'pending')} 
              students={students}
              getStudentName={getStudentName}
              getStatusBadgeClass={getStatusBadgeClass}
              onRecordPayment={handleRecordPayment}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
              isOverdue={isOverdue}
              loading={loading}
            />
          </TabsContent>
          
          <TabsContent value="overdue" className="mt-0">
            <FeesTable 
              fees={filteredFees.filter(fee => isOverdue(fee.due_date, fee.status))} 
              students={students}
              getStudentName={getStudentName}
              getStatusBadgeClass={getStatusBadgeClass}
              onRecordPayment={handleRecordPayment}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
              isOverdue={isOverdue}
              loading={loading}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Fee Dialog */}
      {isAddFeeModalOpen && (
        <AddFeeDialog
          students={students}
          onClose={() => setIsAddFeeModalOpen(false)}
          onAdd={handleAddFee}
        />
      )}

      {/* Payment Dialog */}
      {isPaymentModalOpen && selectedFee && (
        <RecordPaymentDialog
          fee={selectedFee}
          studentName={getStudentName(selectedFee.student_id)}
          onClose={() => setIsPaymentModalOpen(false)}
          onPayment={recordPayment}
        />
      )}
    </div>
  );
};

interface FeesTableProps {
  fees: Fee[];
  students: Student[];
  getStudentName: (studentId: number) => string;
  getStatusBadgeClass: (status: string) => string;
  formatDate: (dateString: string) => string;
  formatCurrency: (amount: number) => string;
  isOverdue: (dueDate: string, status: string) => boolean;
  onRecordPayment: (fee: Fee) => void;
  loading: boolean;
}

const FeesTable: React.FC<FeesTableProps> = ({ 
  fees, 
  students, 
  getStudentName, 
  getStatusBadgeClass,
  formatDate,
  formatCurrency,
  isOverdue,
  onRecordPayment,
  loading 
}) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Student
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Paid
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Balance
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Due Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={8} className="px-6 py-4 text-center">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500"></div>
                </div>
                <p className="mt-2 text-sm text-gray-500">Loading fees...</p>
              </td>
            </tr>
          ) : fees.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                No fees found matching your filters
              </td>
            </tr>
          ) : (
            fees.map((fee) => (
              <tr key={fee.id} className={isOverdue(fee.due_date, fee.status) ? 'bg-red-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {getStudentName(fee.student_id)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {fee.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {formatCurrency(fee.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {formatCurrency(fee.paid)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {formatCurrency(fee.amount - fee.paid)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(fee.due_date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    isOverdue(fee.due_date, fee.status) 
                      ? 'bg-red-100 text-red-800' 
                      : getStatusBadgeClass(fee.status)
                  }`}>
                    {isOverdue(fee.due_date, fee.status) 
                      ? 'Overdue' 
                      : fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => onRecordPayment(fee)}
                        disabled={fee.status === 'paid'}
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        Record Payment
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};