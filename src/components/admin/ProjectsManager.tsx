
import { useState, useEffect } from "react";
import { usePortfolioData } from "@/contexts/DataContext";
import { ProjectData } from "@/types/portfolio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { motion } from "framer-motion";
import { Trash2, Upload, Edit, X, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { uploadFile } from "@/utils/storage";
import { toast } from "sonner";

const projectSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  technologies: z.string().optional(),
  github_url: z.string().url("Must be a valid URL").optional().or(z.string().length(0)),
  demo_url: z.string().url("Must be a valid URL").optional().or(z.string().length(0)),
  image_url: z.string().optional(),
});

export function ProjectsManager() {
  const { data, updateProject, addProject, removeProject, fetchPortfolioData } = usePortfolioData();
  const { toast: uiToast } = useToast();
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectData[]>(data.projects);
  const [newProjectImage, setNewProjectImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingProjectIndex, setEditingProjectIndex] = useState<number>(-1);
  
  useEffect(() => {
    setProjects(data.projects);
  }, [data.projects]);
  
  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      technologies: "",
      github_url: "",
      demo_url: "",
      image_url: "",
    },
  });

  const resetForm = () => {
    form.reset({
      title: "",
      description: "",
      technologies: "",
      github_url: "",
      demo_url: "",
      image_url: "",
    });
    setNewProjectImage(null);
    setIsEditing(false);
    setEditingProjectId(null);
    setEditingProjectIndex(-1);
    setUploadError("");
  };

  const handleEditProject = (project: ProjectData) => {
    console.log("Editing project:", project);
    setIsEditing(true);
    setEditingProjectId(project.id);
    
    // Find the index of the project in the array
    const projectIndex = projects.findIndex(p => p.id === project.id);
    setEditingProjectIndex(projectIndex);
    
    setNewProjectImage(project.image || null);
    
    form.reset({
      title: project.title,
      description: project.description,
      technologies: project.technologies.join(", "),
      github_url: project.github || "",
      demo_url: project.demo || "",
      image_url: project.image || "",
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setUploading(true);
    setUploadError("");
    
    try {
      if (!user) {
        throw new Error("You must be logged in to upload an image");
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Your session has expired. Please log in again.");
      }
      
      const filePath = `projects/${user.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      console.log("Uploading project image to path:", filePath);
      
      const result = await uploadFile(file, filePath);
      
      if (!result.success) {
        throw new Error(result.message || "Upload failed");
      }
      
      setNewProjectImage(result.path);
      form.setValue('image_url', result.path || '');
      
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      console.error("Error uploading image:", error);
      setUploadError(error.message || "Failed to upload image");
      toast.error('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (values: z.infer<typeof projectSchema>) => {
    try {
      if (!user) {
        toast.error('You must be logged in to save projects');
        return;
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Your session has expired. Please log in again.");
        return;
      }
      
      const technologiesArray = values.technologies?.split(',').map(tech => tech.trim()).filter(tech => tech) || [];
      
      if (isEditing && editingProjectId && editingProjectIndex >= 0) {
        console.log(`Updating project with ID: ${editingProjectId} at index ${editingProjectIndex}`);
        
        // Create a new project object
        const updatedProject: ProjectData = {
          id: editingProjectId,
          title: values.title,
          description: values.description,
          technologies: technologiesArray,
          image: newProjectImage || values.image_url || '',
          github: values.github_url || '',
          demo: values.demo_url || ''
        };
        
        // Update project using DataContext's function
        await updateProject(editingProjectIndex, updatedProject);
        toast.success('Project updated successfully');
      } else {
        // Generate a temporary id for new project
        const tempId = Date.now().toString();
        
        // Create project object
        const newProject: ProjectData = {
          id: tempId,
          title: values.title,
          description: values.description,
          technologies: technologiesArray,
          image: newProjectImage || values.image_url || '',
          github: values.github_url || '',
          demo: values.demo_url || ''
        };
        
        // Add project using DataContext's function
        await addProject(newProject);
        toast.success('Project added successfully');
      }
      
      // Reset form after successful save
      resetForm();
    } catch (error: any) {
      console.error(isEditing ? "Error updating project:" : "Error adding project:", error);
      toast.error(`${isEditing ? 'Update' : 'Add'} failed: ${error.message}`);
    }
  };
  
  const handleDeleteProject = async (id: string) => {
    try {
      console.log(`Deleting project with ID: ${id}`);
      
      if (!user) {
        throw new Error("You must be logged in to delete projects");
      }
      
      // Confirm with user
      if (!confirm("Are you sure you want to delete this project?")) {
        return;
      }
      
      // Use the DataContext's function to remove the project
      await removeProject(id);
      
      // If we were editing this project, reset the form
      if (id === editingProjectId) {
        resetForm();
      }
      
      toast.success('Project deleted successfully');
    } catch (error: any) {
      console.error("Error deleting project:", error);
      toast.error('Delete failed: ' + error.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold text-portfolio-purple">
            {isEditing ? 'Edit Project' : 'Add New Project'}
          </CardTitle>
          {isEditing && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={resetForm}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Project Image</label>
                <div className="flex items-center space-x-6">
                  <div className="relative w-32 h-32 rounded-md overflow-hidden border-2 border-gray-200 shadow-md">
                    <img 
                      src={newProjectImage || form.getValues("image_url") || "/placeholder.svg"} 
                      alt="Project" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                  </div>
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('project-image-upload')?.click()}
                      disabled={uploading}
                      className="flex items-center"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {uploading ? 'Uploading...' : 'Upload Image'}
                    </Button>
                    <input
                      id="project-image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
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
              </div>
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Project Title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Write a brief description about the project..." 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="technologies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Technologies Used</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., React, Node.js, Tailwind CSS" {...field} />
                    </FormControl>
                    <FormDescription>Separate each technology with a comma.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="github_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://github.com/username/repo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="demo_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Demo URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://projectdemo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="bg-portfolio-purple hover:bg-portfolio-purple/90 transition-all duration-300 transform hover:scale-105"
              >
                {isEditing ? 'Update Project' : 'Add Project'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Existing Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {projects.map((project, index) => (
                <div key={project.id} className="flex items-center justify-between p-4 rounded-md shadow-sm border border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-md overflow-hidden border border-gray-200">
                      <img 
                        src={project.image || "/placeholder.svg"} 
                        alt={project.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">{project.title}</h3>
                      <p className="text-sm text-gray-500">{project.description.substring(0, 50)}...</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditProject(project)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteProject(project.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {projects.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  No projects added yet. Add your first project above.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
