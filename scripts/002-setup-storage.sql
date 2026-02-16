-- Create storage bucket for plastic photos
-- This is just a reference, storage buckets need to be created via Supabase dashboard or API

-- If you need to enable RLS for storage:
-- 1. Go to Supabase Dashboard
-- 2. Navigate to Storage > plastic-photos
-- 3. Enable "RLS" (Row Level Security)
-- 4. Add policy:
--    - Policy name: "Allow public read access"
--    - Target roles: public
--    - Allowed operations: SELECT
--    - Using expression: true

-- Example public bucket policy:
-- ALTER ROLE authenticated SET statement_timeout = '30s';

-- Create public access for photos
INSERT INTO storage.buckets (id, name, public) VALUES ('plastic-photos', 'plastic-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to download photos
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'plastic-photos' );

CREATE POLICY "Allow authenticated upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'plastic-photos' );

CREATE POLICY "Allow authenticated delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'plastic-photos' );
