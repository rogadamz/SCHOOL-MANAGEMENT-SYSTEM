// frontend/src/components/accounts/RecordPaymentDialog.tsx
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, DollarSign, Calendar, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { dashboardApi } from '@/services/api';
import { ExtendedFee } from '@/services/api-extension';

interface RecordPaymentDialogProps {
  fee: ExtendedFee;
  isOpen: boolean;
  onClose: () => void;
  onPaymentRecorded: (feeId: number, amount: number) => void;
  getStudentName: (studentId: number) => string;
}

export const RecordPaymentDialog = ({
  fee,
  isOpen,
  onClose,
  onPaymentRecorded,
  getStudentName
}: RecordPaymentDialogProps) => {
  const [amount, setAmount] = useState<number>(fee ? (fee.amount - fee.paid) : 0);
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [sendReceipt, setSendReceipt] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Validation states
  const [amountError, setAmountError] = useState<string | null>(null);
  const [paymentMethodError, setPaymentMethodError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  // Reset form when the fee changes
  useEffect(() => {
    if (fee) {
      setAmount(fee.amount - fee.paid);
      setPaymentMethod('cash');
      setReferenceNumber('');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setSendReceipt(true);
      setNotes('');
      setError(null);
      setSuccess(false);
      // Reset validation errors
      setAmountError(null);
      setPaymentMethodError(null);
      setDateError(null);
    }
  }, [fee]);

  const validateForm = (): boolean => {
    let isValid = true;
    
    // Amount validation
    if (!amount || amount <= 0) {
      setAmountError('Amount must be greater than 0');
      isValid = false;
    } else if (amount > (fee.amount - fee.paid)) {
      setAmountError('Amount cannot exceed remaining balance');
      isValid = false;
    } else {
      setAmountError(null);
    }
    
    // Payment method validation
    if (!paymentMethod) {
      setPaymentMethodError('Payment method is required');
      isValid = false;
    } else {
      setPaymentMethodError(null);
    }
    
    // Date validation
    if (!paymentDate) {
      setDateError('Payment date is required');
      isValid = false;
    } else {
      // Check if date is not in the future
      const selectedDate = new Date(paymentDate);
      const today = new Date();
      if (selectedDate > today) {
        setDateError('Payment date cannot be in the future');
        isValid = false;
      } else {
        setDateError(null);
      }
    }
    
    return isValid;
  };

  const handleSubmit = async () => {
    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // In a real implementation, you would call the API
      // await dashboardApi.recordPayment(fee.id, amount, {
      //   paymentMethod,
      //   referenceNumber,
      //   paymentDate,
      //   notes
      // });

      // For demo, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      setSuccess(true);
      
      // Notify parent component that payment was recorded
      onPaymentRecorded(fee.id, amount);
      
      // Close dialog after 1.5 seconds
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
      
    } catch (err: any) {
      console.error('Error recording payment:', err);
      setError(err.message || 'Failed to record payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getReferenceNumberLabel = () => {
    switch(paymentMethod) {
      case 'bank_transfer':
        return 'Transaction Reference';
      case 'check':
        return 'Check Number';
      case 'credit_card':
        return 'Transaction ID';
      case 'mobile_money':
        return 'Transaction ID';
      default:
        return 'Receipt Number';
    }
  };

  // If fee is not provided, don't render
  if (!fee) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record a payment for the selected fee.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-6 flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Payment Recorded</h3>
            <p className="text-gray-500 text-center">
              Payment of {formatCurrency(amount)} has been successfully recorded.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm font-medium mb-2">Fee Details</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-500">Student:</div>
                <div className="font-medium">{getStudentName(fee.student_id)}</div>
                
                <div className="text-gray-500">Description:</div>
                <div className="font-medium">{fee.description}</div>
                
                <div className="text-gray-500">Total Amount:</div>
                <div className="font-medium">{formatCurrency(fee.amount)}</div>
                
                <div className="text-gray-500">Amount Paid:</div>
                <div className="font-medium">{formatCurrency(fee.paid)}</div>
                
                <div className="text-gray-500">Balance:</div>
                <div className="font-medium text-red-600">{formatCurrency(fee.amount - fee.paid)}</div>
                
                <div className="text-gray-500">Due Date:</div>
                <div className="font-medium">{new Date(fee.due_date).toLocaleDateString()}</div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <div className="col-span-3 space-y-1">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      UGX
                    </span>
                    <Input
                      id="amount"
                      type="number"
                      className={`pl-12 ${amountError ? 'border-red-500' : ''}`}
                      value={amount || ''}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        setAmount(isNaN(value) ? 0 : value);
                      }}
                      placeholder="Enter payment amount"
                    />
                  </div>
                  {amountError && <p className="text-xs text-red-500">{amountError}</p>}
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="paymentMethod" className="text-right">
                  Payment Method
                </Label>
                <div className="col-span-3 space-y-1">
                  <Select 
                    value={paymentMethod} 
                    onValueChange={setPaymentMethod}
                  >
                    <SelectTrigger id="paymentMethod" className={paymentMethodError ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    </SelectContent>
                  </Select>
                  {paymentMethodError && <p className="text-xs text-red-500">{paymentMethodError}</p>}
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reference" className="text-right">
                  {getReferenceNumberLabel()}
                </Label>
                <Input
                  id="reference"
                  className="col-span-3"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="Optional"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="paymentDate" className="text-right">
                  Payment Date
                </Label>
                <div className="col-span-3 space-y-1">
                  <Input
                    id="paymentDate"
                    type="date"
                    className={dateError ? 'border-red-500' : ''}
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]} // Prevent selecting future dates
                  />
                  {dateError && <p className="text-xs text-red-500">{dateError}</p>}
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Input
                  id="notes"
                  className="col-span-3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional payment notes"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <div className="col-start-2 col-span-3 flex items-center space-x-2">
                  <Checkbox 
                    id="sendReceipt" 
                    checked={sendReceipt} 
                    onCheckedChange={(checked) => setSendReceipt(checked as boolean)}
                  />
                  <label
                    htmlFor="sendReceipt"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Send receipt to parent/guardian
                  </label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Record Payment
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};