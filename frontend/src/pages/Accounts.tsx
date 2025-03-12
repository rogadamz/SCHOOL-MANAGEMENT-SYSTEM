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
  FileText, Printer, Mail, ArrowUpDown,
  Settings, Save, RefreshCw
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
import { FinancialReports } from '@/components/accounts/FinancialReports';
import { BatchPaymentDialog } from '@/components/accounts/BatchPaymentDialog';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Import the ExtendedFee interface from api-extension
import { ExtendedFee, financialApi } from '@/services/api-extension';

// Default fee category prices for the system
const DEFAULT_FEE_CATEGORIES = {
  'Tuition': 1500000,
  'Transportation': 300000,
  'Lab Fees': 150000,
  'Materials': 100000,
  'Activities': 100000,
  'Other': 0
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
  const [isBatchPaymentDialogOpen, setIsBatchPaymentDialogOpen] = useState(false);
  
  // Selection and pagination state
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [allSelected, setAllSelected] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Filter state
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<{start: string, end: string} | null>(null);
  const [amountRangeFilter, setAmountRangeFilter] = useState<{min: number | null, max: number | null}>({ min: null, max: null });
  const [sortField, setSortField] = useState<string>('due_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Settings state
  const [defaultFeePrices, setDefaultFeePrices] = useState<Record<string, number>>(DEFAULT_FEE_CATEGORIES);
  const [paymentMethods, setPaymentMethods] = useState<string[]>(['Cash', 'Bank Transfer', 'Mobile Money', 'Credit Card', 'Check']);
  const [defaultDueDays, setDefaultDueDays] = useState<number>(14);
  const [reminderSettings, setReminderSettings] = useState({
    enableAutomaticReminders: true,
    daysBeforeDue: 3,
    daysAfterDue: 1,
    reminderFrequency: 7, // days
  });
  const [isSettingsChanged, setIsSettingsChanged] = useState(false);

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
    loadSettings();
  }, []);
  
  // Track settings changes
  useEffect(() => {
    setIsSettingsChanged(true);
  }, [defaultFeePrices, paymentMethods, defaultDueDays, reminderSettings]);

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
        financialApi.getFinancialSummary(),
        dashboardApi.getFeeChartData()
      ]);
      
      // Enhance fee data with additional properties
      const enhancedFees: ExtendedFee[] = await Promise.all(feesData.map(async fee => {
        // Get transactions for this fee to determine payment method and last payment date
        let transactions = [];
        try {
          transactions = await financialApi.getFeeTransactions(fee.id);
        } catch (error) {
          console.error(`Error fetching transactions for fee ${fee.id}:`, error);
        }

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
      
      // Sort fees by due date (newest first) for consistent display
      const sortedFees = enhancedFees.sort((a, b) => 
        new Date(b.due_date).getTime() - new Date(a.due_date).getTime()
      );
      
      setFees(sortedFees);
      setStudents(studentsData);
      
      // Set financial summary
      setFinancialSummary({
        totalAmount: summaryData.totalAmount,
        totalPaid: summaryData.totalPaid,
        totalBalance: summaryData.totalBalance,
        paymentRate: summaryData.paymentRate,
        studentCount: summaryData.studentCount,
        paidCount: summaryData.paidCount,
        partialCount: summaryData.partialCount,
        unpaidCount: summaryData.unpaidCount,
        overdueAmount: calculateOverdueAmount(enhancedFees)
      });
      
      // Process and set chart data
      const colors = ['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#f97316'];
      
      // Process monthly collections
      const monthlyData = chartDataResponse.monthly_collection.map(item => ({
        month: item.month,
        amount: item.amount,
        expected: item.amount * 1.2 // Estimated expected amount (this would come from the backend in a real app)
      }));
      
      // Process fee categories
      const categoryCounts = {};
      sortedFees.forEach(fee => {
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
      sortedFees.forEach(fee => {
        if (fee.payment_method && fee.payment_method !== '-' && fee.paid > 0) {
          const method = fee.payment_method.charAt(0).toUpperCase() + fee.payment_method.slice(1);
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

  /**
   * Load financial settings from local storage or API
   */
  const loadSettings = async () => {
    try {
      // In a real app, these would come from the backend API
      // For now, we'll use localStorage as a persistent store
      
      const storedDefaultFeePrices = localStorage.getItem('defaultFeePrices');
      if (storedDefaultFeePrices) {
        setDefaultFeePrices(JSON.parse(storedDefaultFeePrices));
      }
      
      const storedPaymentMethods = localStorage.getItem('paymentMethods');
      if (storedPaymentMethods) {
        setPaymentMethods(JSON.parse(storedPaymentMethods));
      }
      
      const storedDefaultDueDays = localStorage.getItem('defaultDueDays');
      if (storedDefaultDueDays) {
        setDefaultDueDays(parseInt(storedDefaultDueDays));
      }
      
      const storedReminderSettings = localStorage.getItem('reminderSettings');
      if (storedReminderSettings) {
        setReminderSettings(JSON.parse(storedReminderSettings));
      }
      
      setIsSettingsChanged(false);
      
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  /**
   * Save financial settings to local storage or API
   */
  const saveSettings = async () => {
    try {
      // In a real app, these would be saved via the backend API
      // For now, we'll use localStorage as a persistent store
      
      localStorage.setItem('defaultFeePrices', JSON.stringify(defaultFeePrices));
      localStorage.setItem('paymentMethods', JSON.stringify(paymentMethods));
      localStorage.setItem('defaultDueDays', defaultDueDays.toString());
      localStorage.setItem('reminderSettings', JSON.stringify(reminderSettings));
      
      setIsSettingsChanged(false);
      setActionSuccess("Settings saved successfully");
      
    } catch (error) {
      console.error('Error saving settings:', error);
      setActionSuccess("Failed to save settings");
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
      if (fee.payment_method && fee.payment_method !== '-' && fee.paid > 0) {
        const method = fee.payment_method.charAt(0).toUpperCase() + fee.payment_method.slice(1);
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

  /**
   * Update financial summary when fees change
   */
  const updateFinancialSummary = (updatedFees: ExtendedFee[]) => {
    const totalAmount = updatedFees.reduce((sum, fee) => sum + fee.amount, 0);
    const totalPaid = updatedFees.reduce((sum, fee) => sum + fee.paid, 0);
    const totalBalance = totalAmount - totalPaid;
    const paidCount = updatedFees.filter(fee => fee.status === 'paid').length;
    const partialCount = updatedFees.filter(fee => fee.status === 'partial').length;
    const unpaidCount = updatedFees.filter(fee => 
      fee.status !== 'paid' && fee.status !== 'partial'
    ).length;
    const overdueAmount = calculateOverdueAmount(updatedFees);
    
    setFinancialSummary({
      totalAmount,
      totalPaid,
      totalBalance,
      paymentRate: totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0,
      studentCount: financialSummary.studentCount, // Keep the student count unchanged
      paidCount,
      partialCount,
      unpaidCount,
      overdueAmount
    });
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
      
      // Update state with new fee (add to beginning for "most recent")
      const updatedFees = [newFee, ...fees];
      setFees(updatedFees);
      
      // Show success message
      setActionSuccess("Fee created successfully");
      
      // Update charts and summary
      updateChartData(updatedFees);
      updateFinancialSummary(updatedFees);
      
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
      
      // Find the current fee to preserve its extended properties
      const currentFee = fees.find(f => f.id === updatedFee.id);
      if (!currentFee) return;
      
      // Update fee in state
      const updatedFees = fees.map(fee => 
        fee.id === updatedFee.id 
          ? { 
              ...fee, 
              ...updatedFee,
              // Update category based on new description
              category: determineFeeCategory(updatedFee.description),
              // Preserve other extended properties
              payment_method: fee.payment_method,
              last_payment_date: fee.last_payment_date,
              invoice_number: fee.invoice_number,
              transactions: fee.transactions
            } 
          : fee
      );
      
      // Sort to ensure most recent edits appear at the top
      const sortedFees = [...updatedFees].sort((a, b) => 
        new Date(b.due_date).getTime() - new Date(a.due_date).getTime()
      );
      
      setFees(sortedFees);
      
      // Show success message
      setActionSuccess("Fee updated successfully");
      
      // Update charts and summary
      updateChartData(sortedFees);
      updateFinancialSummary(sortedFees);
      
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
      
      // Show success message
      setActionSuccess("Fee deleted successfully");
      
      // Update charts and summary
      updateChartData(updatedFees);
      updateFinancialSummary(updatedFees);
      
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
      
      // Show success message
      setActionSuccess(`${feeIds.length} fees deleted successfully`);
      
      // Clear selection
      setSelectedRows([]);
      setAllSelected(false);
      
      // Update charts and summary
      updateChartData(updatedFees);
      updateFinancialSummary(updatedFees);
      
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
    
    // Move the updated fee to the top of the list for recency
    const feeIndex = updatedFees.findIndex(fee => fee.id === feeId);
    if (feeIndex > -1) {
      const updatedFee = updatedFees[feeIndex];
      updatedFees.splice(feeIndex, 1);
      updatedFees.unshift(updatedFee);
    }
    
    setFees(updatedFees);
    setActionSuccess(`Payment of ${formatCurrency(amount)} recorded successfully`);
    
    // Update charts and summary
    updateChartData(updatedFees);
    updateFinancialSummary(updatedFees);
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
   * Handle batch payment recording
   */
  const handleBatchPaymentsRecorded = (payments: { feeId: number, amount: number }[]) => {
    // Update fees in state
    const updatedFees = [...fees];
    const today = new Date().toISOString();
    
    // Process each payment
    payments.forEach(payment => {
      const feeIndex = updatedFees.findIndex(fee => fee.id === payment.feeId);
      if (feeIndex === -1) return;
      
      const fee = updatedFees[feeIndex];
      const newPaid = fee.paid + payment.amount;
      const newStatus = newPaid >= fee.amount ? 'paid' : newPaid > 0 ? 'partial' : 'pending';
      
      // Add transaction to the fee's transactions array
      const newTransactions = fee.transactions ? [
        {
          id: fee.transactions.length + 1,
          fee_id: payment.feeId,
          amount: payment.amount,
          payment_method: 'cash', // From form in real implementation
          payment_date: today,
          recorded_by: 1,
          reference_number: `RCT-${new Date().getFullYear()}-${1000 + payment.feeId}`
        },
        ...fee.transactions
      ] : [{
        id: 1,
        fee_id: payment.feeId,
        amount: payment.amount,
        payment_method: 'cash',
        payment_date: today,
        recorded_by: 1,
        reference_number: `RCT-${new Date().getFullYear()}-${1000 + payment.feeId}`
      }];
      
      // Update the fee
      updatedFees[feeIndex] = {
        ...fee,
        paid: newPaid,
        status: newStatus,
        last_payment_date: today,
        payment_method: 'cash',
        transactions: newTransactions
      };
      
      // Move updated fees to the top for recency
      const processed = updatedFees.splice(feeIndex, 1)[0];
      updatedFees.unshift(processed);
    });
    
    setFees(updatedFees);
    setActionSuccess(`Batch payments recorded successfully`);
    setSelectedRows([]);
    
    // Update charts and summary
    updateChartData(updatedFees);
    updateFinancialSummary(updatedFees);
  };

  /**
   * Execute bulk action on selected fees
   */
  const handleBulkAction = (action: string) => {
    if (selectedRows.length === 0) return;
    
    switch (action) {
      case 'payment':
        // Open batch payment dialog
        setIsBatchPaymentDialogOpen(true);
        break;
      case 'remind':
        // Send reminders to selected students
        sendPaymentReminders();
        break;
      case 'export':
        exportSelectedToCsv();
        break;
      case 'print':
        printSelectedInvoices();
        break;
      case 'delete':
        // Delete selected fees
        deleteBulkFees(selectedRows);
        break;
    }
  };

  /**
   * Send payment reminders to selected students
   */
  const sendPaymentReminders = () => {
    // In a real implementation, this would call the backend API
    // For now, we'll simulate the operation
    
    const selectedFees = fees.filter(fee => selectedRows.includes(fee.id));
    const uniqueStudentIds = [...new Set(selectedFees.map(fee => fee.student_id))];
    
    setActionSuccess(`Payment reminders sent to ${uniqueStudentIds.length} students`);
  };

  /**
   * Print selected invoices
   */
  const printSelectedInvoices = () => {
    // In a real implementation, this would generate and print invoices via the backend API
    // For now, we'll simulate the operation
    
    setActionSuccess(`Preparing to print ${selectedRows.length} invoices`);
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

  /**
   * Handle updating default fee price
   */
  const handleUpdateFeePrice = (category: string, price: number) => {
    setDefaultFeePrices(prev => ({
      ...prev,
      [category]: price
    }));
  };

  /**
   * Handle adding a payment method
   */
  const handleAddPaymentMethod = (method: string) => {
    if (!method || paymentMethods.includes(method)) return;
    setPaymentMethods([...paymentMethods, method]);
  };

  /**
   * Handle removing a payment method
   */
  const handleRemovePaymentMethod = (method: string) => {
    setPaymentMethods(paymentMethods.filter(m => m !== method));
  };

  /**
   * Reset settings to defaults
   */
  const resetSettings = () => {
    setDefaultFeePrices(DEFAULT_FEE_CATEGORIES);
    setPaymentMethods(['Cash', 'Bank Transfer', 'Mobile Money', 'Credit Card', 'Check']);
    setDefaultDueDays(14);
    setReminderSettings({
      enableAutomaticReminders: true,
      daysBeforeDue: 3,
      daysAfterDue: 1,
      reminderFrequency: 7,
    });
    setIsSettingsChanged(true);
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
    
    // Amount range filter
    let matchesAmountRange = true;
    if (amountRangeFilter.min !== null || amountRangeFilter.max !== null) {
      if (amountRangeFilter.min !== null && amountRangeFilter.max !== null) {
        matchesAmountRange = fee.amount >= amountRangeFilter.min && fee.amount <= amountRangeFilter.max;
      } else if (amountRangeFilter.min !== null) {
        matchesAmountRange = fee.amount >= amountRangeFilter.min;
      } else if (amountRangeFilter.max !== null) {
        matchesAmountRange = fee.amount <= amountRangeFilter.max;
      }
    }
      
    return matchesStatus && matchesSearch && matchesCategory && matchesDateRange && matchesAmountRange;
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

  // Get selected fees for batch operations
  const selectedFeesData = fees.filter(fee => selectedRows.includes(fee.id));

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
                      // Show only 5 most recent transactions (fees are already sorted by recency)
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
                            <SelectItem value="Other">Other</SelectItem>
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
                            value={dateRangeFilter?.start || ''}
                            onChange={(e) => setDateRangeFilter({
                              start: e.target.value,
                              end: dateRangeFilter?.end || ''
                            })}
                          />
                          <Input
                            type="date"
                            placeholder="End date"
                            value={dateRangeFilter?.end || ''}
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
                          <Input 
                            type="number" 
                            placeholder="Min amount" 
                            value={amountRangeFilter.min !== null ? amountRangeFilter.min : ''}
                            onChange={(e) => setAmountRangeFilter({
                              ...amountRangeFilter,
                              min: e.target.value ? parseInt(e.target.value) : null
                            })}
                          />
                          <Input 
                            type="number" 
                            placeholder="Max amount" 
                            value={amountRangeFilter.max !== null ? amountRangeFilter.max : ''}
                            onChange={(e) => setAmountRangeFilter({
                              ...amountRangeFilter,
                              max: e.target.value ? parseInt(e.target.value) : null
                            })}
                          />
                        </div>
                      </div>
                      
                      {/* Filter Actions */}
                      <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" size="sm" onClick={() => {
                          setCategoryFilter('all');
                          setDateRangeFilter(null);
                          setAmountRangeFilter({ min: null, max: null });
                        }}>
                          Reset
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                
                {/* Export Button */}
                <Button variant="outline" onClick={() => exportSelectedToCsv()}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
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

        {/* FINANCIAL REPORTS TAB */}
        <TabsContent value="reports">
          <FinancialReports />
        </TabsContent>
        
        {/* SETTINGS TAB */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Settings</CardTitle>
              <CardDescription>Configure fee categories, payment methods, and notification settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Fee Categories Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Default Fee Amounts</h3>
                <p className="text-sm text-gray-500">
                  Set default fee amounts for each category. These will be used as suggestions when creating new fees.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(defaultFeePrices).map(([category, price]) => (
                    <div key={category} className="flex items-center space-x-4">
                      <div className="flex-1">
                        <Label htmlFor={`fee-${category}`}>{category}</Label>
                        <div className="relative mt-1">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            UGX
                          </span>
                          <Input
                            id={`fee-${category}`}
                            type="number"
                            className="pl-12"
                            value={price}
                            onChange={(e) => handleUpdateFeePrice(category, parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Payment Methods Section */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Payment Methods</h3>
                <p className="text-sm text-gray-500">
                  Configure the payment methods available in the system.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="payment-methods">Available Payment Methods</Label>
                    <div className="border rounded-md p-4 mt-1 max-h-[200px] overflow-y-auto space-y-2">
                      {paymentMethods.map((method) => (
                        <div key={method} className="flex items-center justify-between">
                          <span>{method}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-red-500"
                            onClick={() => handleRemovePaymentMethod(method)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {paymentMethods.length === 0 && (
                        <p className="text-gray-500 text-sm">No payment methods configured.</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="new-method">Add Payment Method</Label>
                    <div className="flex mt-1 space-x-2">
                      <Input 
                        id="new-method" 
                        placeholder="Enter new method" 
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.currentTarget.value) {
                            handleAddPaymentMethod(e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                      <Button 
                        onClick={() => {
                          const input = document.getElementById('new-method') as HTMLInputElement;
                          if (input.value) {
                            handleAddPaymentMethod(input.value);
                            input.value = '';
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Due Date Settings Section */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Due Date Settings</h3>
                <p className="text-sm text-gray-500">
                  Set the default number of days until fee payments are due.
                </p>
                
                <div className="flex items-center space-x-4 max-w-md">
                  <Label htmlFor="default-due-days" className="min-w-[180px]">Default Due Days:</Label>
                  <Input
                    id="default-due-days"
                    type="number"
                    min="1"
                    max="90"
                    value={defaultDueDays}
                    onChange={(e) => setDefaultDueDays(parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              {/* Payment Reminder Settings */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Payment Reminders</h3>
                <p className="text-sm text-gray-500">
                  Configure automated payment reminder notifications.
                </p>
                
                <div className="space-y-4 max-w-lg">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="enable-reminders" 
                      checked={reminderSettings.enableAutomaticReminders}
                      onCheckedChange={(checked) => 
                        setReminderSettings({
                          ...reminderSettings,
                          enableAutomaticReminders: !!checked
                        })
                      }
                    />
                    <Label htmlFor="enable-reminders">Enable automatic payment reminders</Label>
                  </div>
                  
                  <div className="space-y-2 pl-6">
                    <div className="flex items-center space-x-4">
                      <Label htmlFor="days-before" className="min-w-[180px]">Days before due date:</Label>
                      <Input
                        id="days-before"
                        type="number"
                        min="0"
                        max="30"
                        value={reminderSettings.daysBeforeDue}
                        onChange={(e) => 
                          setReminderSettings({
                            ...reminderSettings,
                            daysBeforeDue: parseInt(e.target.value)
                          })
                        }
                        disabled={!reminderSettings.enableAutomaticReminders}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Label htmlFor="days-after" className="min-w-[180px]">Days after due date:</Label>
                      <Input
                        id="days-after"
                        type="number"
                        min="0"
                        max="30"
                        value={reminderSettings.daysAfterDue}
                        onChange={(e) => 
                          setReminderSettings({
                            ...reminderSettings,
                            daysAfterDue: parseInt(e.target.value)
                          })
                        }
                        disabled={!reminderSettings.enableAutomaticReminders}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Label htmlFor="reminder-frequency" className="min-w-[180px]">Reminder frequency (days):</Label>
                      <Input
                        id="reminder-frequency"
                        type="number"
                        min="1"
                        max="30"
                        value={reminderSettings.reminderFrequency}
                        onChange={(e) => 
                          setReminderSettings({
                            ...reminderSettings,
                            reminderFrequency: parseInt(e.target.value)
                          })
                        }
                        disabled={!reminderSettings.enableAutomaticReminders}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Invoice Template Settings */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Invoice Template</h3>
                <p className="text-sm text-gray-500">
                  Customize the invoice template with school information and terms.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="invoice-notes">Default Invoice Terms & Conditions</Label>
                    <Textarea 
                      id="invoice-notes"
                      placeholder="Enter default terms and conditions for invoices"
                      className="mt-1 h-24"
                      defaultValue="1. All fees are to be paid by the due date.
2. Late payments may incur a 5% surcharge.
3. For payment plans, please contact the accounts office.
4. All payments are non-refundable."
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <div className="px-6 py-4 flex justify-between border-t">
              <Button variant="outline" onClick={resetSettings}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset to Defaults
              </Button>
              <div className="flex space-x-2">
                <Button 
                  variant="primary" 
                  onClick={saveSettings}
                  disabled={!isSettingsChanged}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </div>
          </Card>
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
            onClose={() => setIsUpdateFeeModalOpen(false)}
            onUpdate={handleFeeUpdated}
            isOpen={isUpdateFeeModalOpen}
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
        defaultFeePrices={defaultFeePrices}
      />
      
      {/* Batch Payment Dialog */}
      {selectedRows.length > 0 && (
        <BatchPaymentDialog
          isOpen={isBatchPaymentDialogOpen}
          onClose={() => setIsBatchPaymentDialogOpen(false)}
          fees={selectedFeesData}
          selectedFeeIds={selectedRows}
          onPaymentsRecorded={handleBatchPaymentsRecorded}
          getStudentName={getStudentName}
        />
      )}

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
}isOpen={isInvoiceModalOpen}
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
        defaultFeePrices={defaultFeePrices}
      />
      
      {/* Batch Payment Dialog */}
      {selectedRows.length > 0 && (
        <BatchPaymentDialog
          isOpen={isBatchPaymentDialogOpen}
          onClose={() => setIsBatchPaymentDialogOpen(false)}
          fees={selectedFeesData}
          selectedFeeIds={selectedRows}
          onPaymentsRecorded={handleBatchPaymentsRecorded}
          getStudentName={getStudentName}
        />
      )}

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