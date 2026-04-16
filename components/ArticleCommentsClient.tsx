"use client"
import { useEffect, useState } from "react";
import { Send, Edit, Trash2, MessageCircle, MoreHorizontal, X } from "lucide-react";
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

interface ArticleCommentsClientProps {
  articleId: string;
}

export function ArticleCommentsClient({ articleId }: ArticleCommentsClientProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const { user } = useUserStore();

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
      // Add user info to the newly created comment for immediate display
      const postedComment = {
        ...res.data.comment,
        user: { id: user.id, name: user.name || user.email },
        userName: user.name || user.email,
      };
      setComments((prev) => [postedComment, ...prev]);
      setNewComment("");
      toast.success("Comment posted!");
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

  return (
    <div className="space-y-5">
      {/* Comment Count Header */}
      <div className="flex items-center gap-2 pb-3 border-b">
        <MessageCircle className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm font-semibold text-muted-foreground">
          {loading ? "Loading..." : `${comments.length} comment${comments.length !== 1 ? "s" : ""}`}
        </span>
      </div>

      {/* Instagram-style Comment Input */}
      {user ? (
        <div className="flex items-center gap-3">
          {/* Current user avatar */}
          <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold ${getAvatarColor(user.name || user.email)}`}>
            {getInitials(user.name || user.email)}
          </div>
          {/* Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary outline-none py-2 pr-10 text-sm placeholder:text-muted-foreground transition-colors"
            />
            {newComment.trim() && (
              <button
                onClick={postComment}
                disabled={posting}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-primary font-semibold text-sm hover:opacity-70 transition-opacity disabled:opacity-40"
              >
                {posting ? (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center">
            <MessageCircle size={14} className="text-gray-400" />
          </div>
          <a href="/login" className="text-sm text-primary font-semibold hover:opacity-70 transition-opacity">
            Log in to comment
          </a>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-1">
        {loading ? (
          <div className="space-y-4 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-10">
            <MessageCircle className="mx-auto text-gray-300 dark:text-gray-600 mb-3" size={40} />
            <p className="text-sm text-muted-foreground">
              No comments yet. Be the first to share your thoughts!
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
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold ${getAvatarColor(displayName)}`}>
                  {getInitials(displayName)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {editingCommentId === comment.id ? (
                    /* Edit Mode */
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
                    /* Display Mode */
                    <>
                      <p className="text-sm leading-relaxed">
                        <span className="font-semibold text-foreground mr-1.5">
                          {displayName}
                        </span>
                        <span className="text-foreground/80">
                          {comment.content}
                        </span>
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[11px] text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: false,
                          })}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Actions Menu (only for owner) */}
                {isOwner && editingCommentId !== comment.id && (
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() => setMenuOpenId(menuOpenId === comment.id ? null : comment.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-muted transition-all"
                    >
                      <MoreHorizontal size={16} className="text-muted-foreground" />
                    </button>

                    {menuOpenId === comment.id && (
                      <>
                        {/* Backdrop to close menu */}
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setMenuOpenId(null)}
                        />
                        {/* Dropdown */}
                        <div className="absolute right-0 top-8 z-20 bg-background border rounded-lg shadow-lg py-1 min-w-[120px]">
                          <button
                            onClick={() => {
                              setEditingCommentId(comment.id);
                              setEditingContent(comment.content);
                              setMenuOpenId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                          >
                            <Edit size={14} />
                            Edit
                          </button>
                          <button
                            onClick={() => deleteComment(comment.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-muted transition-colors"
                          >
                            <Trash2 size={14} />
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
    </div>
  );
}
