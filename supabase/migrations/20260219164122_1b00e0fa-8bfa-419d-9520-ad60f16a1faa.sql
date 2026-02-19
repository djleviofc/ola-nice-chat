
-- Create storage bucket for couple photos
INSERT INTO storage.buckets (id, name, public) VALUES ('couple-photos', 'couple-photos', true);

-- Allow anyone to read photos (public bucket)
CREATE POLICY "Public read access for couple photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'couple-photos');

-- Allow anyone to upload photos (orders are created without auth)
CREATE POLICY "Anyone can upload couple photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'couple-photos');
