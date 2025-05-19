
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, ArrowRight, User, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { forceAdminAccess } from '@/utils/auth';
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signIn, signUp, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    const checkUser = async () => {
      if (user) {
        // If user is the admin email, force admin access
        if (user.email === 'chinmaykumarpanda004@gmail.com') {
          console.log("Login: Detected admin email, forcing access");
          try {
            await forceAdminAccess(user.email);
          } catch (error) {
            console.error("Error forcing admin access:", error);
          }
        }
        navigate('/admin');
      }
    };
    
    checkUser();
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Trigger animation
      setIsAnimating(true);
      
      if (isLogin) {
        // Login flow
        console.log("Attempting to sign in with email:", email);
        await signIn(email, password);
        
        // Force admin status for the special admin email
        if (email === 'chinmaykumarpanda004@gmail.com') {
          console.log("Login form: Detected admin email login, forcing access");
          await forceAdminAccess(email);
        }
        
        // Show success animation
        setSuccess(true);
        
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
      } else {
        // Signup flow
        console.log("Attempting to sign up with email:", email);
        await signUp(email, password);
        
        // Show success animation
        setSuccess(true);
        
        toast({
          title: "Registration successful",
          description: "Please check your email for verification.",
        });
        
        setTimeout(() => {
          setIsLogin(true); // Switch back to login form
          setSuccess(false);
        }, 1500);
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      setSuccess(false);
      
      toast({
        title: isLogin ? "Login failed" : "Registration failed",
        description: error.message || "An error occurred during authentication",
        variant: "destructive"
      });
    } finally {
      setIsAnimating(false);
    }
  };

  const toggleForm = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsLogin(!isLogin);
      setIsAnimating(false);
    }, 300);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-portfolio-soft-teal to-white p-4 overflow-hidden">
      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {isLogin ? "Login Successful!" : "Registration Complete!"}
            </h2>
            <p className="text-gray-600 mt-2">
              {isLogin ? "Redirecting you to admin panel..." : "Please check your email for verification."}
            </p>
          </motion.div>
        ) : (
          <motion.div 
            key="form"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className={`glass-card p-8 w-full max-w-md transition-all duration-500 ${isAnimating ? 'scale-95 opacity-70' : 'scale-100 opacity-100'}`}
          >
            <div className="text-center mb-8">
              <motion.div 
                className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <User className="h-10 w-10 text-portfolio-purple" />
              </motion.div>
              <motion.h1 
                className="text-3xl font-bold text-portfolio-purple mb-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Portfolio Admin
              </motion.h1>
              <motion.p 
                className="text-gray-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {isLogin ? "Sign in to manage your portfolio" : "Create a new account"}
              </motion.p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-portfolio-purple"
                    required
                  />
                </div>
              </motion.div>
              
              {/* Password Input */}
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-portfolio-purple"
                    required
                  />
                </div>
              </motion.div>
              
              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button 
                  type="submit" 
                  className="w-full bg-portfolio-purple hover:bg-portfolio-purple/90 transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isLogin ? "Signing in..." : "Signing up..."}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      {isLogin ? "Sign in" : "Sign up"} <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  )}
                </Button>
              </motion.div>
              
              {/* Toggle Login/Register */}
              <motion.div 
                className="text-center mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <button 
                  type="button"
                  onClick={toggleForm}
                  className="text-portfolio-purple hover:text-portfolio-purple/80 text-sm transition-colors"
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </motion.div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
