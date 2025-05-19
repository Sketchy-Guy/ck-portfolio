
-- Drop old policies if they exist to avoid conflicts
DO $$
BEGIN
    DELETE FROM storage.policies 
    WHERE bucket_id = 'portfolio';
    
    -- We run this in a DO block to avoid errors if the policies don't exist
    EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error deleting policies: %', SQLERRM;
END $$;

-- Ensure the portfolio bucket exists with proper configuration
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('portfolio', 'portfolio', true, false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- Create simple and permissive policies for the portfolio bucket
-- Allow public read access to all files in the portfolio bucket
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio');

-- Allow authenticated users to insert files into the portfolio bucket
CREATE POLICY "Authenticated Insert Access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'portfolio');

-- Allow authenticated users to update their own files
CREATE POLICY "Authenticated Update Access"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'portfolio');

-- Allow authenticated users to delete their own files
CREATE POLICY "Authenticated Delete Access"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'portfolio');
