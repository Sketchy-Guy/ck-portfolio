
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Helper function to check file size with better error message
const validateFileSize = (file: File, maxSizeInMB: number = 5) => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return {
      valid: false,
      message: `File size exceeds the maximum allowed size of ${maxSizeInMB}MB. Please crop or resize the image.`
    };
  }
  return { valid: true, message: 'File size is valid' };
};

// Function to create necessary folders in the portfolio bucket
export const ensureStorageBucket = async () => {
  try {
    console.log("Checking storage bucket status...");
    
    // Check if user is authenticated first
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.warn('Not authenticated: Storage operations may be limited');
      // Still attempt to check if the bucket exists since read might be public
    }
    
    // First check if buckets can be listed (tests permissions)
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      
      // If we get a permission error, try to check if the portfolio bucket exists directly
      // without trying to create it (which requires more permissions)
      const { data: portfolioFiles, error: portfolioError } = await supabase.storage
        .from('portfolio')
        .list();
      
      if (!portfolioError) {
        console.log('Portfolio bucket exists and is accessible, skipping creation');
        return { success: true, message: 'Storage bucket verified and accessible' };
      }
      
      return { 
        success: false, 
        message: `Cannot access storage: ${bucketsError.message}. Please ensure you have proper permissions.`
      };
    }
    
    console.log("Available buckets:", buckets?.map(b => b.name).join(', ') || 'None');
    
    // Check if portfolio bucket exists
    const portfolioBucket = buckets?.find(bucket => bucket.name === 'portfolio');
    
    // Important: Even if the bucket doesn't show up in the list, it might exist
    // but not be visible to the current user. Try to access it directly.
    if (!portfolioBucket) {
      console.log('Portfolio bucket not found in list, checking if it exists by accessing it...');
      
      // Try to access the bucket directly without creating it
      const { data: portfolioFiles, error: portfolioError } = await supabase.storage
        .from('portfolio')
        .list();
        
      if (portfolioError) {
        console.warn('Could not access portfolio bucket, attempting to create it...', portfolioError);
        
        // Only attempt to create if we have the right permissions
        if (session?.user.role === 'service_role' || session?.user.app_metadata.claims_admin) {
          // Try to create the bucket with public access
          const { error: createError } = await supabase.storage.createBucket('portfolio', {
            public: true,
            fileSizeLimit: 10485760, // 10MB
            allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
          });
          
          if (createError) {
            console.error('Error creating portfolio bucket:', createError);
            return { 
              success: false, 
              message: `Failed to create storage bucket: ${createError.message}. Using fallback images.` 
            };
          }
          
          console.log('Portfolio bucket created successfully');
        } else {
          // If we don't have permissions, just warn and use fallbacks
          console.warn('Insufficient permissions to create storage bucket');
          return { 
            success: false, 
            message: 'Insufficient permissions to create storage bucket. Using fallback images.' 
          };
        }
      } else {
        console.log('Portfolio bucket exists and is accessible');
      }
    } else {
      console.log('Portfolio bucket exists');
    }
    
    // If we've made it here, the bucket should exist or we've tried to create it
    // Now try to access the bucket to verify
    try {
      console.log("Verifying bucket access...");
      const { data: listData, error: listError } = await supabase.storage
        .from('portfolio')
        .list();
      
      if (listError) {
        console.error('Cannot access portfolio bucket:', listError);
        return { 
          success: false, 
          message: `Storage exists but cannot be accessed: ${listError.message}. Using fallback images.` 
        };
      }
      
      console.log('Portfolio bucket verified and accessible');
      
      // Explicitly check and create the profile_photo folder if needed
      await ensureProfilePhotoFolder();
      
      return { success: true, message: 'Storage bucket verified and accessible' };
    } catch (accessErr: any) {
      console.error('Error accessing storage bucket:', accessErr);
      return { 
        success: false, 
        message: accessErr.message || "Unknown error during storage access. Using fallback images." 
      };
    }
  } catch (error: any) {
    console.error('Unexpected storage initialization error:', error);
    return { 
      success: false, 
      message: error.message || "Unknown error during storage initialization. Using fallback images." 
    };
  }
};

