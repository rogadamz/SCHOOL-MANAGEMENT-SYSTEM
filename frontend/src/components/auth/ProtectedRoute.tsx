import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState, ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const token = localStorage.getItem('token');
  const location = useLocation();
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Validate token (this is a simple check)
    if (token) {
      try {
        // Check if the token is expired based on exp claim
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = payload.exp * 1000 < Date.now();
        
        if (isExpired) {
          console.error("Token expired");
          localStorage.removeItem('token');
          setIsValid(false);
        } else {
          setIsValid(true);
        }
      } catch (error) {
        console.error("Invalid token format:", error);
        localStorage.removeItem('token');
        setIsValid(false);
      }
    } else {
      setIsValid(false);
    }
    
    setIsLoading(false);
  }, [token]);

  // Show loading indicator
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isValid) {
    // Redirect to login with the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};