
import { useState, useEffect } from "react";
import { usePortfolioData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ProfileImageUpload } from "./ProfileImageUpload";
import { ensureStorageBucket } from "@/utils/storage";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  title: z.string().min(2, "Title must be at least 2 characters"),
  email: z.string().email("Must be a valid email"),
  phone: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  github: z.string().url("Must be a valid URL").optional().or(z.string().length(0)),
  linkedin: z.string().url("Must be a valid URL").optional().or(z.string().length(0)),
  twitter: z.string().url("Must be a valid URL").optional().or(z.string().length(0)),
  instagram: z.string().url("Must be a valid URL").optional().or(z.string().length(0)),
  facebook: z.string().url("Must be a valid URL").optional().or(z.string().length(0)),
  profileImage: z.string().optional(),
});

export function ProfileForm() {
  const { data, updateUserData, fetchPortfolioData } = usePortfolioData();
  const { toast: uiToast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  
  // Initialize storage on component mount
  useEffect(() => {
    const initStorage = async () => {
      try {
        console.log("ProfileForm: Initializing storage...");
        const result = await ensureStorageBucket();
        console.log("ProfileForm: Storage initialization result:", result);
        
        if (!result.success) {
          toast.warning("Storage initialization: " + result.message);
        } else {
          toast.success("Storage ready for image uploads");
        }
        
        setInitialCheckDone(true);
      } catch (error: any) {
        console.error("Error initializing storage:", error);
        toast.error("Storage initialization error: " + (error.message || "Unknown error"));
      }
    };
    
    if (user) {
      initStorage();
    }
  }, [user]);
  
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: data.user.name || "",
      title: data.user.title || "",
      email: data.user.email || "",
      phone: data.user.phone || "",
      location: data.user.location || "",
      bio: data.user.bio || "",
      github: data.user.social.github || "",
      linkedin: data.user.social.linkedin || "",
      twitter: data.user.social.twitter || "",
      instagram: data.user.social.instagram || "",
      facebook: data.user.social.facebook || "",
      profileImage: data.user.profileImage || "",
    },
  });
  
  // Update form when data changes
  useEffect(() => {
    form.reset({
      name: data.user.name || "",
      title: data.user.title || "",
      email: data.user.email || "",
      phone: data.user.phone || "",
      location: data.user.location || "",
      bio: data.user.bio || "",
      github: data.user.social.github || "",
      linkedin: data.user.social.linkedin || "",
      twitter: data.user.social.twitter || "",
      instagram: data.user.social.instagram || "",
      facebook: data.user.social.facebook || "",
      profileImage: data.user.profileImage || "",
    });
  }, [data, form]);

  // Handle image upload completion
  const handleImageUploaded = async (imageUrl: string) => {
    console.log("Profile image uploaded:", imageUrl);
    form.setValue('profileImage', imageUrl);
    
    // Immediately update the profile with the new image to ensure it's saved
    await updateProfileImage(imageUrl);
  };

  // Separate function to update just the profile image
  const updateProfileImage = async (imageUrl: string) => {
    try {
      console.log("Updating profile image URL in database:", imageUrl);
      
      // Update the user data immediately with the new image
      await updateUserData({
        ...data.user,
        profileImage: imageUrl
      });
      
      // Refresh data to ensure the UI updates
      await fetchPortfolioData();
      
      console.log("Profile image updated successfully in database");
    } catch (error: any) {
      console.error("Error updating profile image:", error);
      toast.error('Failed to update profile image: ' + error.message);
    }
  };

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    try {
      setIsSubmitting(true);
      console.log("Submitting profile form with values:", values);
      
      // Update user data in context and database
      await updateUserData({
        name: values.name,
        title: values.title,
        email: values.email,
        phone: values.phone || "",
        location: values.location || "",
        bio: values.bio,
        profileImage: values.profileImage || data.user.profileImage,
        social: {
          github: values.github || "",
          linkedin: values.linkedin || "",
          twitter: values.twitter || "",
          instagram: values.instagram || "",
          facebook: values.facebook || "",
        },
      });
      
      // Force refresh data after update
      await fetchPortfolioData();
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast.error('Update failed: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-portfolio-purple">Manage Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <ProfileImageUpload 
              currentImageUrl={data.user.profileImage || "/lovable-uploads/78295e37-4b4d-4900-b613-21ed6626ab3f.png"} 
              onImageUploaded={handleImageUploaded}
              user={user}
            />
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Software Developer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="New York, NY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biography</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Write a brief description about yourself..." 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Social Media Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="github"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GitHub</FormLabel>
                        <FormControl>
                          <Input placeholder="https://github.com/username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn</FormLabel>
                        <FormControl>
                          <Input placeholder="https://linkedin.com/in/username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="twitter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Twitter</FormLabel>
                        <FormControl>
                          <Input placeholder="https://twitter.com/username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="instagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instagram</FormLabel>
                        <FormControl>
                          <Input placeholder="https://instagram.com/username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="facebook"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facebook</FormLabel>
                        <FormControl>
                          <Input placeholder="https://facebook.com/username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-portfolio-purple hover:bg-portfolio-purple/90 transition-all duration-300 transform hover:scale-105"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">◌</span>
                    Updating...
                  </>
                ) : (
                  'Update Profile'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