// Separate function to ensure the profile_photo folder exists
async function ensureProfilePhotoFolder() {
  try {
    console.log("Checking profile_photo folder existence...");
    // Try to list files in the profile_photo folder to see if it exists
    const { data: folderContents, error: listError } = await supabase.storage
      .from('portfolio')
      .list('profile_photo');
    
    if (listError) {
      console.log('Error checking profile_photo folder, attempting to create it:', listError);
      
      // Create an empty file to establish the folder
      const { error: uploadError } = await supabase.storage
        .from('portfolio')
        .upload('profile_photo/.folder', new Blob(['']));
      
      if (uploadError && !uploadError.message.includes('already exists')) {
        console.error('Error creating profile_photo folder:', uploadError);
        toast.error('Failed to create profile_photo folder for image uploads');
      } else {
        console.log('profile_photo folder created successfully');
      }
    } else {
      console.log('profile_photo folder exists with contents:', folderContents?.length || 0, 'files');
    }
    
    return true;
  } catch (error) {
    console.warn('Error checking/creating folders:', error);
    return false;
  }
}

// Function to upload a file to the portfolio bucket
export const uploadFile = async (file: File, path: string) => {
  try {
    // First validate file size
    const sizeValidation = validateFileSize(file);
    if (!sizeValidation.valid) {
      console.error('File size validation failed:', sizeValidation.message);
      throw new Error(sizeValidation.message);
    }
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('Error uploading file: Not authenticated');
      throw new Error('Authentication required to upload files');
    }
    
    // Ensure the bucket exists and is accessible
    const bucketResult = await ensureStorageBucket();
    if (!bucketResult.success) {
      console.warn('Storage bucket not fully available:', bucketResult.message);
      // Continue anyway, the upload might still work
    }
    
    console.log(`Uploading file to ${path}...`, file.type, file.size);
    
    // Generate a unique key for this upload for debugging
    const uploadKey = Math.random().toString(36).substring(2, 8);
    console.log(`Upload tracking ID: ${uploadKey}`);
    
    // Upload the file with public access
    const { data, error } = await supabase.storage
      .from('portfolio')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      console.error(`Upload ${uploadKey} failed:`, error);
      throw error;
    }
    
    console.log(`Upload ${uploadKey} succeeded:`, data);
    
    // Get the public URL for the file
    const publicUrlResult = supabase.storage
      .from('portfolio')
      .getPublicUrl(path);
    
    console.log(`Upload ${uploadKey} public URL:`, publicUrlResult.data.publicUrl);
    
    // Verify the file was uploaded
    try {
      const { data: fileCheck, error: checkError } = await supabase.storage
        .from('portfolio')
        .list(path.split('/')[0], {
          search: path.split('/')[1]
        });
      
      if (checkError) {
        console.warn(`Upload ${uploadKey} verification check error:`, checkError);
      } else {
        console.log(`Upload ${uploadKey} verification:`, 
          fileCheck && fileCheck.length > 0 ? 'File found in storage' : 'File not found in verification');
      }
    } catch (verifyError) {
      console.warn('Could not verify upload:', verifyError);
    }
    
    return { success: true, message: 'File uploaded successfully', path: publicUrlResult.data.publicUrl };
  } catch (error: any) {
    console.error('Error in uploadFile:', error);
    toast.error('Upload failed: ' + (error.message || 'Unknown error'));
    return { success: false, message: error.message || 'Unknown error', path: null };
  }
};

// Function to specifically upload a profile photo
export const uploadProfilePhoto = async (file: File, userId: string) => {
  try {
    // First ensure the bucket and folder exist
    await ensureStorageBucket();
    
    // Create a timestamped file path to avoid cache issues
    const timestamp = new Date().getTime();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `profile_photo/${userId}_${timestamp}_${safeName}`;
    
    // Upload the file
    const result = await uploadFile(file, filePath);
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    console.log('Profile photo uploaded successfully:', result.path);
    
    return result;
  } catch (error: any) {
    console.error('Profile photo upload failed:', error);
    return { success: false, message: error.message, path: null };
  }
};
