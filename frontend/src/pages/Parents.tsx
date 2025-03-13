// frontend/src/pages/Parents.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { PlusCircle, Search, Loader2, Mail, User, Users, Trash2, Edit2, AlertCircle, RefreshCw, Filter, Eye, X } from 'lucide-react';
import { dashboardApi, User as UserType, Student } from '@/services/api';
import { AddParentDialog } from '@/components/parents/AddParentDialog';
import { ParentDetailsDialog } from '@/components/parents/ParentDetailsDialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';

interface ParentWithChildren extends UserType {
  children?: Student[];
  children_count?: number;
}

export const Parents = () => {
  const [parents, setParents] = useState<ParentWithChildren[]>([]);
  const [filteredParents, setFilteredParents] = useState<ParentWithChildren[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<ParentWithChildren | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Fetch parents data on component mount and when needed
  useEffect(() => {
    fetchParentsData();
    
    // Set up interval to refresh data every 30 seconds
    const intervalId = setInterval(() => {
      fetchParentsData(false); // Silent refresh (no loading indicator)
    }, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const fetchParentsData = async (showLoadingState = true) => {
    if (showLoadingState) {
      setLoading(true);
    }
    setError(null);
    
    try {
      console.log("Fetching parents data...");
      
      // Fetch parents directly from the API endpoint
      const response = await fetch('http://localhost:8000/auth/users?role=parent', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching parents: ${response.statusText}`);
      }
      
      const parentsData = await response.json();
      console.log("Raw parents data fetched:", parentsData);
      
      // Fetch all students
      const studentsData = await dashboardApi.getStudents();
      console.log("Students data fetched:", studentsData);
      setStudents(studentsData);
      
      // Enhance parents with children data
      const enhancedParents = parentsData.map((parent: UserType) => {
        const parentChildren = studentsData.filter(student => student.parent_id === parent.id);
        
        return {
          ...parent,
          children: parentChildren,
          children_count: parentChildren.length
        };
      });
      
      console.log("Enhanced parents:", enhancedParents);
      setParents(enhancedParents);
      setFilteredParents(enhancedParents);
    } catch (err: any) {
      console.error('Error fetching parents data:', err);
      setError('Failed to load parents. Please try again later.');
    } finally {
      if (showLoadingState) {
        setLoading(false);
      }
    }
  };

  // Filter parents based on search and filter criteria
  useEffect(() => {
    let filtered = [...parents];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(parent => 
        (parent.full_name && parent.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (parent.email && parent.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (parent.username && parent.username.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply child count filter
    if (activeFilter) {
      if (activeFilter === 'with_children') {
        filtered = filtered.filter(parent => (parent.children_count || 0) > 0);
      } else if (activeFilter === 'without_children') {
        filtered = filtered.filter(parent => (parent.children_count || 0) === 0);
      }
    }
    
    setFilteredParents(filtered);
  }, [searchQuery, activeFilter, parents]);

  const handleAddParent = async (newParent: any) => {
    setLoading(true);
    setApiError(null);
    
    try {
      console.log("Creating parent with data:", newParent);
      
      // Create user with role='parent'
      const userData = {
        username: newParent.username,
        email: newParent.email,
        full_name: newParent.full_name,
        password: newParent.password,
        role: 'parent'
      };
      
      console.log("Sending user creation request:", userData);
      
      // Create user using direct fetch to ensure proper format
      const userResponse = await fetch('http://localhost:8000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(userData)
      });
      
      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        throw new Error(errorData.detail || 'Failed to create parent account');
      }
      
      const user = await userResponse.json();
      console.log("Parent created successfully:", user);
      
      // Refresh the parents list to include the new parent
      await fetchParentsData();
      
      // Close the dialog
      setIsAddDialogOpen(false);
    } catch (err: any) {
      console.error('Error adding parent:', err);
      // Get specific error message from response if available
      const errorMsg = err.message || 'Failed to add parent. Please try again.';
      
      setApiError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleEditParent = async (updatedParent: any) => {
    if (!selectedParent) return;
    
    setLoading(true);
    setApiError(null);
    
    try {
      console.log("Updating parent with data:", updatedParent);
      
      // Update user information
      const userData = {
        full_name: updatedParent.full_name,
        email: updatedParent.email,
        username: updatedParent.username
      };
      
      console.log("Updating user data:", userData);
      
      const userResponse = await fetch(`http://localhost:8000/auth/users/${selectedParent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(userData)
      });
      
      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        throw new Error(errorData.detail || 'Failed to update parent information');
      }
      
      console.log("Parent updated successfully");
      
      // Refresh the parents list to reflect the changes
      await fetchParentsData();
      
      // Close the edit dialog
      setIsEditDialogOpen(false);
      setSelectedParent(null);
    } catch (err: any) {
      console.error('Error updating parent:', err);
      const errorMsg = err.message || 'Failed to update parent. Please try again.';
      setApiError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteParent = async () => {
    if (!selectedParent) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Deleting parent:", selectedParent.id);
      
      // Delete parent using direct fetch to ensure proper handling
      const response = await fetch(`http://localhost:8000/auth/users/${selectedParent.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete parent');
      }
      
      console.log("Parent deleted successfully");
      
      // Refresh the data to reflect the deletion
      await fetchParentsData();
      
      // Close dialog
      setIsDeleteDialogOpen(false);
      setSelectedParent(null);
    } catch (err: any) {
      console.error('Error deleting parent:', err);
      setError(err.message || 'Failed to delete parent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterByChildStatus = (filter: string | null) => {
    setActiveFilter(filter);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Parent/Guardian Management</h1>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
                {activeFilter && (
                  <span className="ml-2 bg-primary/20 text-primary text-xs rounded-full px-2 py-0.5">
                    1
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter by Children</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleFilterByChildStatus(null)}
                className={!activeFilter ? "bg-accent" : ""}
              >
                All Parents
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleFilterByChildStatus('with_children')}
                className={activeFilter === 'with_children' ? "bg-accent" : ""}
              >
                With Children
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleFilterByChildStatus('without_children')}
                className={activeFilter === 'without_children' ? "bg-accent" : ""}
              >
                Without Children
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Parent
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
            <p className="text-xs text-gray-500">Enrolled children</p>
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
          <CardTitle>Parent/Guardian Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search parents..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {activeFilter && (
              <div className="ml-2 flex items-center">
                <div className="bg-primary/10 text-primary text-sm rounded-full px-3 py-1 flex items-center">
                  <span>
                    {activeFilter === 'with_children' 
                      ? 'With Children' 
                      : activeFilter === 'without_children'
                        ? 'Without Children'
                        : activeFilter}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-5 w-5 p-0 ml-2" 
                    onClick={() => setActiveFilter(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-auto" 
              onClick={() => fetchParentsData()}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="ml-2">Refresh</span>
            </Button>
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
                        {searchQuery || activeFilter ? 'No parents found matching your search criteria' : 'No parents found'}
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
                            {parent.children_count || 0} children
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => {
                                    setSelectedParent(parent);
                                    setIsDetailsDialogOpen(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View Details</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => {
                                    setSelectedParent(parent);
                                    setIsEditDialogOpen(true);
                                  }}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit Parent</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => {
                                    setSelectedParent(parent);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete Parent</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
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

      {/* Add Parent Dialog */}
      {isAddDialogOpen && (
        <AddParentDialog
          onClose={() => setIsAddDialogOpen(false)}
          onAdd={handleAddParent}
          error={apiError}
        />
      )}
      
      {/* Edit Parent Dialog */}
      {isEditDialogOpen && selectedParent && (
        <EditParentDialog
          parent={selectedParent}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedParent(null);
          }}
          onUpdate={handleEditParent}
          error={apiError}
        />
      )}
      
      {/* Parent Details Dialog */}
      {isDetailsDialogOpen && selectedParent && (
        <ParentDetailsDialog
          parent={selectedParent}
          onClose={() => {
            setIsDetailsDialogOpen(false);
            setSelectedParent(null);
          }}
          onEdit={() => {
            setIsDetailsDialogOpen(false);
            setIsEditDialogOpen(true);
          }}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the parent
              {selectedParent?.full_name && ` "${selectedParent.full_name}"`} 
              and potentially affect any associated children.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteParent} className="bg-red-600 text-white hover:bg-red-700">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Deleting...
                </>
              ) : (
                <>Delete</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};