import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, CropIcon } from "lucide-react";
import { ImageCropper } from "./ImageCropper";
import { uploadProfilePhoto, ensureStorageBucket } from "@/utils/storage";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from '@/integrations/supabase/client';

interface ProfileImageUploadProps {
  currentImageUrl: string;
  onImageUploaded: (imageUrl: string) => void;
  user: User | null;
}

export function ProfileImageUpload({ 
  currentImageUrl, 
  onImageUploaded,
  user
}: ProfileImageUploadProps) {
  const [imagePreview, setImagePreview] = useState(currentImageUrl);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperSrc, setCropperSrc] = useState<string>("");
  const [imageLoaded, setImageLoaded] = useState(false);

  // Default fallback image if current image fails to load
  const fallbackImage = "/lovable-uploads/78295e37-4b4d-4900-b613-21ed6626ab3f.png";

  // Refresh image when mounted or when current image changes
  useEffect(() => {
    const checkStorage = async () => {
      try {
        // Verify storage is set up correctly
        const result = await ensureStorageBucket();
        if (!result.success) {
          console.warn("Storage setup issue:", result.message);
        }
      } catch (err) {
        console.error("Error checking storage:", err);
      }
    };
    checkStorage();

    // Only use fallback if currentImageUrl is empty or invalid
    if (!currentImageUrl || currentImageUrl.includes("null")) {
      setImagePreview(fallbackImage);
    } else {
      setImagePreview(currentImageUrl);
    }
    setImageLoaded(false);
  }, [currentImageUrl]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setSelectedFile(file);
    setUploadError("");
    
    // Check file size and warn if too large
    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.warning("Image is larger than 5MB. You'll need to crop it before uploading.");
    }
    
    // Create object URL for the cropper
    const objectUrl = URL.createObjectURL(file);
    setCropperSrc(objectUrl);
    setCropperOpen(true);
  };

  const handleCropCancel = () => {
    setCropperOpen(false);
    setSelectedFile(null);
    if (cropperSrc) {
      URL.revokeObjectURL(cropperSrc);
      setCropperSrc("");
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    try {
      setCropperOpen(false);
      setUploading(true);
      setUploadError("");
      
      if (!user) {
        throw new Error("You must be logged in to upload an image");
      }
      
      const croppedFile = new File(
        [croppedBlob], 
        selectedFile ? selectedFile.name : "profile-image.jpg", 
        { type: "image/jpeg" }
      );
      
      if (cropperSrc) {
        URL.revokeObjectURL(cropperSrc);
        setCropperSrc("");
      }
      
      const result = await uploadProfilePhoto(croppedFile, user.id);
      
      if (!result.success || !result.path) {
        throw new Error(result.message || "Failed to upload image");
      }
      
      // Update the image with a cache-busting timestamp
      const newImageUrl = result.path;
      setImagePreview(`${newImageUrl}?t=${Date.now()}`);
      setImageLoaded(false);

      // Notify parent to update DB and re-fetch
      onImageUploaded(newImageUrl);

      toast.success('Profile image uploaded successfully');
    } catch (error: any) {
      console.error("Error uploading image:", error);
      setUploadError(error.message || "There was an error uploading your image");
      toast.error('Upload failed: ' + error.message);
      setImagePreview(fallbackImage);
      setImageLoaded(true);
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  };

  const handleImageError = () => {
    console.log("Image failed to load, using fallback:", fallbackImage);
    setImagePreview(fallbackImage);
    setImageLoaded(true);
  };

  const handleImageLoad = () => {
    console.log("Image loaded successfully");
    setImageLoaded(true);
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2">Profile Image</label>
      <div className="flex items-center space-x-6">
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-portfolio-purple border-t-transparent rounded-full"></div>
            </div>
          )}
          <img 
            src={imagePreview} 
            alt="Profile" 
            className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        </div>
        <div>
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('profile-image-upload')?.click()}
            disabled={uploading}
            className="flex items-center"
          >
            {uploading ? (
              <span className="animate-spin mr-2">◌</span>
            ) : (
              <CropIcon className="mr-2 h-4 w-4" />
            )}
            {uploading ? 'Uploading...' : 'Select & Crop Image'}
          </Button>
          <input
            id="profile-image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
            disabled={uploading}
          />
          <p className="text-xs text-gray-500 mt-2">
            Recommended: Square image, at least 300x300 pixels
          </p>
          {uploadError && (
            <div className="mt-2 text-sm text-red-500 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {uploadError}
            </div>
          )}
        </div>
      </div>

      {/* Image Cropper Modal */}
      {cropperOpen && cropperSrc && (
        <ImageCropper
          imageSrc={cropperSrc}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={1}
          open={cropperOpen}
        />
      )}
    </div>
  );
}
