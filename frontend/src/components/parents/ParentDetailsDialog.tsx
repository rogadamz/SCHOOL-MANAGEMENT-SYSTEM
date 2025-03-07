// frontend/src/components/parents/ParentDetailsDialog.tsx
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Student } from '@/services/api';
import { Mail, User as UserIcon, Users, School, Calendar } from 'lucide-react';

interface ParentWithChildren extends User {
  children?: Student[];
}

interface ParentDetailsDialogProps {
  parent: ParentWithChildren;
  onClose: () => void;
}

export const ParentDetailsDialog = ({ parent, onClose }: ParentDetailsDialogProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Parent/Guardian Profile</DialogTitle>
          <DialogDescription>
            Detailed information about {parent.full_name}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="children">Children</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <UserIcon className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{parent.full_name}</h3>
                  <p className="text-sm text-gray-500">Guardian</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{parent.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-gray-500" />
                  <span>Username: {parent.username}</span>
                </div>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium mb-2">Guardian Information</h4>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">User ID</dt>
                    <dd>{parent.id}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Children</dt>
                    <dd>{parent.children?.length || 0}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Role</dt>
                    <dd>{parent.role}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Account Status</dt>
                    <dd>{parent.is_active ? 'Active' : 'Inactive'}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="children">
            {!parent.children || parent.children.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No children registered for this parent yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 py-2">
                {parent.children.map(child => (
                  <Card key={child.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{child.first_name} {child.last_name}</CardTitle>
                      <CardDescription>Student ID: {child.admission_number}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>DOB: {formatDate(child.date_of_birth)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <School className="h-4 w-4 text-gray-500" />
                          <span>Admission #: {child.admission_number}</span>
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