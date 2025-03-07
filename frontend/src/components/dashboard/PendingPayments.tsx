// frontend/src/components/dashboard/PendingPayments.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, AlertCircle, Clock } from 'lucide-react';
import { dashboardApi } from '@/services/api';

interface PaymentDue {
  id: number;
  student_name: string;
  student_id: number;
  amount: number;
  balance: number;
  description: string;
  due_date: string;
  days_left: number;
}

export const PendingPayments = () => {
  const [payments, setPayments] = useState<PaymentDue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingPayments = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, you would use this API endpoint
        // const data = await dashboardApi.getPaymentsDue();
        
        // For demo purposes, use mock data
        const mockData: PaymentDue[] = [
          {
            id: 1,
            student_name: 'John Smith',
            student_id: 101,
            amount: 1500,
            balance: 1500,
            description: 'Tuition Fee - Term 2',
            due_date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
            days_left: 5
          },
          {
            id: 2,
            student_name: 'Emma Johnson',
            student_id: 102,
            amount: 1200,
            balance: 600,
            description: 'Tuition Fee - Term 2',
            due_date: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
            days_left: 3
          },
          {
            id: 3,
            student_name: 'Michael Brown',
            student_id: 103,
            amount: 1500,
            balance: 1500,
            description: 'Tuition Fee - Term 2',
            due_date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
            days_left: -2
          }
        ];
        
        setPayments(mockData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching pending payments:', error);
        setLoading(false);
      }
    };
    
    fetchPendingPayments();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4">Pending Payments</h3>
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : payments.length > 0 ? (
            payments.map((payment, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg flex justify-between items-start ${
                  payment.days_left < 0 
                    ? 'bg-red-50 border border-red-100' 
                    : payment.days_left <= 5 
                      ? 'bg-yellow-50 border border-yellow-100' 
                      : 'bg-blue-50 border border-blue-100'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    {payment.days_left < 0 ? (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-yellow-500" />
                    )}
                    <p className="font-medium">{payment.student_name}</p>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{payment.description}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm">
                      Balance: <strong>{formatCurrency(payment.balance)}</strong>
                    </span>
                    <span className="text-sm">
                      Due: <strong>{formatDate(payment.due_date)}</strong>
                    </span>
                  </div>
                </div>
                <Button size="sm" className="whitespace-nowrap">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Record Payment
                </Button>
              </div>
            ))
          ) : (
            <p className="text-center py-4 text-gray-500">No pending payments</p>
          )}
          
          {payments.length > 0 && (
            <div className="pt-2">
              <Button variant="outline" className="w-full">
                View All Pending Payments
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};