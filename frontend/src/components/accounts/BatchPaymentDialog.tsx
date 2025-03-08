// frontend/src/components/accounts/BatchPaymentDialog.tsx
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DollarSign, Calendar, CheckCircle2, Loader2, Search, CreditCard } from 'lucide-react';
import { ExtendedFee } from '@/services/api-extension';

interface BatchPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fees: ExtendedFee[];
  selectedFeeIds: number[];
  onPaymentsRecorded: (payments: { feeId: number, amount: number }[]) => void;
  getStudentName: (studentId: number) => string;
}

export const BatchPaymentDialog = ({
  isOpen,
  onClose,
  fees,
  selectedFeeIds,
  onPaymentsRecorded,
  getStudentName
}: BatchPaymentDialogProps) => {
  // Selected fees
  const [selectedFees, setSelectedFees] = useState<ExtendedFee[]>([]);
  
  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [sendReceipt, setSendReceipt] = useState<boolean>(true);
  
  // Payment amount selection mode
  const [paymentMode, setPaymentMode] = useState<'full' | 'partial' | 'custom'>('full');
  
  // Custom amounts for each fee
  const [customAmounts, setCustomAmounts] = useState<Record<number, number>>({});
  
  // For partial payment percentage
  const [partialPercentage, setPartialPercentage] = useState<number>(50);
  
  // Loading and error states
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  // Current step (1: configure payments, 2: review)
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  // Filter for finding specific fees in large selections
  const [filterQuery, setFilterQuery] = useState<string>('');

  // Initialize selected fees when dialog opens
  useEffect(() => {
    if (isOpen && selectedFeeIds.length > 0) {
      const feesToProcess = fees.filter(fee => selectedFeeIds.includes(fee.id));
      setSelectedFees(feesToProcess);
      
      // Initialize custom amounts with remaining balances
      const initialAmounts: Record<number, number> = {};
      feesToProcess.forEach(fee => {
        initialAmounts[fee.id] = fee.amount - fee.paid;
      });
      setCustomAmounts(initialAmounts);
      
      // Reset other states
      setPaymentMethod('cash');
      setReferenceNumber('');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setSendReceipt(true);
      setPaymentMode('full');
      setPartialPercentage(50);
      setCurrentStep(1);
      setFilterQuery('');
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, selectedFeeIds, fees]);

  // Calculate total amount to be paid based on payment mode
  const calculateTotalAmount = (): number => {
    let total = 0;
    
    selectedFees.forEach(fee => {
      const balance = fee.amount - fee.paid;
      
      if (paymentMode === 'full') {
        total += balance;
      } else if (paymentMode === 'partial') {
        total += balance * (partialPercentage / 100);
      } else if (paymentMode === 'custom') {
        total += customAmounts[fee.id] || 0;
      }
    });
    
    return total;
  };

  // Get payment amount for a specific fee based on payment mode
  const getPaymentAmount = (fee: ExtendedFee): number => {
    const balance = fee.amount - fee.paid;
    
    if (paymentMode === 'full') {
      return balance;
    } else if (paymentMode === 'partial') {
      return balance * (partialPercentage / 100);
    } else {
      return customAmounts[fee.id] || 0;
    }
  };

  // Handle custom amount change for a fee
  const handleCustomAmountChange = (feeId: number, amount: number) => {
    const fee = selectedFees.find(f => f.id === feeId);
    if (!fee) return;
    
    const balance = fee.amount - fee.paid;
    // Ensure amount is not more than the balance or less than 0
    const validAmount = Math.min(Math.max(0, amount), balance);
    
    setCustomAmounts(prev => ({
      ...prev,
      [feeId]: validAmount
    }));
  };

  // Handle payment submission
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate
      const totalAmount = calculateTotalAmount();
      if (totalAmount <= 0) {
        throw new Error('Total payment amount must be greater than 0');
      }
      
      // Prepare payment data
      const payments = selectedFees.map(fee => ({
        feeId: fee.id,
        amount: getPaymentAmount(fee)
      })).filter(payment => payment.amount > 0);
      
      // In a real implementation, you would call the API
      // For demo, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Record payments
      onPaymentsRecorded(payments);
      
      // Show success state
      setSuccess(true);
      
      // Close dialog after a delay
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (err: any) {
      console.error('Error processing batch payment:', err);
      setError(err.message || 'Failed to process payments');
    } finally {
      setLoading(false);
    }
  };

  // Format currency in UGX
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Get reference number label based on payment method
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

  // Filter fees based on search query
  const filteredFees = selectedFees.filter(fee => {
    if (!filterQuery) return true;
    
    const studentName = getStudentName(fee.student_id);
    const query = filterQuery.toLowerCase();
    
    return (
      studentName.toLowerCase().includes(query) ||
      fee.description.toLowerCase().includes(query) ||
      (fee.invoice_number && fee.invoice_number.toLowerCase().includes(query))
    );
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Batch Payment Processing</DialogTitle>
          <DialogDescription>
            Record payments for multiple fees at once.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-6 flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Payments Recorded Successfully</h3>
            <p className="text-gray-500 text-center">
              Batch payment of {formatCurrency(calculateTotalAmount())} has been processed for {selectedFees.length} fees.
            </p>
          </div>
        ) : (
          <>
            {currentStep === 1 ? (
              <div className="py-4">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Selected Fees ({selectedFees.length})</h3>
                    
                    {selectedFees.length > 5 && (
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          placeholder="Search fees..."
                          className="pl-8 w-64"
                          value={filterQuery}
                          onChange={(e) => setFilterQuery(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="border rounded-lg overflow-hidden mb-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead className="text-right">Paid</TableHead>
                          <TableHead className="text-right">Balance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredFees.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                              No fees found matching your search
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredFees.map((fee) => (
                            <TableRow key={fee.id}>
                              <TableCell>{getStudentName(fee.student_id)}</TableCell>
                              <TableCell>
                                {fee.description}
                                <div className="text-xs text-gray-400">{fee.invoice_number}</div>
                              </TableCell>
                              <TableCell className="text-right">{formatCurrency(fee.amount)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(fee.paid)}</TableCell>
                              <TableCell className="text-right font-medium text-red-600">
                                {formatCurrency(fee.amount - fee.paid)}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Payment Details</h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Payment Mode</Label>
                        <RadioGroup value={paymentMode} onValueChange={(value: string) => setPaymentMode(value as 'full' | 'partial' | 'custom')}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="full" id="full-payment" />
                            <Label htmlFor="full-payment" className="cursor-pointer">Full payment (pay entire balance)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="partial" id="partial-payment" />
                            <Label htmlFor="partial-payment" className="cursor-pointer">Partial payment (percentage of balance)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="custom" id="custom-payment" />
                            <Label htmlFor="custom-payment" className="cursor-pointer">Custom amount (specify individual amounts)</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      {paymentMode === 'partial' && (
                        <div className="space-y-2 pl-6">
                          <Label>Payment Percentage</Label>
                          <div className="flex items-center gap-4">
                            <Input
                              type="number"
                              min={1}
                              max={100}
                              value={partialPercentage}
                              onChange={(e) => setPartialPercentage(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                              className="w-24"
                            />
                            <div className="flex-1">
                              <div className="h-2 bg-gray-200 rounded-full">
                                <div 
                                  className="h-2 bg-blue-600 rounded-full"
                                  style={{ width: `${partialPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                            <span className="font-medium">{partialPercentage}%</span>
                          </div>
                        </div>
                      )}
                      
                      {paymentMode === 'custom' && (
                        <div className="space-y-2 pl-6">
                          <Label>Custom Payment Amounts</Label>
                          <div className="border rounded-lg overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Student</TableHead>
                                  <TableHead>Description</TableHead>
                                  <TableHead className="text-right">Balance</TableHead>
                                  <TableHead className="text-right">Payment Amount</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {filteredFees.map((fee) => (
                                  <TableRow key={fee.id}>
                                    <TableCell>{getStudentName(fee.student_id)}</TableCell>
                                    <TableCell>{fee.description}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(fee.amount - fee.paid)}</TableCell>
                                    <TableCell className="text-right">
                                      <Input
                                        type="number"
                                        value={customAmounts[fee.id] || 0}
                                        onChange={(e) => handleCustomAmountChange(fee.id, parseFloat(e.target.value) || 0)}
                                        className="w-32 text-right ml-auto"
                                        min={0}
                                        max={fee.amount - fee.paid}
                                      />
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="paymentMethod">Payment Method</Label>
                          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                            <SelectTrigger id="paymentMethod">
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
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="reference">{getReferenceNumberLabel()}</Label>
                          <Input
                            id="reference"
                            value={referenceNumber}
                            onChange={(e) => setReferenceNumber(e.target.value)}
                            placeholder="Optional"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="paymentDate">Payment Date</Label>
                          <Input
                            id="paymentDate"
                            type="date"
                            value={paymentDate}
                            onChange={(e) => setPaymentDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="notes">Notes</Label>
                          <Input
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Optional payment notes"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="sendReceipt"
                          checked={sendReceipt}
                          onCheckedChange={(checked) => setSendReceipt(!!checked)}
                        />
                        <label
                          htmlFor="sendReceipt"
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          Send receipt to parents/guardians
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-4">
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4">Payment Summary</h3>
                  
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <p className="text-sm text-gray-500">Payment Method</p>
                        <p className="font-medium capitalize">{paymentMethod.replace('_', ' ')}</p>
                      </div>
                      
                      {referenceNumber && (
                        <div>
                          <p className="text-sm text-gray-500">{getReferenceNumberLabel()}</p>
                          <p className="font-medium">{referenceNumber}</p>
                        </div>
                      )}
                      
                      <div>
                        <p className="text-sm text-gray-500">Payment Date</p>
                        <p className="font-medium">{new Date(paymentDate).toLocaleDateString()}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Payment Mode</p>
                        <p className="font-medium">
                          {paymentMode === 'full' ? 'Full Payment' : 
                           paymentMode === 'partial' ? `Partial Payment (${partialPercentage}%)` : 
                           'Custom Payment'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">Payment Details</h4>
                      
                      <div className="border rounded-lg overflow-hidden max-h-[300px] overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Student</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead className="text-right">Balance</TableHead>
                              <TableHead className="text-right">Payment</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedFees.map((fee) => {
                              const paymentAmount = getPaymentAmount(fee);
                              const balance = fee.amount - fee.paid;
                              
                              // Skip rows with 0 payment
                              if (paymentAmount <= 0) return null;
                              
                              return (
                                <TableRow key={fee.id}>
                                  <TableCell>{getStudentName(fee.student_id)}</TableCell>
                                  <TableCell>{fee.description}</TableCell>
                                  <TableCell className="text-right">{formatCurrency(balance)}</TableCell>
                                  <TableCell className="text-right font-medium">
                                    {formatCurrency(paymentAmount)}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4">
                        <span className="font-medium">Total Payment:</span>
                        <span className="text-xl font-bold text-blue-600">
                          {formatCurrency(calculateTotalAmount())}
                        </span>
                      </div>
                    </div>
                    
                    {notes && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-gray-500">Notes</p>
                        <p className="font-medium">{notes}</p>
                      </div>
                    )}
                    
                    <div className="mt-4 pt-4 border-t text-sm text-gray-500">
                      {sendReceipt ? 
                        'Receipt will be sent to parents/guardians' : 
                        'Receipt will not be sent to parents/guardians'}
                    </div>
                  </div>
                </div>
                
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <DialogFooter>
              {currentStep === 1 ? (
                <>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    disabled={calculateTotalAmount() <= 0}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Next: Review
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    disabled={loading}
                  >
                    Back
                  </Button>
                  <Button 
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading || calculateTotalAmount() <= 0}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <DollarSign className="mr-2 h-4 w-4" />
                        Complete Payment
                      </>
                    )}
                  </Button>
                </>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};