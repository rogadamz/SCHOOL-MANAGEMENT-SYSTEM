// frontend/src/components/dashboard/RecentActivities.tsx
import { 
    Calendar, 
    Users, 
    DollarSign, 
    BookOpen, 
    Award,
    Bell
  } from 'lucide-react';
  
  interface Event {
    id: number;
    title: string;
    description: string;
    start_date: string;
    event_type: string;
    creator_name: string;
  }
  
  interface RecentActivitiesProps {
    events: Event[];
  }
  
  export const RecentActivities = ({ events }: RecentActivitiesProps) => {
    // If no events, use placeholders
    const displayEvents = events && events.length > 0 ? events : [
      {
        id: 1,
        title: "Parent-Teacher Meeting",
        description: "Scheduled for all classes",
        start_date: new Date().toISOString(),
        event_type: "meeting",
        creator_name: "Admin"
      },
      {
        id: 2,
        title: "End of Term Assessment",
        description: "Preparation for exams",
        start_date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
        event_type: "academic",
        creator_name: "Academic Head"
      },
      {
        id: 3,
        title: "Fee Payment Reminder",
        description: "For outstanding balances",
        start_date: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
        event_type: "fee",
        creator_name: "Accounts"
      }
    ];
  
    const getEventIcon = (type: string) => {
      switch (type.toLowerCase()) {
        case 'holiday':
        case 'meeting':
        case 'activity':
          return <Calendar className="h-4 w-4 text-blue-500" />;
        case 'academic':
          return <BookOpen className="h-4 w-4 text-purple-500" />;
        case 'fee':
          return <DollarSign className="h-4 w-4 text-green-500" />;
        case 'achievement':
          return <Award className="h-4 w-4 text-yellow-500" />;
        default:
          return <Bell className="h-4 w-4 text-gray-500" />;
      }
    };
  
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        return `In ${Math.abs(diffDays)} days`;
      } else if (diffDays === 0) {
        return 'Today';
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      }
    };
  
    return (
      <div className="space-y-4">
        {displayEvents.slice(0, 5).map((event, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-gray-100">
              {getEventIcon(event.event_type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <p className="font-medium truncate">{event.title}</p>
                <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                  {formatDate(event.start_date)}
                </span>
              </div>
              <p className="text-sm text-gray-600 truncate">{event.description}</p>
            </div>
          </div>
        ))}
        
        {displayEvents.length > 0 && (
          <div className="pt-2">
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View all notifications
            </button>
          </div>
        )}
      </div>
    );
  };