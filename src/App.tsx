import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import HireMe from "./pages/HireMe";
import Login from "./pages/Login";
import { useEffect, useState } from "react";
import { ensureStorageBucket } from "@/utils/storage";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Create a query client instance with aggressive refetching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      staleTime: 5000, // Reduced stale time for more frequent refreshes
      gcTime: 1000 * 60 * 10, // 10 minutes cache time
    },
  },
});

const App = () => {
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Only check auth, don't block UI for storage
    const checkAuth = async () => {
      try {
        await supabase.auth.getSession();
      } catch (error) {
        // handle error if needed
      } finally {
        setInitializing(false); // Render app ASAP
      }
    };
    checkAuth();

    // Run storage setup in background, don't block UI
    ensureStorageBucket().then(result => {
      if (!result.success) {
        console.warn('Storage initialization warning:', result.message);
      }
    });
  }, []);

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-gray-800 mx-auto" />
          <p className="mt-4 text-gray-800">Initializing application...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <DataProvider>
              <Toaster />
              <Sonner position="bottom-right" closeButton richColors />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route 
                  path="/admin" 
                  element={
                    <AuthGuard requireAdmin={true}>
                      <Admin />
                    </AuthGuard>
                  } 
                />
                <Route path="/hire-me" element={<HireMe />} />
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </DataProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
