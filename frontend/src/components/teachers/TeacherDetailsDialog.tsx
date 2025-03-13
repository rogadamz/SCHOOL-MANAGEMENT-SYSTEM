import { useState, useEffect } from 'react';
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
  GraduationCap, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  Users, 
  Book,
  User,
  MapPin,
  Briefcase,
  AlertCircle,
  Loader2,
  Edit2
} from 'lucide-react';
import { dashboardApi, ClassData, TimeSlot } from '@/services/api';

interface TeacherDetailsDialogProps {
  teacher: any;
  classes: ClassData[];
  classNameMapping: Record<string, string>;
  onClose: () => void;
  onEdit?: (teacherId: number) => void;
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

export const TeacherDetailsDialog = ({ 
  teacher, 
  classes,
  classNameMapping,
  onClose,
  onEdit
}: TeacherDetailsDialogProps) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [timetable, setTimetable] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teacherStats, setTeacherStats] = useState({
    totalStudents: 0,
    totalHours: 0,
    subjects: new Set<string>()
  });

  // Days of the week for timetable
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // Function to get the mapped class name
  const getMappedClassName = (originalName: string): string => {
    return classNameMapping[originalName] || originalName;
  };

  useEffect(() => {
    // Calculate teacher stats
    if (teacher.classes) {
      const totalStudents = teacher.classes.reduce((sum: number, cls: any) => sum + (cls.student_count || 0), 0);
      
      const subjects = new Set<string>();
      teacher.classes.forEach((cls: any) => {
        // Add class subjects if available
        if (cls.subjects) {
          cls.subjects.forEach((subject: string) => subjects.add(subject));
        }
      });
      
      // If timetable is loaded, calculate total hours
      const totalHours = timetable.length > 0 
        ? timetable.reduce((sum, slot) => {
            // Calculate duration in hours based on start and end time
            const getHours = (timeStr: string) => {
              const [hours, minutes] = timeStr.split(':').map(Number);
              return hours + minutes / 60;
            };
            
            const duration = getHours(slot.end_time) - getHours(slot.start_time);
            return sum + duration;
          }, 0)
        : teacher.classes.length * 5; // Estimate based on number of classes
      
      setTeacherStats({
        totalStudents,
        totalHours: Math.round(totalHours),
        subjects
      });
    }
  }, [teacher.classes, timetable]);

  const handleViewTimetable = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // If we haven't loaded the timetable yet, load it
      if (timetable.length === 0) {
        const data = await dashboardApi.getTeacherTimetable(teacher.id);
        setTimetable(data);
      }
      setActiveTab('timetable');
    } catch (err: any) {
      console.error('Error loading timetable:', err);
      setError('Failed to load timetable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[80%] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl">Teacher Profile</DialogTitle>
          {onEdit && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit(teacher.id)}
              className="flex items-center gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="timetable" onClick={handleViewTimetable} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>Timetable</>
              )}
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
                    <div className="mt-2 text-center">
                      <Badge className="bg-green-500 hover:bg-green-600">Active Teacher</Badge>
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
                        <Badge variant="secondary" className="mt-1">
                          {teacher.specialization || 'Not specified'}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium">Classes Assigned</div>
                        <div>{teacher.classes?.length || 0} classes</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium">Students Taught</div>
                        <div>{teacherStats.totalStudents} students</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium">Weekly Hours</div>
                        <div>{teacherStats.totalHours} hours</div>
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
                        <Phone className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="text-sm font-medium">Phone</div>
                          <div>{teacher.phone || 'Not available'}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="text-sm font-medium">Address</div>
                          <div>{teacher.address || 'Not available'}</div>
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
                        <div>{teacher.user?.username || 'Not available'}</div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium">Account Status</div>
                        <div className="flex items-center">
                          <span className={`h-2 w-2 rounded-full mr-2 ${teacher.user?.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          <span>{teacher.user?.is_active ? 'Active' : 'Inactive'}</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium">User ID</div>
                        <div>{teacher.user?.id || 'Not available'}</div>
                      </div>

                      <div>
                        <div className="text-sm font-medium">Role</div>
                        <div className="capitalize">{teacher.user?.role || 'teacher'}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Teaching Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-primary/5 rounded-lg text-center">
                        <div className="text-3xl font-bold">{teacher.classes?.length || 0}</div>
                        <div className="text-sm text-gray-500">Classes</div>
                      </div>
                      
                      <div className="p-4 bg-primary/5 rounded-lg text-center">
                        <div className="text-3xl font-bold">{teacherStats.totalStudents}</div>
                        <div className="text-sm text-gray-500">Students</div>
                      </div>
                      
                      <div className="p-4 bg-primary/5 rounded-lg text-center">
                        <div className="text-3xl font-bold">{teacherStats.subjects.size || '0'}</div>
                        <div className="text-sm text-gray-500">Subjects</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="classes" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              
              <Card>
                <CardHeader>
                  <CardTitle>Subjects Taught</CardTitle>
                  <CardDescription>
                    Subjects that {teacher.user?.full_name || 'this teacher'} is currently teaching
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {teacher.classes && teacher.classes.length > 0 ? (
                    <div className="space-y-6">
                      <div className="flex flex-wrap gap-2">
                        {Array.from(new Set(teacher.classes.map((cls: any) => cls.name)))
                          .map((className: string, index: number) => (
                            <Badge key={index} variant="outline" className="px-3 py-1">
                              {getMappedClassName(className as string)}
                            </Badge>
                          ))}
                      </div>
                      
                      <div className="pt-4 border-t">
                        <h4 className="text-sm font-medium mb-2">Teaching Schedule by Day</h4>
                        <div className="grid grid-cols-5 gap-2">
                          {days.map(day => (
                            <div key={day} className="text-center p-2 bg-gray-50 rounded-md">
                              <div className="text-xs font-medium text-gray-500">{day}</div>
                              <div className="text-sm font-medium mt-1">
                                {timetable.filter(ts => ts.day_of_week === days.indexOf(day)).length || '0'} slots
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <h4 className="text-sm font-medium mb-2">Class Distribution</h4>
                        <div className="flex items-center h-6 bg-gray-100 rounded-full overflow-hidden">
                          {Array.from(new Set(teacher.classes.map((cls: any) => cls.grade_level))).map((level, index) => {
                            const count = teacher.classes.filter((cls: any) => cls.grade_level === level).length;
                            const percentage = (count / teacher.classes.length) * 100;
                            
                            return (
                              <div 
                                key={index}
                                className={`h-full ${getColorForIndex(index)}`}
                                style={{ width: `${percentage}%` }}
                                title={`${level}: ${count} classes (${percentage.toFixed(0)}%)`}
                              ></div>
                            );
                          })}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {Array.from(new Set(teacher.classes.map((cls: any) => cls.grade_level))).map((level, index) => {
                            const count = teacher.classes.filter((cls: any) => cls.grade_level === level).length;
                            
                            return (
                              <div key={index} className="flex items-center text-xs">
                                <div className={`w-3 h-3 rounded-full ${getColorForIndex(index)} mr-1`}></div>
                                <span>{level} ({count})</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No subjects are currently assigned to this teacher
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
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

        <DialogFooter className="flex gap-2">
          {onEdit && (
            <Button variant="outline" onClick={() => onEdit(teacher.id)}>
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