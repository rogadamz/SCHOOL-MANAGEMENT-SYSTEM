import { Link, useLocation } from 'react-router-dom'
import { cn } from "@/lib/utils"
import {
  BarChart,
  Users,
  Calendar,
  Settings,
} from 'lucide-react'

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: BarChart
  },
  {
    title: "Students",
    href: "/dashboard/students",
    icon: Users
  },
  {
    title: "Attendance",
    href: "/dashboard/attendance",
    icon: Calendar
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings
  }
]

export const Sidebar = () => {
  const location = useLocation()

  return (
    <div className="pb-12 min-h-screen w-60 border-r">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold">
            School Management
          </h2>
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                  location.pathname === item.href ? "bg-accent" : "transparent"
                )}
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