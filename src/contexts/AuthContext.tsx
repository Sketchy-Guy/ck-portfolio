
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Session, User } from '@supabase/supabase-js';
import { ensureAdminStatus, forceAdminAccess } from '@/utils/auth';

// Define types for our context
type AuthContextType = {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAdminStatus: () => Promise<boolean>;
};

// Create context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const checkAdminStatus = async (): Promise<boolean> => {
    if (!user) {
      setIsAdmin(false);
      return false;
    }
    
    try {
      console.log(`Checking admin status for user: ${user.email}`);
      
      // Special case for specific email with direct admin check
      if (user.email === 'chinmaykumarpanda004@gmail.com') {
        console.log("Recognized admin email, granting access.");
        
        // Ensure user is set as admin in database (attempt to fix database issues)
        const result = await ensureAdminStatus(user.email);
        console.log("Admin status result:", result);
        
        // Grant access regardless of database result for this specific email
        setIsAdmin(true);
        return true;
      }
      
      // For other users, check if they are admin in database
      const { data, error } = await supabase
        .from('auth_users')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error("Error fetching admin status:", error);
        // Don't throw the error, just log it and return false
        setIsAdmin(false);
        return false;
      }
      
      const adminStatus = data?.is_admin || false;
      console.log(`Database admin status: ${adminStatus}`);
      setIsAdmin(adminStatus);
      return adminStatus;
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
      return false;
    }
  };

  useEffect(() => {
    // First set up the auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.email);
        
        // Update auth state
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // If user signs out, reset admin status
        if (event === 'SIGNED_OUT') {
          setIsAdmin(false);
        }
        
        // If user signs in, check admin status
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && currentSession) {
          // Use setTimeout to avoid potential deadlocks with Supabase client
          setTimeout(async () => {
            // Special case for chinmaykumarpanda004@gmail.com
            if (currentSession.user?.email === 'chinmaykumarpanda004@gmail.com') {
              console.log("Admin email detected in auth change, granting immediate access");
              
              // Set admin in state immediately for UI
              setIsAdmin(true);
              
              // Make sure database is updated
              await forceAdminAccess(currentSession.user.email);
            } else {
              // For other users, check database
              const adminStatus = await checkAdminStatus();
              setIsAdmin(adminStatus);
            }
          }, 0);
        }
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Get current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Check admin status if user is logged in
        if (currentSession?.user) {
          // Special case for admin email
          if (currentSession.user.email === 'chinmaykumarpanda004@gmail.com') {
            console.log("Admin email detected in initialization, granting immediate access");
            setIsAdmin(true);
            await forceAdminAccess(currentSession.user.email);
          } else {
            const adminStatus = await checkAdminStatus();
            setIsAdmin(adminStatus);
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        toast({
          title: "Authentication Error",
          description: "There was a problem loading your authentication state.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log("Attempting to sign in:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Sign in error:", error);
        throw error;
      }
      
      console.log("Sign in successful for:", email);
      
      // Special case for admin email
      if (email === 'chinmaykumarpanda004@gmail.com') {
        console.log("Admin email sign in detected, setting admin status");
        setIsAdmin(true);
        
        // Try to ensure admin status in database
        await ensureAdminStatus(email);
      }
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      
      navigate('/admin');
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "An error occurred during login",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log("Attempting to sign up:", email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        console.error("Sign up error:", error);
        throw error;
      }
      
      console.log("Sign up response:", data);
      
      if (data.user?.identities?.length === 0) {
        console.error("Email already registered");
        throw new Error("Email already registered. Please login instead.");
      }
      
      console.log("Sign up successful for:", email);
      
      toast({
        title: "Registration successful",
        description: "Please check your email for verification link.",
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      console.log("Signing out...");
      
      await supabase.auth.signOut();
      
      // Reset admin status
      setIsAdmin(false);
      
      console.log("Sign out successful");
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      
      navigate('/');
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Failed",
        description: "There was a problem logging you out. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isAdmin,
        isLoading,
        signIn,
        signUp,
        signOut,
        checkAdminStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
