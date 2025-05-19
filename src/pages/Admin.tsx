
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, LogOut, User, Code, Award, Briefcase, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileForm } from "@/components/admin/ProfileForm";
import { SkillsManager } from "@/components/admin/SkillsManager";
import { ProjectsManager } from "@/components/admin/ProjectsManager";
import { CertificationsManager } from "@/components/admin/CertificationsManager";
import { forceAdminAccess } from '@/utils/auth';

const Admin = () => {
  const { isAdmin, user, isLoading, signOut, checkAdminStatus } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);
  const [adminCheckComplete, setAdminCheckComplete] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Force check admin status on load
  useEffect(() => {
    const checkAccess = async () => {
      if (!isLoading && user) {
        console.log("Admin page loaded. User:", user.email);
        console.log("Current admin status:", isAdmin);
        
        // For our special admin email, force admin access
        if (user.email === 'chinmaykumarpanda004@gmail.com') {
          console.log("Admin page: Detected admin email, forcing access");
          try {
            await forceAdminAccess(user.email);
            await checkAdminStatus();
          } catch (error) {
            console.error("Error forcing admin access:", error);
          }
        }
        
        setAdminCheckComplete(true);
      }
      
      if (!isLoading) {
        setIsInitializing(false);
      }
    };
    
    checkAccess();
  }, [isLoading, user, isAdmin, checkAdminStatus]);

  if (isLoading || isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <Loader2 className="h-12 w-12 animate-spin text-portfolio-purple mx-auto" />
          <p className="mt-4 text-center text-gray-600">Loading admin panel...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login if no user
    console.log("No user found, redirecting to login");
    navigate('/login');
    return null;
  }

  if (adminCheckComplete && !isAdmin) {
    console.log("User is not admin, showing access denied page");
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-portfolio-purple">Access Denied</h1>
          <p className="text-gray-600 mt-2 max-w-md mx-auto">You are not authorized to access the admin panel. You need admin privileges to view this page.</p>
          {user && (
            <p className="text-sm text-gray-500 mt-1">Logged in as: {user.email}</p>
          )}
        </motion.div>
        <div className="flex gap-4">
          <Button 
            onClick={() => navigate('/')}
            className="bg-portfolio-purple hover:bg-portfolio-purple/90"
          >
            Return to Home
          </Button>
          {user ? (
            <Button 
              onClick={signOut}
              variant="outline"
            >
              Log Out
            </Button>
          ) : (
            <Button 
              onClick={() => navigate('/login')}
              variant="outline"
            >
              Go to Login
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Render the admin panel for admin users
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800"
    >
      <header className="bg-portfolio-purple text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <motion.h1 
            className="text-xl font-bold"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Portfolio Admin
          </motion.h1>
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-4"
          >
            {user && (
              <span className="text-sm hidden md:inline-block">
                Logged in as: {user.email}
              </span>
            )}
            <Button 
              variant="ghost" 
              onClick={signOut} 
              className="text-white hover:text-white hover:bg-portfolio-purple/80"
            >
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </motion.div>
        </div>
      </header>
      
      <main className="container mx-auto p-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid grid-cols-4 mb-8 shadow-md">
            <TabsTrigger value="profile" className="flex items-center">
              <User className="mr-2 h-4 w-4" /> Profile
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center">
              <Code className="mr-2 h-4 w-4" /> Skills
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center">
              <Briefcase className="mr-2 h-4 w-4" /> Projects
            </TabsTrigger>
            <TabsTrigger value="certifications" className="flex items-center">
              <Award className="mr-2 h-4 w-4" /> Certifications
            </TabsTrigger>
          </TabsList>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <TabsContent value="profile" className="glass-card p-6 shadow-xl">
              <ProfileForm />
            </TabsContent>
            
            <TabsContent value="skills" className="glass-card p-6 shadow-xl">
              <SkillsManager />
            </TabsContent>
            
            <TabsContent value="projects" className="glass-card p-6 shadow-xl">
              <ProjectsManager />
            </TabsContent>
            
            <TabsContent value="certifications" className="glass-card p-6 shadow-xl">
              <CertificationsManager />
            </TabsContent>
          </motion.div>
        </Tabs>
      </main>
    </motion.div>
  );
};

export default Admin;
