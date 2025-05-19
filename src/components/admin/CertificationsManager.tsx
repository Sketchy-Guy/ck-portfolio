import React, { useState, useEffect } from 'react';
import { usePortfolioData } from "@/contexts/DataContext";
import { CertificationData } from "@/types/portfolio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { supabase } from "@/integrations/supabase/client";
import { Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const certificationSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  issuer: z.string().min(2, "Issuer must be at least 2 characters"),
  date: z.string().min(4, "Date must be at least 4 characters"),
  credential: z.string().optional(),
  link: z.string().url("Must be a valid URL").optional(),
  logo: z.string().optional(),
});

export function CertificationsManager() {
  const { data, updateCertification, addCertification, removeCertification, fetchPortfolioData } = usePortfolioData();
  const { toast } = useToast();
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  const handleSave = async (certification: CertificationData, index: number) => {
    try {
      if (user) {
        updateCertification(index, certification);
        
        const { id, title, issuer, date, credential, link, logo } = certification;
        
        const { error } = await supabase
          .from('certifications')
          .upsert({
            id: id,
            profile_id: user.id,
            title,
            issuer,
            date,
            credential: credential || null,
            link: link || null,
            logo_url: logo || null
          } as any, { onConflict: 'id' });
        
        if (error) throw error;
        
        await fetchPortfolioData();
        
        toast({
          title: "Certification Updated",
          description: "The certification has been successfully updated.",
        });
      }
    } catch (error: any) {
      console.error("Error saving certification:", error);
      toast({
        title: "Update Failed",
        description: error.message || "There was an error updating the certification.",
        variant: "destructive"
      });
    }
  };
  
  const handleAdd = async (certification: CertificationData) => {
    try {
      if (user) {
        addCertification(certification);
        
        const { title, issuer, date, credential, link, logo } = certification;
        
        const { error } = await supabase
          .from('certifications')
          .insert({
            profile_id: user.id,
            title,
            issuer,
            date,
            credential: credential || null,
            link: link || null,
            logo_url: logo || null
          } as any);
        
        if (error) throw error;
        
        await fetchPortfolioData();
        
        toast({
          title: "Certification Added",
          description: "The certification has been successfully added.",
        });
      }
    } catch (error: any) {
      console.error("Error adding certification:", error);
      toast({
        title: "Add Failed",
        description: error.message || "There was an error adding the certification.",
        variant: "destructive"
      });
    }
  };
  
  const handleRemove = async (index: number) => {
    try {
      if (user) {
        removeCertification(index);
        
        const { error } = await supabase
          .from('certifications')
          .delete()
          .eq('id', data.certifications[index].id as any); // Use type assertion for now
        
        if (error) throw error;
        
        await fetchPortfolioData();
        
        toast({
          title: "Certification Removed",
          description: "The certification has been successfully removed.",
        });
      }
    } catch (error: any) {
      console.error("Error removing certification:", error);
      toast({
        title: "Remove Failed",
        description: error.message || "There was an error removing the certification.",
        variant: "destructive"
      });
    }
  };
  
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, setFieldValue: (value: string) => void) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `certification_logos/${user?.id}/${fileName}`;
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('portfolio')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data: publicUrlData } = supabase.storage
        .from('portfolio')
        .getPublicUrl(filePath);
      
      if (publicUrlData) {
        const imageUrl = publicUrlData.publicUrl;
        setLogoPreview(imageUrl);
        setFieldValue(imageUrl);
        
        toast({
          title: "Logo Uploaded",
          description: "The certification logo has been successfully updated."
        });
      }
    } catch (error: any) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "There was an error uploading the logo.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
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
          <CardTitle className="text-2xl font-bold text-portfolio-purple">Manage Certifications</CardTitle>
        </CardHeader>
        <CardContent>
          {data.certifications.map((certification, index) => (
            <CertificationForm
              key={index}
              certification={certification}
              onSave={(values) => handleSave(values, index)}
              onRemove={() => handleRemove(index)}
              onLogoUpload={(e, setFieldValue) => handleLogoUpload(e, setFieldValue)}
              uploading={uploading}
              logoPreview={logoPreview}
            />
          ))}
          <AddCertificationForm onAdd={handleAdd} onLogoUpload={(e, setFieldValue) => handleLogoUpload(e, setFieldValue)} uploading={uploading} logoPreview={logoPreview} />
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface CertificationFormProps {
  certification: CertificationData;
  onSave: (values: CertificationData) => void;
  onRemove: () => void;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>, setFieldValue: (value: string) => void) => void;
  uploading: boolean;
  logoPreview: string | null;
}

