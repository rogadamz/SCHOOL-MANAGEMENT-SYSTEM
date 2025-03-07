// frontend/src/components/students/AddStudentDialog.tsx
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
import { User } from '@/services/api';

interface AddStudentDialogProps {
  parents: User[];
  onClose: () => void;
  onAdd: (student: any) => void;
}

export const AddStudentDialog = ({ parents, onClose, onAdd }: AddStudentDialogProps) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [parentId, setParentId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!firstName || !lastName || !dateOfBirth || !admissionNumber || !parentId) {
      setError('Please fill all required fields');
      return;
    }

    // Validate date of birth
    const birthDate = new Date(dateOfBirth);
    const now = new Date();
    const minValidYear = now.getFullYear() - 20; // Assuming students are not older than 20
    const maxValidYear = now.getFullYear();
    
    if (birthDate.getFullYear() < minValidYear || birthDate.getFullYear() > maxValidYear) {
      setError('Please enter a valid date of birth');
      return;
    }

    // Create student object
    const newStudent = {
      first_name: firstName,
      last_name: lastName,
      date_of_birth: dateOfBirth,
      admission_number: admissionNumber,
      parent_id: parseInt(parentId)
    };

    onAdd(newStudent);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Register a new student to the school system.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="firstName" className="text-right">
                First Name
              </Label>
              <Input
                id="firstName"
                className="col-span-3"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastName" className="text-right">
                Last Name
              </Label>
              <Input
                id="lastName"
                className="col-span-3"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dateOfBirth" className="text-right">
                Date of Birth
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                className="col-span-3"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="admissionNumber" className="text-right">
                Admission #
              </Label>
              <Input
                id="admissionNumber"
                className="col-span-3"
                value={admissionNumber}
                onChange={(e) => setAdmissionNumber(e.target.value)}
                placeholder="ST-2024-001"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="parent" className="text-right">
                Parent/Guardian
              </Label>
              <div className="col-span-3">
                <Select value={parentId} onValueChange={setParentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent/guardian" />
                  </SelectTrigger>
                  <SelectContent>
                    {parents.map((parent) => (
                      <SelectItem key={parent.id} value={parent.id.toString()}>
                        {parent.full_name} ({parent.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Register Student</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};