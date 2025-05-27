import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Edit, Trash2, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { migrateAboutData } from '@/utils/migrateAboutData';

// Define types for About Me entries
interface AboutMeEntry {
  id: string;
  order?: number;
  type?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  period?: string;
  created_at: string;
}

interface AboutMeFormData {
  id?: string;
  order?: number;
  type?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  period?: string;
}

export const AboutManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [aboutEntries, setAboutEntries] = useState<AboutMeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<AboutMeFormData>({});
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);

  // Types for about me entries
  const aboutTypes = [
    { value: 'education', label: 'Education' },
    { value: 'experience', label: 'Experience' },
    { value: 'personal', label: 'Personal' },
    { value: 'skill', label: 'Skill' },
  ];

  // Fetch about me entries
  const fetchAboutEntries = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching about entries');
      const { data, error } = await supabase
        .from('about_me')
        .select('*')
        .order('order', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      console.log('Fetched about entries:', data);
      setAboutEntries(data || []);
    } catch (error: any) {
      console.error('Error fetching about entries:', error);
      toast({
        title: "Failed to load about entries",
        description: error.message || "An error occurred while fetching data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle data migration
  const handleMigration = async () => {
    setIsMigrating(true);
    try {
      const result = await migrateAboutData();
      
      if (result.success) {
        toast({
          title: "Migration Successful",
          description: result.message,
        });
        fetchAboutEntries(); // Refresh the data
      } else {
        toast({
          title: "Migration Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Migration error:', error);
      toast({
        title: "Migration Error",
        description: error.message || "An error occurred during migration",
        variant: "destructive"
      });
    } finally {
      setIsMigrating(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchAboutEntries();
  }, []);

  // Open dialog for creating/editing an entry
  const openEntryDialog = (entry?: AboutMeEntry) => {
    if (entry) {
      setCurrentEntry({
        id: entry.id,
        order: entry.order,
        type: entry.type,
        title: entry.title,
        subtitle: entry.subtitle,
        description: entry.description,
        period: entry.period,
      });
    } else {
      // New entry with default values
      setCurrentEntry({
        order: aboutEntries.length + 1,
        type: 'experience',
      });
    }
    setIsDialogOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentEntry(prev => ({ ...prev, [name]: name === 'order' ? parseInt(value) || 0 : value }));
  };

  // Handle select changes
  const handleSelectChange = (value: string, name: string) => {
    setCurrentEntry(prev => ({ ...prev, [name]: value }));
  };

  // Save about me entry
  const saveEntry = async () => {
    setIsSubmitting(true);
    try {
      if (!user) {
        throw new Error("You must be logged in to update about me entries");
      }

      const entryData = {
        ...currentEntry,
        profile_id: user.id, // Ensure profile_id is set
      };
      
      console.log('Saving about entry:', entryData);

      let result;
      
      if (currentEntry.id) {
        // Update existing entry
        result = await supabase
          .from('about_me')
          .update(entryData)
          .eq('id', currentEntry.id)
          .select();
      } else {
        // Create new entry
        result = await supabase
          .from('about_me')
          .insert(entryData)
          .select();
      }

      if (result.error) {
        throw result.error;
      }

      toast({
        title: currentEntry.id ? "Entry Updated" : "Entry Created",
        description: `About me entry successfully ${currentEntry.id ? 'updated' : 'added'}!`,
      });

      setIsDialogOpen(false);
      fetchAboutEntries();
    } catch (error: any) {
      console.error('Error saving about entry:', error);
      toast({
        title: "Failed to save entry",
        description: error.message || "An error occurred while saving data",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete about me entry
  const deleteEntry = async () => {
    if (!entryToDelete) return;
    
    try {
      const { error } = await supabase
        .from('about_me')
        .delete()
        .eq('id', entryToDelete);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Entry Deleted",
        description: "About me entry successfully deleted!",
      });
      
      fetchAboutEntries();
    } catch (error: any) {
      console.error('Error deleting about entry:', error);
      toast({
        title: "Failed to delete entry",
        description: error.message || "An error occurred while deleting data",
        variant: "destructive"
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setEntryToDelete(null);
    }
  };

  // Prompt for delete confirmation
  const confirmDelete = (id: string) => {
    setEntryToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">About Me Manager</h2>
        <div className="flex gap-2">
          <Button 
            onClick={handleMigration}
            disabled={isMigrating}
            variant="outline"
            className="border-portfolio-purple text-portfolio-purple hover:bg-portfolio-purple hover:text-white"
          >
            {isMigrating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Database className="mr-2 h-4 w-4" />
            Migrate Data
          </Button>
          <Button 
            onClick={() => openEntryDialog()} 
            className="bg-portfolio-purple hover:bg-portfolio-purple/80"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Entry
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-portfolio-purple" />
        </div>
      ) : aboutEntries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 border rounded-md bg-slate-50 dark:bg-slate-800/50"
        >
          <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">No about me entries yet</h3>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
            Start by migrating your existing data or adding new entries to showcase your personal and professional journey.
          </p>
          <div className="flex gap-4 justify-center mt-4">
            <Button 
              onClick={handleMigration}
              disabled={isMigrating}
              variant="outline"
            >
              {isMigrating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Database className="mr-2 h-4 w-4" />
              Migrate Existing Data
            </Button>
            <Button 
              onClick={() => openEntryDialog()} 
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Your First Entry
            </Button>
          </div>
        </motion.div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className="w-[140px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aboutEntries.map((entry) => (
                <TableRow key={entry.id} className="transition-colors hover:bg-muted/40">
                  <TableCell className="font-medium">{entry.order || '-'}</TableCell>
                  <TableCell className="capitalize">{entry.type || '-'}</TableCell>
                  <TableCell>{entry.title || '-'}</TableCell>
                  <TableCell>{entry.period || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openEntryDialog(entry)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => confirmDelete(entry.id)}
                        className="h-8 w-8 p-0 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialog for adding/editing an about me entry */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{currentEntry.id ? 'Edit About Me Entry' : 'Add New About Me Entry'}</DialogTitle>
            <DialogDescription>
              Fill in the details below to {currentEntry.id ? 'update' : 'create'} an about me entry.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label htmlFor="order" className="text-sm font-medium mb-1 block">
                  Order
                </label>
                <Input
                  id="order"
                  name="order"
                  type="number"
                  min="1"
                  value={currentEntry.order || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-span-3">
                <label htmlFor="type" className="text-sm font-medium mb-1 block">
                  Type
                </label>
                <Select 
                  value={currentEntry.type || ''} 
                  onValueChange={(value) => handleSelectChange(value, 'type')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {aboutTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label htmlFor="title" className="text-sm font-medium mb-1 block">
                Title
              </label>
              <Input
                id="title"
                name="title"
                value={currentEntry.title || ''}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label htmlFor="subtitle" className="text-sm font-medium mb-1 block">
                Subtitle
              </label>
              <Input
                id="subtitle"
                name="subtitle"
                value={currentEntry.subtitle || ''}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label htmlFor="period" className="text-sm font-medium mb-1 block">
                Period (e.g., "2018-2022" or "May 2020 - Present")
              </label>
              <Input
                id="period"
                name="period"
                value={currentEntry.period || ''}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label htmlFor="description" className="text-sm font-medium mb-1 block">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                rows={4}
                value={currentEntry.description || ''}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={saveEntry} 
              disabled={isSubmitting}
              className="bg-portfolio-purple hover:bg-portfolio-purple/80"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {currentEntry.id ? 'Update' : 'Add'} Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog 
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this about me entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={deleteEntry}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};