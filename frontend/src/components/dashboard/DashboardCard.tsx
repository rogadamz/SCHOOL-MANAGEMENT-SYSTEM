// src/components/dashboard/DashboardCard.tsx
import React from 'react';
import { cn } from "@/lib/utils";
import { Loader2 } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  loading?: boolean;
  trend?: {
    value: number;
    positive: boolean;
  };
  colorVariant?: 'blue' | 'green' | 'red' | 'purple' | 'orange';
  onClick?: () => void;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  loading = false,
  trend,
  colorVariant = 'blue',
  onClick
}) => {
  // Define color classes based on variant
  const colorClasses = {
    blue: {
      background: "bg-gradient-to-br from-blue-500 to-blue-600",
      hover: "hover:from-blue-600 hover:to-blue-700",
      iconBg: "bg-blue-400/20"
    },
    green: {
      background: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      hover: "hover:from-emerald-600 hover:to-emerald-700",
      iconBg: "bg-emerald-400/20"
    },
    red: {
      background: "bg-gradient-to-br from-red-500 to-red-600",
      hover: "hover:from-red-600 hover:to-red-700",
      iconBg: "bg-red-400/20"
    },
    purple: {
      background: "bg-gradient-to-br from-purple-500 to-purple-600",
      hover: "hover:from-purple-600 hover:to-purple-700",
      iconBg: "bg-purple-400/20"
    },
    orange: {
      background: "bg-gradient-to-br from-orange-500 to-orange-600",
      hover: "hover:from-orange-600 hover:to-orange-700",
      iconBg: "bg-orange-400/20"
    }
  };

  const colors = colorClasses[colorVariant];

  return (
    <div 
      className={cn(
        colors.background,
        "rounded-xl shadow-lg overflow-hidden transition-transform duration-200",
        onClick ? `cursor-pointer transform ${colors.hover} active:scale-95` : ""
      )}
      onClick={onClick}
    >
      <div className="p-5 text-white">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-sm font-medium opacity-90 mb-1">{title}</div>
            <div className="flex items-center">
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <div className="text-3xl font-bold">{value}</div>
              )}
              
              {trend && !loading && (
                <div className={`ml-2 text-sm font-medium ${trend.positive ? 'text-green-300' : 'text-red-300'} flex items-center`}>
                  {trend.positive ? '↑' : '↓'} {trend.value}%
                </div>
              )}
            </div>
          </div>
          
          <div className={cn("p-3 rounded-lg", colors.iconBg)}>
            {icon}
          </div>
        </div>
        
        {subtitle && (
          <div className="text-sm mt-3 opacity-80">{subtitle}</div>
        )}
      </div>
    </div>
  );
};