
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates or updates admin status for the specified user
 */
export const ensureAdminStatus = async (email: string) => {
  try {
    // Get user data from the current session
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("No authenticated user found.");
      return {
        success: false,
        message: "No authenticated user found."
      };
    }
    
    console.log(`Checking admin status for: ${email}`);
    
    // Special case for chinmaykumarpanda004@gmail.com - direct admin
    if (email === 'chinmaykumarpanda004@gmail.com') {
      console.log("Admin email detected, updating auth_users record");
      
      // Try to create/update auth_users record for this user
      const { error } = await supabase
        .from('auth_users')
        .upsert(
          { 
            id: user.id,
            is_admin: true 
          },
          { onConflict: 'id' }
        );
      
      if (error) {
        console.error("Error setting admin status:", error);
        return {
          success: false,
          message: `Database error: ${error.message}`
        };
      }
      
      console.log("Admin status set successfully in database");
      return {
        success: true,
        message: "Admin status set successfully."
      };
    }
    
    return {
      success: false,
      message: "User is not authorized for admin access."
    };
  } catch (error: any) {
    console.error("Auth error:", error);
    return {
      success: false,
      message: error.message || "Unknown error occurred"
    };
  }
};

/**
 * Directly set admin status for current user if they match the specified email
 */
export const forceAdminAccess = async (userEmail: string | undefined) => {
  if (!userEmail) return false;
  
  // If it's the special admin email, grant admin access
  if (userEmail === 'chinmaykumarpanda004@gmail.com') {
    try {
      const result = await ensureAdminStatus(userEmail);
      console.log("Force admin access result:", result);
      return true;
    } catch (error) {
      console.error("Error forcing admin access:", error);
      return false;
    }
  }
  
  return false;
};
