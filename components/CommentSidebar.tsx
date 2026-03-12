"use client"
import { useEffect, useState, useRef } from "react";
import { X, Send, Edit, Trash2, MoreHorizontal, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useUserStore } from "@/store/useUserStore";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  userId: string;
  content: string;
  user?: { id: string; name: string };
  userName?: string;
  createdAt: string;
}

interface CommentsSidebarProps {
  articleId: string;
  onClose: () => void;
}

// Helper to get display name from comment
const getDisplayName = (comment: Comment) => {
  return comment.user?.name || comment.userName || "Unknown";
};

// Helper to get initials from name
const getInitials = (name: string) => {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

// Generate a consistent color from a string
const getAvatarColor = (name: string) => {
  const colors = [
    "bg-rose-500", "bg-pink-500", "bg-fuchsia-500", "bg-purple-500",
    "bg-violet-500", "bg-indigo-500", "bg-blue-500", "bg-sky-500",
    "bg-cyan-500", "bg-teal-500", "bg-emerald-500", "bg-green-500",
    "bg-amber-500", "bg-orange-500", "bg-red-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export function CommentsSidebar({ articleId, onClose }: CommentsSidebarProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const { user } = useUserStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await api.get(`comments/${articleId}`);
      setComments(res.data.comments || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const postComment = async () => {
    if (!user) {
      toast.error("You need to be logged in to comment");
      return;
    }
    if (!newComment.trim()) return;

    setPosting(true);
    try {
      const res = await api.post(`comments`, { articleId, content: newComment });
      const postedComment = {
        ...res.data.comment,
        user: { id: user.id, name: user.name || user.email },
        userName: user.name || user.email,
      };
      setComments((prev) => [postedComment, ...prev]);
      setNewComment("");
      toast.success("Comment posted!");
      // Scroll to top to see the new comment
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      toast.error("Failed to post comment");
    } finally {
      setPosting(false);
    }
  };

  const updateComment = async (id: string) => {
    if (!editingContent.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      await api.put(`comments/${id}`, { content: editingContent });
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, content: editingContent } : c))
      );
      setEditingCommentId(null);
      setMenuOpenId(null);
      toast.success("Comment updated!");
    } catch (error) {
      toast.error("Failed to update comment");
    }
  };

  const deleteComment = async (id: string) => {
    if (!confirm("Delete this comment?")) return;

    try {
      await api.delete(`comments/${id}`);
      setComments((prev) => prev.filter((c) => c.id !== id));
      setMenuOpenId(null);
      toast.success("Comment deleted!");
    } catch (error) {
      toast.error("Failed to delete comment");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      postComment();
    }
  };

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  // Close sidebar on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-end z-50" onClick={onClose}>
      {/* Sidebar Panel */}
      <div
        className="w-full sm:w-[400px] h-full bg-background shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <h2 className="font-semibold text-base">
              Comments{!loading && ` (${comments.length})`}
            </h2>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>

        {/* Comments List */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
          {loading ? (
            <div className="space-y-4 py-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-muted rounded w-20" />
                    <div className="h-3 bg-muted rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="mx-auto text-muted-foreground/30 mb-3" size={40} />
              <p className="text-sm text-muted-foreground">
                No comments yet.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Be the first to share your thoughts!
              </p>
            </div>
          ) : (
            comments.map((comment) => {
              const displayName = getDisplayName(comment);
              const isOwner = user?.id === comment.userId || user?.id === comment.user?.id;

              return (
                <div
                  key={comment.id}
                  className="group flex gap-3 py-3 hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors"
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold ${getAvatarColor(displayName)}`}>
                    {getInitials(displayName)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {editingCommentId === comment.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") updateComment(comment.id);
                            if (e.key === "Escape") setEditingCommentId(null);
                          }}
                          autoFocus
                          className="w-full bg-transparent border-b border-primary outline-none py-1 text-sm"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateComment(comment.id)}
                            className="text-xs text-primary font-semibold hover:opacity-70"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingCommentId(null)}
                            className="text-xs text-muted-foreground hover:text-foreground"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm leading-relaxed">
                          <span className="font-semibold text-foreground mr-1.5">
                            {displayName}
                          </span>
                          <span className="text-foreground/80">
                            {comment.content}
                          </span>
                        </p>
                        <span className="text-[11px] text-muted-foreground mt-1 inline-block">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: false,
                          })}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  {isOwner && editingCommentId !== comment.id && (
                    <div className="relative flex-shrink-0">
                      <button
                        onClick={() => setMenuOpenId(menuOpenId === comment.id ? null : comment.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-muted transition-all"
                      >
                        <MoreHorizontal size={14} className="text-muted-foreground" />
                      </button>

                      {menuOpenId === comment.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setMenuOpenId(null)}
                          />
                          <div className="absolute right-0 top-7 z-20 bg-background border rounded-lg shadow-lg py-1 min-w-[110px]">
                            <button
                              onClick={() => {
                                setEditingCommentId(comment.id);
                                setEditingContent(comment.content);
                                setMenuOpenId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                            >
                              <Edit size={13} />
                              Edit
                            </button>
                            <button
                              onClick={() => deleteComment(comment.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-muted transition-colors"
                            >
                              <Trash2 size={13} />
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Comment Input (fixed at bottom) */}
        {user ? (
          <div className="border-t px-4 py-3 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold ${getAvatarColor(user.name || user.email)}`}>
              {getInitials(user.name || user.email)}
            </div>
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent border-b border-border focus:border-primary outline-none py-2 pr-8 text-sm placeholder:text-muted-foreground transition-colors"
              />
              {newComment.trim() && (
                <button
                  onClick={postComment}
                  disabled={posting}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-primary font-semibold hover:opacity-70 transition-opacity disabled:opacity-40"
                >
                  {posting ? (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="border-t px-4 py-3">
            <a href="/login" className="text-sm text-primary font-semibold hover:opacity-70 transition-opacity">
              Log in to comment
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