const CertificationForm: React.FC<CertificationFormProps> = ({ certification, onSave, onRemove, onLogoUpload, uploading, logoPreview }) => {
  const form = useForm<z.infer<typeof certificationSchema>>({
    resolver: zodResolver(certificationSchema),
    defaultValues: {
      title: certification.title,
      issuer: certification.issuer,
      date: certification.date,
      credential: certification.credential || "",
      link: certification.link || "",
      logo: certification.logo || "",
    },
  });

  const onSubmit = (values: z.infer<typeof certificationSchema>) => {
    onSave({
      ...certification,
      title: values.title,
      issuer: values.issuer,
      date: values.date,
      credential: values.credential,
      link: values.link,
      logo: values.logo,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6 p-4 border rounded-md shadow-sm"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Logo</label>
            <div className="flex items-center space-x-6">
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 shadow-md">
                <img 
                  src={logoPreview || certification.logo || "/placeholder-image.png"} 
                  alt="Certification Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById(`logo-upload-${certification.title}`)?.click()}
                  disabled={uploading}
                  className="flex items-center"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploading ? 'Uploading...' : 'Upload Logo'}
                </Button>
                <input
                  id={`logo-upload-${certification.title}`}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    onLogoUpload(e, (value) => form.setValue('logo', value));
                  }}
                  disabled={uploading}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Recommended: Square image, at least 100x100 pixels
                </p>
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
                  <Input placeholder="Certification Title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="issuer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Issuer</FormLabel>
                <FormControl>
                  <Input placeholder="Issuing Organization" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input placeholder="YYYY-MM" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="credential"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Credential ID (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Credential ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="link"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link (Optional)</FormLabel>
                <FormControl>
                  <Input type="url" placeholder="https://example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end gap-2">
            <Button type="submit" className="bg-portfolio-purple hover:bg-portfolio-purple/90">
              Save
            </Button>
            <Button type="button" variant="destructive" onClick={onRemove}>
              Remove
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
};

interface AddCertificationFormProps {
  onAdd: (values: CertificationData) => void;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>, setFieldValue: (value: string) => void) => void;
  uploading: boolean;
  logoPreview: string | null;
}

const AddCertificationForm: React.FC<AddCertificationFormProps> = ({ onAdd, onLogoUpload, uploading, logoPreview }) => {
  const form = useForm<z.infer<typeof certificationSchema>>({
    resolver: zodResolver(certificationSchema),
    defaultValues: {
      title: "",
      issuer: "",
      date: "",
      credential: "",
      link: "",
      logo: "",
    },
  });

  const onSubmit = (values: z.infer<typeof certificationSchema>) => {
    // Generate a unique ID for the new certification
    const newId = crypto.randomUUID();
    
    onAdd({
      id: newId,  // Add id field
      title: values.title,
      issuer: values.issuer,
      date: values.date,
      credential: values.credential || "",
      link: values.link || "",
      logo: values.logo || "",
    });
    form.reset();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6 p-4 border rounded-md shadow-sm"
    >
      <h3 className="text-lg font-semibold mb-4">Add New Certification</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Logo</label>
            <div className="flex items-center space-x-6">
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 shadow-md">
                <img 
                  src={logoPreview || "/placeholder-image.png"} 
                  alt="Certification Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('new-logo-upload')?.click()}
                  disabled={uploading}
                  className="flex items-center"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploading ? 'Uploading...' : 'Upload Logo'}
                </Button>
                <input
                  id="new-logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    onLogoUpload(e, (value) => form.setValue('logo', value));
                  }}
                  disabled={uploading}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Recommended: Square image, at least 100x100 pixels
                </p>
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
                  <Input placeholder="Certification Title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="issuer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Issuer</FormLabel>
                <FormControl>
                  <Input placeholder="Issuing Organization" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input placeholder="YYYY-MM" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="credential"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Credential ID (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Credential ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="link"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link (Optional)</FormLabel>
                <FormControl>
                  <Input type="url" placeholder="https://example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end">
            <Button type="submit" className="bg-portfolio-purple hover:bg-portfolio-purple/90">
              Add Certification
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
};
