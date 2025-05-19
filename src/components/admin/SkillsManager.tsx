
import React, { useState } from "react";
import { usePortfolioData } from "@/contexts/DataContext";
import { SkillData } from "@/types/portfolio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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
import { Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PostgrestError } from "@supabase/supabase-js";

const skillSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  category: z.string().min(2, "Category must be at least 2 characters"),
  level: z.number().min(0).max(100),
});

export function SkillsManager() {
  const { data, updateSkill, addSkill, removeSkill, fetchPortfolioData } = usePortfolioData();
  const { toast } = useToast();
  const { user } = useAuth();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  const form = useForm<z.infer<typeof skillSchema>>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      name: "",
      category: "",
      level: 50,
    },
  });
  
  const handleSave = async (values: z.infer<typeof skillSchema>, index: number) => {
    const isValid = await form.trigger();
    if (!isValid) {
      toast({
        title: "Error",
        description: "Please fill in all fields correctly.",
        variant: "destructive"
      });
      return;
    }
    
    // Create a complete SkillData object to ensure all required properties are present
    const updatedSkill: SkillData = {
      name: values.name,
      category: values.category,
      level: values.level
    };
    
    try {
      if (user) {
        // Optimistically update the local state
        updateSkill(index, updatedSkill);
        
        // Prepare the data for Supabase update
        const skillToUpdate = data.skills[index];
        
        const { error } = await supabase
          .from('skills')
          .update({
            name: updatedSkill.name,
            category: updatedSkill.category,
            level: updatedSkill.level,
            updated_at: new Date().toISOString(),
          })
          .eq('profile_id', user.id)
          .eq('name', skillToUpdate.name);
        
        if (error) {
          throw error;
        }
        
        // After successfully saving to Supabase, fetch the latest data
        await fetchPortfolioData();
        
        toast({
          title: "Skill Updated",
          description: "Skill has been successfully updated.",
        });
      }
    } catch (error: any) {
      console.error("Error saving skill:", error);
      toast({
        title: "Update Failed",
        description: error.message || "There was an error updating the skill.",
        variant: "destructive"
      });
    } finally {
      setEditingIndex(null);
    }
  };
  
  const handleAdd = async (values: z.infer<typeof skillSchema>) => {
    const isValid = await form.trigger();
    if (!isValid) {
      toast({
        title: "Error",
        description: "Please fill in all fields correctly.",
        variant: "destructive"
      });
      return;
    }
    
    // Create a SkillData object with required fields
    const newSkill: SkillData = {
      name: values.name,
      category: values.category,
      level: values.level
    };
    
    try {
      if (user) {
        // Optimistically update the local state
        addSkill(newSkill);
        
        // Prepare the data for Supabase insert
        const { error } = await supabase
          .from('skills')
          .insert({
            name: newSkill.name,
            category: newSkill.category,
            level: newSkill.level,
            profile_id: user.id,
          } as any); // Use type assertion as temporary solution
        
        if (error) {
          throw error;
        }
        
        // After successfully saving to Supabase, fetch the latest data
        await fetchPortfolioData();
        
        toast({
          title: "Skill Added",
          description: "Skill has been successfully added.",
        });
      }
    } catch (error: any) {
      console.error("Error adding skill:", error);
      toast({
        title: "Add Failed",
        description: error.message || "There was an error adding the skill.",
        variant: "destructive"
      });
    } finally {
      form.reset();
    }
  };
  
  const handleDelete = async (index: number) => {
    try {
      if (user) {
        // Optimistically update the local state
        const skillToDelete = data.skills[index];
        removeSkill(index);
        
        // Delete from Supabase
        const { error } = await supabase
          .from('skills')
          .delete()
          .eq('profile_id', user.id as any) // Use type assertion
          .eq('name', skillToDelete.name as any); // Use type assertion
        
        if (error) {
          throw error;
        }
        
        // After successfully deleting from Supabase, fetch the latest data
        await fetchPortfolioData();
        
        toast({
          title: "Skill Deleted",
          description: "Skill has been successfully deleted.",
        });
      }
    } catch (error: any) {
      console.error("Error deleting skill:", error);
      toast({
        title: "Delete Failed",
        description: error.message || "There was an error deleting the skill.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-portfolio-purple">Manage Skills</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleAdd)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skill Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., React.js" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Web Development" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proficiency Level</FormLabel>
                  <FormControl>
                    <Slider
                      defaultValue={[field.value]}
                      max={100}
                      step={1}
                      onValueChange={(value) => field.onChange(value[0])}
                    />
                  </FormControl>
                  <FormDescription>
                    Set your proficiency level for this skill.
                  </FormDescription>
                  <FormMessage />
                  <div className="text-sm text-gray-500 mt-2">
                    Level: {field.value}
                  </div>
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="bg-portfolio-purple hover:bg-portfolio-purple/90 transition-all duration-300 transform hover:scale-105"
            >
              Add Skill
            </Button>
          </form>
        </Form>
        
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Existing Skills</h3>
          <AnimatePresence>
            {data.skills.map((skill, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="mb-4 p-4 border rounded-md shadow-sm"
              >
                {editingIndex === index ? (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit((values) => handleSave(values, index))} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Skill Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., React.js" 
                                defaultValue={skill.name} 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Web Development" 
                                defaultValue={skill.category} 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="level"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Proficiency Level</FormLabel>
                            <FormControl>
                              <Slider
                                defaultValue={[skill.level]}
                                max={100}
                                step={1}
                                onValueChange={(value) => field.onChange(value[0])}
                              />
                            </FormControl>
                            <FormDescription>
                              Set your proficiency level for this skill.
                            </FormDescription>
                            <FormMessage />
                            <div className="text-sm text-gray-500 mt-2">
                              Level: {field.value}
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end gap-2">
                        <Button 
                          type="submit" 
                          className="bg-portfolio-purple hover:bg-portfolio-purple/90"
                        >
                          Save
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setEditingIndex(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{skill.name}</div>
                      <div className="text-sm text-gray-500">{skill.category}</div>
                      <div className="text-sm text-gray-500">Level: {skill.level}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setEditingIndex(index);
                          form.reset({
                            name: skill.name,
                            category: skill.category,
                            level: skill.level,
                          });
                        }}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={() => handleDelete(index)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
