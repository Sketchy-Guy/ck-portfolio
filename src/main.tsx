
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { supabase } from '@/integrations/supabase/client';

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");
const root = createRoot(container);

// Log the app initialization for debugging
console.log("Initializing React application");

// Log Supabase connection status
supabase.auth.getSession().then(({ data }) => {
  console.log("Supabase auth status:", data.session ? "Authenticated" : "Not authenticated");
});

root.render(<App />);
