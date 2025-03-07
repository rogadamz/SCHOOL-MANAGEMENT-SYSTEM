// frontend/src/components/teachers/TeacherDetailsDialog.tsx
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { dashboardApi, Teacher, ClassData } from '@/services/api';
import { Loader2, BookOpen, User, Mail, Phone, Calendar, GraduationCap, Users } from 'lucide-react';
interface TeacherWithUser extends Teacher {
  user_fullname?: string;
  user_email?: string;
}

interface TeacherDetailsDialogProps {
  teacher: TeacherWithUser;
  onClose: () => void;
}

export const TeacherDetailsDialog = ({ teacher, onClose }: TeacherDetailsDialogProps) => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherClasses = async () => {
      setLoading(true);
      try {
        // Fetch all classes
        const allClasses = await dashboardApi.getClasses();
        
        // Filter to only this teacher's classes
        const teacherClasses = allClasses.filter(c => c.teacher_id === teacher.id);
        setClasses(teacherClasses);
      } catch (error) {
        console.error('Error fetching teacher classes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherClasses();
  }, [teacher.id]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Teacher Profile</DialogTitle>
          <DialogDescription>
            Detailed information about {teacher.user_fullname}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <GraduationCap className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{teacher.user_fullname}</h3>
                  <p className="text-sm text-gray-500">{teacher.specialization}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{teacher.user_email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>ID: {teacher.id}</span>
                </div>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium mb-2">Teaching Information</h4>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Specialization</dt>
                    <dd>{teacher.specialization}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Classes Assigned</dt>
                    <dd>{classes.length}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="classes">
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : classes.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No classes assigned to this teacher yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
                {classes.map(cls => (
                  <Card key={cls.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{cls.name}</CardTitle>
                      <CardDescription>Grade Level: {cls.grade_level}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <BookOpen className="h-4 w-4 text-gray-500" />
                          <span>Class ID: {cls.id}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span>{cls.student_count || 0} Students</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};