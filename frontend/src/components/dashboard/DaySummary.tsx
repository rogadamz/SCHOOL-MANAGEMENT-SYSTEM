// src/components/dashboard/DaySummary.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDaySummary } from '@/services/api';
import { Users, DollarSign, AlertTriangle } from 'lucide-react';

interface DaySummaryProps {
  date: string;
  summary: CalendarDaySummary;
}

export const DaySummary: React.FC<DaySummaryProps> = ({ date, summary }) => {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Summary for {formattedDate}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Attendance Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-medium opacity-90 mb-1">Attendance</div>
                <div className="text-3xl font-bold">{summary.attendance.rate.toFixed(1)}%</div>
                <div className="text-sm mt-2">
                  {summary.attendance.present} / {summary.attendance.present + summary.attendance.absent} students present
                </div>
              </div>
              <div className="p-3 rounded-lg bg-blue-400/20">
                <Users className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
          
          {/* Fee Collection Card */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-4 text-white shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-medium opacity-90 mb-1">Fees Collected</div>
                <div className="text-3xl font-bold">${summary.fees.collected.toFixed(2)}</div>
                <div className="text-sm mt-2">
                  For the day
                </div>
              </div>
              <div className="p-3 rounded-lg bg-emerald-400/20">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
          
          {/* Pending Fees Card */}
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-4 text-white shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-medium opacity-90 mb-1">Pending Payments</div>
                <div className="text-3xl font-bold">${summary.fees.pending.toFixed(2)}</div>
                <div className="text-sm mt-2">
                  Expected but not received
                </div>
              </div>
              <div className="p-3 rounded-lg bg-amber-400/20">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Additional information could be added here */}
        <div className="mt-5 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
          <p className="mb-2">
            <strong>Note:</strong> This is a summary of activities for {formattedDate}.
          </p>
          <p>
            Daily attendance rate: <strong>{summary.attendance.rate.toFixed(1)}%</strong> ({summary.attendance.present} present, {summary.attendance.absent} absent)
          </p>
          <p>
            Daily fee collection: <strong>${summary.fees.collected.toFixed(2)}</strong> collected, <strong>${summary.fees.pending.toFixed(2)}</strong> pending
          </p>
        </div>
      </CardContent>
    </Card>
  );
};