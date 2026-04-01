-- Bucket for phone product images (used by phones / phone_images.storage_path)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'phone-images') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'phone-images',
      'phone-images',
      true,
      5242880,
      ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    );
  END IF;
END $$;

CREATE POLICY "Anyone can view phone images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'phone-images');

CREATE POLICY "Authenticated users can upload phone images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'phone-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own phone images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'phone-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own phone images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'phone-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
