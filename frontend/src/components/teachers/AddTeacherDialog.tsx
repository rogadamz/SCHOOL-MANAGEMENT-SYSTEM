// frontend/src/components/teachers/AddTeacherDialog.tsx
import { useState } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, UserPlus } from 'lucide-react';

interface AddTeacherDialogProps {
  onClose: () => void;
  onAdd: (teacherData: any) => void;
}

export const AddTeacherDialog = ({ onClose, onAdd }: AddTeacherDialogProps) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Custom specialization input for "other" option
  const [customSpecialization, setCustomSpecialization] = useState('');

  // Predefined specializations for nursery schools
  const specializations = [
    'Early Childhood Education',
    'Special Education',
    'Language Development',
    'Music Education',
    'Art Education',
    'Physical Education',
    'Montessori Education',
    'Child Psychology',
    'Nutrition and Health',
    'General Education'
  ];

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    if (!fullName.trim()) {
      errors.fullName = 'Full name is required';
      isValid = false;
    }

    if (!email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }

    if (!username.trim()) {
      errors.username = 'Username is required';
      isValid = false;
    } else if (username.length < 4) {
      errors.username = 'Username must be at least 4 characters';
      isValid = false;
    }

    if (!password.trim()) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    // Check specialization, accounting for both dropdown and custom
    if (specialization !== 'custom' && !specialization.trim()) {
      errors.specialization = 'Specialization is required';
      isValid = false;
    } else if (specialization === 'custom' && !customSpecialization.trim()) {
      errors.customSpecialization = 'Please enter a specialization';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create teacher data object
      const teacherData = {
        full_name: fullName,
        email,
        username,
        password,
        specialization: specialization === 'custom' ? customSpecialization : specialization
      };

      console.log("Submitting teacher data:", teacherData);

      // Call the onAdd function passed from parent
      await onAdd(teacherData);
    } catch (err: any) {
      console.error('Error in form submission:', err);
      setError(err.message || 'An error occurred while creating the teacher');
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate username from email
  const generateUsername = (email: string) => {
    if (!email) return '';
    
    // Take everything before the @ in the email
    const emailPrefix = email.split('@')[0];
    
    // Remove special characters and spaces
    return emailPrefix.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  };

  // Handle email change and auto-generate username
  const handleEmailChange = (value: string) => {
    setEmail(value);
    
    // Only update username if it's currently empty or was auto-generated
    if (!username || username === generateUsername(email)) {
      setUsername(generateUsername(value));
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Teacher</DialogTitle>
          <DialogDescription>
            Create a new teacher account. The teacher will receive login credentials.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="full-name" className="text-right">
              Full Name
            </Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className={validationErrors.fullName ? 'border-red-500' : ''}
              />
              {validationErrors.fullName && (
                <p className="text-xs text-red-500">{validationErrors.fullName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="teacher@downtown.edu"
                className={validationErrors.email ? 'border-red-500' : ''}
              />
              {validationErrors.email && (
                <p className="text-xs text-red-500">{validationErrors.email}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="teacher1"
                className={validationErrors.username ? 'border-red-500' : ''}
              />
              {validationErrors.username && (
                <p className="text-xs text-red-500">{validationErrors.username}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              Password
            </Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={validationErrors.password ? 'border-red-500' : ''}
              />
              {validationErrors.password && (
                <p className="text-xs text-red-500">{validationErrors.password}</p>
              )}
              <p className="text-xs text-gray-500">
                Must be at least 6 characters
              </p>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="specialization" className="text-right">
              Specialization
            </Label>
            <div className="col-span-3 space-y-1">
              <Select
                value={specialization}
                onValueChange={setSpecialization}
              >
                <SelectTrigger 
                  id="specialization"
                  className={validationErrors.specialization ? 'border-red-500' : ''}
                >
                  <SelectValue placeholder="Select specialization" />
                </SelectTrigger>
                <SelectContent>
                  {specializations.map((spec) => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Other (Custom)</SelectItem>
                </SelectContent>
              </Select>
              
              {specialization === 'custom' && (
                <div className="mt-2">
                  <Input
                    placeholder="Enter custom specialization"
                    value={customSpecialization}
                    onChange={(e) => setCustomSpecialization(e.target.value)}
                    className={validationErrors.customSpecialization ? 'border-red-500' : ''}
                  />
                  {validationErrors.customSpecialization && (
                    <p className="text-xs text-red-500">{validationErrors.customSpecialization}</p>
                  )}
                </div>
              )}
              
              {validationErrors.specialization && (
                <p className="text-xs text-red-500">{validationErrors.specialization}</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Teacher
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};