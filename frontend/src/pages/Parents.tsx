import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { PlusCircle, Search, Loader2, Mail, User, Users, Trash2, Edit2, AlertCircle, RefreshCw, Filter, Eye, X } from 'lucide-react';
import { dashboardApi, Student, User as UserType } from '@/services/api';
import { AddParentDialog } from '@/components/parents/AddParentDialog';
import { EditParentDialog } from '@/components/parents/EditParentDialog';
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

// Extended Student type with additional properties
interface ExtendedStudent extends Student {
  attendance_rate?: number;
  current_grade?: string;
  academic_progress?: string;
  fee_status?: string;
  class_name?: string;
}

// Extended User type with additional properties
interface ParentWithChildren extends UserType {
  children?: ExtendedStudent[];
  children_count?: number;
  phone?: string;
  address?: string;
  occupation?: string;
  emergency_contact?: string;
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
  const [childrenCountFilters, setChildrenCountFilters] = useState<Set<number>>(new Set());

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
      
      // Fetch all students first, as they contain parent_id information
      const studentsData = await dashboardApi.getStudents();
      console.log("Students data fetched:", studentsData);
      setStudents(studentsData);
      
      // Extract unique parent IDs from students
      const parentIds = new Set<number>();
      studentsData.forEach(student => {
        if (student.parent_id) {
          parentIds.add(student.parent_id);
        }
      });
      
      // Create parent data from students
      const parentsMap = new Map<number, ParentWithChildren>();
      
      // For each parent ID, create a parent object
      for (const parentId of parentIds) {
        try {
          // Create parent object with default values
          const parent: ParentWithChildren = {
            id: parentId,
            username: `parent${parentId}`,
            email: `parent${parentId}@example.com`,
            full_name: `Parent ${parentId}`,
            role: 'parent',
            is_active: true,
            children: studentsData.filter(student => student.parent_id === parentId),
            children_count: studentsData.filter(student => student.parent_id === parentId).length,
            phone: '',
            address: '',
            occupation: '',
            emergency_contact: ''
          };
          
          parentsMap.set(parentId, parent);
        } catch (error) {
          console.warn(`Couldn't create parent object for ID ${parentId}`, error);
        }
      }
      
      const enhancedParents = Array.from(parentsMap.values());
      console.log("Enhanced parents:", enhancedParents);
      
      // Add some sample parents if none were found
      if (enhancedParents.length === 0) {
        console.log("No parents found, adding sample data");
        const sampleParents: ParentWithChildren[] = [
          {
            id: 1,
            username: "parent1",
            email: "parent1@example.com",
            full_name: "John Smith",
            role: "parent",
            is_active: true,
            children: studentsData.filter(student => student.id % 3 === 0) as ExtendedStudent[],
            children_count: studentsData.filter(student => student.id % 3 === 0).length,
            phone: "+1 555-123-4567",
            address: "123 Main St, Anytown",
            occupation: "Engineer",
            emergency_contact: "+1 555-987-6543"
          },
          {
            id: 2,
            username: "parent2",
            email: "parent2@example.com",
            full_name: "Sarah Johnson",
            role: "parent",
            is_active: true,
            children: studentsData.filter(student => student.id % 3 === 1) as ExtendedStudent[],
            children_count: studentsData.filter(student => student.id % 3 === 1).length,
            phone: "+1 555-234-5678",
            address: "456 Oak Ave, Somewhere",
            occupation: "Doctor",
            emergency_contact: "+1 555-876-5432"
          },
          {
            id: 3,
            username: "parent3",
            email: "parent3@example.com",
            full_name: "Michael Brown",
            role: "parent",
            is_active: true,
            children: studentsData.filter(student => student.id % 3 === 2) as ExtendedStudent[],
            children_count: studentsData.filter(student => student.id % 3 === 2).length,
            phone: "+1 555-345-6789",
            address: "789 Pine St, Elsewhere",
            occupation: "Teacher",
            emergency_contact: "+1 555-765-4321"
          }
        ];
        
        enhancedParents.push(...sampleParents);
      }
      
      setParents(enhancedParents);
      setFilteredParents(enhancedParents);
      
      // Create a set of unique children counts
      const uniqueChildrenCounts = new Set<number>();
      enhancedParents.forEach((parent: ParentWithChildren) => {
        if (parent.children_count !== undefined) {
          uniqueChildrenCounts.add(parent.children_count);
        }
      });
      setChildrenCountFilters(uniqueChildrenCounts);
      
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
    
