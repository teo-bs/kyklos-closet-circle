
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Video, Square, RotateCcw, Play } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface VideoRecorderProps {
  onVideoRecorded: (videoBlob: Blob, thumbnail: Blob) => void;
}

export const VideoRecorder: React.FC<VideoRecorderProps> = ({ onVideoRecorded }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 720 }, 
          height: { ideal: 1280 },
          facingMode: 'user'
        },
        audio: true
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive"
      });
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const generateThumbnail = useCallback((videoElement: HTMLVideoElement): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      ctx.drawImage(videoElement, 0, 0);
      
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/jpeg', 0.8);
    });
  }, []);

  const startRecording = useCallback(async () => {
    if (!streamRef.current) {
      await startCamera();
      return;
    }

    // Start countdown
    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(countdownInterval);
          
          // Start actual recording
          chunksRef.current = [];
          const mediaRecorder = new MediaRecorder(streamRef.current!, {
            mimeType: 'video/webm;codecs=vp8,opus'
          });
          
          mediaRecorderRef.current = mediaRecorder;
          
          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              chunksRef.current.push(event.data);
            }
          };
          
          mediaRecorder.onstop = async () => {
            const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
            const videoUrl = URL.createObjectURL(videoBlob);
            
            setRecordedVideoUrl(videoUrl);
            setIsRecording(false);
            setTimeLeft(null);
            
            // Generate thumbnail from recorded video
            if (videoRef.current) {
              const thumbnail = await generateThumbnail(videoRef.current);
              onVideoRecorded(videoBlob, thumbnail);
            }
          };
          
          mediaRecorder.start(100);
          setIsRecording(true);
          setTimeLeft(15);
          
          // Set up recording timer
          const recordingTimer = setInterval(() => {
            setTimeLeft(prev => {
              if (prev === 1) {
                clearInterval(recordingTimer);
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                  mediaRecorderRef.current.stop();
                }
                return 0;
              }
              return prev! - 1;
            });
          }, 1000);
          
          return null;
        }
        return prev! - 1;
      });
    }, 1000);
  }, [startCamera, onVideoRecorded, generateThumbnail]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const resetRecording = useCallback(() => {
    setRecordedVideoUrl(null);
    setIsRecording(false);
    setCountdown(null);
    setTimeLeft(null);
    startCamera();
  }, [startCamera]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="relative aspect-[9/16] bg-black rounded-lg overflow-hidden mb-4">
        {/* Live preview/recorded video */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={!recordedVideoUrl}
          src={recordedVideoUrl || undefined}
          className="w-full h-full object-cover"
          controls={!!recordedVideoUrl}
        />
        
        {/* Countdown overlay */}
        {countdown && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-6xl font-bold text-white animate-pulse">
              {countdown}
            </div>
          </div>
        )}
        
        {/* Recording indicator */}
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-white text-sm font-medium">
              Recording {timeLeft && `${timeLeft}s`}
            </span>
          </div>
        )}
      </div>
      
      {/* Controls */}
      <div className="flex justify-center space-x-4">
        {!recordedVideoUrl ? (
          <Button
            onClick={startRecording}
            disabled={isRecording || countdown !== null}
            className="bg-[#715AFF] hover:bg-[#715AFF]/90 text-white"
            size="lg"
          >
            {isRecording ? (
              <>
                <Square className="w-5 h-5 mr-2" />
                Stop ({timeLeft}s)
              </>
            ) : countdown ? (
              `Starting in ${countdown}...`
            ) : (
              <>
                <Video className="w-5 h-5 mr-2" />
                Record Video
              </>
            )}
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button
              onClick={resetRecording}
              variant="outline"
              size="lg"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Re-record
            </Button>
          </div>
        )}
      </div>
      
      {!recordedVideoUrl && (
        <p className="text-center text-sm text-gray-500 mt-3">
          Record a 15-second video showcasing your item
        </p>
      )}
    </div>
  );
};
