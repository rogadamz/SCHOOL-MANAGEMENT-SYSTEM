// frontend/src/components/teachers/TeacherDetailsDialog.tsx
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
import { 
  GraduationCap, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  Users, 
  Book,
  User,
  MapPin,
  Briefcase
} from 'lucide-react';
import { dashboardApi, ClassData, TimeSlot } from '@/services/api';

interface TeacherDetailsDialogProps {
  teacher: any;
  classes: ClassData[];
  classNameMapping: Record<string, string>;
  onClose: () => void;
}

export const TeacherDetailsDialog = ({ 
  teacher, 
  classes,
  classNameMapping,
  onClose 
}: TeacherDetailsDialogProps) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [timetable, setTimetable] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  // Function to get the mapped class name
  const getMappedClassName = (originalName: string): string => {
    return classNameMapping[originalName] || originalName;
  };

  // Days of the week for timetable
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const handleViewTimetable = async () => {
    setLoading(true);
    try {
      // If we haven't loaded the timetable yet, load it
      if (timetable.length === 0) {
        const data = await dashboardApi.getTeacherTimetable(teacher.id);
        setTimetable(data);
      }
      setActiveTab('timetable');
    } catch (error) {
      console.error('Error loading timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[80%] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Teacher Details</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="timetable" onClick={handleViewTimetable} disabled={loading}>
              {loading ? 'Loading...' : 'Timetable'}
            </TabsTrigger>
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
                      <GraduationCap className="h-12 w-12 text-primary" />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium">Full Name</div>
                        <div>{teacher.user?.full_name || 'Not available'}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium">Email</div>
                        <div>{teacher.user?.email || 'Not available'}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium">Specialization</div>
                        <div>{teacher.specialization || 'Not specified'}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium">Classes Assigned</div>
                        <div>{teacher.classes?.length || 0} classes</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium">Phone</div>
                        <div>Not available</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium">Address</div>
                        <div>Not available</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t">
                    <CardTitle className="text-base mb-3">User Account</CardTitle>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-sm font-medium">Username</div>
                        <div>{teacher.user?.username || 'Not available'}</div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium">Account Status</div>
                        <div className="flex items-center">
                          <span className={`h-2 w-2 rounded-full mr-2 ${teacher.user?.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          <span>{teacher.user?.is_active ? 'Active' : 'Inactive'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="classes" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Assigned Classes</CardTitle>
                <CardDescription>
                  Classes currently assigned to {teacher.user?.full_name || 'this teacher'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {teacher.classes && teacher.classes.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Class Name</TableHead>
                          <TableHead>Grade Level</TableHead>
                          <TableHead>Students</TableHead>
                          <TableHead>Schedule</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teacher.classes.map((cls: any) => (
                          <TableRow key={cls.id}>
                            <TableCell className="font-medium">
                              {getMappedClassName(cls.name)}
                            </TableCell>
                            <TableCell>{cls.grade_level}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Users className="h-4 w-4 mr-2 text-gray-500" />
                                <span>{cls.student_count || 'N/A'}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={handleViewTimetable}
                              >
                                <Clock className="h-3 w-3 mr-1" />
                                View Schedule
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No classes are currently assigned to this teacher
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timetable" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Schedule</CardTitle>
                <CardDescription>
                  Teaching schedule for {teacher.user?.full_name || 'this teacher'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {timetable.length > 0 ? (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[100px]">Time</TableHead>
                          {days.map(day => (
                            <TableHead key={day} className="min-w-[150px]">{day}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {['08:30-09:15', '09:30-10:15', '10:30-11:15', '11:30-12:15', '13:00-13:45', '14:00-14:45'].map(timeSlot => {
                          const [startTime, endTime] = timeSlot.split('-');
                          return (
                            <TableRow key={timeSlot}>
                              <TableCell className="font-medium">{timeSlot}</TableCell>
                              {days.map((day, dayIndex) => {
                                // Find a class for this time slot and day
                                const slot = timetable.find(ts => 
                                  ts.day_of_week === dayIndex && 
                                  ts.start_time === startTime &&
                                  ts.end_time === endTime
                                );
                                
                                if (slot) {
                                  // Find class name
                                  const cls = classes.find(c => c.id === slot.class_id);
                                  return (
                                    <TableCell key={dayIndex} className="bg-primary/5">
                                      <div className="font-medium">{slot.subject}</div>
                                      <div className="text-xs text-gray-500">
                                        {cls ? getMappedClassName(cls.name) : 'Unknown Class'}
                                      </div>
                                    </TableCell>
                                  );
                                }
                                
                                return <TableCell key={dayIndex} className="text-gray-300">-</TableCell>;
                              })}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No schedule information available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};