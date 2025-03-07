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
  DollarSign, BookOpen, Bell, School 
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await dashboardApi.getDashboardSummary();
        setDashboardData(data);
        
        // Get today's summary
        const today = new Date().toISOString().split('T')[0];
        const todaySummary = await dashboardApi.getCalendarDaySummary(today);
        setDaySummary(todaySummary);
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

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
        setError('Failed to refresh dashboard data. Please try again later.');
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

  if (loading && !dashboardData) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !dashboardData) {
    return (
      <DashboardLayout>
        <div className="flex flex-col justify-center items-center h-full">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={handleRefresh}>
            Try Again
          </Button>
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

              <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="attendance">Attendance</TabsTrigger>
                  <TabsTrigger value="academics">Academics</TabsTrigger>
                  <TabsTrigger value="finance">Finance</TabsTrigger>
                  <TabsTrigger value="calendar">Calendar</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-6">
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
                </TabsContent>
                
                <TabsContent value="attendance" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AttendanceChart 
                      data={[
                        { date: '1 Week', present: 85, absent: 15 },
                        { date: '2 Weeks', present: 82, absent: 18 },
                        { date: '3 Weeks', present: 88, absent: 12 },
                        { date: '1 Month', present: 90, absent: 10 },
                      ]} 
                    />
                    <AttendancePatterns 
                      data={[
                        { name: 'Present', value: dashboardData?.attendance_today?.present || 0 },
                        { name: 'Absent', value: dashboardData?.attendance_today?.absent || 0 },
                        { name: 'Late', value: dashboardData?.attendance_today?.late || 0 },
                        { name: 'Excused', value: dashboardData?.attendance_today?.excused || 0 },
                      ]}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="text-lg font-medium mb-4">Attendance by Class</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span>Pre-K A</span>
                            <div className="w-64 bg-gray-200 rounded-full h-2.5">
                              <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '92%' }}></div>
                            </div>
                            <span className="font-medium">92%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Pre-K B</span>
                            <div className="w-64 bg-gray-200 rounded-full h-2.5">
                              <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '88%' }}></div>
                            </div>
                            <span className="font-medium">88%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Kindergarten A</span>
                            <div className="w-64 bg-gray-200 rounded-full h-2.5">
                              <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '78%' }}></div>
                            </div>
                            <span className="font-medium">78%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Kindergarten B</span>
                            <div className="w-64 bg-gray-200 rounded-full h-2.5">
                              <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '94%' }}></div>
                            </div>
                            <span className="font-medium">94%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="text-lg font-medium mb-4">Students Requiring Attention</h3>
                        <div className="space-y-4">
                          <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex justify-between items-center">
                            <div>
                              <p className="font-medium">John Smith</p>
                              <p className="text-sm text-gray-500">Absent 3 days in a row</p>
                            </div>
                            <Button size="sm">Contact Parent</Button>
                          </div>
                          <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg flex justify-between items-center">
                            <div>
                              <p className="font-medium">Emma Johnson</p>
                              <p className="text-sm text-gray-500">Late 4 times this month</p>
                            </div>
                            <Button size="sm">Contact Parent</Button>
                          </div>
                          <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex justify-between items-center">
                            <div>
                              <p className="font-medium">Michael Brown</p>
                              <p className="text-sm text-gray-500">Attendance below 70%</p>
                            </div>
                            <Button size="sm">Contact Parent</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="academics" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <GradeDistribution 
                      data={[
                        { grade: 'A', count: 30 },
                        { grade: 'B', count: 45 },
                        { grade: 'C', count: 28 },
                        { grade: 'D', count: 15 },
                        { grade: 'F', count: 5 },
                      ]} 
                    />
                    <div className="lg:col-span-2">
                      <PerformanceTrends 
                        data={[
                          { month: 'Jan', averageScore: 75, highestScore: 95, lowestScore: 55, subject: 'Overall' },
                          { month: 'Feb', averageScore: 78, highestScore: 98, lowestScore: 58, subject: 'Overall' },
                          { month: 'Mar', averageScore: 80, highestScore: 96, lowestScore: 62, subject: 'Overall' },
                          { month: 'Apr', averageScore: 82, highestScore: 97, lowestScore: 65, subject: 'Overall' },
                          { month: 'May', averageScore: 83, highestScore: 99, lowestScore: 68, subject: 'Overall' },
                        ]} 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SubjectComparison 
                      data={[
                        { subject: 'Math', average: 78, classAverage: 75 },
                        { subject: 'English', average: 82, classAverage: 80 },
                        { subject: 'Science', average: 85, classAverage: 79 },
                        { subject: 'Art', average: 90, classAverage: 88 },
                        { subject: 'Music', average: 88, classAverage: 85 },
                        { subject: 'PE', average: 92, classAverage: 90 },
                      ]}
                    />
                    
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="text-lg font-medium mb-4">Recent Academic Achievements</h3>
                        <div className="space-y-4">
                          <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
                            <div className="flex justify-between">
                              <p className="font-medium">Science Fair Winners</p>
                              <span className="text-sm text-gray-500">May 15</span>
                            </div>
                            <p className="text-sm text-gray-700 mt-1">
                              Kindergarten B class won first place in the district science fair with their "Plant Growth" project.
                            </p>
                          </div>
                          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                            <div className="flex justify-between">
                              <p className="font-medium">Reading Challenge</p>
                              <span className="text-sm text-gray-500">May 10</span>
                            </div>
                            <p className="text-sm text-gray-700 mt-1">
                              Pre-K A completed their 100-book reading challenge ahead of schedule!
                            </p>
                          </div>
                          <div className="p-3 bg-purple-50 border border-purple-100 rounded-lg">
                            <div className="flex justify-between">
                              <p className="font-medium">Math Competition</p>
                              <span className="text-sm text-gray-500">May 5</span>
                            </div>
                            <p className="text-sm text-gray-700 mt-1">
                              Five students qualified for the regional math competition next month.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="finance" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FeeCollectionChart />
                    <FeeStatusDistributionChart />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="text-lg font-medium mb-4">Financial Summary</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span>Total Fees</span>
                            <span className="font-medium">${dashboardData?.financial_summary?.total_amount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Collected</span>
                            <span className="font-medium text-green-600">${dashboardData?.financial_summary?.total_paid.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Outstanding</span>
                            <span className="font-medium text-red-600">${dashboardData?.financial_summary?.total_balance.toLocaleString()}</span>
                          </div>
                          <div className="mt-4">
                            <p className="text-sm mb-1">Collection Progress</p>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-blue-600 h-2.5 rounded-full" 
                                style={{ width: `${dashboardData?.financial_summary?.payment_rate}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>0%</span>
                              <span>{dashboardData?.financial_summary?.payment_rate.toFixed(1)}%</span>
                              <span>100%</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <PendingPayments />
                  </div>
                </TabsContent>
                
                <TabsContent value="calendar" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SummaryCalendar onDaySelect={handleDaySelect} />
                    {daySummary && selectedDate && (
                      <DaySummary date={selectedDate} summary={daySummary} />
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6">
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="text-lg font-medium mb-4">Upcoming Events</h3>
                        <div className="space-y-4">
                          {dashboardData?.recent_events?.map((event: any, index: number) => (
                            <div key={index} className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                              <div className="flex justify-between">
                                <p className="font-medium">{event.title}</p>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  event.event_type === 'holiday' ? 'bg-red-100 text-red-800' :
                                  event.event_type === 'meeting' ? 'bg-blue-100 text-blue-800' :
                                  event.event_type === 'activity' ? 'bg-green-100 text-green-800' :
                                  'bg-purple-100 text-purple-800'
                                }`}>
                                  {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm text-gray-500 mt-1">
                                <span>{new Date(event.start_date).toLocaleDateString()}</span>
                                <span>{event.location || 'School'}</span>
                              </div>
                              <p className="text-sm text-gray-700 mt-2">
                                {event.description?.substring(0, 100)}{event.description?.length > 100 ? '...' : ''}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
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