
-- Create properly configured storage buckets with RLS policies
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('portfolio', 'portfolio', true, false, 5242880, null)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Implement proper RLS policies for the portfolio bucket
-- First, drop any existing policies that might be causing issues
DROP POLICY IF EXISTS "Public Portfolio Access" ON storage.objects;
DROP POLICY IF EXISTS "Portfolio User Access" ON storage.objects;

-- Create policy to allow authenticated users to upload to their own folders
CREATE POLICY "Allow authenticated uploads to portfolio bucket" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'portfolio' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Create policy to allow authenticated users to update their own files
CREATE POLICY "Allow authenticated updates to portfolio bucket" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'portfolio' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Create policy to allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated deletes from portfolio bucket" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'portfolio' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Create policy to allow access to public files
CREATE POLICY "Allow public access to portfolio bucket" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'portfolio');
