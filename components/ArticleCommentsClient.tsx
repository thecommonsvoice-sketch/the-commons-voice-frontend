"use client"
import { useEffect, useState, useRef } from "react";
import { Send, Edit, MessageCircle, MoreHorizontal, X } from "lucide-react";
import { Button } from "./ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useUserStore } from "@/store/useUserStore";
import { formatDistanceToNow } from "date-fns";



// old one
// interface Comment {
//   id: string;
//   userId: string;
//   content: string;
//   user?: { id: string; name: string };
//   userName?: string;
//   createdAt: string;
// }

// new one
interface Comment {
  id: string;
  userId: string;
  content: string;
  user?: { id: string; name: string };
  userName?: string;
  createdAt: string;
  parentId?: string | null; // Added to support threading
}

interface ArticleCommentsClientProps {
  articleId: string;
}

export function ArticleCommentsClient({ articleId }: ArticleCommentsClientProps) {
  const [comments, setComments] = useState<Comment[]>([]); // All the comments of the article we are fetching by articleId
  const [newComment, setNewComment] = useState(""); // for posting a new comment
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const { user } = useUserStore();

  // State to track who we are replying to
  const [replyingTo, setReplyingTo] = useState<{
    commentId: string;
    displayName: string;
  } | null>(null);

  // State to track collapsed/expanded reply sections
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});

  // Input ref to auto-focus when clicking "Reply"
  const inputRef = useRef<HTMLInputElement>(null);

  // State to track the ID of the comment/reply that was just posted, for scrolling into view
  const [justPostedCommentId, setJustPostedCommentId] = useState<string | null>(null);

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
      if (replyingTo) {
        // Reply mode
        const res = await api.put(`comments/${replyingTo.commentId}/reply`, {
          content: newComment,
        });
        const postedReply = {
          ...res.data.reply,
          user: { id: user.id, name: user.name || user.email },
          userName: user.name || user.email,
        };
        
        // Append comment locally
        setComments((prev) => [...prev, postedReply]);

        // Auto-expand the replies drawer of the root comment in this thread
        let parentComment = comments.find((c) => c.id === replyingTo.commentId);
        let rootId = replyingTo.commentId;
        while (parentComment && parentComment.parentId) {
          const nextParentId = parentComment.parentId;
          rootId = nextParentId;
          parentComment = comments.find((c) => c.id === nextParentId);
        }
        setExpandedReplies((prev) => ({
          ...prev,
          [rootId]: true,
        }));

        // Set the ID of the newly posted reply to trigger smooth scroll
        setJustPostedCommentId(postedReply.id);

        setNewComment("");
        setReplyingTo(null);
        toast.success("Reply posted!");
      } else {
        // Standard comment mode
        const res = await api.post(`comments`, { articleId, content: newComment });
        const postedComment = {
          ...res.data.comment,
          user: { id: user.id, name: user.name || user.email },
          userName: user.name || user.email,
        };
        setComments((prev) => [postedComment, ...prev]);
        // Set the ID of the newly posted comment to trigger smooth scroll
        setJustPostedCommentId(postedComment.id);
        setNewComment("");
        toast.success("Comment posted!");
      }
    } catch (error) {
      console.error("Failed to post comment/reply:", error);
      toast.error(replyingTo ? "Failed to post reply" : "Failed to post comment");
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

  useEffect(() => {
    if (justPostedCommentId) {
      // Use a timeout to ensure the state update and expanded drawer elements are fully rendered in the DOM
      const timer = setTimeout(() => {
        const element = document.getElementById(`comment-${justPostedCommentId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          // Apply a subtle premium highlight glow that fades out
          element.classList.add("bg-primary/10", "dark:bg-primary/20");
          setTimeout(() => {
            element.classList.remove("bg-primary/10", "dark:bg-primary/20");
          }, 1500);
          setJustPostedCommentId(null);
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [justPostedCommentId, comments]);

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

  // Organize comments into root comments
  const rootComments = comments.filter((c) => !c.parentId);

  // Recursive renderer to build a YouTube/Reddit style nested comment section
  const renderCommentNode = (node: Comment, depth: number = 0): React.ReactNode => {
    const displayName = getDisplayName(node);
    const isOwner = user?.id === node.userId || user?.id === node.user?.id;
    
    // Find direct child replies of this comment
    const nodeReplies = comments.filter((c) => c.parentId === node.id);
    const hasReplies = nodeReplies.length > 0;
    const isExpanded = !!expandedReplies[node.id];

    // Sort replies chronologically (oldest to newest)
    const sortedReplies = [...nodeReplies].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return (
      <div
        id={`comment-${node.id}`}
        key={node.id}
        className={`py-2 px-2 rounded-lg transition-all duration-500 hover:bg-muted/10 ${
          depth > 0 
            ? "ml-4 md:ml-6 mt-2 pl-4 border-l-2 border-gray-200 dark:border-gray-800" 
            : "border-b border-gray-100 dark:border-gray-900 pb-3"
        }`}
      >
        <div className="group flex gap-3">
          {/* Avatar - slightly smaller for replies */}
          <div className={`${
            depth > 0 ? "w-6 h-6 text-[10px]" : "w-8 h-8 text-xs"
          } rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold ${getAvatarColor(displayName)}`}>
            {getInitials(displayName)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {editingCommentId === node.id ? (
              /* Edit Mode */
              <div className="space-y-2">
                <input
                  type="text"
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") updateComment(node.id);
                    if (e.key === "Escape") setEditingCommentId(null);
                  }}
                  autoFocus
                  className="w-full bg-transparent border-b border-primary outline-none py-1 text-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => updateComment(node.id)}
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
                    {node.content}
                  </span>
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[11px] text-muted-foreground">
                    {formatDistanceToNow(new Date(node.createdAt), {
                      addSuffix: false,
                    })}
                  </span>
                  {user && !isOwner && (
                    <button
                      onClick={() => {
                        setReplyingTo({
                          commentId: node.id,
                          displayName: displayName,
                        });
                        inputRef.current?.focus();
                      }}
                      className="text-[11px] text-muted-foreground hover:text-foreground font-semibold transition-colors"
                    >
                      Reply
                    </button>
                  )}
                  {isOwner && (
                    <>
                      <button
                        onClick={() => {
                          setEditingCommentId(node.id);
                          setEditingContent(node.content);
                        }}
                        className="text-[11px] text-muted-foreground hover:text-primary font-semibold transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteComment(node.id)}
                        className="text-[11px] text-red-500/80 hover:text-red-600 font-semibold transition-colors"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Toggle replies button for root comment (depth === 0) */}
        {depth === 0 && hasReplies && (
          <button
            onClick={() => {
              setExpandedReplies((prev) => ({
                ...prev,
                [node.id]: !prev[node.id],
              }));
            }}
            className="flex items-center gap-2 mt-2 text-xs font-semibold text-primary hover:opacity-80 transition-opacity pl-11"
          >
            <span className="w-6 border-b border-primary/30" />
            {isExpanded
              ? "Hide replies"
              : `View ${nodeReplies.length} repl${
                  nodeReplies.length === 1 ? "y" : "ies"
                }`}
          </button>
        )}

        {/* Render child replies recursively */}
        {((depth === 0 && isExpanded) || depth > 0) && hasReplies && (
          <div className="space-y-1 mt-2">
            {sortedReplies.map((reply) => renderCommentNode(reply, depth + 1))}
          </div>
        )}
      </div>
    );
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

      {/* Replying-to Banner */}
      {replyingTo && (
        <div className="flex items-center justify-between bg-muted/50 border border-muted px-3 py-2 rounded-lg text-xs text-muted-foreground animate-in fade-in slide-in-from-top-1 duration-200">
          <span className="flex items-center gap-1.5">
            <MessageCircle size={14} className="text-primary/70" />
            Replying to <span className="font-semibold text-foreground">@{replyingTo.displayName}</span>
          </span>
          <button
            onClick={() => setReplyingTo(null)}
            className="hover:text-foreground p-0.5 rounded-full hover:bg-muted transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

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
              ref={inputRef}
              type="text"
              placeholder={replyingTo ? `Reply to @${replyingTo.displayName}...` : "Add a comment..."}
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
          rootComments.map((comment) => renderCommentNode(comment, 0))
        )}
      </div>
    </div>
  );
}
