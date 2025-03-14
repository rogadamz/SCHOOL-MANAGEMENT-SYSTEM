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
import { 
  Mail, 
  Phone, 
  Calendar, 
  Users, 
  User,
  MapPin,
  Briefcase,
  Edit2,
  School,
  GraduationCap,
  DollarSign,
  BookOpen,
  Clock
} from 'lucide-react';
import { Student, User as UserType } from '@/services/api';

// Extend the Student type to include optional properties we want to display
interface ExtendedStudent extends Student {
  attendance_rate?: number;
  current_grade?: string;
  academic_progress?: string;
  fee_status?: string;
  class_name?: string;
}

interface ParentWithChildren extends UserType {
  children?: ExtendedStudent[];
  children_count?: number;
  phone?: string;
  address?: string;
  occupation?: string;
  emergency_contact?: string;
}

interface ParentDetailsDialogProps {
  parent: ParentWithChildren;
  onClose: () => void;
  onEdit?: () => void;
}

// Function to get color based on index
const getColorForIndex = (index: number): string => {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-indigo-500',
  ];
  return colors[index % colors.length];
};

export const ParentDetailsDialog = ({ 
  parent, 
  onClose,
  onEdit
}: ParentDetailsDialogProps) => {
  const [activeTab, setActiveTab] = useState('profile');

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get children grades distribution
  const getGradeDistribution = () => {
    if (!parent.children || parent.children.length === 0) return {};
    
    const gradeDistribution: Record<string, number> = {};
    
    parent.children.forEach((child) => {
      const classInfo = child.class_name || 'Unknown';
      gradeDistribution[classInfo] = (gradeDistribution[classInfo] || 0) + 1;
    });
    
    return gradeDistribution;
  };

  const gradeDistribution = getGradeDistribution();

  // Count children with good attendance (safely handling undefined values)
  const countChildrenWithGoodAttendance = () => {
    if (!parent.children || parent.children.length === 0) return 0;
    
    return parent.children.filter(child => 
      typeof child.attendance_rate === 'number' && child.attendance_rate > 90
    ).length;
  };

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
                  <div className="mt-2 text-center">
                    <Badge className="bg-green-500 hover:bg-green-600">Active Guardian</Badge>
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
                      <Briefcase className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium">Occupation</div>
                        <div>{parent.occupation || 'Not specified'}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium">Children</div>
                        <div>{parent.children?.length || 0} registered in school</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="text-sm font-medium">Address</div>
                          <div>{parent.address || 'Not available'}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="text-sm font-medium">Emergency Contact</div>
                          <div>{parent.emergency_contact || 'Not available'}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>User Account</CardTitle>
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

                {parent.children && parent.children.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Children Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-primary/5 rounded-lg text-center">
                          <div className="text-3xl font-bold">{parent.children.length}</div>
                          <div className="text-sm text-gray-500">Children</div>
                        </div>
                        
                        <div className="p-4 bg-primary/5 rounded-lg text-center">
                          <div className="text-3xl font-bold">{Object.keys(gradeDistribution).length}</div>
                          <div className="text-sm text-gray-500">Classes</div>
                        </div>
                        
                        <div className="p-4 bg-primary/5 rounded-lg text-center">
                          <div className="text-3xl font-bold">{countChildrenWithGoodAttendance()}</div>
                          <div className="text-sm text-gray-500">Good Attendance</div>
                        </div>
                      </div>

                      {Object.keys(gradeDistribution).length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">Children's Class Distribution</h4>
                          <div className="flex items-center h-6 bg-gray-100 rounded-full overflow-hidden">
                            {Object.entries(gradeDistribution).map(([grade, count], index) => {
                              const percentage = (count / (parent.children?.length || 1)) * 100;
                              
                              return (
                                <div 
                                  key={index}
                                  className={`h-full ${getColorForIndex(index)}`}
                                  style={{ width: `${percentage}%` }}
                                  title={`${grade}: ${count} children (${percentage.toFixed(0)}%)`}
                                ></div>
                              );
                            })}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {Object.entries(gradeDistribution).map(([grade, count], index) => (
                              <div key={index} className="flex items-center text-xs">
                                <div className={`w-3 h-3 rounded-full ${getColorForIndex(index)} mr-1`}></div>
                                <span>{grade} ({count})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="children" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Children Details</CardTitle>
                <CardDescription>
                  Children registered under {parent.full_name || 'this parent/guardian'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {parent.children && parent.children.length > 0 ? (
                  <div className="space-y-6">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Admission #</TableHead>
                            <TableHead>Date of Birth</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {parent.children.map((child) => (
                            <TableRow key={child.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="bg-primary/10 p-2 rounded-full">
                                    <User className="h-4 w-4 text-primary" />
                                  </div>
                                  <span className="font-medium">{child.first_name} {child.last_name}</span>
                                </div>
                              </TableCell>
                              <TableCell>{child.admission_number}</TableCell>
                              <TableCell>{child.date_of_birth ? formatDate(child.date_of_birth) : 'N/A'}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{child.class_name || 'Not assigned'}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-green-500">Active</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Academic Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {parent.children.map((child, index) => (
                              <div key={index} className="border-b pb-3 last:border-b-0 last:pb-0">
                                <div className="flex justify-between items-center">
                                  <div className="font-medium">{child.first_name} {child.last_name}</div>
                                  <Badge variant="outline">{child.class_name || 'N/A'}</Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                  <div className="flex items-center gap-1 text-xs">
                                    <GraduationCap className="h-3 w-3 text-gray-500" />
                                    <span>Grade: {child.current_grade || 'N/A'}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-xs">
                                    <BookOpen className="h-3 w-3 text-gray-500" />
                                    <span>Progress: {child.academic_progress || 'Good'}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Financial & Attendance</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {parent.children.map((child, index) => (
                              <div key={index} className="border-b pb-3 last:border-b-0 last:pb-0">
                                <div className="font-medium">{child.first_name} {child.last_name}</div>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                  <div className="flex items-center gap-1 text-xs">
                                    <DollarSign className="h-3 w-3 text-gray-500" />
                                    <span>Fees: {child.fee_status || 'Up to date'}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-xs">
                                    <Clock className="h-3 w-3 text-gray-500" />
                                    <span>Attendance: {child.attendance_rate || '95'}%</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-10 w-10 mx-auto text-gray-300 mb-3" />
                    <p>No children registered for this parent/guardian</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => alert('This would open the add student dialog')}
                    >
                      Register a Child
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
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