"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Video,
  Film,
  Newspaper,
  Plus,
  RefreshCw,
  Trash2,
  Play,
  Upload,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Pencil,
  Eye,
  EyeOff,
  X,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useUserStore } from "@/store/useUserStore";
import type { Article } from "@/lib/types";

import { parseMediaUrl } from "@/components/UniversalVideoPlayer";
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`;

type ContentType = "video" | "wire";
type DropFilter = "all" | "published" | "draft";

export default function AdminSubscriberContentPage() {
  const router = useRouter();
  const { user } = useUserStore();

  const [contentType, setContentType] = useState<ContentType>("video");
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [categoryId, setCategoryId] = useState("");

  // Existing drops list & filter
  const [subscriberDrops, setSubscriberDrops] = useState<Article[]>([]);
  const [loadingDrops, setLoadingDrops] = useState(true);
  const [tableFilter, setTableFilter] = useState<DropFilter>("all");

  // Edit Drop Modal state
  const [editingDrop, setEditingDrop] = useState<Article | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editVideoUrl, setEditVideoUrl] = useState("");
  const [editCoverImage, setEditCoverImage] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchSubscriberDrops();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      const list = res.data?.categories || [];
      setCategories(list);
      if (list.length > 0) {
        setCategoryId(list[0].id);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  const fetchSubscriberDrops = async () => {
    setLoadingDrops(true);
    try {
      const res = await api.get("/subscribers/dispatches");
      const list: Article[] = res.data?.dispatches || res.data?.data || [];
      setSubscriberDrops(list);
    } catch (err) {
      console.error("Failed to load subscriber drops:", err);
    } finally {
      setLoadingDrops(false);
    }
  };

  const handleFileUpload = async (file: File, isVideo: boolean = false, isEdit: boolean = false) => {
    if (isVideo) setUploadingVideo(true);
    else setUploadingImage(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "tcv_preset");

    try {
      const res = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        if (isEdit) {
          if (isVideo) setEditVideoUrl(data.secure_url);
          else setEditCoverImage(data.secure_url);
        } else {
          if (isVideo) setVideoUrl(data.secure_url);
          else setCoverImage(data.secure_url);
        }
        toast.success("File uploaded successfully!");
      } else {
        toast.error("Upload failed");
      }
    } catch (err) {
      toast.error("Upload request failed");
    } finally {
      if (isVideo) setUploadingVideo(false);
      else setUploadingImage(false);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    if (contentType === "video" && !videoUrl.trim()) {
      toast.error("Please provide a video URL or upload a video file");
      return;
    }

    setPublishing(true);
    try {
      const vUrl = videoUrl.trim();
      const vTitle = videoTitle.trim() || title.trim();
      const videos = contentType === "video" || vUrl
        ? [{ url: vUrl, title: vTitle, type: "video" }]
        : undefined;

      await api.post("/subscribers/dispatches", {
        title: title.trim(),
        content: description.trim() || title.trim(),
        excerpt: description.trim() || undefined,
        categoryId: categoryId || (categories.length > 0 ? categories[0].id : undefined),
        coverImage: coverImage || undefined,
        videoUrl: vUrl || undefined,
        videoTitle: vTitle,
        videoType: "video",
        videos,
        status: "PUBLISHED",
      });

      toast.success("Exclusive subscriber drop published successfully!");
      setTitle("");
      setVideoUrl("");
      setVideoTitle("");
      setDescription("");
      setCoverImage(null);
      fetchSubscriberDrops();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to publish subscriber drop");
    } finally {
      setPublishing(false);
    }
  };

  // Toggle Publish / Unpublish Status
  const handleToggleStatus = async (item: Article) => {
    const nextStatus = item.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      await api.patch(`/subscribers/dispatches/${item.id}/status`, { status: nextStatus });
      toast.success(nextStatus === "PUBLISHED" ? "Drop published to subscribers!" : "Drop saved as draft (hidden from subscribers)");
      setSubscriberDrops((prev) =>
        prev.map((d) => (d.id === item.id ? { ...d, status: nextStatus as any } : d))
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  // Open Edit Modal
  const startEditing = (item: Article) => {
    setEditingDrop(item);
    setEditTitle(item.title);
    setEditDescription(item.content || item.excerpt || "");
    setEditVideoUrl(item.videos && item.videos.length > 0 ? item.videos[0].url : "");
    setEditCoverImage(item.coverImage || "");
    setEditCategoryId(item.categoryId || (categories.length > 0 ? categories[0].id : ""));
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDrop) return;
    if (!editTitle.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    setUpdating(true);
    try {
      const vUrl = editVideoUrl.trim();
      await api.post(`/subscribers/dispatches`, {
        title: editTitle.trim(),
        content: editDescription.trim() || editTitle.trim(),
        excerpt: editDescription.trim() || undefined,
        coverImage: editCoverImage.trim() || undefined,
        categoryId: editCategoryId || undefined,
        videoUrl: vUrl || undefined,
        videoTitle: editTitle.trim(),
        videoType: vUrl ? "video" : undefined,
        videos: vUrl ? [{ url: vUrl, title: editTitle.trim(), type: "video" }] : [],
      });

      toast.success("Subscriber drop updated successfully!");
      setEditingDrop(null);
      fetchSubscriberDrops();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update subscriber drop");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteDrop = async (id: string, dropTitle: string) => {
    if (!confirm(`Are you sure you want to delete subscriber drop "${dropTitle}"?`)) return;

    try {
      await api.delete(`/subscribers/dispatches/${id}`);
      toast.success("Subscriber drop deleted");
      setSubscriberDrops((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete drop");
    }
  };

  const publishedCount = subscriberDrops.filter((d) => d.status === "PUBLISHED").length;
  const draftCount = subscriberDrops.filter((d) => d.status === "DRAFT").length;

  const filteredDrops = subscriberDrops.filter((d) => {
    if (tableFilter === "published") return d.status === "PUBLISHED";
    if (tableFilter === "draft") return d.status === "DRAFT";
    return true;
  });

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link href="/dashboard/admin" className="hover:underline flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" /> Admin Panel
            </Link>
            <span>•</span>
            <span className="text-primary font-semibold">Subscriber Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-serif">
            Subscriber Content Studio
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Upload raw video drops, post short wire notes, and manage exclusive subscriber publications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/subscribers" target="_blank" className="gap-1.5">
              <ExternalLink className="h-3.5 w-3.5" /> View Subscriber Lounge
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-4 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Total Subscriber Drops</p>
            <p className="text-2xl font-bold text-foreground mt-0.5">{subscriberDrops.length}</p>
          </div>
          <Film className="h-8 w-8 text-primary/30" />
        </div>
        <div className="rounded-xl border bg-card p-4 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Published (Active)</p>
            <p className="text-2xl font-bold text-emerald-600 mt-0.5">{publishedCount}</p>
          </div>
          <CheckCircle2 className="h-8 w-8 text-emerald-500/30" />
        </div>
        <div className="rounded-xl border bg-card p-4 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Drafts (Hidden)</p>
            <p className="text-2xl font-bold text-amber-600 mt-0.5">{draftCount}</p>
          </div>
          <EyeOff className="h-8 w-8 text-amber-500/30" />
        </div>
      </div>

      {/* Upload Studio Form Card */}
      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-base font-semibold flex items-center gap-2 text-foreground">
            <Plus className="h-4 w-4 text-primary" /> Publish New Subscriber Drop
          </h2>

          {/* Type Selector Tabs */}
          <div className="inline-flex rounded-lg border bg-muted/50 p-1 text-xs font-medium">
            <button
              onClick={() => setContentType("video")}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                contentType === "video" ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground"
              }`}
            >
              <Film className="h-3.5 w-3.5" /> 🎥 Video Drop
            </button>
            <button
              onClick={() => setContentType("wire")}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                contentType === "wire" ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground"
              }`}
            >
              <Newspaper className="h-3.5 w-3.5" /> 💬 Short Wire Note
            </button>
          </div>
        </div>

        <form onSubmit={handlePublish} className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              {contentType === "video" ? "Video Title / Headline" : "Wire Note Title"}
            </label>
            <Input
              type="text"
              placeholder={contentType === "video" ? "e.g. Exclusive Raw Footage from City Protest" : "e.g. Breaking Wire: Unconfirmed reports on..."}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="h-11 text-sm font-medium"
            />
          </div>

          {/* Video URL & File Upload (If Video Drop) */}
          {contentType === "video" && (
            <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <label className="text-xs font-bold text-primary uppercase tracking-wider block">
                🎥 Video Source
              </label>
              <Input
                type="text"
                placeholder="Paste direct MP4, YouTube, Twitter/X, Vimeo, or Audio link..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="h-10 text-sm bg-background font-mono"
              />
              {videoUrl.trim() && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Detected Format: <strong>{parseMediaUrl(videoUrl).label}</strong></span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">or upload MP4 video directly:</span>
                <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-medium bg-card hover:bg-muted border border-border px-3 py-1.5 rounded-md transition-colors">
                  <Upload className="h-3.5 w-3.5 text-primary" />
                  {uploadingVideo ? "Uploading Video..." : "Select MP4 File"}
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, true);
                    }}
                  />
                </label>
              </div>
            </div>
          )}

          {/* Description / Content text */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              {contentType === "video" ? "Reporter Note / Video Description" : "Short Note Body Text (Twitter/Substack Note Style)"}
            </label>
            <Textarea
              placeholder={contentType === "video" ? "Add context about this raw video clip..." : "Write your quick subscriber wire note here..."}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="text-sm leading-relaxed"
            />
          </div>

          {/* Thumbnail / Cover Image */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Cover Thumbnail Image (Optional)</label>
            <div className="flex items-center gap-3">
              <Input
                type="text"
                placeholder="Image URL or upload below"
                value={coverImage || ""}
                onChange={(e) => setCoverImage(e.target.value)}
                className="h-10 text-sm flex-1"
              />
              <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-medium bg-muted hover:bg-muted/80 border px-3 py-2 rounded-md transition-colors shrink-0">
                <Upload className="h-3.5 w-3.5" />
                {uploadingImage ? "Uploading..." : "Upload Image"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, false);
                  }}
                />
              </label>
            </div>
            {coverImage && (
              <div className="mt-2 relative h-20 w-36 overflow-hidden rounded-md border">
                <Image src={coverImage} alt="Thumbnail preview" fill className="object-cover" />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={publishing || uploadingImage || uploadingVideo}
            className="w-full h-11 font-semibold text-sm gap-2"
          >
            {publishing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" /> Publishing Drop...
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" /> Publish Exclusive Subscriber Drop
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Existing Drops List Table */}
      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/30">
          <div className="flex items-center gap-2">
            <Film className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Active Subscriber Drops ({filteredDrops.length})</h3>
          </div>

          {/* Table Filter Tabs */}
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border bg-card p-1 text-xs font-medium">
              <button
                onClick={() => setTableFilter("all")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  tableFilter === "all" ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground"
                }`}
              >
                All ({subscriberDrops.length})
              </button>
              <button
                onClick={() => setTableFilter("published")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  tableFilter === "published" ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground"
                }`}
              >
                Published ({publishedCount})
              </button>
              <button
                onClick={() => setTableFilter("draft")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  tableFilter === "draft" ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground"
                }`}
              >
                Drafts ({draftCount})
              </button>
            </div>

            <Button onClick={fetchSubscriberDrops} variant="ghost" size="sm" className="h-8 text-xs">
              <RefreshCw className="h-3.5 w-3.5 mr-1" /> Refresh
            </Button>
          </div>
        </div>

        {loadingDrops ? (
          <div className="p-12 text-center text-sm text-muted-foreground">Loading drops...</div>
        ) : filteredDrops.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">No subscriber drops match this filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b bg-muted/50 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">Title / Drop</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Published Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredDrops.map((item) => {
                  const hasVideo = item.videos && item.videos.length > 0;
                  const isPublished = item.status === "PUBLISHED";

                  return (
                    <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3 font-semibold text-foreground max-w-xs truncate">
                        <Link href="/subscribers" target="_blank" className="hover:underline flex items-center gap-1.5" title="View in Subscriber Lounge">
                          {hasVideo && <Play className="h-3 w-3 text-primary fill-primary shrink-0" />}
                          {item.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        {hasVideo ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary border border-primary/20">
                            🎥 Video Drop
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground border">
                            💬 Wire Note
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isPublished ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-0.5 text-[11px] font-semibold border border-emerald-500/20">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 px-2.5 py-0.5 text-[11px] font-semibold border border-amber-500/20">
                            <EyeOff className="h-3 w-3 text-amber-500" /> Draft
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {item.author?.name || "TCV Staff"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(item.publishedAt || item.createdAt || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Status Button (Publish / Unpublish) */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleStatus(item)}
                            className={`h-8 px-2.5 text-xs gap-1 font-medium ${
                              isPublished
                                ? "text-muted-foreground hover:text-amber-600 hover:bg-amber-50"
                                : "bg-primary text-primary-foreground hover:bg-primary/90"
                            }`}
                            title={isPublished ? "Unpublish (Hide from subscribers)" : "Publish (Make visible to subscribers)"}
                          >
                            {isPublished ? (
                              <>
                                <EyeOff className="h-3.5 w-3.5" /> Unpublish
                              </>
                            ) : (
                              <>
                                <Eye className="h-3.5 w-3.5" /> Publish
                              </>
                            )}
                          </Button>

                          {/* Edit Button */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditing(item)}
                            className="h-8 px-2.5 text-xs gap-1 text-muted-foreground hover:text-foreground"
                            title="Edit Subscriber Drop"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </Button>

                          {/* Delete Button */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteDrop(item.id, item.title)}
                            className="h-8 px-2 text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                            title="Delete Drop"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Drop Modal */}
      {editingDrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-card border rounded-2xl shadow-xl w-full max-w-xl p-6 space-y-5 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
                <Pencil className="h-4 w-4 text-primary" /> Edit Subscriber Drop
              </h3>
              <button
                onClick={() => setEditingDrop(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Title / Headline</label>
                <Input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="h-10 text-sm font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Content Body / Description
                </label>
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={4}
                  className="text-sm leading-relaxed"
                />
              </div>

              {/* Video URL */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Video URL (Optional)</label>
                <Input
                  type="text"
                  placeholder="MP4 or YouTube URL"
                  value={editVideoUrl}
                  onChange={(e) => setEditVideoUrl(e.target.value)}
                  className="h-10 text-sm font-mono"
                />
              </div>

              {/* Thumbnail Image */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Cover Image URL (Optional)</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="Image URL"
                    value={editCoverImage}
                    onChange={(e) => setEditCoverImage(e.target.value)}
                    className="h-10 text-sm flex-1"
                  />
                  <label className="cursor-pointer inline-flex items-center gap-1 text-xs font-medium bg-muted hover:bg-muted/80 border px-3 py-2 rounded-md transition-colors shrink-0">
                    <Upload className="h-3.5 w-3.5" />
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, false, true);
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Category */}
              {categories.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Category</label>
                  <select
                    value={editCategoryId}
                    onChange={(e) => setEditCategoryId(e.target.value)}
                    className="w-full h-10 rounded-md border bg-background px-3 text-sm font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <Button type="button" variant="outline" onClick={() => setEditingDrop(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updating}>
                  {updating ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
