
import React, { useState, useRef } from "react";
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crop as CropIcon, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImageBlob: Blob) => void;
  onCancel: () => void;
  aspectRatio?: number;
  open: boolean;
}

// Function to get the center crop for the initial crop state
function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export function ImageCropper({ 
  imageSrc, 
  onCropComplete, 
  onCancel, 
  aspectRatio = 1, 
  open 
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // When the image loads, set up the initial crop
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspectRatio));
    setError(null); // Clear any previous errors
  };

  // Function to create a cropped image
  const createCroppedImage = async () => {
    try {
      if (!imgRef.current || !crop) {
        toast.error("Please select a crop area first");
        return;
      }
      
      setIsLoading(true);
      setError(null);

      const image = imgRef.current;
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('No 2d context');
      }
      
      const pixelRatio = window.devicePixelRatio;
      
      // Calculate the scaled crop values
      const cropX = crop.x * scaleX;
      const cropY = crop.y * scaleY;
      const cropWidth = crop.width * scaleX;
      const cropHeight = crop.height * scaleY;
      
      // Set canvas size to the cropped image size multiplied by pixel ratio
      canvas.width = cropWidth * pixelRatio;
      canvas.height = cropHeight * pixelRatio;
      
      // Scale the context to account for the device pixel ratio
      ctx.scale(pixelRatio, pixelRatio);
      ctx.imageSmoothingQuality = 'high';
      
      // Draw the cropped image
      ctx.drawImage(
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      );
      
      // Convert canvas to Blob (binary data)
      canvas.toBlob((blob) => {
        if (!blob) {
          setError('Failed to create image. Please try again.');
          setIsLoading(false);
          return;
        }
        
        // Check blob size to ensure it's under the limit
        if (blob.size > 5 * 1024 * 1024) { // 5MB limit
          setError('The cropped image is still too large. Please make a smaller crop selection.');
          setIsLoading(false);
          return;
        }
        
        onCropComplete(blob);
        setIsLoading(false);
      }, 'image/jpeg', 0.92); // JPEG at 92% quality - good balance between quality and size
    } catch (error: any) {
      console.error('Error during image cropping:', error);
      setError(error.message || 'An error occurred during cropping');
      setIsLoading(false);
      toast.error('Cropping failed: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CropIcon className="mr-2 h-4 w-4" />
            Crop Your Image
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center p-4">
          <div className="max-h-[60vh] overflow-auto">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              aspect={aspectRatio}
              className="max-w-full"
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop me"
                onLoad={onImageLoad}
                className="max-w-full object-contain"
                onError={() => {
                  setError('Failed to load image. Please try another one.');
                  toast.error('Image loading failed');
                }}
              />
            </ReactCrop>
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            Drag to adjust the crop area. For best results, create a square crop.
          </p>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={createCroppedImage}
            disabled={!crop || isLoading}
            className="ml-2"
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">◌</span>
                Processing...
              </>
            ) : (
              'Apply Crop'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
