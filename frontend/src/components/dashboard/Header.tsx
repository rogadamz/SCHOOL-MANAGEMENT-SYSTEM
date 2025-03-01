import { Button } from "@/components/ui/button"
import { useNavigate } from 'react-router-dom'

export const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="ml-auto flex items-center space-x-4">
          <Button 
            onClick={handleLogout}
            variant="outline"
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};