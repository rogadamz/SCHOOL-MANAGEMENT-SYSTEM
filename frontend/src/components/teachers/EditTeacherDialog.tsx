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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, UserPlus, AlertCircle, Save } from 'lucide-react';

interface EditTeacherDialogProps {
  teacher: any;
  onClose: () => void;
  onUpdate: (teacherData: any) => Promise<void>;
  error: string | null;
}

export const EditTeacherDialog = ({ teacher, onClose, onUpdate, error }: EditTeacherDialogProps) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [customSpecialization, setCustomSpecialization] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

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

  // Initialize form with teacher data
  useEffect(() => {
    if (teacher) {
      setFullName(teacher.user?.full_name || '');
      setEmail(teacher.user?.email || '');
      setUsername(teacher.user?.username || '');
      
      // Handle specialization
      const teacherSpecialization = teacher.specialization || '';
      if (specializations.includes(teacherSpecialization)) {
        setSpecialization(teacherSpecialization);
      } else if (teacherSpecialization) {
        setSpecialization('custom');
        setCustomSpecialization(teacherSpecialization);
      } else {
        setSpecialization('');
      }
      
      setPhone(teacher.phone || '');
      setAddress(teacher.address || '');
    }
  }, [teacher]);

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

    try {
      // Create updated teacher data
      const updatedTeacher = {
        specialization: specialization === 'custom' ? customSpecialization : specialization,
        user: {
          full_name: fullName,
          email,
          username,
        },
        phone,
        address,
        customSpecialization
      };

      console.log("Submitting updated teacher data:", updatedTeacher);

      // Call the onUpdate function passed from parent
      await onUpdate(updatedTeacher);
    } catch (err: any) {
      console.error('Error in form submission:', err);
      // Error is handled in the parent component
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Teacher</DialogTitle>
          <DialogDescription>
            Edit teacher information for {teacher.user?.full_name || 'this teacher'}.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="full-name" className="text-right">
              Full Name <span className="text-red-500">*</span>
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
              Email <span className="text-red-500">*</span>
            </Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              Username <span className="text-red-500">*</span>
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
            <Label htmlFor="specialization" className="text-right">
              Specialization <span className="text-red-500">*</span>
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

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Phone
            </Label>
            <div className="col-span-3">
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 123-456-7890"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right">
              Address
            </Label>
            <div className="col-span-3">
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 School St, Downtown"
              />
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
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};