// frontend/src/services/api-extension.ts
import { Fee } from './api';

// Extended Fee interface with additional properties for financial management
export interface ExtendedFee extends Fee {
  selected?: boolean;
  category?: string;
  payment_method?: string;
  last_payment_date?: string | null;
  invoice_number?: string;
  notes?: string;
  transactions?: FeeTransaction[];
}

// Fee transaction interface
export interface FeeTransaction {
  id: number;
  fee_id: number;
  amount: number;
  payment_method: string;
  reference_number?: string;
  payment_date: string;
  recorded_by: number;
  notes?: string;
}

// Financial dashboard summary
export interface FinancialSummary {
  totalAmount: number;
  totalPaid: number;
  totalBalance: number;
  paymentRate: number;
  studentCount: number;
  paidCount: number;
  partialCount: number;
  unpaidCount: number;
  overdueAmount: number;
}

// Fee category interface
export interface FeeCategory {
  id: number;
  name: string;
  value: number;
  color: string;
}

// Interface for financial reports
export interface FinancialReport {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'summary' | 'detailed' | 'custom';
  parameters?: Record<string, any>;
  url?: string;
}

// Financial report generation request
export interface GenerateReportRequest {
  report_type: string;
  start_date: string;
  end_date: string;
  include_details: boolean;
  fee_types?: string[];
  classes?: number[];
  format: 'pdf' | 'excel' | 'csv';
}

// Financial API extension
export const financialApi = {
  // Get financial summary by period
  getFinancialSummary: async (period: 'today' | 'week' | 'month' | 'term' | 'year' = 'month'): Promise<FinancialSummary> => {
    // This would be a real API call in a production environment
    // For demo, return simulated data
    
    // Different values based on period
    let totalAmount, totalPaid, overdueAmount;
    
    switch(period) {
      case 'today':
        totalAmount = 500000;
        totalPaid = 325000;
        overdueAmount = 75000;
        break;
      case 'week':
        totalAmount = 3500000;
        totalPaid = 2275000;
        overdueAmount = 525000;
        break;
      case 'month':
        totalAmount = 15000000;
        totalPaid = 9750000;
        overdueAmount = 2250000;
        break;
      case 'term':
        totalAmount = 45000000;
        totalPaid = 29250000;
        overdueAmount = 6750000;
        break;
      case 'year':
        totalAmount = 135000000;
        totalPaid = 87750000;
        overdueAmount = 20250000;
        break;
      default:
        totalAmount = 15000000;
        totalPaid = 9750000;
        overdueAmount = 2250000;
    }
    
    const totalBalance = totalAmount - totalPaid;
    const paymentRate = (totalPaid / totalAmount) * 100;
    
    return {
      totalAmount,
      totalPaid,
      totalBalance,
      paymentRate,
      studentCount: 120,
      paidCount: Math.round(120 * (paymentRate / 100) * 0.8), // 80% of proportional
      partialCount: Math.round(120 * (paymentRate / 100) * 0.2), // 20% of proportional
      unpaidCount: 120 - Math.round(120 * (paymentRate / 100)),
      overdueAmount
    };
  },
  
  // Record a payment for a fee
  recordPayment: async (feeId: number, amount: number, details?: {
    paymentMethod: string;
    referenceNumber?: string;
    paymentDate: string;
    notes?: string;
  }): Promise<ExtendedFee> => {
    // This would be a real API call in a production environment
    // For demo, simulate API behavior
    console.log(`Recording payment for fee ${feeId}:`, amount, details);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return fake response
    return {
      id: feeId,
      student_id: 1,
      amount: 1500000,
      description: "Tuition Fee - Term 1 2024-2025",
      due_date: new Date().toISOString(),
      paid: amount,
      status: amount >= 1500000 ? 'paid' : amount > 0 ? 'partial' : 'pending',
      term: "Term 1",
      academic_year: "2024-2025",
      payment_method: details?.paymentMethod || 'cash',
      last_payment_date: new Date().toISOString()
    };
  },
  
  // Record multiple payments in a batch
  recordBatchPayment: async (payments: { feeId: number, amount: number }[], details?: {
    paymentMethod: string;
    referenceNumber?: string;
    paymentDate: string;
    notes?: string;
  }): Promise<{ success: boolean; processed: number; failed: number }> => {
    // This would be a real API call in a production environment
    // For demo, simulate API behavior
    console.log('Recording batch payments:', payments, details);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return fake response
    return {
      success: true,
      processed: payments.length,
      failed: 0
    };
  },
  
  // Generate financial reports
  generateReport: async (request: GenerateReportRequest): Promise<{ reportId: string; downloadUrl: string }> => {
    // This would be a real API call in a production environment
    // For demo, simulate API behavior
    console.log('Generating financial report:', request);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return fake response
    return {
      reportId: `report-${Date.now()}`,
      downloadUrl: `https://example.com/reports/financial-${request.report_type}.${request.format}`
    };
  },
  
  // Get fee categories
  getFeeCategories: async (): Promise<FeeCategory[]> => {
    // This would be a real API call in a production environment
    // For demo, return simulated data
    return [
      { id: 1, name: 'Tuition', value: 75000, color: '#2563eb' },
      { id: 2, name: 'Transportation', value: 20000, color: '#16a34a' },
      { id: 3, name: 'Lab Fees', value: 15000, color: '#dc2626' },
      { id: 4, name: 'Materials', value: 10000, color: '#9333ea' },
      { id: 5, name: 'Activities', value: 10000, color: '#f97316' },
    ];
  },
  
  // Get fee transactions for a specific fee
  getFeeTransactions: async (feeId: number): Promise<FeeTransaction[]> => {
    // This would be a real API call in a production environment
    // For demo, return simulated data
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate 0-3 random transactions
    const transactionCount = Math.floor(Math.random() * 4);
    const transactions: FeeTransaction[] = [];
    
    for (let i = 0; i < transactionCount; i++) {
      const paymentDate = new Date();
      paymentDate.setDate(paymentDate.getDate() - (i * 10 + Math.floor(Math.random() * 5)));
      
      transactions.push({
        id: i + 1,
        fee_id: feeId,
        amount: 500000 - (i * 100000),
        payment_method: ['cash', 'bank_transfer', 'mobile_money', 'credit_card'][Math.floor(Math.random() * 4)],
        reference_number: `RCT-${new Date().getFullYear()}-${1000 + i}`,
        payment_date: paymentDate.toISOString(),
        recorded_by: 1, // Admin user ID
        notes: i === 0 ? 'Initial payment' : undefined
      });
    }
    
    return transactions.sort((a, b) => 
      new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
    );
  }
};