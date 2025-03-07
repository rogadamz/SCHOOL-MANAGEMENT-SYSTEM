// frontend/src/components/accounts/UpdateFeeDialog.tsx
import { useState, useEffect } from 'react';
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
import { Fee } from '@/services/api';

interface UpdateFeeDialogProps {
  fee: Fee;
  onClose: () => void;
  onUpdate: (fee: any) => void;
}

export const UpdateFeeDialog = ({ fee, onClose, onUpdate }: UpdateFeeDialogProps) => {
  const [amount, setAmount] = useState(fee.amount.toString());
  const [description, setDescription] = useState(fee.description);
  const [dueDate, setDueDate] = useState(fee.due_date.split('T')[0]);
  const [paid, setPaid] = useState(fee.paid.toString());
  const [status, setStatus] = useState(fee.status);
  const [term, setTerm] = useState(fee.term);
  const [academicYear, setAcademicYear] = useState(fee.academic_year);
  const [error, setError] = useState('');

  // Update status when paid amount changes
  useEffect(() => {
    if (parseFloat(paid) >= parseFloat(amount)) {
      setStatus('paid');
    } else if (parseFloat(paid) > 0) {
      setStatus('pending');
    } else {
      setStatus('overdue');
    }
  }, [paid, amount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!amount || !description || !dueDate || !term || !academicYear) {
      setError('Please fill all required fields');
      return;
    }

    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Amount must be a positive number');
      return;
    }

    if (isNaN(parseFloat(paid)) || parseFloat(paid) < 0) {
      setError('Paid amount must be a non-negative number');
      return;
    }

    if (parseFloat(paid) > parseFloat(amount)) {
      setError('Paid amount cannot exceed total amount');
      return;
    }

    // Create updated fee object
    const updatedFee = {
      id: fee.id,
      student_id: fee.student_id,
      amount: parseFloat(amount),
      description,
      due_date: dueDate,
      paid: parseFloat(paid),
      status: parseFloat(paid) === parseFloat(amount) ? 'paid' : 
             parseFloat(paid) > 0 ? 'pending' : 'overdue',
      term,
      academic_year: academicYear
    };

    onUpdate(updatedFee);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Fee</DialogTitle>
          <DialogDescription>
            Update fee information for {fee.student_name || `Student ID: ${fee.student_id}`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                className="col-span-3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                className="col-span-3"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="paid" className="text-right">
                Paid Amount
              </Label>
              <Input
                id="paid"
                type="number"
                step="0.01"
                min="0"
                className="col-span-3"
                value={paid}
                onChange={(e) => setPaid(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right">
                Due Date
              </Label>
              <Input
                id="dueDate"
                type="date"
                className="col-span-3"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="term" className="text-right">
                Term
              </Label>
              <Select value={term} onValueChange={setTerm}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Term 1">Term 1</SelectItem>
                  <SelectItem value="Term 2">Term 2</SelectItem>
                  <SelectItem value="Term 3">Term 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="academicYear" className="text-right">
                Academic Year
              </Label>
              <Select value={academicYear} onValueChange={setAcademicYear}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select academic year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2023-2024">2023-2024</SelectItem>
                  <SelectItem value="2024-2025">2024-2025</SelectItem>
                  <SelectItem value="2025-2026">2025-2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Update Fee</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};