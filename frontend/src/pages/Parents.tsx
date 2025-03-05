// src/pages/Parents.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, Plus, Edit, Trash2, RotateCw, 
  Mail, Phone, Users, MessageSquare
} from 'lucide-react';
import { dashboardApi } from '@/services/api';

// Define Parent interface (add to api.ts in a real app)
interface Parent {
  id: number;
  user_id: number;
  user?: {
    id: number;
    username: string;
    email: string;
    full_name: string;
    role: string;
    is_active: boolean;
  };
  children?: { id: number; first_name: string; last_name: string; admission_number: string; }[];
}

export const Parents = () => {
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [parentStats, setParentStats] = useState({
    totalParents: 0,
    activeParents: 0,
    averageChildren: 0,
    feesUpToDate: 0
  });

  useEffect(() => {
    fetchParents();
  }, []);

  const fetchParents = async () => {
    try {
      setLoading(true);
      
      // In a real app, you would call your API
      // const data = await dashboardApi.getParents();
      
      // For demo purposes, using sample data
      const sampleParents: Parent[] = [
        {
          id: 1,
          user_id: 4,
          user: {
            id: 4,
            username: "parent1",
            email: "parent1@example.com",
            full_name: "John Brown",
            role: "parent",
            is_active: true
          },
          children: [
            { id: 1, first_name: 'James', last_name: 'Brown', admission_number: 'ST-2023-001' },
            { id: 2, first_name: 'Emily', last_name: 'Brown', admission_number: 'ST-2023-002' }
          ]
        },
        {
          id: 2,
          user_id: 5,
          user: {
            id: 5,
            username: "parent2",
            email: "parent2@example.com",
            full_name: "Sarah Davis",
            role: "parent",
            is_active: true
          },
          children: [
            { id: 3, first_name: 'Michael', last_name: 'Davis', admission_number: 'ST-2023-003' }
          ]
        }
      ];
      
      setParents(sampleParents);
      
      // Calculate parent statistics
      const totalParents = sampleParents.length;
      const activeParents = sampleParents.filter(p => p.user?.is_active).length;
      const totalChildren = sampleParents.reduce((count, parent) => {
        return count + (parent.children?.length || 0);
      }, 0);
      const averageChildren = totalParents > 0 ? totalChildren / totalParents : 0;
      
      setParentStats({
        totalParents,
        activeParents,
        averageChildren,
        feesUpToDate: Math.round(totalParents * 0.8) // 80% paid up for demo
      });
      
    } catch (error) {
      console.error('Error fetching parents:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter parents based on search query
  const filteredParents = parents.filter(parent => {
    const fullName = parent.user?.full_name || '';
    const email = parent.user?.email || '';
    const childrenNames = parent.children?.map(child => `${child.first_name} ${child.last_name}`).join(' ') || '';
    
    return fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
           email.toLowerCase().includes(searchQuery.toLowerCase()) ||
           childrenNames.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleViewParent = (parent: Parent) => {
    setSelectedParent(parent);
    setIsDetailModalOpen(true);
  };

  const handleEditParent = (parent: Parent) => {
    setSelectedParent(parent);
    setIsEditModalOpen(true);
  };

  const handleMessageParent = (parentId: number) => {
    // In a real app, this would open a messaging component
    alert(`Messaging functionality would open for parent ID: ${parentId}`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Parents Management</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium opacity-90 mb-1">Total Parents</p>
                <h3 className="text-3xl font-bold">{parentStats.totalParents}</h3>
                <p className="text-sm mt-2 opacity-75">
                  {parentStats.activeParents} active parents
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-400/20">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium opacity-90 mb-1">Children per Parent</p>
                <h3 className="text-3xl font-bold">{parentStats.averageChildren.toFixed(1)}</h3>
                <p className="text-sm mt-2 opacity-75">
                  Average children enrolled
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-400/20">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium opacity-90 mb-1">Fees Up-to-Date</p>
                <h3 className="text-3xl font-bold">{parentStats.feesUpToDate}</h3>
                <p className="text-sm mt-2 opacity-75">
                  {Math.round((parentStats.feesUpToDate / Math.max(1, parentStats.totalParents)) * 100)}% of parents
                </p>
              </div>
              <div className="p-3 rounded-lg bg-amber-400/20">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border text-gray-800">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Parent Engagement</p>
                <h3 className="text-3xl font-bold">85%</h3>
                <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: '85%' }}
                  ></div>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-gray-100">
                <MessageSquare className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search parents..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchParents}>
            <RotateCw className="h-4 w-4" />
          </Button>
          
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Parent
          </Button>
        </div>
      </div>

      {/* Parents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          // Loading placeholders
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={`loading-${index}`} className="shadow-sm">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="rounded-full bg-gray-200 h-12 w-12 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredParents.length === 0 ? (
          <div className="col-span-3 p-8 text-center text-gray-500">
            No parents found matching your search criteria
          </div>
        ) : (
          filteredParents.map((parent) => (
            <Card key={parent.id} className="shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div className="bg-blue-500 rounded-full h-12 w-12 flex items-center justify-center text-white font-bold text-lg mr-4">
                      {parent.user?.full_name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{parent.user?.full_name}</h3>
                      <p className="text-sm text-gray-500">{parent.children?.length || 0} children enrolled</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {parent.user?.is_active ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Inactive</span>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {parent.user?.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    (555) 123-4567
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Children</h4>
                  <div className="space-y-1">
                    {parent.children?.map(child => (
                      <div key={child.id} className="text-sm bg-gray-100 rounded px-2 py-1 inline-block mr-2">
                        {child.first_name} {child.last_name} ({child.admission_number})
                      </div>
                    ))}
                    {!parent.children?.length && (
                      <p className="text-sm text-gray-500">No children enrolled</p>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end mt-4 space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleMessageParent(parent.id)}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Message
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleViewParent(parent)}
                  >
                    View
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEditParent(parent)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Parent Detail Modal */}
      {isDetailModalOpen && selectedParent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">{selectedParent.user?.full_name}</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Contact Information</h4>
                <p className="text-sm">{selectedParent.user?.email}</p>
                <p className="text-sm">(555) 123-4567</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Children</h4>
                <ul className="text-sm list-disc pl-5">
                  {selectedParent.children?.map(child => (
                    <li key={child.id}>
                      {child.first_name} {child.last_name} ({child.admission_number})
                    </li>
                  ))}
                  {!selectedParent.children?.length && <li>No children enrolled</li>}
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Account Status</h4>
                <p className="text-sm">
                  {selectedParent.user?.is_active ? 'Active' : 'Inactive'}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Payment Status</h4>
                <p className="text-sm">
                  All fees up to date
                </p>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Parent Edit Modal (simplified) */}
      {isEditModalOpen && selectedParent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Edit Parent</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <Input 
                  type="text" 
                  defaultValue={selectedParent.user?.full_name}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input 
                  type="email" 
                  defaultValue={selectedParent.user?.email}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <Input 
                  type="tel" 
                  defaultValue="(555) 123-4567"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select className="w-full rounded-md border border-input px-3 py-2">
                  <option value="active" selected={!!selectedParent.user?.is_active}>Active</option>
                  <option value="inactive" selected={!selectedParent.user?.is_active}>Inactive</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                // In a real app, call API to update parent
                setIsEditModalOpen(false);
              }}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Parent Modal (simplified) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Add New Parent</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <Input 
                  type="text" 
                  placeholder="Enter full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input 
                  type="email" 
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <Input 
                  type="tel" 
                  placeholder="Enter phone number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <Input 
                  type="password" 
                  placeholder="Create password"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Confirm Password</label>
                <Input 
                  type="password" 
                  placeholder="Confirm password"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                // In a real app, call API to create parent
                setIsAddModalOpen(false);
              }}>
                Create Parent
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};