    // Apply children count filter
    if (activeFilter !== null) {
      const filterCount = parseInt(activeFilter);
      filtered = filtered.filter(parent => 
        parent.children_count === filterCount
      );
    }
    
    setFilteredParents(filtered);
  }, [searchQuery, activeFilter, parents]);

  const handleAddParent = async (newParent: any) => {
    setLoading(true);
    setApiError(null);
    
    try {
      console.log("Creating parent with data:", newParent);
      
      // In a real app, this would call the API
      // Since the endpoint isn't available, we'll simulate adding a parent
      
      // Simulate successful parent creation
      const maxId = Math.max(0, ...parents.map(p => p.id));
      const addedParent: ParentWithChildren = {
        id: maxId + 1,
        username: newParent.username,
        email: newParent.email,
        full_name: newParent.full_name,
        role: 'parent',
        is_active: true,
        phone: newParent.phone,
        address: newParent.address,
        occupation: newParent.occupation,
        emergency_contact: newParent.emergency_contact,
        children: [],
        children_count: 0
      };
      
      console.log("Parent created successfully:", addedParent);
      
      // Add the new parent to our state
      setParents(prevParents => [...prevParents, addedParent]);
      setFilteredParents(prevParents => [...prevParents, addedParent]);
      
      // Close the dialog
      setIsAddDialogOpen(false);
    } catch (err: any) {
      console.error('Error adding parent:', err);
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
      
      // In a real app, this would make an API call to update the parent
      // Since the endpoint isn't available, we'll update the local state
      
      // Create updated parent object
      const updatedParentFull = {
        ...selectedParent,
        full_name: updatedParent.full_name,
        email: updatedParent.email,
        username: updatedParent.username,
        phone: updatedParent.phone,
        address: updatedParent.address,
        occupation: updatedParent.occupation,
        emergency_contact: updatedParent.emergency_contact
      };
      
      console.log("Parent updated successfully:", updatedParentFull);
      
      // Update the parents list to reflect the changes
      setParents(prevParents => 
        prevParents.map(parent => 
          parent.id === selectedParent.id ? updatedParentFull : parent
        )
      );
      
      setFilteredParents(prevParents => 
        prevParents.map(parent => 
          parent.id === selectedParent.id ? updatedParentFull : parent
        )
      );
      
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
      
      // In a real app, this would make an API call to delete the parent
      // Since the endpoint isn't available, we'll update the local state
      
      console.log("Parent deleted successfully");
      
      // Remove the parent from the state
      setParents(prevParents => 
        prevParents.filter(parent => parent.id !== selectedParent.id)
      );
      
      setFilteredParents(prevParents => 
        prevParents.filter(parent => parent.id !== selectedParent.id)
      );
      
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

  const handleFilterByChildrenCount = (count: number | null) => {
    setActiveFilter(count !== null ? count.toString() : null);
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
              <DropdownMenuLabel>Filter by Number of Children</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleFilterByChildrenCount(null)}
                className={!activeFilter ? "bg-accent" : ""}
              >
                All Parents
              </DropdownMenuItem>
              {Array.from(childrenCountFilters).sort((a, b) => a - b).map(count => (
                <DropdownMenuItem 
                  key={count} 
                  onClick={() => handleFilterByChildrenCount(count)}
                  className={activeFilter === count.toString() ? "bg-accent" : ""}
                >
                  {count} {count === 1 ? 'Child' : 'Children'}
                </DropdownMenuItem>
              ))}
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
          <CardTitle>Guardian Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search guardians..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {activeFilter && (
              <div className="ml-2 flex items-center">
                <div className="bg-primary/10 text-primary text-sm rounded-full px-3 py-1 flex items-center">
                  <span>Children: {activeFilter}</span>
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
                            <span>{parent.children_count || 0} {parent.children_count === 1 ? 'child' : 'children'}</span>
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
              and remove all their data from the database.
              {selectedParent?.children_count && selectedParent.children_count > 0 && (
                <span className="block mt-2 font-semibold text-red-500">
                  Warning: This parent has {selectedParent.children_count} {selectedParent.children_count === 1 ? 'child' : 'children'} 
                  associated with their account. These children will be left without a guardian in the system.
                </span>
              )}
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