import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DollarSign, CreditCard, Calendar, Search, 
  Filter, Download, Plus, Edit, Trash2, RotateCw, 
  AlertCircle, TrendingUp, CheckCircle, ChevronDown,
  ChevronsUpDown, ArrowUpDown, FileText, Printer,
  Mail, MessageSquare, Share2, CalendarClock, UserPlus,
  BarChart, PieChart, Users
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BarChart as BarChartComponent, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart as PieChartComponent, Pie, Cell } from 'recharts';
import { dashboardApi, Fee, Student } from '@/services/api';

// Mock payment data for demonstration
const PAYMENT_METHODS = [
  { id: 1, name: 'Cash', value: 35000, color: '#2563eb' },
  { id: 2, name: 'Bank Transfer', value: 55000, color: '#16a34a' },
  { id: 3, name: 'Credit Card', value: 28000, color: '#dc2626' },
  { id: 4, name: 'Check', value: 12000, color: '#9333ea' },
];

// Mock fee categories for demonstration
const FEE_CATEGORIES = [
  { id: 1, name: 'Tuition', value: 75000, color: '#2563eb' },
  { id: 2, name: 'Transportation', value: 20000, color: '#16a34a' },
  { id: 3, name: 'Lab Fees', value: 15000, color: '#dc2626' },
  { id: 4, name: 'Materials', value: 10000, color: '#9333ea' },
  { id: 5, name: 'Activities', value: 10000, color: '#f97316' },
];

// Mock payment timeline data
const PAYMENT_TIMELINE = [
  { month: 'Jan', amount: 12000, expected: 15000 },
  { month: 'Feb', amount: 14000, expected: 15000 },
  { month: 'Mar', amount: 13500, expected: 15000 },
  { month: 'Apr', amount: 14800, expected: 15000 },
  { month: 'May', amount: 15200, expected: 15000 },
  { month: 'Jun', amount: 14000, expected: 15000 },
  { month: 'Jul', amount: 13000, expected: 15000 },
  { month: 'Aug', amount: 14500, expected: 15000 },
  { month: 'Sep', amount: 15000, expected: 15000 },
  { month: 'Oct', amount: 14800, expected: 15000 },
  { month: 'Nov', amount: 13500, expected: 15000 },
  { month: 'Dec', amount: 15000, expected: 15000 },
];

// Fee Record interface with extended properties
interface ExtendedFee extends Fee {
  selected?: boolean;
  category?: string;
  payment_method?: string;
  last_payment_date?: string | null;
  invoice_number?: string;
}

