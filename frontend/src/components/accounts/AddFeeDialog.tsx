// frontend/src/components/accounts/AddFeeDialog.tsx
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
import { Student } from '@/services/api';

interface AddFeeDialogProps {
  students: Student[];
  onClose: () => void;
  onAdd: (fee: any) => void;
}

export const AddFeeDialog = ({ students, onClose, onAdd }: AddFeeDialogProps) => {
  const [studentId, setStudentId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [paid, setPaid] = useState('0');
  const [status, setStatus] = useState('pending');
  const [term, setTerm] = useState('Term 1');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!studentId || !amount || !description || !dueDate || !term || !academicYear) {
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

    // Create fee object
    const newFee = {
      student_id: parseInt(studentId),
      amount: parseFloat(amount),
      description,
      due_date: dueDate,
      paid: parseFloat(paid),
      status: parseFloat(paid) === parseFloat(amount) ? 'paid' : 
             parseFloat(paid) > 0 ? 'partial' : 'pending',
      term,
      academic_year: academicYear
    };

    onAdd(newFee);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Fee</DialogTitle>
          <DialogDescription>
            Create a new fee record for a student.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="student" className="text-right">
                Student
              </Label>
              <div className="col-span-3">
                <Select value={studentId} onValueChange={setStudentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.first_name} {student.last_name} ({student.admission_number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                className="col-span-3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tuition Fee, Activity Fee, etc."
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
                placeholder="0.00"
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
                placeholder="0.00"
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
            <Button type="submit">Add Fee</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};