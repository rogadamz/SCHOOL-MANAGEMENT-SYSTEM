// frontend/src/components/dashboard/DashboardLayout.tsx
import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  Users, 
  UserIcon, 
  Calendar, 
  DollarSign, 
  FileText, 
  Settings,
  GraduationCap 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();

  // Navigation items
  const navItems = [
    { title: 'Dashboard', path: '/dashboard', icon: <HomeIcon className="h-4 w-4 mr-2" /> },
    { title: 'Students', path: '/dashboard/students', icon: <Users className="h-4 w-4 mr-2" /> },
    { title: 'Teachers', path: '/dashboard/teachers', icon: <GraduationCap className="h-4 w-4 mr-2" /> },
    { title: 'Parents', path: '/dashboard/parents', icon: <UserIcon className="h-4 w-4 mr-2" /> },
    { title: 'Attendance', path: '/dashboard/attendance', icon: <Calendar className="h-4 w-4 mr-2" /> },
    { title: 'Accounts', path: '/dashboard/accounts', icon: <DollarSign className="h-4 w-4 mr-2" /> },
    { title: 'Report Cards', path: '/dashboard/report-cards', icon: <FileText className="h-4 w-4 mr-2" /> },
    { title: 'Settings', path: '/dashboard/settings', icon: <Settings className="h-4 w-4 mr-2" /> },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 border-r bg-white">
        <div className="p-6">
          <Link to="/dashboard" className="flex items-center">
            <h1 className="text-xl font-bold text-primary">Downtown Nursery</h1>
          </Link>
        </div>
        <nav className="space-y-1 px-3 py-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                isActive(item.path)
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.icon}
              {item.title}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navbar */}
        <header className="bg-white border-b shadow-sm p-4 flex justify-between items-center">
          <div>
            {/* Page title will be handled by each page component */}
          </div>
          <div>
            <Button variant="ghost" asChild>
              <Link to="/logout">Logout</Link>
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};