export function Accounts() {
  // State management
  const [fees, setFees] = useState<ExtendedFee[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [feeStatus, setFeeStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFee, setSelectedFee] = useState<ExtendedFee | null>(null);
  const [isAddFeeModalOpen, setIsAddFeeModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [allSelected, setAllSelected] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<{start: string, end: string} | null>(null);
  const [sortField, setSortField] = useState<string>('due_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Financial summary state
  const [financialSummary, setFinancialSummary] = useState({
    totalAmount: 0,
    totalPaid: 0,
    totalBalance: 0,
    paymentRate: 0,
    studentCount: 0,
    paidCount: 0,
    partialCount: 0,
    unpaidCount: 0,
    overdueAmount: 0,
  });

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch data from API
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch fees, students, and financial summary in parallel
      const [feesData, studentsData, summaryData] = await Promise.all([
        dashboardApi.getFees(),
        dashboardApi.getStudents(),
        dashboardApi.getFeeSummary()
      ]);
      
      // Enhance fee data with additional properties for demonstration
      const enhancedFees: ExtendedFee[] = feesData.map(fee => ({
        ...fee,
        selected: false,
        category: ['Tuition', 'Transportation', 'Lab Fees', 'Materials', 'Activities'][Math.floor(Math.random() * 5)],
        payment_method: fee.paid > 0 ? ['Cash', 'Bank Transfer', 'Credit Card', 'Check'][Math.floor(Math.random() * 4)] : '-',
        last_payment_date: fee.paid > 0 ? new Date(new Date().setDate(new Date().getDate() - Math.floor(Math.random() * 30))).toISOString() : null,
        invoice_number: `INV-${new Date().getFullYear()}-${10000 + fee.id}`
      }));
      
      setFees(enhancedFees);
      setStudents(studentsData);
      
      // Set financial summary
      setFinancialSummary({
        totalAmount: summaryData.total_amount,
        totalPaid: summaryData.total_paid,
        totalBalance: summaryData.total_balance,
        paymentRate: summaryData.payment_rate,
        studentCount: summaryData.student_count,
        paidCount: summaryData.paid_count,
        partialCount: summaryData.partial_count,
        unpaidCount: summaryData.unpaid_count,
        overdueAmount: calculateOverdueAmount(enhancedFees)
      });
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total overdue amount
  const calculateOverdueAmount = (feesList: ExtendedFee[]): number => {
    return feesList.reduce((total, fee) => {
      const isDueDate = new Date(fee.due_date) < new Date() && fee.status !== 'paid';
      return total + (isDueDate ? (fee.amount - fee.paid) : 0);
    }, 0);
  };

  // Get student name by student_id
  const getStudentName = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.first_name} ${student.last_name}` : 'Unknown Student';
  };

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Apply sorting to fees
  const sortFees = (feesToSort: ExtendedFee[]): ExtendedFee[] => {
    return [...feesToSort].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'student':
          comparison = getStudentName(a.student_id).localeCompare(getStudentName(b.student_id));
          break;
        case 'description':
          comparison = a.description.localeCompare(b.description);
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'paid':
          comparison = a.paid - b.paid;
          break;
        case 'balance':
          comparison = (a.amount - a.paid) - (b.amount - b.paid);
          break;
        case 'due_date':
          comparison = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'category':
          comparison = (a.category || '').localeCompare(b.category || '');
          break;
        default:
          comparison = 0;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  // Apply filters to fees data
  const filteredFees = fees.filter(fee => {
    // Status filter
    const matchesStatus = feeStatus === 'all' || 
                          (feeStatus === 'overdue' ? 
                            (new Date(fee.due_date) < new Date() && fee.status !== 'paid') : 
                            fee.status === feeStatus);

    // Search filter
    const matchesSearch = searchQuery === '' || 
      getStudentName(fee.student_id).toLowerCase().includes(searchQuery.toLowerCase()) ||
      fee.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (fee.invoice_number && fee.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Category filter  
    const matchesCategory = categoryFilter === 'all' || fee.category === categoryFilter;
    
    // Date range filter
    let matchesDateRange = true;
    if (dateRangeFilter) {
      const feeDate = new Date(fee.due_date);
      const startDate = dateRangeFilter.start ? new Date(dateRangeFilter.start) : null;
      const endDate = dateRangeFilter.end ? new Date(dateRangeFilter.end) : null;
      
      if (startDate && endDate) {
        matchesDateRange = feeDate >= startDate && feeDate <= endDate;
      } else if (startDate) {
        matchesDateRange = feeDate >= startDate;
      } else if (endDate) {
        matchesDateRange = feeDate <= endDate;
      }
    }
      
    return matchesStatus && matchesSearch && matchesCategory && matchesDateRange;
  });

  // Apply sorting to filtered fees
  const sortedFees = sortFees(filteredFees);
  
  // Apply pagination to sorted fees
  const paginatedFees = sortedFees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Toggle selection of a single fee
  const toggleFeeSelection = (id: number) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  // Toggle selection of all fees
  const toggleAllSelection = () => {
    if (allSelected) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedFees.map(fee => fee.id));
    }
    setAllSelected(!allSelected);
  };

  // Handle record payment for a fee
  const handleRecordPayment = (fee: ExtendedFee) => {
    setSelectedFee(fee);
    setIsPaymentModalOpen(true);
  };

  // Execute bulk action on selected fees
  const handleBulkAction = (action: string) => {
    // Implementation would depend on the action
    console.log(`Executing ${action} on fees:`, selectedRows);
    
    // This is where you would implement the actual actions
    switch (action) {
      case 'payment':
        // Open a bulk payment modal
        break;
      case 'remind':
        // Send reminders to selected students
        break;
      case 'export':
        exportSelectedToCsv();
        break;
      case 'print':
        // Open print dialog for selected fees
        break;
      case 'delete':
        // Show confirmation dialog before deleting
        break;
    }
  };

  // Export selected fees to CSV
  const exportSelectedToCsv = () => {
    const selectedFees = fees.filter(fee => selectedRows.includes(fee.id));
    
    // Create CSV content
    let csv = 'Student,Description,Category,Amount,Paid,Balance,Due Date,Status,Payment Method,Invoice Number\n';
    
    selectedFees.forEach(fee => {
      const studentName = getStudentName(fee.student_id);
      const balance = fee.amount - fee.paid;
      
      csv += `"${studentName}","${fee.description}","${fee.category}",${fee.amount},${fee.paid},${balance},"${fee.due_date}","${fee.status}","${fee.payment_method}","${fee.invoice_number}"\n`;
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

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
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

  // Get status badge style based on status
  const getStatusBadgeClass = (status: string, dueDate: string) => {
    // Check if overdue first
    if (isOverdue(dueDate, status) && status !== 'paid') {
      return 'bg-red-100 text-red-800';
    }
    
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status text with overdue check
  const getStatusText = (status: string, dueDate: string) => {
    if (isOverdue(dueDate, status) && status !== 'paid') {
      return 'Overdue';
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Calculate total pages for pagination
  const totalPages = Math.ceil(filteredFees.length / itemsPerPage);

  // Generate pagination controls
  const paginationControls = () => {
    const pages = [];
    const maxPageButtons = 5;
    
    // Previous button
    pages.push(
      <Button
        key="prev"
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        Previous
      </Button>
    );
    
    // Page buttons
    if (totalPages <= maxPageButtons) {
      // Show all pages if there are fewer than maxPageButtons
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <Button
            key={i}
            variant={currentPage === i ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentPage(i)}
          >
            {i}
          </Button>
        );
      }
    } else {
      // Show first page, current page and neighbors, and last page
      // First page
      pages.push(
        <Button
          key={1}
          variant={currentPage === 1 ? "default" : "outline"}
          size="sm"
          onClick={() => setCurrentPage(1)}
        >
          1
        </Button>
      );
      
      // Ellipsis if needed
      if (currentPage > 3) {
        pages.push(<span key="ellipsis1" className="px-2">...</span>);
      }
      
      // Pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(
          <Button
            key={i}
            variant={currentPage === i ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentPage(i)}
          >
            {i}
          </Button>
        );
      }
      
      // Ellipsis if needed
      if (currentPage < totalPages - 2) {
        pages.push(<span key="ellipsis2" className="px-2">...</span>);
      }
      
      // Last page
      if (totalPages > 1) {
        pages.push(
          <Button
            key={totalPages}
            variant={currentPage === totalPages ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentPage(totalPages)}
          >
            {totalPages}
          </Button>
        );
      }
    }
    
    // Next button
    pages.push(
      <Button
        key="next"
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        Next
      </Button>
    );
    
    return pages;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Financial Management</h2>
          <p className="text-gray-500">Manage student fees, payments, and financial records</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData}>
            <RotateCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setIsAddFeeModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Fee
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fees">Fee Management</TabsTrigger>
          <TabsTrigger value="reports">Financial Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium opacity-90 mb-1">Overdue Amount</p>
                    <h3 className="text-3xl font-bold">{formatCurrency(financialSummary.overdueAmount)}</h3>
                    <p className="text-sm mt-2 opacity-75">
                      Requires immediate attention
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-orange-400/20">
                    <AlertCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium opacity-90 mb-1">Total Invoiced</p>
                    <h3 className="text-3xl font-bold">{formatCurrency(financialSummary.totalAmount)}</h3>
                    <p className="text-sm mt-2 opacity-75">
                      Expected revenue
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-400/20">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
                <div className="p-3 bg-blue-100 rounded-full">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pending Fees</p>
                  <p className="text-xl font-bold">{financialSummary.unpaidCount} students</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Overdue Fees</p>
                  <p className="text-xl font-bold">
                    {fees.filter(fee => isOverdue(fee.due_date, fee.status)).length} invoices
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Timeline Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Collection Timeline</CardTitle>
                <CardDescription>Monthly fee collection vs expected</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChartComponent
                      data={PAYMENT_TIMELINE}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <RechartsTooltip formatter={(value) => [`$${value}`, '']} />
                      <Legend />
                      <Bar dataKey="amount" name="Collected" fill="#2563eb" />
                      <Bar dataKey="expected" name="Expected" fill="#d1d5db" />
                    </BarChartComponent>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Fee Categories Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Fee Distribution by Category</CardTitle>
                <CardDescription>Breakdown of fees by category</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChartComponent>
                      <Pie
                        data={FEE_CATEGORIES}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {FEE_CATEGORIES.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => [`$${value}`, '']} />
                      <Legend />
                    </PieChartComponent>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Access Section */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common financial management tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <UserPlus className="h-5 w-5 mb-1" />
                  <span className="text-xs">Create Invoice</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <DollarSign className="h-5 w-5 mb-1" />
                  <span className="text-xs">Record Payment</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <BarChart className="h-5 w-5 mb-1" />
                  <span className="text-xs">Financial Report</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <Mail className="h-5 w-5 mb-1" />
                  <span className="text-xs">Payment Reminder</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <Printer className="h-5 w-5 mb-1" />
                  <span className="text-xs">Print Receipts</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Fee Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest fee payments and invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-4 text-left font-medium">Student</th>
                      <th className="py-3 px-4 text-left font-medium">Description</th>
                      <th className="py-3 px-4 text-right font-medium">Amount</th>
                      <th className="py-3 px-4 text-center font-medium">Status</th>
                      <th className="py-3 px-4 text-right font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fees.slice(0, 5).map((fee) => (
                      <tr key={fee.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{getStudentName(fee.student_id)}</td>
                        <td className="py-3 px-4">{fee.description}</td>
                        <td className="py-3 px-4 text-right">{formatCurrency(fee.amount)}</td>
                        <td className="py-3 px-4">
                          <div className="flex justify-center">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(fee.status, fee.due_date)}`}>
                              {getStatusText(fee.status, fee.due_date)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">{formatDate(fee.due_date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FEES MANAGEMENT TAB */}
        <TabsContent value="fees" className="space-y-6">
          {/* Fee Status Tabs */}
          <Tabs defaultValue="all" value={feeStatus} onValueChange={setFeeStatus}>
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
              <TabsList>
                <TabsTrigger value="all">All Fees</TabsTrigger>
                <TabsTrigger value="paid">Paid</TabsTrigger>
                <TabsTrigger value="partial">Partial</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="overdue">Overdue</TabsTrigger>
              </TabsList>
              
              <div className="flex gap-2 flex-wrap">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="text"
                    placeholder="Search student, description, invoice..."
                    className="pl-8 w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {/* Advanced Filters */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <h3 className="font-medium">Filter Fees</h3>
                      
                      {/* Category Filter */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Category</label>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="Tuition">Tuition</SelectItem>
                            <SelectItem value="Transportation">Transportation</SelectItem>
                            <SelectItem value="Lab Fees">Lab Fees</SelectItem>
                            <SelectItem value="Materials">Materials</SelectItem>
                            <SelectItem value="Activities">Activities</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Date Range */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Due Date Range</label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="date"
                            placeholder="Start date"
                            onChange={(e) => setDateRangeFilter({
                              start: e.target.value,
                              end: dateRangeFilter?.end || ''
                            })}
                          />
                          <Input
                            type="date"
                            placeholder="End date"
                            onChange={(e) => setDateRangeFilter({
                              start: dateRangeFilter?.start || '',
                              end: e.target.value
                            })}
                          />
                        </div>
                      </div>
                      
                      {/* Amount Range */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Amount Range</label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input type="number" placeholder="Min amount" />
                          <Input type="number" placeholder="Max amount" />
                        </div>
                      </div>
                      
                      {/* Filter Actions */}
                      <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" size="sm" onClick={() => {
                          setCategoryFilter('all');
                          setDateRangeFilter(null);
                        }}>
                          Reset
                        </Button>
                        <Button size="sm">Apply Filters</Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                
                {/* Export Options */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={exportSelectedToCsv}>
                      Export as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Export as Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Export as PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {/* Refresh Button */}
                <Button variant="outline" onClick={fetchData}>
                  <RotateCw className="h-4 w-4" />
                </Button>
                
                {/* Add Fee Button */}
                <Button onClick={() => setIsAddFeeModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Fee
                </Button>
              </div>
            </div>

            {/* Bulk Actions for Selected Fees */}
            {selectedRows.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-4 flex items-center justify-between">
                <div className="text-sm text-blue-700 font-medium pl-2">
                  {selectedRows.length} {selectedRows.length === 1 ? 'fee' : 'fees'} selected
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction('payment')}>
                    <DollarSign className="h-4 w-4 mr-1" />
                    Record Payments
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction('remind')}>
                    <Mail className="h-4 w-4 mr-1" />
                    Send Reminders
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction('export')}>
                    <Download className="h-4 w-4 mr-1" />
                    Export Selected
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction('print')}>
                    <Printer className="h-4 w-4 mr-1" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleBulkAction('delete')}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            )}

            {/* Fee Records Table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left">
                        <div className="flex items-center">
                          <Checkbox 
                            checked={allSelected}
                            onCheckedChange={toggleAllSelection}
                            aria-label="Select all fees"
                          />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('student')}>
                          Student
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('description')}>
                          Description
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('category')}>
                          Category
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center justify-end gap-1 cursor-pointer" onClick={() => handleSort('amount')}>
                          Amount
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center justify-end gap-1 cursor-pointer" onClick={() => handleSort('balance')}>
                          Balance
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('due_date')}>
                          Due Date
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center justify-center gap-1 cursor-pointer" onClick={() => handleSort('status')}>
                          Status
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-4 text-center">
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500"></div>
                          </div>
                          <p className="mt-2 text-sm text-gray-500">Loading fees...</p>
                        </td>
                      </tr>
                    ) : paginatedFees.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                          No fees found matching your filters
                        </td>
                      </tr>
                    ) : (
                      paginatedFees.map((fee) => (
                        <tr 
                          key={fee.id} 
                          className={`
                            ${isOverdue(fee.due_date, fee.status) ? 'bg-red-50' : ''}
                            ${selectedRows.includes(fee.id) ? 'bg-blue-50' : ''}
                            hover:bg-gray-50
                          `}
                        >
                          <td className="px-3 py-4">
                            <Checkbox 
                              checked={selectedRows.includes(fee.id)}
                              onCheckedChange={() => toggleFeeSelection(fee.id)}
                              aria-label={`Select fee for ${getStudentName(fee.student_id)}`}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {getStudentName(fee.student_id)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>
                              {fee.description}
                              <div className="text-xs text-gray-400">{fee.invoice_number}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                            {fee.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            {formatCurrency(fee.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            <span className={fee.amount - fee.paid > 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                              {formatCurrency(fee.amount - fee.paid)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                            {formatDate(fee.due_date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex justify-center">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(fee.status, fee.due_date)}`}>
                                {getStatusText(fee.status, fee.due_date)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                            <div className="flex justify-end space-x-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() => handleRecordPayment(fee)}
                                      disabled={fee.status === 'paid'}
                                    >
                                      <DollarSign className="h-4 w-4 text-blue-600" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Record Payment</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() => setIsInvoiceModalOpen(true)}
                                    >
                                      <FileText className="h-4 w-4 text-gray-600" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>View Invoice</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <ChevronDown className="h-4 w-4 text-gray-600" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  
                                  <DropdownMenuItem onClick={() => handleRecordPayment(fee)} disabled={fee.status === 'paid'}>
                                    <DollarSign className="h-4 w-4 mr-2" />
                                    Record Payment
                                  </DropdownMenuItem>
                                  
                                  <DropdownMenuItem>
                                    <FileText className="h-4 w-4 mr-2" />
                                    View Invoice
                                  </DropdownMenuItem>
                                  
                                  <DropdownMenuItem>
                                    <Printer className="h-4 w-4 mr-2" />
                                    Print Invoice
                                  </DropdownMenuItem>
                                  
                                  <DropdownMenuItem>
                                    <Mail className="h-4 w-4 mr-2" />
                                    Send Reminder
                                  </DropdownMenuItem>
                                  
                                  <DropdownMenuSeparator />
                                  
                                  <DropdownMenuItem>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Details
                                  </DropdownMenuItem>
                                  
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls */}
            {filteredFees.length > 0 && (
              <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-gray-500">
                  Showing {Math.min(filteredFees.length, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(filteredFees.length, currentPage * itemsPerPage)} of {filteredFees.length} fees
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex mr-2 items-center">
                    <span className="text-sm text-gray-500 mr-2">Items per page:</span>
                    <Select 
                      value={itemsPerPage.toString()} 
                      onValueChange={(value) => {
                        setItemsPerPage(parseInt(value));
                        setCurrentPage(1); // Reset to first page when changing items per page
                      }}
                    >
                      <SelectTrigger className="w-16 h-8">
                        <SelectValue placeholder="10" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-1">
                    {paginationControls()}
                  </div>
                </div>
              </div>
            )}
          </Tabs>
        </TabsContent>

        {/* FINANCIAL REPORTS TAB */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
              <CardDescription>Generate and view financial reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Payment Summary</h3>
                      <BarChart className="h-5 w-5 text-blue-500" />
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Overview of all payments and collection statistics</p>
                    <Button className="w-full">Generate Report</Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Student Balances</h3>
                      <Users className="h-5 w-5 text-blue-500" />
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Detailed breakdown of student fee balances</p>
                    <Button className="w-full">Generate Report</Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Fee Collection</h3>
                      <PieChart className="h-5 w-5 text-blue-500" />
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Analysis of fee collection by category and time period</p>
                    <Button className="w-full">Generate Report</Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Payment Methods</h3>
                      <CreditCard className="h-5 w-5 text-blue-500" />
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Analysis of payments by payment method</p>
                    <Button className="w-full">Generate Report</Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Overdue Fees</h3>
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                    <p className="text-sm text-gray-500 mb-4">List of all overdue fees with aging analysis</p>
                    <Button className="w-full">Generate Report</Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Custom Report</h3>
                      <FileText className="h-5 w-5 text-blue-500" />
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Generate a customized financial report</p>
                    <Button className="w-full">Create Custom Report</Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods Analysis</CardTitle>
              <CardDescription>Distribution of payments by method</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChartComponent>
                    <Pie
                      data={PAYMENT_METHODS}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {PAYMENT_METHODS.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => [`$${value}`, '']} />
                    <Legend />
                  </PieChartComponent>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SETTINGS TAB */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Settings</CardTitle>
              <CardDescription>Configure financial preferences and options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Fee Templates</h3>
                  <p className="text-sm text-gray-500">Create and manage reusable fee templates</p>
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">Tuition Fee</h4>
                        <p className="text-sm text-gray-500">Standard tuition fee template</p>
                      </div>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">Transportation Fee</h4>
                        <p className="text-sm text-gray-500">School bus service fee</p>
                      </div>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">Lab Fee</h4>
                        <p className="text-sm text-gray-500">Science laboratory fee</p>
                      </div>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                    <Button className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Template
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Payment Settings</h3>
                  <p className="text-sm text-gray-500">Configure payment methods and options</p>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Default Currency</label>
                      <Select defaultValue="ugx">
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ugx">UGX (USh)</SelectItem>
                          <SelectItem value="usd">USD ($)</SelectItem>
                          <SelectItem value="eur">EUR (€)</SelectItem>
                          <SelectItem value="gbp">GBP (£)</SelectItem>
                          <SelectItem value="kes">KES (KSh)</SelectItem>
                          <SelectItem value="tzs">TZS (TSh)</SelectItem>
                          <SelectItem value="rwf">RWF (RF)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Payment Methods</label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="cash" defaultChecked />
                          <label htmlFor="cash" className="text-sm">Cash</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="bank" defaultChecked />
                          <label htmlFor="bank" className="text-sm">Bank Transfer</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="card" defaultChecked />
                          <label htmlFor="card" className="text-sm">Credit/Debit Card</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="check" defaultChecked />
                          <label htmlFor="check" className="text-sm">Check</label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Invoice Numbering Format</label>
                      <Input defaultValue="INV-{YEAR}-{NUMBER}" />
                      <p className="text-xs text-gray-500">Use {'{'}{'}'}YEAR{'{'}{'}'}', {'{'}{'}'}MONTH{'{'}{'}'}', {'{'}{'}'}NUMBER{'{'}{'}'} as placeholders</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Reminders & Notifications</h3>
                <p className="text-sm text-gray-500">Configure automated reminders for fee payments</p>
                
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox id="reminder1" defaultChecked />
                      <div>
                        <label htmlFor="reminder1" className="text-sm font-medium">Payment Due Reminder</label>
                        <p className="text-xs text-gray-500">Send reminder 5 days before due date</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox id="reminder2" defaultChecked />
                      <div>
                        <label htmlFor="reminder2" className="text-sm font-medium">Overdue Payment Reminder</label>
                        <p className="text-xs text-gray-500">Send reminder when payment is overdue</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox id="reminder3" defaultChecked />
                      <div>
                        <label htmlFor="reminder3" className="text-sm font-medium">Payment Receipt</label>
                        <p className="text-xs text-gray-500">Send receipt when payment is recorded</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox id="reminder4" />
                      <div>
                        <label htmlFor="reminder4" className="text-sm font-medium">Weekly Summary</label>
                        <p className="text-xs text-gray-500">Send weekly summary of pending payments</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline">Cancel</Button>
                <Button>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}