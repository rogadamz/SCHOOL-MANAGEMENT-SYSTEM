// src/components/accounts/RecordPaymentDialog.tsx
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DollarSign, AlertCircle } from 'lucide-react';
import { Fee } from '@/services/api';

interface RecordPaymentDialogProps {
  fee: Fee;
  studentName: string;
  onClose: () => void;
  onPayment: (feeId: number, amount: number) => void;
}

export function RecordPaymentDialog({ 
  fee, 
  studentName, 
  onClose, 
  onPayment 
}: RecordPaymentDialogProps) {
  const [amount, setAmount] = useState<number>(fee.amount - fee.paid);
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [reference, setReference] = useState<string>('');
  const [sendReceipt, setSendReceipt] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

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
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate amount
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (amount > (fee.amount - fee.paid)) {
      setError(`Payment amount cannot exceed the remaining balance of ${formatCurrency(fee.amount - fee.paid)}`);
      return;
    }

    // Process payment
    setIsProcessing(true);
    
    try {
      onPayment(fee.id, amount);
      // If we reached this point, it means the payment was successful
    } catch (err) {
      setError('Failed to process payment. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record a payment for {studentName}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Fee details summary */}
            <div className="bg-gray-50 p-4 rounded-md mb-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-500">Invoice:</div>
                <div className="font-medium">{fee.description}</div>
                
                <div className="text-gray-500">Due Date:</div>
                <div className="font-medium">{formatDate(fee.due_date)}</div>
                
                <div className="text-gray-500">Total Amount:</div>
                <div className="font-medium">{formatCurrency(fee.amount)}</div>
                
                <div className="text-gray-500">Already Paid:</div>
                <div className="font-medium">{formatCurrency(fee.paid)}</div>
                
                <div className="text-gray-500">Remaining Balance:</div>
                <div className="font-medium text-red-600">{formatCurrency(fee.amount - fee.paid)}</div>
              </div>
            </div>
            
            {/* Payment amount */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Payment Amount
              </Label>
              <div className="col-span-3">
                <div className="relative">
                  <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="amount"
                    type="number"
                    className="pl-8"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    min={0}
                    max={fee.amount - fee.paid}
                    step={1000}
                  />
                </div>
              </div>
            </div>
            
            {/* Payment method */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="method" className="text-right">
                Payment Method
              </Label>
              <div className="col-span-3">
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id="method">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="mobile">Mobile Money</SelectItem>
                    <SelectItem value="card">Card Payment</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Reference number */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reference" className="text-right">
                Reference
              </Label>
              <Input
                id="reference"
                placeholder="Optional reference number"
                className="col-span-3"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>
            
            {/* Receipt option */}
            <div className="grid grid-cols-4 items-center gap-4">
              <div></div>
              <div className="flex items-center space-x-2 col-span-3">
                <Checkbox 
                  id="receipt" 
                  checked={sendReceipt}
                  onCheckedChange={(checked) => setSendReceipt(checked as boolean)}
                />
                <Label htmlFor="receipt">Send receipt to parent/guardian</Label>
              </div>
            </div>
            
            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}