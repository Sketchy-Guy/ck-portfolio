
-- First, create a function to check if a storage policy exists
CREATE OR REPLACE FUNCTION public.check_storage_policy_exists(
  policy_name TEXT,
  bucket_name TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  policy_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM storage.policies
    WHERE name = policy_name AND bucket_id = bucket_name
  ) INTO policy_exists;
  
  RETURN policy_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the portfolio bucket exists and is public
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('portfolio', 'portfolio', true, false, 10485760, null)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 10485760;

-- Drop existing policies if they exist
DO $$
BEGIN
    -- Delete existing policies for the portfolio bucket
    DELETE FROM storage.policies 
    WHERE bucket_id = 'portfolio';
    
    -- We run this in a DO block to avoid errors if the policies don't exist
    EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error deleting policies: %', SQLERRM;
END $$;

-- Create new policies to allow upload for authenticated users
CREATE POLICY "Public Portfolio Select"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio');

CREATE POLICY "Auth Portfolio Insert" 
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'portfolio');

CREATE POLICY "Auth Portfolio Update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'portfolio' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Auth Portfolio Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'portfolio' AND (auth.uid())::text = (storage.foldername(name))[1]);
