// frontend/src/components/dashboard/Sidebar.tsx
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import {
  BarChart,
  Users,
  GraduationCap,
  UserPlus,
  Calendar,
  DollarSign,
  BookOpen,
  Settings,
  Home
} from 'lucide-react';

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home
  },
  {
    title: "Students",
    href: "/dashboard/students",
    icon: Users
  },
  {
    title: "Teachers",
    href: "/dashboard/teachers",
    icon: GraduationCap
  },
  {
    title: "Parents",
    href: "/dashboard/parents",
    icon: UserPlus
  },
  {
    title: "Attendance",
    href: "/dashboard/attendance",
    icon: Calendar
  },
  {
    title: "Accounts",
    href: "/dashboard/accounts",
    icon: DollarSign
  },
  {
    title: "Report Cards",
    href: "/dashboard/report-cards",
    icon: BookOpen
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings
  }
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="pb-12 min-h-screen w-60 border-r bg-white">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center h-14 pl-4 mb-6">
            <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Downtown Nursery
            </h2>
          </div>
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm transition-colors hover:bg-gray-100",
                  location.pathname === item.href 
                    ? "bg-gray-100 text-blue-600 font-medium" 
                    : "text-gray-700"
                )}
              >
                <item.icon className={cn(
                  "mr-2 h-4 w-4",
                  location.pathname === item.href
                    ? "text-blue-600"
                    : "text-gray-500"
                )} />
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};