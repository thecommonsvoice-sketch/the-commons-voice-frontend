"use client"
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { VideoData } from '@/lib/types';
import { AlertCircle, Upload, CheckCircle, Loader, X, Play } from 'lucide-react';
import { toast } from 'sonner';

interface VideoSectionProps {
  videos: VideoData[];
  onChange: (videos: VideoData[]) => void;
}

interface UploadState {
  [key: number]: {
    uploading: boolean;
    progress: number;
  };
}

export const VideoSection = ({ videos, onChange }: VideoSectionProps) => {
  const [uploadState, setUploadState] = useState<UploadState>({});
  // Detect embed type from URL (YouTube only)
  const getEmbedTypeFromUrl = (url: string): 'youtube' | 'unknown' => {
    if (!url) return 'unknown';
    
    const youtubeRegex = /(?:youtube\.com|youtu\.be)/i;
    
    if (youtubeRegex.test(url)) return 'youtube';
    
    return 'unknown';
  };

  const addVideo = () => {
    onChange([...videos, { type: 'embed', url: '', title: '', description: '' }]);
  };

  const handleVideoChange = (index: number, field: keyof VideoData, value: string) => {
    const newVideos = [...videos];
    // Reset url when changing type
    if (field === 'type') {
      newVideos[index] = {
        ...newVideos[index],
        type: value as 'upload' | 'embed',
        url: ''  // Reset url when changing type
      };
    } else {
      newVideos[index] = { ...newVideos[index], [field]: value };
    }
    onChange(newVideos);
  };

  const removeVideo = (index: number) => {
    const newVideos = videos.filter((_, i) => i !== index);
    onChange(newVideos);
  };

  const handleVideoUpload = async (index: number, file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a valid video file');
      return;
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Video must be smaller than 100MB');
      return;
    }

    setUploadState((prev) => ({
      ...prev,
      [index]: { uploading: true, progress: 0 },
    }));

    try {
      const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadState((prev) => ({
            ...prev,
            [index]: { uploading: true, progress },
          }));
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          if (data.secure_url) {
            handleVideoChange(index, 'url', data.secure_url);
            toast.success('Video uploaded successfully!');
          } else {
            toast.error('Video upload failed');
          }
        } else {
          toast.error('Video upload failed');
        }
      });

      // Handle error
      xhr.addEventListener('error', () => {
        toast.error('Upload error - please try again');
      });

      xhr.open('POST', url);
      xhr.send(formData);
    } catch (err) {
      console.error('Video upload error:', err);
      toast.error('Failed to upload video');
    } finally {
      setUploadState((prev) => ({
        ...prev,
        [index]: { uploading: false, progress: 0 },
      }));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Media Embeds</h3>
        {videos.length > 0 && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {videos.length} media item{videos.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {videos.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
          <Play className="w-10 h-10 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">No media added yet</p>
        </div>
      )}

      {videos.map((video, index) => {
        const embedType = video.type === 'embed' ? getEmbedTypeFromUrl(video.url) : null;
        const isUploading = uploadState[index]?.uploading || false;
        const uploadProgress = uploadState[index]?.progress || 0;
        
        return (
          <div 
            key={index} 
            className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Header with media type and number */}
            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-300 dark:border-gray-600 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-300">{index + 1}</span>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {video.type === 'upload' ? '📹 Video Upload' : '🎬 YouTube Embed'}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeVideo(index)}
                className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
              >
                <X size={18} />
              </Button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Media Type Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Media Type
                </label>
                <Select
                  value={video.type}
                  onValueChange={(value) => handleVideoChange(index, 'type', value)}
                  disabled={isUploading}
                >
                  <SelectTrigger className="bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500">
                    <SelectValue placeholder="Select media type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="embed">🎬 Embed (YouTube)</SelectItem>
                    <SelectItem value="upload">📹 Upload Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Video Upload */}
              {video.type === 'upload' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Choose Video File
                  </label>
                  {!video.url ? (
                    <div className="space-y-3">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {isUploading ? (
                            <>
                              <Loader size={24} className="text-indigo-600 dark:text-indigo-400 animate-spin mb-2" />
                              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Uploading... {uploadProgress}%</p>
                            </>
                          ) : (
                            <>
                              <Upload size={24} className="text-gray-500 dark:text-gray-400 mb-2" />
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">MP4, WebM up to 100MB</p>
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleVideoUpload(index, file);
                            }
                          }}
                          disabled={isUploading}
                          className="hidden"
                        />
                      </label>
                      
                      {/* Upload Progress Bar */}
                      {isUploading && uploadProgress > 0 && (
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
                      <CheckCircle size={20} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-green-800 dark:text-green-300">Upload complete!</p>
                        <p className="text-xs text-green-700 dark:text-green-400 mt-1 truncate">
                          {video.url.substring(video.url.lastIndexOf('/') + 1)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVideoChange(index, 'url', '')}
                        className="text-green-600 hover:text-red-600 dark:text-green-400 dark:hover:text-red-400"
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    YouTube URL
                  </label>
                  <Input
                    placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
                    value={video.url || ''}
                    onChange={(e) => handleVideoChange(index, 'url', e.target.value)}
                    disabled={isUploading}
                    className="bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500"
                  />
                  
                  {/* URL Status Indicator */}
                  {video.url && (
                    <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded mt-2 ${
                      embedType === 'youtube' 
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' 
                        : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800'
                    }`}>
                      {embedType === 'youtube' ? (
                        <>
                          <CheckCircle size={16} />
                          <span>✓ Valid YouTube URL</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle size={16} />
                          <span>⚠️ URL not recognized as YouTube</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title <span className="text-gray-500 text-xs">(optional)</span>
                </label>
                <Input
                  placeholder="Video title or heading"
                  value={video.title || ''}
                  onChange={(e) => handleVideoChange(index, 'title', e.target.value)}
                  disabled={isUploading}
                  className="bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description <span className="text-gray-500 text-xs">(optional)</span>
                </label>
                <Textarea
                  placeholder="Add a brief description or caption"
                  value={video.description || ''}
                  onChange={(e) => handleVideoChange(index, 'description', e.target.value)}
                  disabled={isUploading}
                  rows={3}
                  className="bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 resize-none"
                />
              </div>
            </div>
          </div>
        );
      })}
      
      <Button 
        type="button" 
        onClick={addVideo} 
        variant="outline"
        className="w-full border-dashed border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        <span className="text-lg mr-2">+</span> Add Media Embed
      </Button>
    </div>
  );
};