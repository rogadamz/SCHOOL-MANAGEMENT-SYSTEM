// src/pages/Fees.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DollarSign, CreditCard, Calendar, Search, 
  Filter, Download, Plus, Edit, Trash2, RotateCw 
} from 'lucide-react';
import { dashboardApi, Fee, Student } from '@/services/api';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Fees = () => {
  const [fees, setFees] = useState<Fee[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Financial summary states
  const [summary, setSummary] = useState({
    totalAmount: 0,
    totalPaid: 0,
    totalBalance: 0,
    paymentRate: 0
  });

  useEffect(() => {
    fetchFees();
    fetchStudents();
  }, []);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const data = await dashboardApi.getAllFees();
      setFees(data);
      
      // Calculate financial summary
      const totalAmount = data.reduce((sum, fee) => sum + fee.amount, 0);
      const totalPaid = data.reduce((sum, fee) => sum + fee.paid, 0);
      const totalBalance = totalAmount - totalPaid;
      const paymentRate = totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;
      
      setSummary({
        totalAmount,
        totalPaid,
        totalBalance,
        paymentRate
      });
    } catch (error) {
      console.error('Error fetching fees:', error);
      
      // Fallback data
      setFees([
        {
          id: 1,
          student_id: 1,
          amount: 1500,
          description: "Tuition Fee",
          due_date: "2024-03-01",
          paid: 1500,
          status: "paid",
          term: "Term 1",
          academic_year: "2023-2024"
        },
        {
          id: 2,
          student_id: 2,
          amount: 1500,
          description: "Tuition Fee",
          due_date: "2024-03-01",
          paid: 800,
          status: "partial",
          term: "Term 1",
          academic_year: "2023-2024"
        },
        {
          id: 3,
          student_id: 3,
          amount: 1500,
          description: "Tuition Fee",
          due_date: "2024-03-01",
          paid: 0,
          status: "pending",
          term: "Term 1",
          academic_year: "2023-2024"
        }
      ]);
      
      setSummary({
        totalAmount: 4500,
        totalPaid: 2300,
        totalBalance: 2200,
        paymentRate: 51.1
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await dashboardApi.getStudents();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
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
    
    return matchesSearch && matchesStatus;
  });

  // Handle payment record
  const handleRecordPayment = (fee: Fee) => {
    setSelectedFee(fee);
    setIsEditModalOpen(true);
  };

  // Mock record payment function (in a real app, you'd call an API)
  const recordPayment = (feeId: number, amount: number) => {
    setFees(fees.map(fee => {
      if (fee.id === feeId) {
        const newPaid = fee.paid + amount;
        const newStatus = newPaid >= fee.amount ? 'paid' : newPaid > 0 ? 'partial' : 'pending';
        
        return {
          ...fee,
          paid: newPaid,
          status: newStatus
        };
      }
      return fee;
    }));
    
    setIsEditModalOpen(false);
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
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
                <h3 className="text-3xl font-bold">${summary.totalPaid.toLocaleString()}</h3>
                <p className="text-sm mt-2 opacity-75">
                  {summary.paymentRate.toFixed(1)}% of total fees
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
                <h3 className="text-3xl font-bold">${summary.totalBalance.toLocaleString()}</h3>
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
                <h3 className="text-3xl font-bold">${summary.totalAmount.toLocaleString()}</h3>
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
                <h3 className="text-3xl font-bold">{summary.paymentRate.toFixed(1)}%</h3>
                <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${summary.paymentRate}%` }}
                  ></div>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-gray-100">
                <DollarSign className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Filters */}
      <div className="mb-6">
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="all">All Fees</TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
              <TabsTrigger value="partial">Partial</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2">
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
              
              <Button variant="outline" onClick={fetchFees}>
                <RotateCw className="h-4 w-4" />
              </Button>
              
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Fee
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
              loading={loading}
            />
          </TabsContent>
          
          <TabsContent value="overdue" className="mt-0">
            <FeesTable 
              fees={filteredFees.filter(fee => fee.status === 'overdue')} 
              students={students}
              getStudentName={getStudentName}
              getStatusBadgeClass={getStatusBadgeClass}
              onRecordPayment={handleRecordPayment}
              loading={loading}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Mock Payment Modal */}
      {isEditModalOpen && selectedFee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Record Payment</h3>
            <p className="mb-4">
              <span className="font-semibold">Student:</span> {getStudentName(selectedFee.student_id)}<br />
              <span className="font-semibold">Fee:</span> {selectedFee.description}<br />
              <span className="font-semibold">Amount:</span> ${selectedFee.amount}<br />
              <span className="font-semibold">Already Paid:</span> ${selectedFee.paid}<br />
              <span className="font-semibold">Balance:</span> ${selectedFee.amount - selectedFee.paid}
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Payment Amount</label>
              <Input 
                type="number" 
                placeholder="Enter amount" 
                defaultValue={selectedFee.amount - selectedFee.paid}
                id="payment-amount"
                min="0"
                max={selectedFee.amount - selectedFee.paid}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  const amountInput = document.getElementById('payment-amount') as HTMLInputElement;
                  const amount = parseFloat(amountInput.value);
                  recordPayment(selectedFee.id, amount);
                }}
              >
                Save Payment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface FeesTableProps {
  fees: Fee[];
  students: Student[];
  getStudentName: (studentId: number) => string;
  getStatusBadgeClass: (status: string) => string;
  onRecordPayment: (fee: Fee) => void;
  loading: boolean;
}

const FeesTable: React.FC<FeesTableProps> = ({ 
  fees, 
  students, 
  getStudentName, 
  getStatusBadgeClass,
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
              <tr key={fee.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {getStudentName(fee.student_id)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {fee.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  ${fee.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  ${fee.paid.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  ${(fee.amount - fee.paid).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(fee.due_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(fee.status)}`}>
                    {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                  <div className="flex justify-end space-x-2">
                    <button 
                      className="text-blue-600 hover:text-blue-900"
                      onClick={() => onRecordPayment(fee)}
                      disabled={fee.status === 'paid'}
                    >
                      <DollarSign className="h-4 w-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};