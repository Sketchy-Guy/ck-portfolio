
-- Create a function to simplify adding a storage policy
CREATE OR REPLACE FUNCTION public.create_storage_policy(
  bucket_name TEXT,
  policy_name TEXT,
  definition TEXT
)
RETURNS VOID AS $$
DECLARE
  policy_exists BOOLEAN;
BEGIN
  -- Check if policy already exists
  SELECT EXISTS (
    SELECT 1 FROM storage.policies
    WHERE bucket_id = bucket_name AND name = policy_name
  ) INTO policy_exists;
  
  -- Create policy if it doesn't exist
  IF NOT policy_exists THEN
    EXECUTE format(
      'CREATE POLICY "%s" ON storage.objects FOR ALL TO public USING (%s)',
      policy_name,
      definition
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow anonymous access to the portfolio bucket
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('portfolio', 'portfolio', true, false, 5242880, null)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Add policy to allow public access to portfolio bucket
SELECT public.create_storage_policy(
  'portfolio',
  'Public Portfolio Access',
  'bucket_id = ''portfolio'''
);
