import React, { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";

const skillSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  category: z.string().min(2, "Category must be at least 2 characters"),
  level: z.number().min(0).max(100),
});

const PROFILE_ID = "10f6f545-cd03-4b5f-bbf4-96dc44158959";

export function SkillsManager() {
  const { data, updateSkill, addSkill, removeSkill, fetchPortfolioData } = usePortfolioData();
  const { toast } = useToast();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [initialInsertDone, setInitialInsertDone] = useState(false);

  const form = useForm<z.infer<typeof skillSchema>>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      name: "",
      category: "",
      level: 50,
    },
  });

  // Insert all existing skills in the database on first mount (if not already present)
  useEffect(() => {
    const insertExistingSkills = async () => {
      if (!data.skills || data.skills.length === 0 || initialInsertDone) return;

      // Check which skills already exist in the DB
      const { data: dbSkills, error } = await supabase
        .from("skills")
        .select("name, category, level")
        .eq("profile_id", PROFILE_ID);

      if (error) {
        toast({
          title: "Error",
          description: "Could not fetch skills from database.",
          variant: "destructive",
        });
        return;
      }

      // Find skills not in DB
      const dbSkillsSet = new Set(
        (dbSkills || []).map(
          (s) => `${s.name}|${s.category}|${s.level}`
        )
      );
      const skillsToInsert = data.skills.filter(
        (s) => !dbSkillsSet.has(`${s.name}|${s.category}|${s.level}`)
      );

      if (skillsToInsert.length > 0) {
        const insertPayload = skillsToInsert.map((s) => ({
          name: s.name,
          category: s.category,
          level: s.level,
          profile_id: PROFILE_ID,
        }));
        const { error: insertError } = await supabase
          .from("skills")
          .insert(insertPayload);

        if (insertError) {
          toast({
            title: "Error",
            description: "Could not insert some existing skills.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Skills Synced",
            description: "Existing skills have been inserted into the database.",
          });
          await fetchPortfolioData();
        }
      }
      setInitialInsertDone(true);
    };

    insertExistingSkills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.skills]);

  // Add Skill
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

    const newSkill: SkillData = {
      name: values.name,
      category: values.category,
      level: values.level
    };

    try {
      addSkill(newSkill);

      const { error } = await supabase
        .from('skills')
        .insert({
          name: newSkill.name,
          category: newSkill.category,
          level: newSkill.level,
          profile_id: PROFILE_ID,
        });

      if (error) throw error;

      await fetchPortfolioData();

      toast({
        title: "Skill Added",
        description: "Skill has been successfully added.",
      });
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

  // Edit/Save Skill
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

    const updatedSkill: SkillData = {
      name: values.name,
      category: values.category,
      level: values.level
    };

    try {
      updateSkill(index, updatedSkill);

      const skillToUpdate = data.skills[index];

      const { error } = await supabase
        .from('skills')
        .update({
          name: updatedSkill.name,
          category: updatedSkill.category,
          level: updatedSkill.level,
          updated_at: new Date().toISOString(),
        })
        .eq('profile_id', PROFILE_ID)
        .eq('name', skillToUpdate.name);

      if (error) throw error;

      await fetchPortfolioData();

      toast({
        title: "Skill Updated",
        description: "Skill has been successfully updated.",
      });
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

  // Delete Skill
  const handleDelete = async (index: number) => {
    try {
      const skillToDelete = data.skills[index];
      removeSkill(index);

      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('profile_id', PROFILE_ID)
        .eq('name', skillToDelete.name);

      if (error) throw error;

      await fetchPortfolioData();

      toast({
        title: "Skill Deleted",
        description: "Skill has been successfully deleted.",
      });
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
