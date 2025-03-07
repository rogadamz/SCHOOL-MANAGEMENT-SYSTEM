// frontend/src/pages/Parents.tsx
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { PlusCircle, Search, Loader2, Mail, Phone, User, Users } from 'lucide-react';
import { dashboardApi, Student, User as UserType } from '@/services/api';
import { AddParentDialog } from '@/components/parents/AddParentDialog';
import { ParentDetailsDialog } from '@/components/parents/ParentDetailsDialog';

interface ParentWithChildren extends UserType {
  children?: Student[];
  children_count?: number;
}

export const Parents = () => {
  const [parents, setParents] = useState<ParentWithChildren[]>([]);
  const [filteredParents, setFilteredParents] = useState<ParentWithChildren[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<ParentWithChildren | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch parents
        const parentsData = await dashboardApi.getParents();
        
        // Fetch all students
        const studentsData = await dashboardApi.getStudents();
        setStudents(studentsData);
        
        // Add children count to each parent
        const parentsWithChildrenCount = parentsData.map(parent => {
          const childrenCount = studentsData.filter(student => student.parent_id === parent.id).length;
          return {
            ...parent,
            children_count: childrenCount
          };
        });
        
        setParents(parentsWithChildrenCount);
        setFilteredParents(parentsWithChildrenCount);
      } catch (error) {
        console.error('Error fetching parents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = parents.filter(parent => 
        parent.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        parent.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        parent.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredParents(filtered);
    } else {
      setFilteredParents(parents);
    }
  }, [searchQuery, parents]);

  const handleAddParent = async (newParent: any) => {
    setLoading(true);
    try {
      const addedParent = await dashboardApi.createParent(newParent);
      
      // Add to list
      const parentWithChildCount = {
        ...addedParent,
        children_count: 0
      };
      
      setParents([...parents, parentWithChildCount]);
      setFilteredParents([...parents, parentWithChildCount]);
    } catch (error) {
      console.error('Error adding parent:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (parent: ParentWithChildren) => {
    try {
      // Find this parent's children
      const children = students.filter(student => student.parent_id === parent.id);
      
      // Add children to the parent object
      const parentWithChildren = {
        ...parent,
        children
      };
      
      setSelectedParent(parentWithChildren);
      setIsDetailsDialogOpen(true);
    } catch (error) {
      console.error('Error preparing parent details:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Parent/Guardian Management</h1>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Parent
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Parents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{parents.length}</div>
              <p className="text-xs text-gray-500">Registered guardians</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
              <p className="text-xs text-gray-500">Across all guardians</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Children</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {parents.length > 0 
                  ? (students.length / parents.length).toFixed(1) 
                  : '0'}
              </div>
              <p className="text-xs text-gray-500">Per guardian</p>
            </CardContent>
          </Card>
        </div>

        {/* Parents List */}
        <Card>
          <CardHeader>
            <CardTitle>Parents Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Input
                  type="search"
                  placeholder="Search parents..."
                  className="w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button variant="outline" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Children</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredParents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          No parents found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredParents.map((parent) => (
                        <TableRow key={parent.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="bg-primary/10 p-2 rounded-full">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium">{parent.full_name}</div>
                                <div className="text-xs text-gray-500">ID: {parent.id}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-500" />
                              {parent.email}
                            </div>
                          </TableCell>
                          <TableCell>{parent.username}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-gray-500" />
                              {parent.children_count} children
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewDetails(parent)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      {isAddDialogOpen && (
        <AddParentDialog
          onClose={() => setIsAddDialogOpen(false)}
          onAdd={handleAddParent}
        />
      )}
      
      {isDetailsDialogOpen && selectedParent && (
        <ParentDetailsDialog
          parent={selectedParent}
          onClose={() => {
            setIsDetailsDialogOpen(false);
            setSelectedParent(null);
          }}
        />
      )}
    </DashboardLayout>
  );
};