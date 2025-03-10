// frontend/src/pages/Accounts.tsx
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
  AlertCircle, CheckCircle, ChevronDown,
  FileText, Printer, Mail, ArrowUpDown
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BarChart as BarChartComponent, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart as PieChartComponent, Pie, Cell } from 'recharts';
import { dashboardApi, Fee, Student } from '@/services/api';
import { RecordPaymentDialog } from '@/components/accounts/RecordPaymentDialog';
import { AddFeeDialog } from '@/components/accounts/AddFeeDialog';
import { UpdateFeeDialog } from '@/components/accounts/UpdateFeeDialog';
import { InvoiceDialog } from '@/components/accounts/InvoiceDialog';
import { Alert, AlertDescription } from "@/components/ui/alert";

// Import the ExtendedFee interface from api-extension
import { ExtendedFee, financialApi } from '@/services/api-extension';

/**
 * Fee type default values
 */
const FEE_TYPE_DEFAULTS = {
  'tuition': { amount: 1500000, description: "Tuition Fee" },
  'transport': { amount: 300000, description: "Transportation Fee" },
  'lab': { amount: 150000, description: "Laboratory Fee" },
  'materials': { amount: 100000, description: "Learning Materials" },
  'activity': { amount: 100000, description: "Activities Fee" },
  'custom': { amount: 0, description: "" }
};

/**
 * Main Accounts component for financial management
 */
