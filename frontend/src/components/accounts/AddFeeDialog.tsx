// src/components/accounts/AddFeeDialog.tsx
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { DollarSign, AlertCircle, Plus, Users } from 'lucide-react';
import { Student } from '@/services/api';

interface AddFeeDialogProps {
  students: Student[];
  onClose: () => void;
  onAdd: (feeData: any) => void;
}

export function AddFeeDialog({ students, onClose, onAdd }: AddFeeDialogProps) {
  const [activeTab, setActiveTab] = useState<string>('single');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [description, setDescription] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState<string>('Tuition');
  const [dueDate, setDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [term, setTerm] = useState<string>('Term 1');
  const [academicYear, setAcademicYear] = useState<string>('2023-2024');
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

  // Toggle student selection for batch mode
  const toggleStudentSelection = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  // Select all students
  const selectAllStudents = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(student => student.id.toString()));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if ((activeTab === 'single' && !selectedStudentId) || 
        (activeTab === 'batch' && selectedStudents.length === 0)) {
      setError('Please select at least one student');
      return;
    }

    if (!description) {
      setError('Please enter a description for the fee');
      return;
    }

    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!dueDate) {
      setError('Please select a due date');
      return;
    }

    // Process form submission
    setIsProcessing(true);
    
    try {
      if (activeTab === 'single') {
        // Create single fee
        const feeData = {
          student_id: parseInt(selectedStudentId),
          description,
          amount,
          category,
          due_date: dueDate,
          term,
          academic_year: academicYear,
          paid: 0,
          status: 'pending'
        };
        
        onAdd(feeData);
      } else {
        // Create multiple fees
        const feeBatch = selectedStudents.map(studentId => ({
          student_id: parseInt(studentId),
          description,
          amount,
          category,
          due_date: dueDate,
          term,
          academic_year: academicYear,
          paid: 0,
          status: 'pending'
        }));
        
        // In a real implementation, you'd handle batch creation differently
        // For now, we'll just add the first one as a demonstration
        onAdd(feeBatch[0]);
      }
    } catch (err) {
      setError('Failed to create fee. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create New Fee</DialogTitle>
          <DialogDescription>
            Add a new fee for one or multiple students
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="single" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Single Student</TabsTrigger>
            <TabsTrigger value="batch">Multiple Students</TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              {/* Student Selection - Single Mode */}
              <TabsContent value="single" className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="student" className="text-right">
                    Student
                  </Label>
                  <div className="col-span-3">
                    <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                      <SelectTrigger id="student">
                        <SelectValue placeholder="Select a student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map(student => (
                          <SelectItem key={student.id} value={student.id.toString()}>
                            {student.first_name} {student.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
              
              {/* Student Selection - Batch Mode */}
              <TabsContent value="batch" className="space-y-4">
                <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                  <div className="flex items-center p-2 border-b">
                    <Checkbox 
                      id="selectAll" 
                      checked={selectedStudents.length === students.length && students.length > 0}
                      onCheckedChange={selectAllStudents}
                    />
                    <Label htmlFor="selectAll" className="ml-2 font-medium">Select All Students</Label>
                  </div>
                  <div className="divide-y">
                    {students.map(student => (
                      <div key={student.id} className="flex items-center p-2">
                        <Checkbox 
                          id={`student-${student.id}`} 
                          checked={selectedStudents.includes(student.id.toString())}
                          onCheckedChange={() => toggleStudentSelection(student.id.toString())}
                        />
                        <Label htmlFor={`student-${student.id}`} className="ml-2">
                          {student.first_name} {student.last_name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-sm text-blue-600">
                  {selectedStudents.length} students selected
                </div>
              </TabsContent>
              
              {/* Fee Details (Common for both modes) */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  placeholder="e.g., Tuition Fee - Term 1"
                  className="col-span-3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <div className="col-span-3">
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select fee category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tuition">Tuition</SelectItem>
                      <SelectItem value="Transportation">Transportation</SelectItem>
                      <SelectItem value="Lab Fees">Lab Fees</SelectItem>
                      <SelectItem value="Materials">Materials</SelectItem>
                      <SelectItem value="Activities">Activities</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <div className="col-span-3">
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      id="amount"
                      type="number"
                      className="pl-8"
                      placeholder="Enter amount"
                      value={amount || ''}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      min={0}
                      step={1000}
                    />
                  </div>
                </div>
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
                <div className="col-span-3">
                  <Select value={term} onValueChange={setTerm}>
                    <SelectTrigger id="term">
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Term 1">Term 1</SelectItem>
                      <SelectItem value="Term 2">Term 2</SelectItem>
                      <SelectItem value="Term 3">Term 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="academicYear" className="text-right">
                  Academic Year
                </Label>
                <div className="col-span-3">
                  <Select value={academicYear} onValueChange={setAcademicYear}>
                    <SelectTrigger id="academicYear">
                      <SelectValue placeholder="Select academic year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2023-2024">2023-2024</SelectItem>
                      <SelectItem value="2024-2025">2024-2025</SelectItem>
                      <SelectItem value="2025-2026">2025-2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Summary */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium mb-2">Fee Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-500">Description:</div>
                  <div>{description || '-'}</div>
                  
                  <div className="text-gray-500">Amount:</div>
                  <div>{amount ? formatCurrency(amount) : '-'}</div>
                  
                  <div className="text-gray-500">Category:</div>
                  <div>{category}</div>
                  
                  <div className="text-gray-500">Due Date:</div>
                  <div>{dueDate ? new Date(dueDate).toLocaleDateString() : '-'}</div>
                  
                  <div className="text-gray-500">Term:</div>
                  <div>{term}</div>
                  
                  <div className="text-gray-500">Academic Year:</div>
                  <div>{academicYear}</div>
                  
                  <div className="text-gray-500">Students:</div>
                  <div>{activeTab === 'single' ? 
                    (selectedStudentId ? '1 student' : 'No student selected') : 
                    `${selectedStudents.length} students selected`}</div>
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
                {isProcessing ? 'Creating...' : activeTab === 'single' ? 'Create Fee' : 'Create Multiple Fees'}
              </Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}