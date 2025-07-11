
-- Create listings table for storing fashion items
CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  price INTEGER NOT NULL, -- Price in cents
  category TEXT NOT NULL,
  size TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumb_url TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for listings
CREATE POLICY "Users can view active listings" 
  ON public.listings 
  FOR SELECT 
  USING (status = 'active' OR user_id = auth.uid());

CREATE POLICY "Users can create their own listings" 
  ON public.listings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings" 
  ON public.listings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create storage buckets for videos and thumbnails
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('videos', 'videos', true),
  ('thumbnails', 'thumbnails', true);

-- Create storage policies
CREATE POLICY "Users can upload videos" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view videos" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'videos');

CREATE POLICY "Users can upload thumbnails" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view thumbnails" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'thumbnails');
