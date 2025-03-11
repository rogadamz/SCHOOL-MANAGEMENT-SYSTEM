// frontend/src/components/accounts/AddFeeDialog.tsx
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, CheckCircle2, DollarSign, Loader2, Users } from 'lucide-react';
import { dashboardApi, Student } from '@/services/api';

interface AddFeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onFeeAdded: (feeData: any) => void;
  defaultFeePrices: Record<string, number>;
}

export const AddFeeDialog = ({
  isOpen,
  onClose,
  students,
  onFeeAdded,
  defaultFeePrices = {
    'Tuition': 1500000,
    'Transportation': 300000,
    'Lab Fees': 150000,
    'Materials': 100000,
    'Activities': 100000
  } // Provide default values to prevent errors
}: AddFeeDialogProps) => {
  const [activeTab, setActiveTab] = useState<string>('single');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [feeType, setFeeType] = useState<string>('tuition');
  const [description, setDescription] = useState<string>('');
  const [amount, setAmount] = useState<number>(defaultFeePrices['Tuition'] || 0);
  const [dueDate, setDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [term, setTerm] = useState<string>('Term 1');
  const [academicYear, setAcademicYear] = useState<string>('2024-2025');
  const [notes, setNotes] = useState<string>('');
  const [sendInvoice, setSendInvoice] = useState<boolean>(true);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Validation states
  const [errors, setErrors] = useState<{
    student?: string;
    students?: string;
    description?: string;
    amount?: string;
    dueDate?: string;
    term?: string;
    academicYear?: string;
  }>({});

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Update description and default amount when fee type changes
  useEffect(() => {
    let defaultDescription = '';
    let defaultAmount = 0;
    
    switch(feeType) {
      case 'tuition':
        defaultDescription = `Tuition Fee - ${term} ${academicYear}`;
        defaultAmount = defaultFeePrices['Tuition'] || 1500000;
        break;
      case 'transport':
        defaultDescription = `Transportation Fee - ${term} ${academicYear}`;
        defaultAmount = defaultFeePrices['Transportation'] || 300000;
        break;
      case 'lab':
        defaultDescription = `Laboratory Fee - ${term} ${academicYear}`;
        defaultAmount = defaultFeePrices['Lab Fees'] || 150000;
        break;
      case 'materials':
        defaultDescription = `Learning Materials - ${term} ${academicYear}`;
        defaultAmount = defaultFeePrices['Materials'] || 100000;
        break;
      case 'activity':
        defaultDescription = `Activities Fee - ${term} ${academicYear}`;
        defaultAmount = defaultFeePrices['Activities'] || 100000;
        break;
      case 'custom':
        // Don't change the description for custom fee type
        break;
      default:
        defaultDescription = '';
        defaultAmount = 0;
    }
    
    if (feeType !== 'custom') {
      setDescription(defaultDescription);
      setAmount(defaultAmount);
    }
  }, [feeType, term, academicYear, defaultFeePrices]);

  // Toggle select all students
  useEffect(() => {
    if (selectAll) {
      setSelectedStudentIds(students.map(student => student.id.toString()));
    } else if (selectedStudentIds.length === students.length) {
      // This prevents an infinite loop when manually selecting all students
      // Only clear if select all was toggled off
      setSelectedStudentIds([]);
    }
  }, [selectAll, students]);

  // Update selectAll status based on manual selections
  useEffect(() => {
    if (students.length > 0 && selectedStudentIds.length === students.length) {
      setSelectAll(true);
    } else if (selectAll && selectedStudentIds.length !== students.length) {
      setSelectAll(false);
    }
  }, [selectedStudentIds, students, selectAll]);

  const resetForm = () => {
    setActiveTab('single');
    setSelectedStudentId('');
    setSelectedStudentIds([]);
    setSelectAll(false);
    setFeeType('tuition');
    
    // Set default description and amount for tuition
    setDescription(`Tuition Fee - Term 1 2024-2025`);
    setAmount(defaultFeePrices['Tuition'] || 1500000);
    
    // Set due date to 14 days from now
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    setDueDate(dueDate.toISOString().split('T')[0]);
    
    setTerm('Term 1');
    setAcademicYear('2024-2025');
    setNotes('');
    setSendInvoice(true);
    setCurrentStep(1);
    setErrors({});
    setError(null);
    setSuccess(false);
  };

  const validateStep1 = (): boolean => {
    const newErrors: any = {};
    let isValid = true;
    
    if (activeTab === 'single' && !selectedStudentId) {
      newErrors.student = 'Please select a student';
      isValid = false;
    }
    
    if (activeTab === 'batch' && selectedStudentIds.length === 0) {
      newErrors.students = 'Please select at least one student';
      isValid = false;
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
      isValid = false;
    }
    
    if (!amount || amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
      isValid = false;
    }
    
    if (!dueDate) {
      newErrors.dueDate = 'Due date is required';
      isValid = false;
    } else {
      // Check if due date is not in the past
      const selectedDate = new Date(dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to beginning of day
      
      if (selectedDate < today) {
        newErrors.dueDate = 'Due date cannot be in the past';
        isValid = false;
      }
    }
    
    if (!term) {
      newErrors.term = 'Term is required';
      isValid = false;
    }
    
    if (!academicYear) {
      newErrors.academicYear = 'Academic year is required';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Map fee type to category name for consistency
      const categoryMapping: Record<string, string> = {
        'tuition': 'Tuition',
        'transport': 'Transportation',
        'lab': 'Lab Fees',
        'materials': 'Materials',
        'activity': 'Activities',
        'custom': 'Custom'
      };
      
      // Prepare fee data
      const feeData = {
        description,
        amount,
        due_date: dueDate,
        term,
        academic_year: academicYear,
        notes,
        status: 'pending',
        paid: 0,
        category: categoryMapping[feeType] || 'Custom'
      };
      
      // Create fees based on active tab
      if (activeTab === 'single') {
        // Create fee data with student ID
        const singleFeeData = {
          ...feeData,
          student_id: parseInt(selectedStudentId),
        };
        
        // Notify parent component
        onFeeAdded(singleFeeData);
        
      } else {
        // For batch mode, create one fee per student
        for (const studentId of selectedStudentIds) {
          const batchFeeData = {
            ...feeData,
            student_id: parseInt(studentId),
          };
          
          // Notify parent component for each student
          onFeeAdded(batchFeeData);
        }
      }
      
      // Show success message
      setSuccess(true);
      
      // Close dialog after a delay
      setTimeout(() => {
        onClose();
      }, 1000);
      
    } catch (err: any) {
      console.error('Error creating fee:', err);
      setError(err.message || 'Failed to create fee. Please try again.');
      setCurrentStep(1);
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

  // Get student name by id
  const getStudentName = (id: string) => {
    const student = students.find(s => s.id.toString() === id);
    return student ? `${student.first_name} ${student.last_name}` : 'Unknown Student';
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Fee</DialogTitle>
          <DialogDescription>
            Create a new fee for one or multiple students.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-6 flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Fee Created Successfully</h3>
            <p className="text-gray-500 text-center">
              {activeTab === 'single' 
                ? `Fee of ${formatCurrency(amount)} has been created for ${getStudentName(selectedStudentId)}.`
                : `Fees of ${formatCurrency(amount)} have been created for ${selectedStudentIds.length} students.`
              }
            </p>
          </div>
        ) : (
          <>
            {currentStep === 1 ? (
              <div className="py-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="single">Single Student</TabsTrigger>
                    <TabsTrigger value="batch">Multiple Students</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="single" className="mt-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="student">Student</Label>
                        <Select 
                          value={selectedStudentId}
                          onValueChange={setSelectedStudentId}
                        >
                          <SelectTrigger id="student" className={errors.student ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select a student" />
                          </SelectTrigger>
                          <SelectContent>
                            {students.map(student => (
                              <SelectItem 
                                key={student.id} 
                                value={student.id.toString()}
                              >
                                {student.first_name} {student.last_name} - {student.admission_number}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.student && (
                          <p className="text-xs text-red-500">{errors.student}</p>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="batch" className="mt-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="students">Select Students</Label>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="selectAll" 
                              checked={selectAll}
                              onCheckedChange={(checked) => {
                                setSelectAll(!!checked);
                              }}
                            />
                            <label
                              htmlFor="selectAll"
                              className="text-sm font-medium leading-none cursor-pointer"
                            >
                              Select All
                            </label>
                          </div>
                        </div>
                        
                        <div className="border rounded-md p-2 max-h-[200px] overflow-y-auto">
                          <div className="space-y-2">
                            {students.length > 0 ? students.map(student => (
                              <div key={student.id} className="flex items-center space-x-2">
                                <Checkbox 
                                  id={`student-${student.id}`}
                                  checked={selectedStudentIds.includes(student.id.toString())}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedStudentIds([...selectedStudentIds, student.id.toString()]);
                                    } else {
                                      setSelectedStudentIds(
                                        selectedStudentIds.filter(id => id !== student.id.toString())
                                      );
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={`student-${student.id}`}
                                  className="text-sm leading-none cursor-pointer flex-1"
                                >
                                  {student.first_name} {student.last_name} - {student.admission_number}
                                </label>
                              </div>
                            )) : (
                              <p className="text-sm text-gray-500 text-center py-2">No students available</p>
                            )}
                          </div>
                        </div>
                        {errors.students && (
                          <p className="text-xs text-red-500">{errors.students}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          {selectedStudentIds.length} students selected
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="feeType">Fee Type</Label>
                    <Select value={feeType} onValueChange={setFeeType}>
                      <SelectTrigger id="feeType">
                        <SelectValue placeholder="Select fee type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tuition">Tuition Fee ({formatCurrency(defaultFeePrices['Tuition'] || 0)})</SelectItem>
                        <SelectItem value="transport">Transportation Fee ({formatCurrency(defaultFeePrices['Transportation'] || 0)})</SelectItem>
                        <SelectItem value="lab">Laboratory Fee ({formatCurrency(defaultFeePrices['Lab Fees'] || 0)})</SelectItem>
                        <SelectItem value="materials">Learning Materials ({formatCurrency(defaultFeePrices['Materials'] || 0)})</SelectItem>
                        <SelectItem value="activity">Activities Fee ({formatCurrency(defaultFeePrices['Activities'] || 0)})</SelectItem>
                        <SelectItem value="custom">Custom Fee</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className={errors.description ? 'border-red-500' : ''}
                      placeholder="Fee description"
                    />
                    {errors.description && (
                      <p className="text-xs text-red-500">{errors.description}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (UGX)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        UGX
                      </span>
                      <Input
                        id="amount"
                        type="number"
                        className={`pl-12 ${errors.amount ? 'border-red-500' : ''}`}
                        value={amount || ''}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          setAmount(isNaN(value) ? 0 : value);
                        }}
                        placeholder="Enter fee amount"
                      />
                    </div>
                    {errors.amount && (
                      <p className="text-xs text-red-500">{errors.amount}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="term">Term</Label>
                      <Select value={term} onValueChange={setTerm}>
                        <SelectTrigger id="term" className={errors.term ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select term" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Term 1">Term 1</SelectItem>
                          <SelectItem value="Term 2">Term 2</SelectItem>
                          <SelectItem value="Term 3">Term 3</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.term && (
                        <p className="text-xs text-red-500">{errors.term}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="academicYear">Academic Year</Label>
                      <Select value={academicYear} onValueChange={setAcademicYear}>
                        <SelectTrigger id="academicYear" className={errors.academicYear ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select academic year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2023-2024">2023-2024</SelectItem>
                          <SelectItem value="2024-2025">2024-2025</SelectItem>
                          <SelectItem value="2025-2026">2025-2026</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.academicYear && (
                        <p className="text-xs text-red-500">{errors.academicYear}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      className={errors.dueDate ? 'border-red-500' : ''}
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                    {errors.dueDate && (
                      <p className="text-xs text-red-500">{errors.dueDate}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Optional notes"
                      className="resize-none"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="sendInvoice" 
                      checked={sendInvoice}
                      onCheckedChange={(checked) => setSendInvoice(!!checked)}
                    />
                    <label
                      htmlFor="sendInvoice"
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      Send invoice to parents/guardians
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-4">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Fee Summary</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Fee Type</p>
                        <p className="font-medium">
                          {feeType === 'tuition' ? 'Tuition Fee' :
                           feeType === 'transport' ? 'Transportation Fee' :
                           feeType === 'lab' ? 'Laboratory Fee' :
                           feeType === 'materials' ? 'Learning Materials' :
                           feeType === 'activity' ? 'Activities Fee' :
                           'Custom Fee'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Amount</p>
                        <p className="font-medium">{formatCurrency(amount)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Description</p>
                        <p className="font-medium">{description}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Due Date</p>
                        <p className="font-medium">{new Date(dueDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Term</p>
                        <p className="font-medium">{term}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Academic Year</p>
                        <p className="font-medium">{academicYear}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Students</p>
                      {activeTab === 'single' ? (
                        <p className="font-medium">{getStudentName(selectedStudentId)}</p>
                      ) : (
                        <div>
                          <p className="font-medium">{selectedStudentIds.length} students selected</p>
                          <div className="mt-1 text-sm max-h-[100px] overflow-y-auto">
                            {selectedStudentIds.slice(0, 5).map(id => (
                              <div key={id} className="text-gray-700">{getStudentName(id)}</div>
                            ))}
                            {selectedStudentIds.length > 5 && (
                              <div className="text-gray-500">
                                ...and {selectedStudentIds.length - 5} more
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {notes && (
                      <div>
                        <p className="text-sm text-gray-500">Notes</p>
                        <p className="font-medium">{notes}</p>
                      </div>
                    )}
                    
                    <div className="pt-2">
                      <p className="text-sm text-gray-500">
                        {sendInvoice ? 'Invoice will be sent to parents/guardians' : 'Invoice will not be sent to parents/guardians'}
                      </p>
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
                    onClick={handleNextStep}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
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
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <DollarSign className="mr-2 h-4 w-4" />
                        Create Fee
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