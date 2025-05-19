
import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export const AuthGuard = ({ children, requireAdmin = false }: AuthGuardProps) => {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only run this effect when loading is complete
    if (!isLoading) {
      console.log("AuthGuard check - User:", user?.email);
      console.log("AuthGuard check - Is Admin:", isAdmin);
      console.log("AuthGuard check - Require Admin:", requireAdmin);
      
      // If user is not logged in, redirect to login
      if (!user) {
        console.log("No user found, redirecting to login");
        navigate('/login');
      } 
      // If admin is required but user is not admin, we'll handle this in the render method
    }
  }, [user, isAdmin, isLoading, navigate, requireAdmin]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-portfolio-purple" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  // Debug check
  if (requireAdmin) {
    console.log(`Admin check for ${user?.email}: isAdmin=${isAdmin}`);
  }

  // If user is authenticated and admin is not required, or user is admin and admin is required
  if (user && (!requireAdmin || isAdmin)) {
    return <>{children}</>;
  }

  // If user is authenticated but admin is required and user is not admin
  if (user && requireAdmin && !isAdmin) {
    console.log("User is not admin but tried to access admin page");
    // Don't redirect, show access denied inside Admin.tsx
    return null;
  }

  // For other cases, render nothing (redirection will happen in useEffect)
  return null;
};
