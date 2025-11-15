"use client"
import { useEffect, useState } from "react";
import { Send, Edit, Trash2, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useUserStore } from "@/store/useUserStore";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  userId: string;
  content: string;
  userName: string;
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
  const { user } = useUserStore();

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await api.get(`comments/${articleId}`);
      setComments(res.data.comments || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  const postComment = async () => {
    if (!user) {
      toast.error("You need to be logged in to comment");
      return;
    }
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    setPosting(true);
    try {
      const res = await api.post(`comments`, { articleId, content: newComment });
      setComments((prev) => [res.data.comment, ...prev]);
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
      toast.success("Comment updated!");
    } catch (error) {
      toast.error("Failed to update comment");
    }
  };

  const deleteComment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      await api.delete(`comments/${id}`);
      setComments((prev) => prev.filter((c) => c.id !== id));
      toast.success("Comment deleted!");
    } catch (error) {
      toast.error("Failed to delete comment");
    }
  };

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      {user ? (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Add Your Comment
            </label>
            <Textarea
              placeholder="Share your thoughts about this article..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={4}
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 resize-none"
            />
          </div>
          <Button
            onClick={postComment}
            disabled={posting || !newComment.trim()}
            className="w-full flex items-center gap-2"
          >
            <Send size={16} />
            {posting ? "Posting..." : "Post Comment"}
          </Button>
        </div>
      ) : (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
          <p className="text-sm text-blue-900 dark:text-blue-200">
            <a href="/login" className="font-semibold hover:underline">
              Sign in
            </a>{" "}
            to comment on this article.
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin">
              <MessageCircle className="text-gray-400" size={24} />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <MessageCircle className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-sm transition"
            >
              <div className="flex justify-between items-start gap-3 mb-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {comment.userName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>

                {/* Edit/Delete Actions */}
                {user?.id === comment.userId && (
                  <div className="flex gap-1">
                    {editingCommentId === comment.id ? (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => updateComment(comment.id)}
                        className="text-xs"
                      >
                        Save
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingCommentId(comment.id);
                            setEditingContent(comment.content);
                          }}
                          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteComment(comment.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Comment Content */}
              {editingCommentId === comment.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    rows={3}
                    className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 resize-none"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => updateComment(comment.id)}
                      className="text-xs"
                    >
                      Save Changes
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingCommentId(null)}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
