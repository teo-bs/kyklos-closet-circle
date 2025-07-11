
import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { VideoRecorder } from '@/components/sell/VideoRecorder';
import { ListingForm } from '@/components/sell/ListingForm';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export interface ListingFormData {
  title: string;
  price: number;
  category: string;
  size: string;
}

const Sell = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<Blob | null>(null);
  const [thumbnailBlob, setThumbnailBlob] = useState<Blob | null>(null);

  const handleVideoRecorded = useCallback((videoBlob: Blob, thumbnail: Blob) => {
    console.log('Video recorded:', videoBlob.size, 'bytes');
    console.log('Thumbnail generated:', thumbnail.size, 'bytes');
    setRecordedVideo(videoBlob);
    setThumbnailBlob(thumbnail);
  }, []);

  const handleFormSubmit = async (formData: ListingFormData) => {
    if (!user || !recordedVideo || !thumbnailBlob) {
      toast({
        title: "Error",
        description: "Please record a video first",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    try {
      console.log('Starting upload process...');
      
      // Generate unique filenames
      const timestamp = Date.now();
      const videoFileName = `${user.id}/${timestamp}.webm`;
      const thumbFileName = `${user.id}/${timestamp}.jpg`;

      console.log('Uploading video...', videoFileName);
      
      // Upload video to Supabase Storage
      const { data: videoData, error: videoError } = await supabase.storage
        .from('videos')
        .upload(videoFileName, recordedVideo, {
          contentType: 'video/webm'
        });

      if (videoError) {
        console.error('Video upload error:', videoError);
        throw new Error(`Video upload failed: ${videoError.message}`);
      }

      console.log('Video uploaded successfully:', videoData);
      console.log('Uploading thumbnail...', thumbFileName);

      // Upload thumbnail to Supabase Storage
      const { data: thumbData, error: thumbError } = await supabase.storage
        .from('thumbnails')
        .upload(thumbFileName, thumbnailBlob, {
          contentType: 'image/jpeg'
        });

      if (thumbError) {
        console.error('Thumbnail upload error:', thumbError);
        throw new Error(`Thumbnail upload failed: ${thumbError.message}`);
      }

      console.log('Thumbnail uploaded successfully:', thumbData);

      // Get public URLs
      const { data: { publicUrl: videoUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(videoFileName);

      const { data: { publicUrl: thumbUrl } } = supabase.storage
        .from('thumbnails')
        .getPublicUrl(thumbFileName);

      console.log('Video URL:', videoUrl);
      console.log('Thumbnail URL:', thumbUrl);

      // Insert listing into database
      const { data: listing, error: dbError } = await supabase
        .from('listings')
        .insert({
          user_id: user.id,
          title: formData.title,
          price: Math.round(formData.price * 100), // Convert to cents
          category: formData.category,
          size: formData.size,
          video_url: videoUrl,
          thumb_url: thumbUrl,
          status: 'active'
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error(`Database error: ${dbError.message}`);
      }

      console.log('Listing created:', listing);

      toast({
        title: "Success!",
        description: "Your item has been listed successfully",
      });

      // Navigate to the new listing
      navigate(`/listing/${listing.id}`);

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sell Your Style</h1>
          <p className="text-gray-600">Record a 15-second video to showcase your item</p>
        </div>

        <div className="space-y-6">
          <VideoRecorder onVideoRecorded={handleVideoRecorded} />
          
          {recordedVideo && (
            <ListingForm 
              onSubmit={handleFormSubmit}
              isSubmitting={isUploading}
            />
          )}

          {isUploading && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-[#715AFF] mr-2" />
              <span className="text-gray-600">Uploading your listing...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sell;
