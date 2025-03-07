// frontend/src/pages/Accounts.tsx
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { FeeCollectionChart, FeeStatusDistributionChart } from '@/components/dashboard/charts/FeeCharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { PlusCircle, Search, Loader2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { dashboardApi, Fee, Student } from '@/services/api';
import { AddFeeDialog } from '@/components/accounts/AddFeeDialog';
import { UpdateFeeDialog } from '@/components/accounts/UpdateFeeDialog';

export const Accounts = () => {
  const [fees, setFees] = useState<Fee[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredFees, setFilteredFees] = useState<Fee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [feeSummary, setFeeSummary] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [feesData, studentsData, summaryData] = await Promise.all([
          dashboardApi.getFees(),
          dashboardApi.getStudents(),
          dashboardApi.getFeeSummary()
        ]);
        
        // Add student names to fees for easier display
        const feesWithNames = feesData.map(fee => {
          const student = studentsData.find(s => s.id === fee.student_id);
          return {
            ...fee,
            student_name: student ? `${student.first_name} ${student.last_name}` : 'Unknown Student'
          };
        });
        
        setFees(feesWithNames);
        setFilteredFees(feesWithNames);
        setStudents(studentsData);
        setFeeSummary(summaryData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = fees.filter(fee => 
        fee.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fee.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fee.status.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFees(filtered);
    } else {
      setFilteredFees(fees);
    }
  }, [searchQuery, fees]);

  useEffect(() => {
    if (activeTab === 'all') {
      setFilteredFees(fees);
    } else {
      const filtered = fees.filter(fee => fee.status.toLowerCase() === activeTab);
      setFilteredFees(filtered);
    }
  }, [activeTab, fees]);

  const handleAddFee = async (newFee: any) => {
    setLoading(true);
    try {
      const addedFee = await dashboardApi.createFee(newFee.student_id, newFee);
      
      // Find student name for display
      const student = students.find(s => s.id === newFee.student_id);
      const feeWithName = {
        ...addedFee,
        student_name: student ? `${student.first_name} ${student.last_name}` : 'Unknown Student'
      };
      
      setFees([...fees, feeWithName]);
      
      // Refresh summary data
      const summaryData = await dashboardApi.getFeeSummary();
      setFeeSummary(summaryData);
    } catch (error) {
      console.error('Error adding fee:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFee = async (updatedFee: any) => {
    setLoading(true);
    try {
      const updated = await dashboardApi.updateFee(updatedFee.id, updatedFee);
      
      // Find student name for display
      const student = students.find(s => s.id === updated.student_id);
      const feeWithName = {
        ...updated,
        student_name: student ? `${student.first_name} ${student.last_name}` : 'Unknown Student'
      };
      
      // Update fees list
      const updatedFees = fees.map(fee => 
        fee.id === feeWithName.id ? feeWithName : fee
      );
      
      setFees(updatedFees);
      
      // Refresh summary data
      const summaryData = await dashboardApi.getFeeSummary();
      setFeeSummary(summaryData);
    } catch (error) {
      console.error('Error updating fee:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Financial Management</h1>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Fee
          </Button>
        </div>

        {/* Summary Stats */}
        {feeSummary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(feeSummary.total_amount)}</div>
                <p className="text-xs text-gray-500">For {feeSummary.student_count} students</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(feeSummary.total_paid)}</div>
                <p className="text-xs text-gray-500">{feeSummary.payment_rate.toFixed(1)}% payment rate</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(feeSummary.total_balance)}</div>
                <p className="text-xs text-gray-500">From {feeSummary.student_count - feeSummary.paid_count} students</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{feeSummary.paid_count} Fully Paid</div>
                <p className="text-xs text-gray-500">{feeSummary.partial_count} Partial, {feeSummary.unpaid_count} Unpaid</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FeeCollectionChart />
          <FeeStatusDistributionChart />
        </div>

        {/* Fees List */}
        <Card>
          <CardHeader>
            <CardTitle>Fee Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">All Fees</TabsTrigger>
                  <TabsTrigger value="paid">Paid</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="overdue">Overdue</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex items-center gap-2">
                <Input
                  type="search"
                  placeholder="Search fees..."
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
                      <TableHead>Student Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No fees found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredFees.map((fee) => (
                        <TableRow key={fee.id}>
                          <TableCell>{fee.student_name}</TableCell>
                          <TableCell>{fee.description}</TableCell>
                          <TableCell>{formatCurrency(fee.amount)}</TableCell>
                          <TableCell>{formatCurrency(fee.paid)}</TableCell>
                          <TableCell>{new Date(fee.due_date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <span className={
                              fee.status === 'paid' ? 'bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium' :
                              fee.status === 'pending' ? 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium' :
                              'bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium'
                            }>
                              {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedFee(fee);
                                setIsUpdateDialogOpen(true);
                              }}
                            >
                              Update
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
        <AddFeeDialog
          students={students}
          onClose={() => setIsAddDialogOpen(false)}
          onAdd={handleAddFee}
        />
      )}
      
      {isUpdateDialogOpen && selectedFee && (
        <UpdateFeeDialog
          fee={selectedFee}
          onClose={() => {
            setIsUpdateDialogOpen(false);
            setSelectedFee(null);
          }}
          onUpdate={handleUpdateFee}
        />
      )}
    </DashboardLayout>
  );
};