// frontend/src/pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { SummaryCalendar } from '@/components/dashboard/SummaryCalendar';
import { DaySummary } from '@/components/dashboard/DaySummary';
import { FeeCollectionChart, FeeStatusDistributionChart } from '@/components/dashboard/charts/FeeCharts';
import { AttendanceChart } from '@/components/dashboard/charts/AttendanceChart';
import { PerformanceTrends } from '@/components/dashboard/charts/PerformanceTrends';
import { GradeDistribution } from '@/components/dashboard/charts/GradeDistribution';
import { RecentActivities } from '@/components/dashboard/RecentActivities';
import { PendingPayments } from '@/components/dashboard/PendingPayments';
import { SubjectComparison } from '@/components/dashboard/charts/SubjectComparison';
import { AttendancePatterns } from '@/components/dashboard/charts/AttendancePatterns';
import { DateRangePicker } from '@/components/dashboard/DateRangePicker';
import { 
  Users, UserPlus, GraduationCap, CalendarCheck, 
  DollarSign, BookOpen, Bell, School, AlertTriangle 
} from 'lucide-react';
import { Students } from './Students';
import { Teachers } from './Teachers';
import { Parents } from './Parents';
import { Accounts } from './Accounts';
import { ReportCards } from './ReportCards';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { dashboardApi, CalendarDaySummary } from '@/services/api';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [daySummary, setDaySummary] = useState<CalendarDaySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState<{ start: Date, end: Date }>({
    start: new Date(new Date().setDate(new Date().getDate() - 30)),
    end: new Date()
  });

  // Add this debug state to track API response status
  const [debugInfo, setDebugInfo] = useState({
    apiCalls: 0,
    tokenValid: false,
    lastError: ''
  });

  useEffect(() => {
    // First, check if the token exists and is valid
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log("No token found, redirecting to login");
      navigate('/login');
      return;
    }

    // Try to verify token is valid with a simple check
    try {
      // Decode the token to see if it's expired
      // This is a simple check - in production you'd want a more robust check
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const isExpired = tokenData.exp * 1000 < Date.now();
      
      setDebugInfo(prev => ({
        ...prev,
        tokenValid: !isExpired
      }));

      if (isExpired) {
        console.log("Token expired, redirecting to login");
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
    } catch (err) {
      console.error("Error checking token:", err);
      setDebugInfo(prev => ({
        ...prev,
        lastError: 'Token validation error'
      }));
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching dashboard data...");
        
        // Increment API call counter
        setDebugInfo(prev => ({ ...prev, apiCalls: prev.apiCalls + 1 }));
        
        const data = await dashboardApi.getDashboardSummary();
        console.log("Dashboard data received:", data);
        setDashboardData(data);
        
        // Get today's summary
        const today = new Date().toISOString().split('T')[0];
        
        // Increment API call counter
        setDebugInfo(prev => ({ ...prev, apiCalls: prev.apiCalls + 1 }));
        
        const todaySummary = await dashboardApi.getCalendarDaySummary(today);
        console.log("Today's summary received:", todaySummary);
        setDaySummary(todaySummary);
        
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data: ' + (err.message || 'Unknown error'));
        setDebugInfo(prev => ({
          ...prev,
          lastError: err.message || 'Unknown error fetching dashboard data'
        }));
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [navigate]);

  const handleDaySelect = (date: string, summary: CalendarDaySummary) => {
    setSelectedDate(date);
    setDaySummary(summary);
  };

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    
    // Fetch updated dashboard data
    dashboardApi.getDashboardSummary()
      .then(data => {
        setDashboardData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error refreshing dashboard data:', err);
        setError('Failed to refresh dashboard data: ' + (err.message || 'Unknown error'));
        setLoading(false);
      });
  };

  const getAttendanceRateColor = (rate: number) => {
    if (rate >= 90) return 'green';
    if (rate >= 75) return 'orange';
    return 'red';
  };

  const getPaymentRateColor = (rate: number) => {
    if (rate >= 90) return 'green';
    if (rate >= 60) return 'blue';
    return 'red';
  };

  // Error boundary for components that might fail
  const SafeComponent = ({
    children,
    fallback = <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">Component failed to load</div>
  }: {
    children: React.ReactNode;
    fallback?: React.ReactNode;
  }) => {
    const [hasError, setHasError] = useState(false);
    
    useEffect(() => {
      const errorHandler = (error: ErrorEvent) => {
        console.error("Caught error:", error);
        setHasError(true);
        setDebugInfo(prev => ({
          ...prev,
          lastError: error.message || 'Error in component'
        }));
      };
      
      window.addEventListener('error', errorHandler);
      return () => window.removeEventListener('error', errorHandler);
    }, []);
    
    if (hasError) return <>{fallback}</>;
    return <>{children}</>;
  };

  // Debug panel for development
  const DebugPanel = () => (
    <div className="fixed bottom-0 right-0 bg-gray-800 text-white p-2 text-xs z-50 opacity-80">
      <p>API Calls: {debugInfo.apiCalls}</p>
      <p>Token Valid: {debugInfo.tokenValid ? 'Yes' : 'No'}</p>
      <p>Last Error: {debugInfo.lastError || 'None'}</p>
    </div>
  );

  if (loading && !dashboardData) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="ml-4">Loading dashboard data...</span>
        </div>
        <DebugPanel />
      </DashboardLayout>
    );
  }

  if (error && !dashboardData) {
    return (
      <DashboardLayout>
        <div className="flex flex-col justify-center items-center h-full p-8">
          <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Dashboard Error</h2>
          <p className="text-red-500 mb-4 text-center max-w-md">{error}</p>
          <div className="flex space-x-4">
            <Button onClick={handleRefresh}>
              Try Again
            </Button>
            <Button variant="outline" onClick={() => {
              localStorage.removeItem('token');
              navigate('/login');
            }}>
              Return to Login
            </Button>
          </div>
          <div className="mt-8 p-4 bg-gray-50 rounded-lg max-w-lg w-full">
            <h3 className="font-bold mb-2">Debug Information</h3>
            <pre className="text-xs overflow-auto max-h-40">
              API Calls: {debugInfo.apiCalls}
              Token Valid: {debugInfo.tokenValid ? 'Yes' : 'No'}
              Last Error: {debugInfo.lastError || 'None'}
            </pre>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Routes>
        <Route
          path="/"
          element={
            <div className="p-4 md:p-6 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                <h1 className="text-2xl font-bold">School Dashboard</h1>
                <div className="flex items-center gap-2">
                  <DateRangePicker 
                    dateRange={dateRange}
                    onChange={setDateRange}
                  />
                  <Button variant="outline" size="sm" onClick={handleRefresh}>
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Summary Cards */}
              <SafeComponent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  <DashboardCard
                    title="Students"
                    value={dashboardData?.student_count || 0}
                    icon={<Users className="h-6 w-6 text-white" />}
                    colorVariant="blue"
                    onClick={() => navigate('/dashboard/students')}
                  />
                  <DashboardCard
                    title="Parents/Guardians"
                    value={dashboardData?.parent_count || 0}
                    icon={<UserPlus className="h-6 w-6 text-white" />}
                    colorVariant="purple"
                    onClick={() => navigate('/dashboard/parents')}
                  />
                  <DashboardCard
                    title="Teachers"
                    value={dashboardData?.teacher_count || 0}
                    icon={<GraduationCap className="h-6 w-6 text-white" />}
                    colorVariant="green"
                    onClick={() => navigate('/dashboard/teachers')}
                  />
                  <DashboardCard
                    title="Classes"
                    value={dashboardData?.class_count || 0}
                    icon={<School className="h-6 w-6 text-white" />}
                    colorVariant="orange"
                  />
                  <DashboardCard
                    title="Today's Attendance"
                    value={`${dashboardData?.attendance_today?.rate.toFixed(1)}%`}
                    icon={<CalendarCheck className="h-6 w-6 text-white" />}
                    colorVariant={getAttendanceRateColor(dashboardData?.attendance_today?.rate || 0)}
                    subtitle={`${dashboardData?.attendance_today?.present || 0} of ${dashboardData?.attendance_today?.total || 0} students present`}
                  />
                  <DashboardCard
                    title="Fee Collection"
                    value={`${dashboardData?.financial_summary?.payment_rate.toFixed(1)}%`}
                    icon={<DollarSign className="h-6 w-6 text-white" />}
                    colorVariant={getPaymentRateColor(dashboardData?.financial_summary?.payment_rate || 0)}
                    subtitle={`$${dashboardData?.financial_summary?.total_paid.toLocaleString() || 0} collected`}
                    onClick={() => navigate('/dashboard/accounts')}
                  />
                </div>
              </SafeComponent>

              <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="attendance">Attendance</TabsTrigger>
                  <TabsTrigger value="academics">Academics</TabsTrigger>
                  <TabsTrigger value="finance">Finance</TabsTrigger>
                  <TabsTrigger value="calendar">Calendar</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-6">
                  <SafeComponent>
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                      <div className="xl:col-span-2">
                        <Card>
                          <CardContent className="p-6">
                            <h3 className="text-lg font-medium mb-4">Quick Access</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                              <Button 
                                variant="outline" 
                                className="flex flex-col items-center justify-center h-24"
                                onClick={() => navigate('/dashboard/students')}
                              >
                                <Users className="h-8 w-8 mb-2 text-blue-500" />
                                <span>Students</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="flex flex-col items-center justify-center h-24"
                                onClick={() => navigate('/dashboard/teachers')}
                              >
                                <GraduationCap className="h-8 w-8 mb-2 text-green-500" />
                                <span>Teachers</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="flex flex-col items-center justify-center h-24"
                                onClick={() => navigate('/dashboard/accounts')}
                              >
                                <DollarSign className="h-8 w-8 mb-2 text-red-500" />
                                <span>Fees</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="flex flex-col items-center justify-center h-24"
                                onClick={() => navigate('/dashboard/report-cards')}
                              >
                                <BookOpen className="h-8 w-8 mb-2 text-purple-500" />
                                <span>Reports</span>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="xl:col-span-1">
                        <Card className="h-full">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-medium">Recent Notifications</h3>
                              <Bell className="h-5 w-5 text-gray-400" />
                            </div>
                            <RecentActivities events={dashboardData?.recent_events || []} />
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </SafeComponent>

                  <SafeComponent>
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                      <div className="xl:col-span-2">
                        <AttendanceChart 
                          data={[
                            { date: 'Mon', present: 85, absent: 15 },
                            { date: 'Tue', present: 90, absent: 10 },
                            { date: 'Wed', present: 88, absent: 12 },
                            { date: 'Thu', present: 92, absent: 8 },
                            { date: 'Fri', present: 95, absent: 5 },
                          ]} 
                        />
                      </div>
                      <div className="xl:col-span-1">
                        <FeeStatusDistributionChart />
                      </div>
                    </div>
                  </SafeComponent>
                </TabsContent>
                
                {/* Additional tabs omitted for brevity */}
              </Tabs>
              
              {/* Debug panel in development */}
              <DebugPanel />
            </div>
          }
        />
        <Route path="/students/*" element={<Students />} />
        <Route path="/teachers/*" element={<Teachers />} />
        <Route path="/parents/*" element={<Parents />} />
        <Route path="/accounts/*" element={<Accounts />} />
        <Route path="/report-cards/*" element={<ReportCards />} />
      </Routes>
    </DashboardLayout>
  );
};