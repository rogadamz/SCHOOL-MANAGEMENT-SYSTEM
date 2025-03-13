// frontend/src/components/parents/AddParentDialog.tsx
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, UserPlus, AlertCircle } from 'lucide-react';

interface AddParentDialogProps {
  onClose: () => void;
  onAdd: (parent: any) => Promise<void>;
  error: string | null;
}

export const AddParentDialog = ({ onClose, onAdd, error }: AddParentDialogProps) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

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

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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
      // Create parent data object
      const parentData = {
        full_name: fullName,
        email,
        username,
        password,
        phone,
        address
      };

      console.log("Submitting parent data:", parentData);

      // Call the onAdd function passed from parent
      await onAdd(parentData);
      
      // Form reset happens in the parent component after successful submission
    } catch (err: any) {
      console.error('Error in form submission:', err);
      // Error is handled in the parent component
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

  // Generate random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(result);
    setConfirmPassword(result);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Parent/Guardian</DialogTitle>
          <DialogDescription>
            Create a new parent or guardian account.
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
            <Label htmlFor="fullName" className="text-right">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Smith"
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
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="john.smith@example.com"
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
                placeholder="jsmith"
                className={validationErrors.username ? 'border-red-500' : ''}
              />
              {validationErrors.username && (
                <p className="text-xs text-red-500">{validationErrors.username}</p>
              )}
              <p className="text-xs text-gray-500">
                Auto-generated from email, but can be changed
              </p>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              Password <span className="text-red-500">*</span>
            </Label>
            <div className="col-span-3 space-y-1">
              <div className="flex gap-2">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={validationErrors.password ? 'border-red-500' : ''}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={generatePassword}
                >
                  Generate
                </Button>
              </div>
              {validationErrors.password && (
                <p className="text-xs text-red-500">{validationErrors.password}</p>
              )}
              <p className="text-xs text-gray-500">
                Must be at least 6 characters
              </p>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="confirmPassword" className="text-right">
              Confirm Password <span className="text-red-500">*</span>
            </Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={validationErrors.confirmPassword ? 'border-red-500' : ''}
              />
              {validationErrors.confirmPassword && (
                <p className="text-xs text-red-500">{validationErrors.confirmPassword}</p>
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
                placeholder="(555) 123-4567"
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
                placeholder="123 Main St, Downtown"
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
                Creating...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Parent
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};