export function Accounts() {
  // =========================================================================
  // STATE MANAGEMENT
  // =========================================================================
  
  // Main data state
  const [fees, setFees] = useState<ExtendedFee[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    monthlyCollection: [] as Array<{month: string, amount: number, expected: number}>,
    feeCategories: [] as Array<{name: string, value: number, color: string}>,
    paymentMethods: [] as Array<{name: string, value: number, color: string}>
  });
  
  // UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [feeStatus, setFeeStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFee, setSelectedFee] = useState<ExtendedFee | null>(null);
  const [isAddFeeModalOpen, setIsAddFeeModalOpen] = useState(false);
  const [isUpdateFeeModalOpen, setIsUpdateFeeModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [feeToDelete, setFeeToDelete] = useState<number | null>(null);
  
  // Selection and pagination state
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [allSelected, setAllSelected] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Filter state
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<{start: string, end: string} | null>(null);
  const [sortField, setSortField] = useState<string>('due_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

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

  // =========================================================================
  // EFFECTS / LIFECYCLE
  // =========================================================================

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Reset success message after 3 seconds
  useEffect(() => {
    if (actionSuccess) {
      const timer = setTimeout(() => {
        setActionSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [actionSuccess]);

  // =========================================================================
  // DATA FETCHING
  // =========================================================================

  /**
   * Fetch all required data from API
   */
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch fees, students, financial summary, and chart data in parallel
      const [feesData, studentsData, summaryData, chartDataResponse] = await Promise.all([
        dashboardApi.getFees(),
        dashboardApi.getStudents(),
        dashboardApi.getFeeSummary(),
        dashboardApi.getFeeChartData()
      ]);
      
      // Enhance fee data with additional properties
      const enhancedFees: ExtendedFee[] = await Promise.all(feesData.map(async fee => {
        // Get transactions for this fee to determine payment method and last payment date
        const transactions = await financialApi.getFeeTransactions(fee.id);

        return {
          ...fee,
          selected: false,
          category: determineFeeCategory(fee.description),
          payment_method: transactions.length > 0 ? transactions[0].payment_method : '-',
          last_payment_date: transactions.length > 0 ? transactions[0].payment_date : null,
          invoice_number: `INV-${new Date().getFullYear()}-${10000 + fee.id}`,
          transactions: transactions
        };
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
      
      // Process and set chart data
      const colors = ['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#f97316'];
      
      // Process monthly collections
      const monthlyData = chartDataResponse.monthly_collection.map(item => ({
        month: item.month,
        amount: item.amount,
        expected: item.amount * 1.1 // Estimated expected amount (this would come from the backend in a real app)
      }));
      
      // Process fee categories
      const categoryCounts = {};
      enhancedFees.forEach(fee => {
        const category = fee.category || 'Other';
        if (!categoryCounts[category]) {
          categoryCounts[category] = 0;
        }
        categoryCounts[category] += fee.amount;
      });
      
      const categoryData = Object.entries(categoryCounts).map(([name, value], index) => ({
        name,
        value: value as number,
        color: colors[index % colors.length]
      }));
      
      // Process payment methods
      const methodCounts = {};
      enhancedFees.forEach(fee => {
        if (fee.payment_method && fee.payment_method !== '-') {
          const method = fee.payment_method;
          if (!methodCounts[method]) {
            methodCounts[method] = 0;
          }
          methodCounts[method] += fee.paid;
        }
      });
      
      const methodData = Object.entries(methodCounts).map(([name, value], index) => ({
        name,
        value: value as number,
        color: colors[index % colors.length]
      }));
      
      setChartData({
        monthlyCollection: monthlyData,
        feeCategories: categoryData,
        paymentMethods: methodData
      });
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // HELPER FUNCTIONS
  // =========================================================================

  /**
   * Determine fee category based on description
   */
  const determineFeeCategory = (description: string): string => {
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('tuition')) return 'Tuition';
    if (lowerDesc.includes('transport')) return 'Transportation';
    if (lowerDesc.includes('lab')) return 'Lab Fees';
    if (lowerDesc.includes('material')) return 'Materials';
    if (lowerDesc.includes('activit')) return 'Activities';
    return 'Other';
  };

  /**
   * Calculate total overdue amount from fees list
   */
  const calculateOverdueAmount = (feesList: ExtendedFee[]): number => {
    return feesList.reduce((total, fee) => {
      const isDueDate = new Date(fee.due_date) < new Date() && fee.status !== 'paid';
      return total + (isDueDate ? (fee.amount - fee.paid) : 0);
    }, 0);
  };

  /**
   * Get student name by student_id
   */
  const getStudentName = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.first_name} ${student.last_name}` : 'Unknown Student';
  };

  /**
   * Format currency in UGX
   */
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  /**
   * Check if a fee is overdue
   */
  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'paid') return false;
    
    const today = new Date();
    const due = new Date(dueDate);
    return due < today;
  };

  /**
   * Get status badge style based on status
   */
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

  /**
   * Get status text with overdue check
   */
  const getStatusText = (status: string, dueDate: string) => {
    if (isOverdue(dueDate, status) && status !== 'paid') {
      return 'Overdue';
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  /**
   * Update chart data when fees change
   */
  const updateChartData = (updatedFees: ExtendedFee[]) => {
    const colors = ['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#f97316'];
    
    // Process fee categories
    const categoryCounts = {};
    updatedFees.forEach(fee => {
      const category = fee.category || 'Other';
      if (!categoryCounts[category]) {
        categoryCounts[category] = 0;
      }
      categoryCounts[category] += fee.amount;
    });
    
    const categoryData = Object.entries(categoryCounts).map(([name, value], index) => ({
      name,
      value: value as number,
      color: colors[index % colors.length]
    }));
    
    // Process payment methods
    const methodCounts = {};
    updatedFees.forEach(fee => {
      if (fee.payment_method && fee.payment_method !== '-') {
        const method = fee.payment_method;
        if (!methodCounts[method]) {
          methodCounts[method] = 0;
        }
        methodCounts[method] += fee.paid;
      }
    });
    
    const methodData = Object.entries(methodCounts).map(([name, value], index) => ({
      name,
      value: value as number,
      color: colors[index % colors.length]
    }));
    
    // Keep the monthly collection data, only update the categories and methods
    setChartData(prevData => ({
      ...prevData,
      feeCategories: categoryData,
      paymentMethods: methodData
    }));
  };

  // =========================================================================
  // FEE MANAGEMENT FUNCTIONS
  // =========================================================================

  /**
   * Create a new fee
   */
  const createNewFee = async (feeData) => {
    try {
      // Call API to create fee in database
      const response = await dashboardApi.createFee(feeData.student_id, {
        amount: feeData.amount,
        description: feeData.description,
        due_date: feeData.due_date,
        term: feeData.term,
        academic_year: feeData.academic_year,
        status: 'pending',
        paid: 0
      });
      
      // Get the new fee data from the response
      const newFee: ExtendedFee = {
        ...response,
        selected: false,
        category: feeData.category || 'Tuition',
        payment_method: '-',
        last_payment_date: null,
        invoice_number: `INV-${new Date().getFullYear()}-${10000 + response.id}`,
        transactions: []
      };
      
      // Update state with new fee
      const updatedFees = [newFee, ...fees];
      setFees(updatedFees);
      
      // Show success message
      setActionSuccess("Fee created successfully");
      
      // Update financial summary
      const newTotalAmount = financialSummary.totalAmount + newFee.amount;
      setFinancialSummary({
        ...financialSummary,
        totalAmount: newTotalAmount,
        totalBalance: newTotalAmount - financialSummary.totalPaid,
        paymentRate: (financialSummary.totalPaid / newTotalAmount) * 100,
        unpaidCount: financialSummary.unpaidCount + 1
      });
      
      // Update charts
      updateChartData(updatedFees);
      
    } catch (error) {
      console.error('Error creating fee:', error);
      setActionSuccess("Failed to create fee");
    }
  };

  /**
   * Update an existing fee
   */
  const updateFee = async (updatedFee: Fee) => {
    try {
      // Call API to update fee in database
      await dashboardApi.updateFee(updatedFee.id, updatedFee);
      
      // Update fee in state
      const updatedFees = fees.map(fee => 
        fee.id === updatedFee.id 
          ? { 
              ...fee, 
              ...updatedFee,
              // Preserve extended properties
              category: determineFeeCategory(updatedFee.description),
              payment_method: fee.payment_method,
              last_payment_date: fee.last_payment_date,
              invoice_number: fee.invoice_number,
              transactions: fee.transactions
            } 
          : fee
      );
      
      setFees(updatedFees);
      
      // Update charts
      updateChartData(updatedFees);
      
      // Show success message
      setActionSuccess("Fee updated successfully");
      
      // Update financial summary
      const totalAmount = updatedFees.reduce((sum, fee) => sum + fee.amount, 0);
      const totalPaid = updatedFees.reduce((sum, fee) => sum + fee.paid, 0);
      const paidCount = updatedFees.filter(fee => fee.status === 'paid').length;
      const partialCount = updatedFees.filter(fee => fee.status === 'partial').length;
      const unpaidCount = updatedFees.filter(fee => fee.status === 'pending').length;
      
      setFinancialSummary({
        ...financialSummary,
        totalAmount,
        totalPaid,
        totalBalance: totalAmount - totalPaid,
        paymentRate: totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0,
        paidCount,
        partialCount,
        unpaidCount,
        overdueAmount: calculateOverdueAmount(updatedFees)
      });
      
    } catch (error) {
      console.error('Error updating fee:', error);
      setActionSuccess("Failed to update fee");
    }
  };

  /**
   * Delete a fee
   */
  const deleteFee = async (feeId: number) => {
    try {
      // Find the fee to be deleted
      const feeToDelete = fees.find(fee => fee.id === feeId);
      if (!feeToDelete) return;
      
      // Call API to delete fee from database
      await dashboardApi.deleteFee(feeId);
      
      // Filter out the fee from local state
      const updatedFees = fees.filter(fee => fee.id !== feeId);
      setFees(updatedFees);
      
      // Update charts
      updateChartData(updatedFees);
      
      // Show success message
      setActionSuccess("Fee deleted successfully");
      
      // Update financial summary
      const newTotalAmount = financialSummary.totalAmount - feeToDelete.amount;
      const newTotalPaid = financialSummary.totalPaid - feeToDelete.paid;
      
      setFinancialSummary({
        ...financialSummary,
        totalAmount: newTotalAmount,
        totalPaid: newTotalPaid,
        totalBalance: newTotalAmount - newTotalPaid,
        paymentRate: newTotalAmount > 0 ? (newTotalPaid / newTotalAmount) * 100 : 0,
        unpaidCount: feeToDelete.status === 'pending' ? financialSummary.unpaidCount - 1 : financialSummary.unpaidCount,
        paidCount: feeToDelete.status === 'paid' ? financialSummary.paidCount - 1 : financialSummary.paidCount,
        partialCount: feeToDelete.status === 'partial' ? financialSummary.partialCount - 1 : financialSummary.partialCount,
        overdueAmount: calculateOverdueAmount(updatedFees)
      });
      
    } catch (error) {
      console.error(`Error deleting fee ${feeId}:`, error);
      setActionSuccess("Failed to delete fee");
    }
  };

  /**
   * Delete multiple fees
   */
  const deleteBulkFees = async (feeIds: number[]) => {
    try {
      // Delete each fee one by one
      for (const feeId of feeIds) {
        await dashboardApi.deleteFee(feeId);
      }
      
      // Update local state
      const updatedFees = fees.filter(fee => !feeIds.includes(fee.id));
      setFees(updatedFees);
      
      // Update charts
      updateChartData(updatedFees);
      
      // Show success message
      setActionSuccess(`${feeIds.length} fees deleted successfully`);
      
      // Clear selection
      setSelectedRows([]);
      setAllSelected(false);
      
      // Update financial summary - recalculate all values
      const totalAmount = updatedFees.reduce((sum, fee) => sum + fee.amount, 0);
      const totalPaid = updatedFees.reduce((sum, fee) => sum + fee.paid, 0);
      const paidCount = updatedFees.filter(fee => fee.status === 'paid').length;
      const partialCount = updatedFees.filter(fee => fee.status === 'partial').length;
      const unpaidCount = updatedFees.filter(fee => fee.status === 'pending').length;
      
      setFinancialSummary({
        ...financialSummary,
        totalAmount,
        totalPaid,
        totalBalance: totalAmount - totalPaid,
        paymentRate: totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0,
        paidCount,
        partialCount,
        unpaidCount,
        overdueAmount: calculateOverdueAmount(updatedFees)
      });
      
    } catch (error) {
      console.error('Error deleting bulk fees:', error);
      setActionSuccess("Failed to delete some fees");
    }
  };

  // =========================================================================
  // EVENT HANDLERS
  // =========================================================================

  /**
   * Handle sorting of fees table
   */
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  /**
   * Toggle selection of a single fee
   */
  const toggleFeeSelection = (id: number) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  /**
   * Toggle selection of all fees
   */
  const toggleAllSelection = () => {
    if (allSelected) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedFees.map(fee => fee.id));
    }
    setAllSelected(!allSelected);
  };

  /**
   * Handle record payment for a fee
   */
  const handleRecordPayment = (fee: ExtendedFee) => {
    setSelectedFee(fee);
    setIsPaymentModalOpen(true);
  };

  /**
   * Handle fee edit
   */
  const handleEditFee = (fee: ExtendedFee) => {
    setSelectedFee(fee);
    setIsUpdateFeeModalOpen(true);
  };

  /**
   * Handle fee delete confirmation
   */
  const handleConfirmDelete = (feeId: number) => {
    setFeeToDelete(feeId);
    setIsDeleteDialogOpen(true);
  };

  /**
   * Handle fee delete execution
   */
  const handleDeleteFee = async () => {
    if (feeToDelete) {
      await deleteFee(feeToDelete);
      setFeeToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  /**
   * Handle payment recording
   */
  const handlePaymentRecorded = (feeId: number, amount: number) => {
    // Update fee in state
    const updatedFees = fees.map(fee => {
      if (fee.id === feeId) {
        const newPaid = fee.paid + amount;
        const newStatus = newPaid >= fee.amount ? 'paid' : newPaid > 0 ? 'partial' : 'pending';
        const today = new Date().toISOString();
        
        // Add transaction to the fee's transactions array
        const newTransactions = fee.transactions ? [
          {
            id: fee.transactions.length + 1,
            fee_id: feeId,
            amount: amount,
            payment_method: 'cash', // This would come from the form in a real implementation
            payment_date: today,
            recorded_by: 1, // This would be the current user's ID
            reference_number: `RCT-${new Date().getFullYear()}-${1000 + feeId}`
          },
          ...fee.transactions
        ] : [{
          id: 1,
          fee_id: feeId,
          amount: amount,
          payment_method: 'cash',
          payment_date: today,
          recorded_by: 1,
          reference_number: `RCT-${new Date().getFullYear()}-${1000 + feeId}`
        }];
        
        return {
          ...fee,
          paid: newPaid,
          status: newStatus,
          last_payment_date: today,
          payment_method: 'cash',
          transactions: newTransactions
        };
      }
      return fee;
    });
    
    setFees(updatedFees);
    updateChartData(updatedFees);
    setActionSuccess(`Payment of ${formatCurrency(amount)} recorded successfully`);
    
    // Update financial summary
    const totalPaid = updatedFees.reduce((sum, fee) => sum + fee.paid, 0);
    const totalAmount = updatedFees.reduce((sum, fee) => sum + fee.amount, 0);
    const paidCount = updatedFees.filter(fee => fee.status === 'paid').length;
    const partialCount = updatedFees.filter(fee => fee.status === 'partial').length;
    const unpaidCount = updatedFees.filter(fee => fee.status === 'pending').length;
    
    setFinancialSummary(prev => ({
      ...prev,
      totalPaid,
      totalBalance: totalAmount - totalPaid,
      paymentRate: (totalPaid / totalAmount) * 100,
      paidCount,
      partialCount,
      unpaidCount
    }));
  };

  /**
   * Handle invoice view
   */
  const handleViewInvoice = (fee: ExtendedFee) => {
    setSelectedFee(fee);
    setIsInvoiceModalOpen(true);
  };

  /**
   * Handle fee added
   */
  const handleFeeAdded = (feeData) => {
    createNewFee(feeData);
    setActionSuccess("Fee created successfully");
    setSelectedRows([]);
  };

  /**
   * Handle fee updated
   */
  const handleFeeUpdated = (fee) => {
    updateFee(fee);
    setSelectedRows([]);
  };

  /**
   * Execute bulk action on selected fees
   */
  const handleBulkAction = (action: string) => {
    if (selectedRows.length === 0) return;
    
    switch (action) {
      case 'payment':
        // Open a bulk payment modal
        setActionSuccess(`Bulk payment initiated for ${selectedRows.length} fees`);
        break;
      case 'remind':
        // Send reminders to selected students
        setActionSuccess(`Payment reminders sent to ${selectedRows.length} students`);
        break;
      case 'export':
        exportSelectedToCsv();
        break;
      case 'print':
        // Open print dialog for selected fees
        setActionSuccess(`Preparing to print ${selectedRows.length} invoices`);
        break;
      case 'delete':
        // Delete selected fees
        deleteBulkFees(selectedRows);
        break;
    }
  };

  /**
   * Export selected fees to CSV
   */
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
    
    setActionSuccess(`Exported ${selectedFees.length} fees to CSV`);
  };

  // =========================================================================
  // DATA FILTERING AND PROCESSING
  // =========================================================================

  /**
   * Apply filters to fees data
   */
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

  /**
   * Apply sorting to fees
   */
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

  // Apply sorting to filtered fees
  const sortedFees = sortFees(filteredFees);

  // Apply pagination to sorted fees
  const paginatedFees = sortedFees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate total pages for pagination
  const totalPages = Math.ceil(filteredFees.length / itemsPerPage);

  /**
   * Generate pagination controls
   */
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

  // =========================================================================
  // RENDER
  // =========================================================================
  return (
    <div className="p-6">
      {/* Page Header */}
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

      {/* Success Message */}
      {actionSuccess && (
        <Alert className="mb-4">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">{actionSuccess}</AlertDescription>
        </Alert>
      )}

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
                      data={chartData.monthlyCollection}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <RechartsTooltip formatter={(value) => [formatCurrency(value as number), '']} />
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
                        data={chartData.feeCategories}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {chartData.feeCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => [formatCurrency(value as number), '']} />
                      <Legend />
                    </PieChartComponent>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

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
                      <th className="py-3 px-4 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4">
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500"></div>
                          </div>
                        </td>
                      </tr>
                    ) : fees.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4 text-gray-500">
                          No recent transactions
                        </td>
                      </tr>
                    ) : (
                      fees.slice(0, 5).map((fee) => (
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
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRecordPayment(fee)}
                                disabled={fee.status === 'paid'}
                              >
                                Pay
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewInvoice(fee)}
                              >
                                View
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={() => setActiveTab('fees')}>
                  View All Fees
                </Button>
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
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                </Button>
                
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
                            {fee.category || 'Other'}
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
                                      onClick={() => handleViewInvoice(fee)}
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
                                  
                                  <DropdownMenuItem onClick={() => handleViewInvoice(fee)}>
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
                                  
                                  <DropdownMenuItem onClick={() => handleEditFee(fee)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Details
                                  </DropdownMenuItem>
                                  
                                  <DropdownMenuItem 
                                    className="text-red-600" 
                                    onClick={() => handleConfirmDelete(fee.id)}
                                  >
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

        {/* FINANCIAL REPORTS TAB and SETTINGS TAB are omitted for brevity */}
        <TabsContent value="reports">
          <div className="text-center p-8 text-gray-500">
            Financial Reports functionality would be implemented here.
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          <div className="text-center p-8 text-gray-500">
            Financial Settings functionality would be implemented here.
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog Components */}
      {selectedFee && (
        <>
          <RecordPaymentDialog 
            fee={selectedFee}
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            onPaymentRecorded={handlePaymentRecorded}
            getStudentName={getStudentName}
          />
          
          <UpdateFeeDialog
            fee={selectedFee}
            isOpen={isUpdateFeeModalOpen}
            onClose={() => setIsUpdateFeeModalOpen(false)}
            onUpdate={handleFeeUpdated}
          />
          
          <InvoiceDialog
            fee={selectedFee}
            isOpen={isInvoiceModalOpen}
            onClose={() => setIsInvoiceModalOpen(false)}
            getStudentName={getStudentName}
          />
        </>
      )}
      
      <AddFeeDialog
        isOpen={isAddFeeModalOpen}
        onClose={() => setIsAddFeeModalOpen(false)}
        students={students}
        onFeeAdded={handleFeeAdded}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this fee record and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDeleteFee}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}