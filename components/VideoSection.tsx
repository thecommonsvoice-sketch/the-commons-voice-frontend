// import { useState } from 'react};
"use client"
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

interface VideoSectionProps {
  videos: VideoData[];
  onChange: (videos: VideoData[]) => void;
}

export const VideoSection = ({ videos, onChange }: VideoSectionProps) => {
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

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Videos</h3>
      {videos.map((video, index) => (
        <div key={index} className="border p-4 rounded-lg space-y-4">
          <Select
            value={video.type}
            onValueChange={(value) => handleVideoChange(index, 'type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select video type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="embed">Embed (YouTube)</SelectItem>
              <SelectItem value="upload">Upload Video</SelectItem>
            </SelectContent>
          </Select>
          
          {video.type === 'upload' ? (
            <div className="mt-2">
              <Input
                type="file"
                accept="video/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  // Upload to Cloudinary
                  const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`;
                  const formData = new FormData();
                  formData.append('file', file);
                  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');
                  try {
                    const res = await fetch(url, { method: 'POST', body: formData });
                    const data = await res.json();
                    if (data.secure_url) {
                      handleVideoChange(index, 'url', data.secure_url);
                    } else {
                      console.error('Video upload failed:', data);
                    }
                  } catch (err) {
                    console.error('Video upload error:', err);
                  }
                }}
              />
              {video.url && (
                <p className="text-sm text-gray-500 mt-1">
                  Uploaded: {video.url}
                </p>
              )}
            </div>
          ) : (
            <Input
              placeholder="YouTube URL"
              value={video.url || ''}  // Ensure value is never undefined
              onChange={(e) => handleVideoChange(index, 'url', e.target.value)}
              className="mt-2"
            />
          )}
          
          <Input
            placeholder="Video Title"
            value={video.title || ''}  // Ensure value is never undefined
            onChange={(e) => handleVideoChange(index, 'title', e.target.value)}
            className="mt-2"
          />
          
          <Textarea
            placeholder="Video Description"
            value={video.description || ''}  // Ensure value is never undefined
            onChange={(e) => handleVideoChange(index, 'description', e.target.value)}
            className="mt-2"
          />

          <Button 
            type="button"
            variant="destructive" 
            size="sm"
            onClick={() => removeVideo(index)}
            className="mt-2"
          >
            Remove Video
          </Button>
        </div>
      ))}
      
      <Button type="button" onClick={addVideo} variant="outline">
        Add Video
      </Button>
    </div>
  );
};