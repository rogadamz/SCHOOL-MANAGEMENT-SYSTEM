// src/components/dashboard/Sidebar.tsx
import { Link, useLocation } from 'react-router-dom'
import { cn } from "@/lib/utils"
import {
  BarChart,
  Users,
  Calendar,
  Settings,
  GraduationCap,
  DollarSign,
  Award,
  UserRound,
  BookOpen,
  School,
  MessageSquare,
  FileText,
  BookMarked,
  Clock
} from 'lucide-react'

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: BarChart,
    description: "Overview and summary statistics"
  },
  {
    title: "Students",
    href: "/dashboard/students",
    icon: Users,
    description: "Manage student information"
  },
  {
    title: "Teachers",
    href: "/dashboard/teachers",
    icon: GraduationCap,
    description: "Manage teaching staff"
  },
  {
    title: "Parents",
    href: "/dashboard/parents",
    icon: UserRound,
    description: "Manage parent information"
  },
  {
    title: "Attendance",
    href: "/dashboard/attendance",
    icon: Calendar,
    description: "Track daily attendance"
  },
  {
    title: "Fees",
    href: "/dashboard/fees",
    icon: DollarSign,
    description: "Manage tuition and payments"
  },
  {
    title: "Grades",
    href: "/dashboard/grades",
    icon: Award,
    description: "Student assessment and reports"
  },
  {
    title: "Classes",
    href: "/dashboard/classes",
    icon: BookOpen,
    description: "Manage class sections"
  },
  {
    title: "Report Cards",
    href: "/dashboard/reports",
    icon: FileText,
    description: "Student report cards and progress reports"
  },
  {
    title: "Timetable",
    href: "/dashboard/timetable",
    icon: Clock,
    description: "Class schedules and timetables"
  },
  {
    title: "Learning Materials",
    href: "/dashboard/materials",
    icon: BookMarked,
    description: "Educational resources and materials"
  },
  {
    title: "Messages",
    href: "/dashboard/messages",
    icon: MessageSquare,
    description: "Communication between users"
  },
  {
    title: "School",
    href: "/dashboard/school",
    icon: School,
    description: "School settings and information"
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    description: "System configuration"
  }
]

export const Sidebar = () => {
  const location = useLocation()

  return (
    <div className="pb-12 min-h-screen w-64 border-r bg-gray-50">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center px-3 py-3 mb-4">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center mr-2">
              <School className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold">
              Downtown Nursery
            </h2>
          </div>
          <div className="space-y-1 max-h-[calc(100vh-140px)] overflow-y-auto">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm transition-colors hover:bg-blue-100 hover:text-blue-600",
                  location.pathname === item.href 
                    ? "bg-blue-100 text-blue-600" 
                    : "text-gray-700"
                )}
                title={item.description}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}