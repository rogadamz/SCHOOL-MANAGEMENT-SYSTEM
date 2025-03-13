// frontend/src/components/parents/ParentDetailsDialog.tsx
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Mail, 
  Phone, 
  User,
  MapPin,
  Users,
  AlertCircle,
  Edit2,
  Calendar,
  School,
  GraduationCap,
  BookOpen
} from 'lucide-react';
import { User as UserType, Student } from '@/services/api';

interface ParentWithChildren extends UserType {
  children?: Student[];
}

interface ParentDetailsDialogProps {
  parent: ParentWithChildren;
  onClose: () => void;
  onEdit?: () => void;
}

export const ParentDetailsDialog = ({ parent, onClose, onEdit }: ParentDetailsDialogProps) => {
  const [activeTab, setActiveTab] = useState('profile');
  
  // Function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not available';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Calculate student's age
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 'N/A';
    
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  // Check if parent has children
  const hasChildren = parent.children && parent.children.length > 0;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[80%] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl">Parent/Guardian Profile</DialogTitle>
          {onEdit && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onEdit}
              className="flex items-center gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="children">Children</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center mb-4">
                    <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-12 w-12 text-primary" />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium">Full Name</div>
                        <div>{parent.full_name || 'Not available'}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium">Email</div>
                        <div>{parent.email || 'Not available'}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium">Phone</div>
                        <div>{parent.phone || 'Not available'}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium">Address</div>
                        <div>{parent.address || 'Not available'}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium">Registered Children</div>
                        <div>
                          {hasChildren ? parent.children!.length : 0} children
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium">Username</div>
                        <div>{parent.username || 'Not available'}</div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium">Account Status</div>
                        <div className="flex items-center">
                          <span className={`h-2 w-2 rounded-full mr-2 ${parent.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          <span>{parent.is_active ? 'Active' : 'Inactive'}</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium">User ID</div>
                        <div>{parent.id || 'Not available'}</div>
                      </div>

                      <div>
                        <div className="text-sm font-medium">Role</div>
                        <div className="capitalize">{parent.role || 'parent'}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {hasChildren && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Children Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-primary/5 rounded-lg text-center">
                          <div className="text-3xl font-bold">{parent.children!.length}</div>
                          <div className="text-sm text-gray-500">Total Children</div>
                        </div>
                        
                        <div className="p-4 bg-primary/5 rounded-lg text-center">
                          <div className="text-3xl font-bold">
                            {parent.children!.length > 0 
                              ? Math.min(...parent.children!.map(child => 
                                  calculateAge(child.date_of_birth)
                                ).filter(age => typeof age === 'number')) 
                              : 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">Youngest Age</div>
                        </div>
                        
                        <div className="p-4 bg-primary/5 rounded-lg text-center">
                          <div className="text-3xl font-bold">
                            {parent.children!.length > 0 
                              ? Math.max(...parent.children!.map(child => 
                                  calculateAge(child.date_of_birth)
                                ).filter(age => typeof age === 'number')) 
                              : 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">Oldest Age</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="children" className="mt-4">
            {!hasChildren ? (
              <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg text-center">
                <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <h3 className="text-lg font-medium text-yellow-800 mb-2">No Children Registered</h3>
                <p className="text-yellow-700">
                  This parent/guardian doesn't have any children registered in the system yet.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Enrolled Children</CardTitle>
                    <CardDescription>
                      Children registered under {parent.full_name || 'this guardian'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student Name</TableHead>
                            <TableHead>Admission #</TableHead>
                            <TableHead>Date of Birth</TableHead>
                            <TableHead>Age</TableHead>
                            <TableHead>Class</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {parent.children!.map((child) => (
                            <TableRow key={child.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="bg-primary/10 p-2 rounded-full">
                                    <School className="h-4 w-4 text-primary" />
                                  </div>
                                  <div>
                                    <div className="font-medium">{child.first_name} {child.last_name}</div>
                                    <div className="text-xs text-gray-500">ID: {child.id}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{child.admission_number}</TableCell>
                              <TableCell>{formatDate(child.date_of_birth)}</TableCell>
                              <TableCell>{calculateAge(child.date_of_birth)} years</TableCell>
                              <TableCell>
                                {child.class_id ? (
                                  <Badge variant="outline" className="px-2 py-1">
                                    {child.class_name || `Class ${child.class_id}`}
                                  </Badge>
                                ) : (
                                  <span className="text-gray-500">Not assigned</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Academic Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">Class Distribution</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {Array.from(new Set(parent.children!.map(child => child.class_name || 'Unassigned'))).map((className, index) => {
                              const count = parent.children!.filter(child => (child.class_name || 'Unassigned') === className).length;
                              return (
                                <div key={index} className="bg-primary/5 rounded-md p-3">
                                  <div className="text-sm font-medium">{className}</div>
                                  <div className="text-2xl font-bold mt-1">{count}</div>
                                  <div className="text-xs text-gray-500">{((count / parent.children!.length) * 100).toFixed(0)}% of children</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Enrollment Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <div className="text-sm font-medium">Total Children</div>
                            <div className="font-bold">{parent.children!.length}</div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="text-sm font-medium">Boys</div>
                            <div>{parent.children!.filter(child => (child.gender || '').toLowerCase() === 'male').length}</div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="text-sm font-medium">Girls</div>
                            <div>{parent.children!.filter(child => (child.gender || '').toLowerCase() === 'female').length}</div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="text-sm font-medium">Unspecified Gender</div>
                            <div>{parent.children!.filter(child => !child.gender).length}</div>
                          </div>
                        </div>
                        
                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-2">Age Distribution</h4>
                          <div className="flex flex-wrap gap-2">
                            {Array.from(new Set(parent.children!.map(child => calculateAge(child.date_of_birth)))).map((age, index) => {
                              if (typeof age !== 'number') return null;
                              const count = parent.children!.filter(child => calculateAge(child.date_of_birth) === age).length;
                              return (
                                <Badge key={index} variant="outline" className="px-3 py-1">
                                  {age} years: {count} {count === 1 ? 'child' : 'children'}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex gap-2">
          {onEdit && (
            <Button variant="outline" onClick={onEdit}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};