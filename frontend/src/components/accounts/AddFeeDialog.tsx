// frontend/src/components/accounts/AddFeeDialog.tsx
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Student } from '@/services/api';

interface AddFeeDialogProps {
  students: Student[];
  onClose: () => void;
  onAdd: (feeData: any) => void;
}

export const AddFeeDialog = ({ students, onClose, onAdd }: AddFeeDialogProps) => {
  const [studentId, setStudentId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [term, setTerm] = useState<string>('');
  const [academicYear, setAcademicYear] = useState<string>(
    `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
  );
  const [initialPayment, setInitialPayment] = useState<string>('0');
  const [error, setError] = useState<string>('');

  const terms = ['Term 1', 'Term 2', 'Term 3'];
  
  const currentYear = new Date().getFullYear();
  const academicYears = [
    `${currentYear-1}-${currentYear}`,
    `${currentYear}-${currentYear+1}`,
    `${currentYear+1}-${currentYear+2}`
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!studentId || !amount || !description || !dueDate || !term || !academicYear) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Validate amount
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    // Validate initial payment
    const parsedInitialPayment = parseFloat(initialPayment || '0');
    if (isNaN(parsedInitialPayment) || parsedInitialPayment < 0) {
      setError('Please enter a valid initial payment amount');
      return;
    }
    
    if (parsedInitialPayment > parsedAmount) {
      setError('Initial payment cannot exceed the fee amount');
      return;
    }
    
    // Create new fee object
    const newFee = {
      student_id: parseInt(studentId),
      amount: parsedAmount,
      paid: parsedInitialPayment,
      description,
      due_date: dueDate,
      term,
      academic_year: academicYear,
      status: parsedInitialPayment >= parsedAmount ? 'paid' : 
              parsedInitialPayment > 0 ? 'partial' : 'pending'
    };
    
    onAdd(newFee);
  };

  // Helper to format student name with ID
  const formatStudentOption = (student: Student) => {
    return `${student.first_name} ${student.last_name} (ID: ${student.id})`;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add New Fee</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="student" className="text-right">
                Student *
              </Label>
              <div className="col-span-3">
                <Select value={studentId} onValueChange={setStudentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(student => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {formatStudentOption(student)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="term" className="text-right">
                Term *
              </Label>
              <div className="col-span-3">
                <Select value={term} onValueChange={setTerm}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    {terms.map(t => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="academicYear" className="text-right">
                Academic Year *
              </Label>
              <div className="col-span-3">
                <Select value={academicYear} onValueChange={setAcademicYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears.map(year => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description *
              </Label>
              <div className="col-span-3">
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="E.g., Tuition Fee, Lab Fee, Activity Fee"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount * ($)
              </Label>
              <Input
                id="amount"
                type="number"
                className="col-span-3"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="initialPayment" className="text-right">
                Initial Payment ($)
              </Label>
              <Input
                id="initialPayment"
                type="number"
                className="col-span-3"
                value={initialPayment}
                onChange={(e) => setInitialPayment(e.target.value)}
                min="0"
                max={amount}
                step="0.01"
                placeholder="0.00"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right">
                Due Date *
              </Label>
              <Input
                id="dueDate"
                type="date"
                className="col-span-3"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            
            {error && (
              <div className="col-span-4 text-sm text-red-500 text-center">
                {error}
              </div>
            )}
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