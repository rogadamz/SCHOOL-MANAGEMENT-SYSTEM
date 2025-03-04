import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import {
  Users, UserRound, GraduationCap, Calendar, DollarSign, 
  CreditCard, BarChart3, School, BookOpen, MessageSquare,
  FileText, AlertTriangle, CheckCircle, HelpCircle, Activity
} from 'lucide-react';

const API_URL = 'http://localhost:8000';

// Custom fetcher function to handle API calls
const fetcher = async (url) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}${url}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error);
    throw error;
  }
};

// Custom hook for data fetching with loading and error states
const useApiData = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await fetcher(url);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err);
        console.error(`Error fetching ${url}:`, err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [url]);

  return { data, loading, error };
};

// Dashboard Card Component
const DashboardCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  colorClass = 'from-blue-500 to-blue-600',
  loading = false
}) => (
  <Card className={`shadow-sm overflow-hidden bg-gradient-to-br ${colorClass} text-white`}>
    <CardContent className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium opacity-90 mb-1">{title}</p>
          <div className="text-3xl font-bold">
            {loading ? (
              <div className="h-8 w-16 animate-pulse bg-white/20 rounded"></div>
            ) : (
              value
            )}
          </div>
          {subtitle && (
            <p className="text-sm mt-2 opacity-75">{subtitle}</p>
          )}
        </div>
        <div className="p-3 rounded-lg bg-white/20">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

// Calendar Day Component 
const CalendarDay = ({ day, date, month, events, selected, onClick, hasFeeData, hasAttendance }) => {
  // Format date to YYYY-MM-DD for API calls
  const formattedDate = date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : '';
  
  // Today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check if the date is today
  const isToday = date && date.getTime() === today.getTime();
  
  // Check if the date is in the past
  const isPast = date && date < today;
  
  // Check if date is selectable (must be today or in the past)
  const isSelectable = date && (isToday || isPast);
  
  // Determine base classes based on state
  let baseClasses = "relative flex flex-col h-24 p-1 border border-gray-200 rounded";
  
  if (!date) {
    // Empty day cell
    baseClasses += " bg-gray-50";
  } else if (selected) {
    // Selected day
    baseClasses += " bg-blue-100 border-blue-300";
  } else if (isToday) {
    // Today
    baseClasses += " bg-yellow-50 border-yellow-200";
  } else if (!isSelectable) {
    // Future date (not selectable)
    baseClasses += " bg-gray-50 text-gray-400";
  }
  
  return (
    <div 
      className={baseClasses}
      onClick={() => isSelectable && onClick(formattedDate)}
    >
      <div className="text-right mb-1">
        {day}
        {isToday && (
          <span className="absolute top-1 left-1 h-2 w-2 rounded-full bg-red-500"></span>
        )}
      </div>
      
      {/* Indicators */}
      {events && events.length > 0 && (
        <div className="flex gap-1 mt-auto">
          <div className="w-2 h-2 rounded-full bg-purple-500" title="Event"></div>
        </div>
      )}
      
      {/* Attendance indicator */}
      {hasAttendance && (
        <div className="absolute bottom-1 left-1">
          <div className="w-2 h-2 rounded-full bg-green-500" title="Attendance recorded"></div>
        </div>
      )}
      
      {/* Fee payment indicator */}
      {hasFeeData && (
        <div className="absolute bottom-1 right-1">
          <div className="w-2 h-2 rounded-full bg-blue-500" title="Fee payment"></div>
        </div>
      )}
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  // Use mock data for initial testing (this would come from API in production)
  const [dashboardData, setDashboardData] = useState({
    student_count: 3,
    teacher_count: 2,
    parent_count: 2,
    class_count: 2,
    financial_summary: {
      total_amount: 21750,
      total_paid: 15225,
      total_balance: 6525,
      payment_rate: 70
    },
    attendance_today: {
      present: 2,
      absent: 1,
      late: 0,
      excused: 0,
      total: 3,
      rate: 66.7
    },
    recent_events: [
      {
        id: 1,
        title: "Parent-Teacher Meeting",
        start_date: "2025-03-13",
        end_date: "2025-03-13",
        all_day: false,
        start_time: "15:00",
        end_time: "18:00",
        location: "School Hall",
        event_type: "meeting"
      }
    ],
    resource_count: 3
  });
  
  const [financialChartData, setFinancialChartData] = useState({
    monthly_collection: [
      { month: 'Jan', amount: 1800 },
      { month: 'Feb', amount: 2200 },
      { month: 'Mar', amount: 1900 },
      { month: 'Apr', amount: 2400 },
      { month: 'May', amount: 1200 },
      { month: 'Jun', amount: 1400 },
      { month: 'Jul', amount: 1000 },
      { month: 'Aug', amount: 1600 },
      { month: 'Sep', amount: 1800 },
      { month: 'Oct', amount: 2100 },
      { month: 'Nov', amount: 0 },
      { month: 'Dec', amount: 0 }
    ],
    status_distribution: [
      { status: 'Paid', count: 8 },
      { status: 'Partial', count: 3 },
      { status: 'Pending', count: 1 }
    ]
  });
  
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [financialChartLoading, setFinancialChartLoading] = useState(false);
  
  // State for selected date in calendar
  const [selectedDate, setSelectedDate] = useState('');
  const [calendarDayData, setCalendarDayData] = useState(null);
  const [calendarDayLoading, setCalendarDayLoading] = useState(false);
  
  // Get current month and year for calendar
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setDashboardLoading(true);
        // In a production app, this would be an actual API call:
        // const data = await fetcher('/dashboard/summary');
        // setDashboardData(data);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Use the mock data already set in state
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setDashboardLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Fetch financial chart data
  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setFinancialChartLoading(true);
        // In a production app, this would be an actual API call:
        // const data = await fetcher('/financial/chart-data');
        // setFinancialChartData(data);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        // Use the mock data already set in state
      } catch (error) {
        console.error('Error fetching financial chart data:', error);
      } finally {
        setFinancialChartLoading(false);
      }
    };
    
    fetchFinancialData();
  }, []);
  
  // Fetch calendar day data when a date is selected
  useEffect(() => {
    const fetchCalendarDayData = async () => {
      if (!selectedDate) return;
      
      try {
        setCalendarDayLoading(true);
        // In a production app, this would be an actual API call:
        // const data = await fetcher(`/dashboard/calendar-day?day_date=${selectedDate}`);
        // setCalendarDayData(data);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock calendar day data
        setCalendarDayData({
          date: selectedDate,
          attendance: {
            present: 2,
            absent: 1,
            total: 3,
            rate: 66.7
          },
          fees: {
            collected: 1200,
            pending: 300
          },
          events: [
            {
              id: 1,
              title: "Reading Assessment",
              event_type: "academic",
              all_day: true,
              creator_name: "John Smith"
            }
          ],
          has_data: true
        });
      } catch (error) {
        console.error(`Error fetching calendar data for ${selectedDate}:`, error);
      } finally {
        setCalendarDayLoading(false);
      }
    };
    
    fetchCalendarDayData();
  }, [selectedDate]);
  
  // Month names
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  // Generate calendar days for the current month
  const generateCalendarDays = () => {
    const days = [];
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Add empty slots for days before the 1st of the month
    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
      days.push({ day: null, date: null });
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      days.push({ day, date });
    }
    
    return days;
  };
  
  const calendarDays = generateCalendarDays();
  
  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  // Handle calendar day selection
  const handleDaySelect = (formattedDate) => {
    setSelectedDate(formattedDate);
  };
  
  // COLORS for charts
  const COLORS = ['#2563eb', '#10b981', '#ef4444', '#8b5cf6', '#f97316'];
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DashboardCard
          title="Students"
          value={dashboardLoading ? "..." : dashboardData?.student_count}
          subtitle="Total Students"
          icon={<Users className="h-5 w-5 text-white" />}
          colorClass="from-blue-500 to-blue-600"
          loading={dashboardLoading}
        />
        
        <DashboardCard
          title="Teachers"
          value={dashboardLoading ? "..." : dashboardData?.teacher_count}
          subtitle="Total Teachers"
          icon={<GraduationCap className="h-5 w-5 text-white" />}
          colorClass="from-green-500 to-green-600"
          loading={dashboardLoading}
        />
        
        <DashboardCard
          title="Parents"
          value={dashboardLoading ? "..." : dashboardData?.parent_count}
          subtitle="Total Parents"
          icon={<UserRound className="h-5 w-5 text-white" />}
          colorClass="from-purple-500 to-purple-600"
          loading={dashboardLoading}
        />
        
        <DashboardCard
          title="Today's Attendance"
          value={dashboardLoading ? "..." : `${dashboardData?.attendance_today.present}/${dashboardData?.attendance_today.total}`}
          subtitle={dashboardLoading ? "Loading..." : `${dashboardData?.attendance_today.rate.toFixed(1)}% Present Today`}
          icon={<Calendar className="h-5 w-5 text-white" />}
          colorClass="from-amber-500 to-amber-600"
          loading={dashboardLoading}
        />
        
        <DashboardCard
          title="Fees Collected"
          value={dashboardLoading ? "..." : `$${dashboardData?.financial_summary.total_paid.toLocaleString()}`}
          subtitle="Total Amount Collected"
          icon={<DollarSign className="h-5 w-5 text-white" />}
          colorClass="from-emerald-500 to-emerald-600"
          loading={dashboardLoading}
        />
        
        <DashboardCard
          title="Balance Due"
          value={dashboardLoading ? "..." : `$${dashboardData?.financial_summary.total_balance.toLocaleString()}`}
          subtitle="Remaining to be Collected"
          icon={<CreditCard className="h-5 w-5 text-white" />}
          colorClass="from-red-500 to-red-600"
          loading={dashboardLoading}
        />
        
        <DashboardCard
          title="Payment Rate"
          value={dashboardLoading ? "..." : `${dashboardData?.financial_summary.payment_rate.toFixed(1)}%`}
          subtitle={dashboardLoading ? "Loading..." : `$${dashboardData?.financial_summary.total_paid.toLocaleString()} of $${dashboardData?.financial_summary.total_amount.toLocaleString()}`}
          icon={<BarChart3 className="h-5 w-5 text-white" />}
          colorClass="from-blue-500 to-blue-600"
          loading={dashboardLoading}
        />
        
        <DashboardCard
          title="Learning Resources"
          value={dashboardLoading ? "..." : dashboardData?.resource_count}
          subtitle="Available Resources"
          icon={<BookOpen className="h-5 w-5 text-white" />}
          colorClass="from-cyan-500 to-cyan-600"
          loading={dashboardLoading}
        />
      </div>
      
      {/* Tabs for different sections */}
      <Tabs defaultValue="overview" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Fee Collection */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Fee Collection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {financialChartLoading ? (
                    <div className="flex h-full justify-center items-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-500"></div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={financialChartData?.monthly_collection || []}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount Collected']} />
                        <Legend />
                        <Bar dataKey="amount" name="Amount Collected" fill="#2563eb" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Payment Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {financialChartLoading ? (
                    <div className="flex h-full justify-center items-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-500"></div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={financialChartData?.status_distribution || []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="status"
                          label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {(financialChartData?.status_distribution || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name, props) => [`${value} students`, props.payload.status]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Recent Events */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-500"></div>
                  </div>
                ) : dashboardData?.recent_events.length === 0 ? (
                  <p className="text-center py-4 text-gray-500">No upcoming events</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dashboardData?.recent_events.map((event) => (
                      <div key={event.id} className="border p-4 rounded-lg">
                        <h3 className="font-semibold mb-1">{event.title}</h3>
                        <p className="text-sm text-gray-500 mb-2">
                          {new Date(event.start_date).toLocaleDateString()} 
                          {!event.all_day && event.start_time && ` at ${event.start_time}`}
                        </p>
                        <div className="flex items-center text-xs">
                          <span className={`px-2 py-1 rounded-full ${
                            event.event_type === 'holiday' ? 'bg-red-100 text-red-800' :
                            event.event_type === 'meeting' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
                          </span>
                          {event.location && (
                            <span className="ml-2 text-gray-600">
                              at {event.location}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="financial">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Fee Status Summary */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Fee Collection Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-500"></div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="border p-4 rounded-lg text-center">
                        <div className="text-3xl font-bold text-green-600">
                          ${dashboardData?.financial_summary.total_paid.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">Total Collected</div>
                      </div>
                      <div className="border p-4 rounded-lg text-center">
                        <div className="text-3xl font-bold text-amber-600">
                          ${dashboardData?.financial_summary.total_balance.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">Balance Due</div>
                      </div>
                      <div className="border p-4 rounded-lg text-center">
                        <div className="text-3xl font-bold text-blue-600">
                          {dashboardData?.financial_summary.payment_rate.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-500">Payment Rate</div>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 h-4 rounded-full mb-8">
                      <div 
                        className="bg-green-500 h-4 rounded-full" 
                        style={{ width: `${dashboardData?.financial_summary.payment_rate}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-around">
                      <div className="text-center">
                        <div className="mb-1">
                          <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                        </div>
                        <div className="text-lg font-bold">
                          {financialChartData?.status_distribution[0]?.count || 0}
                        </div>
                        <div className="text-sm text-gray-500">Fully Paid</div>
                      </div>
                      <div className="text-center">
                        <div className="mb-1">
                          <HelpCircle className="h-8 w-8 text-amber-500 mx-auto" />
                        </div>
                        <div className="text-lg font-bold">
                          {financialChartData?.status_distribution[1]?.count || 0}
                        </div>
                        <div className="text-sm text-gray-500">Partially Paid</div>
                      </div>
                      <div className="text-center">
                        <div className="mb-1">
                          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto" />
                        </div>
                        <div className="text-lg font-bold">
                          {financialChartData?.status_distribution[2]?.count || 0}
                        </div>
                        <div className="text-sm text-gray-500">Unpaid</div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            {/* Upcoming Payments */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Payments</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-500"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Mock upcoming payments */}
                    <div className="border p-3 rounded-lg text-sm">
                      <div className="font-medium">James Brown</div>
                      <div className="text-gray-600">Tuition Fee (Term 2)</div>
                      <div className="flex justify-between mt-1">
                        <span className="text-blue-600">$1,250</span>
                        <span className="text-red-600">3 days left</span>
                      </div>
                    </div>
                    <div className="border p-3 rounded-lg text-sm">
                      <div className="font-medium">Emily Brown</div>
                      <div className="text-gray-600">Development Fee</div>
                      <div className="flex justify-between mt-1">
                        <span className="text-blue-600">$500</span>
                        <span className="text-amber-600">8 days left</span>
                      </div>
                    </div>
                    <div className="border p-3 rounded-lg text-sm">
                      <div className="font-medium">Michael Davis</div>
                      <div className="text-gray-600">Activity Fee</div>
                      <div className="flex justify-between mt-1">
                        <span className="text-blue-600">$350</span>
                        <span className="text-gray-600">15 days left</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Payment Distribution Chart */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Payment Distribution Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  {financialChartLoading ? (
                    <div className="flex h-full justify-center items-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-500"></div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={financialChartData?.monthly_collection || []}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount Collected']} />
                        <Legend />
                        <Line type="monotone" dataKey="amount" name="Amount Collected" stroke="#2563eb" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="calendar">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Calendar</CardTitle>
                <div className="flex space-x-2">
                  <button 
                    className="p-1 rounded-full hover:bg-gray-200"
                    onClick={handlePreviousMonth}
                  >
                    ◀
                  </button>
                  <span className="font-medium">
                    {monthNames[currentMonth]} {currentYear}
                  </span>
                  <button 
                    className="p-1 rounded-full hover:bg-gray-200"
                    onClick={handleNextMonth}
                  >
                    ▶
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className="text-center text-sm font-medium">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => (
                    <CalendarDay 
                      key={`day-${index}`}
                      day={day.day}
                      date={day.date}
                      month={currentMonth}
                      events={[]} // Would come from API in real implementation
                      selected={day.date && selectedDate === `${day.date.getFullYear()}-${String(day.date.getMonth() + 1).padStart(2, '0')}-${String(day.date.getDate()).padStart(2, '0')}`}
                      onClick={handleDaySelect}
                      hasFeeData={false} // Would check from API
                      hasAttendance={false} // Would check from API
                    />
                  ))}
                </div>
                
                <div className="flex flex-wrap gap-4 justify-center mt-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-purple-500 mr-1"></div>
                    <span>Event</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                    <span>Attendance</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                    <span>Fee Payment</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Selected Day Summary */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Day Summary'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedDate ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center text-gray-500">
                    <Calendar className="h-12 w-12 mb-2 text-gray-400" />
                    <p>Select a day from the calendar<br/>to view details</p>
                  </div>
                ) : calendarDayLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-500"></div>
                  </div>
                ) : !calendarDayData?.has_data ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center text-gray-500">
                    <Activity className="h-12 w-12 mb-2 text-gray-400" />
                    <p>No data available for this day</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Attendance Summary */}
                    {calendarDayData?.attendance?.total > 0 && (
                      <div className="border rounded-lg p-4">
                        <h3 className="font-medium text-sm text-gray-500 mb-2">Attendance</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {calendarDayData.attendance.present}
                            </div>
                            <div className="text-xs text-gray-500">Present</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">
                              {calendarDayData.attendance.absent}
                            </div>
                            <div className="text-xs text-gray-500">Absent</div>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 h-2 rounded-full">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${calendarDayData.attendance.rate}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-center mt-1 text-gray-600">
                            {calendarDayData.attendance.rate.toFixed(1)}% Attendance Rate
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Fee Payments */}
                    {(calendarDayData?.fees?.collected > 0 || calendarDayData?.fees?.pending > 0) && (
                      <div className="border rounded-lg p-4">
                        <h3 className="font-medium text-sm text-gray-500 mb-2">Fee Payments</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-center">
                            <div className="text-xl font-bold text-green-600">
                              ${calendarDayData.fees.collected.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">Collected</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-amber-600">
                              ${calendarDayData.fees.pending.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">Pending</div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Events */}
                    {calendarDayData?.events?.length > 0 && (
                      <div className="border rounded-lg p-4">
                        <h3 className="font-medium text-sm text-gray-500 mb-2">Events</h3>
                        <div className="space-y-2">
                          {calendarDayData.events.map(event => (
                            <div key={event.id} className="border-b pb-2 last:border-0">
                              <div className="font-medium">{event.title}</div>
                              <div className="flex justify-between text-xs">
                                <span className={`px-1.5 py-0.5 rounded-full ${
                                  event.event_type === 'holiday' ? 'bg-red-100 text-red-800' :
                                  event.event_type === 'meeting' ? 'bg-blue-100 text-blue-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {event.event_type}
                                </span>
                                <span className="text-gray-500">
                                  By {event.creator_name}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;