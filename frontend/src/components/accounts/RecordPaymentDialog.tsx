// frontend/src/components/accounts/RecordPaymentDialog.tsx
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Fee } from '@/services/api';
import { AlertCircle } from 'lucide-react';

interface RecordPaymentDialogProps {
  fee: Fee;
  studentName: string;
  onClose: () => void;
  onPayment: (feeId: number, amount: number) => void;
}

export const RecordPaymentDialog = ({ 
  fee, 
  studentName, 
  onClose, 
  onPayment 
}: RecordPaymentDialogProps) => {
  const [amount, setAmount] = useState<string>((fee.amount - fee.paid).toString());
  const [error, setError] = useState<string>('');
  
  const remainingBalance = fee.amount - fee.paid;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const paymentAmount = parseFloat(amount);
    
    // Validate payment amount
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }
    
    if (paymentAmount > remainingBalance) {
      setError('Payment amount cannot exceed the remaining balance');
      return;
    }
    
    onPayment(fee.id, paymentAmount);
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-blue-800 mb-2">Fee Details</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-600">Student:</div>
              <div className="font-medium">{studentName}</div>
              
              <div className="text-gray-600">Description:</div>
              <div className="font-medium">{fee.description}</div>
              
              <div className="text-gray-600">Total Amount:</div>
              <div className="font-medium">{formatCurrency(fee.amount)}</div>
              
              <div className="text-gray-600">Amount Paid:</div>
              <div className="font-medium">{formatCurrency(fee.paid)}</div>
              
              <div className="text-gray-600">Remaining Balance:</div>
              <div className="font-medium text-red-600">{formatCurrency(remainingBalance)}</div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Payment Amount ($)
                </Label>
                <div className="col-span-3">
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0.01"
                    max={remainingBalance}
                    step="0.01"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum payment: {formatCurrency(remainingBalance)}
                  </p>
                </div>
              </div>
              
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-500 mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}
              
              <div className="mt-2">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Current balance</span>
                    <span>{formatCurrency(remainingBalance)}</span>
                  </div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Payment amount</span>
                    <span>{formatCurrency(parseFloat(amount) || 0)}</span>
                  </div>
                  <div className="border-t pt-1 mt-1">
                    <div className="flex justify-between font-medium">
                      <span>New balance</span>
                      <span>{formatCurrency(remainingBalance - (parseFloat(amount) || 0))}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Record Payment</Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};