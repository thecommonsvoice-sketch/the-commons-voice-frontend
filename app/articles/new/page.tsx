"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { Category, VideoData } from "@/lib/types";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useUserStore } from "@/store/useUserStore";
import { VideoSection } from '@/components/VideoSection';

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`;

export default function NewArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [metaTitle, setMetaTitle] = useState<string>("");
  const [metaDescription, setMetaDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageUploading, setImageUploading] = useState<boolean>(false);
  const [videos, setVideos] = useState<VideoData[]>([]);
  const { user } = useUserStore();

  useEffect(() => {
    api.get("/categories?limit=100").then((res) => {
      setCategories(res.data?.categories || []);
    });
  }, []);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
  }, [user, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

    try {
      const res = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        setCoverImage(data.secure_url);
        toast.success("Image uploaded!");
      } else {
        toast.error("Image upload failed");
      }
    } catch {
      toast.error("Image upload failed");
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Filter out incomplete videos (those without URLs)
      const validVideos = videos.filter(v => v.url && v.url.trim() !== '');
      
      await api.post("/articles", {
        title,
        content,
        categoryId,
        coverImage: coverImage || undefined,
        metaTitle: metaTitle || undefined,
        metaDescription: metaDescription || undefined,
        videos: validVideos.length > 0 ? validVideos : undefined,
      });
      
      toast.success("Article created!");
      router.push(`/dashboard/${user?.role?.toLowerCase() || ''}`);
    } catch (err) {
      console.error('Error details:', err); // Debug error response
      const errorMessage = isAxiosError(err) && err.response?.data?.message 
        ? err.response.data.message 
        : 'Failed to create article';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto py-10 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold text-center mb-8 text-gray-800 dark:text-white">Create New Article</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Section */}
          <div>
            <label className="block text-lg font-medium text-gray-700 dark:text-gray-300">Title</label>
            <Input
              placeholder="Enter article title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-2 p-4 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Content Section */}
          <div>
            <label className="block text-lg font-medium text-gray-700 dark:text-gray-300">Content</label>
            <Textarea
              placeholder="Write your article content here"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              required
              className="mt-2 p-4 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Meta Title & Description Section */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-lg font-medium text-gray-700 dark:text-gray-300">Meta Title</label>
              <Input
                placeholder="SEO Title (max 60 characters)"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                maxLength={60}
                className="mt-2 p-4 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-lg font-medium text-gray-700 dark:text-gray-300">Meta Description</label>
              <Input
                placeholder="SEO Description (max 160 characters)"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                maxLength={160}
                className="mt-2 p-4 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-lg font-medium text-gray-700 dark:text-gray-300">Category</label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="mt-2 w-full p-4 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cover Image Section */}
          <div>
            <label className="block text-lg font-medium text-gray-700 dark:text-gray-300">Cover Image</label>
            <div
              className="mt-2 p-4 border-dashed border-2 border-gray-300 dark:border-gray-600 rounded-md text-center cursor-pointer"
              onClick={() => document.getElementById("image-upload")?.click()}
            >
              <span className="text-gray-500 dark:text-gray-400">
                {imageUploading ? "Uploading..." : "Click or Drag & Drop Image"}
              </span>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={imageUploading}
              />
            </div>
            {coverImage && (
              <div className="mt-4 flex items-center gap-4">
                <img
                  src={coverImage}
                  alt="Cover"
                  className="h-40 object-cover rounded-md shadow-md"
                />
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setCoverImage(null)}
                  className="h-10"
                >
                  Remove
                </Button>
              </div>
            )}
          </div>

          {/* Video Section */}
          <VideoSection 
            videos={videos}
            onChange={setVideos}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || imageUploading || !title || !content || !categoryId}
            className={`w-full py-3 text-white font-semibold rounded-md transition-all duration-300 ${
              loading ? "bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Creating..." : "Create Article"}
          </Button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
