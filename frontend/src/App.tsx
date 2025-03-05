// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Students } from '@/pages/Students';
import { Teachers } from '@/pages/Teachers';
import { Parents } from '@/pages/Parents';
import { Attendance } from '@/pages/Attendance';
import { Fees } from '@/pages/Fees';
import { Grades } from '@/pages/Grades';
import { Classes } from '@/pages/Classes';
import { School } from '@/pages/School';
import { Settings } from '@/pages/Settings';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

// Helper function to check if user is authenticated
const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Protected Route component
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Dashboard Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="parents" element={<Parents />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="fees" element={<Fees />} />
          <Route path="grades" element={<Grades />} />
          <Route path="classes" element={<Classes />} />
          <Route path="school" element={<School />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* 404 route */}
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </Router>
  );
}

export default App;