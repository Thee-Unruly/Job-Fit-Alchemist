
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface LayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, requireAuth = true }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  
  // If authentication is required and the user isn't logged in, redirect to login
  if (requireAuth && !isLoading && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If this is a non-auth page and user is logged in
  if (!requireAuth && user) {
    return <Navigate to="/dashboard" replace />;
  }

  // If it's a public page or user is authenticated
  return (
    <div className="min-h-screen flex flex-col">
      {requireAuth && user ? (
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <TopBar />
            <main className="flex-1 p-6 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      ) : (
        // Non-authenticated layout (login/register)
        <main className="flex-1">
          {children}
        </main>
      )}
    </div>
  );
};

export default Layout;
