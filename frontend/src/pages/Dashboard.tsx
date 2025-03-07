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
import { Users, UserPlus, GraduationCap, CalendarCheck, DollarSign, BookOpen } from 'lucide-react';
import { Students } from './Students';
import { Teachers } from './Teachers';
import { Parents } from './Parents';
import { Accounts } from './Accounts';
import { ReportCards } from './ReportCards';
import { dashboardApi, CalendarDaySummary } from '@/services/api';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [daySummary, setDaySummary] = useState<CalendarDaySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    // This will trigger the useEffect to run again
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col justify-center items-center h-full">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
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
            <div className="p-6 space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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
                  title="Today's Attendance"
                  value={`${dashboardData?.attendance_today?.rate.toFixed(1)}%`}
                  icon={<CalendarCheck className="h-6 w-6 text-white" />}
                  colorVariant="orange"
                  subtitle={`${dashboardData?.attendance_today?.present || 0} of ${dashboardData?.attendance_today?.total || 0} students present`}
                />
                <DashboardCard
                  title="Fees Collected"
                  value={`$${dashboardData?.financial_summary?.total_paid.toFixed(2) || 0}`}
                  icon={<DollarSign className="h-6 w-6 text-white" />}
                  colorVariant="red"
                  subtitle={`${dashboardData?.financial_summary?.payment_rate.toFixed(1) || 0}% payment rate`}
                  onClick={() => navigate('/dashboard/accounts')}
                />
                <DashboardCard
                  title="Report Cards"
                  value={dashboardData?.class_count || 0}
                  icon={<BookOpen className="h-6 w-6 text-white" />}
                  colorVariant="blue"
                  onClick={() => navigate('/dashboard/report-cards')}
                />
              </div>

              {/* Calendar and Day Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SummaryCalendar onDaySelect={handleDaySelect} />
                {daySummary && selectedDate && (
                  <DaySummary date={selectedDate} summary={daySummary} />
                )}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FeeCollectionChart />
                <FeeStatusDistributionChart />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AttendanceChart 
                  data={[
                    { date: '1 Week', present: dashboardData?.attendance_today?.present || 0, absent: dashboardData?.attendance_today?.absent || 0 },
                    { date: '2 Weeks', present: dashboardData?.attendance_today?.present || 0, absent: dashboardData?.attendance_today?.absent || 0 },
                    { date: '3 Weeks', present: dashboardData?.attendance_today?.present || 0, absent: dashboardData?.attendance_today?.absent || 0 },
                    { date: '1 Month', present: dashboardData?.attendance_today?.present || 0, absent: dashboardData?.attendance_today?.absent || 0 },
                  ]} 
                />
                <PerformanceTrends 
                  data={[
                    { month: 'Jan', averageScore: 75, highestScore: 95, lowestScore: 55, subject: 'Overall' },
                    { month: 'Feb', averageScore: 78, highestScore: 98, lowestScore: 58, subject: 'Overall' },
                    { month: 'Mar', averageScore: 80, highestScore: 96, lowestScore: 62, subject: 'Overall' },
                  ]} 
                />
                <GradeDistribution 
                  data={[
                    { grade: 'A', count: 30 },
                    { grade: 'B', count: 45 },
                    { grade: 'C', count: 28 },
                    { grade: 'D', count: 15 },
                    { grade: 'F', count: 5 },
                  ]} 
                />
              </div>
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