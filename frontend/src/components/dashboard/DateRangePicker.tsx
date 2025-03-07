// frontend/src/components/dashboard/DateRangePicker.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DateRangePickerProps {
  dateRange: {
    start: Date;
    end: Date;
  };
  onChange: (dateRange: { start: Date; end: Date }) => void;
}

export const DateRangePicker = ({ dateRange, onChange }: DateRangePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatDateRange = () => {
    const startDate = dateRange.start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const endDate = dateRange.end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startDate} - ${endDate}`;
  };

  const handleRangeSelect = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    
    onChange({ start, end });
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 border-dashed">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDateRange()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => handleRangeSelect(7)}>
          Last 7 days
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleRangeSelect(14)}>
          Last 14 days
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleRangeSelect(30)}>
          Last 30 days
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleRangeSelect(90)}>
          Last 3 months
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleRangeSelect(180)}>
          Last 6 months
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};