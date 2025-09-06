"use client"
import { useEffect, useState } from "react";
import { X, Edit, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
// import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useUserStore } from "@/store/useUserStore";

interface Comment {
  id: string;
  userId: string;
  content: string;
  userName: string;
  createdAt: string;
}

interface CommentsSidebarProps {
  articleId: string;
  onClose: () => void;
}

export function CommentsSidebar({ articleId, onClose }: CommentsSidebarProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const { user } = useUserStore();

  const fetchComments = async () => {
    try {
      const res = await api.get(`comments/${articleId}`);
      setComments(res.data.comments || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const postComment = async () => {
    if (!user) {
      toast.error("You need to be logged in to comment");
      return;
    }
    if (!newComment.trim()) return;

    try {
      const res = await api.post(`comments`, { articleId, content: newComment });
      setComments((prev) => [res.data.comment, ...prev]);
      setNewComment("");
      toast.success("Comment added");
    } catch (error) {
      toast.error("Failed to post comment");
    }
  };

  const updateComment = async (id: string) => {
    try {
      await api.put(`comments/${id}`, { content: editingContent });
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, content: editingContent } : c))
      );
      setEditingCommentId(null);
      toast.success("Comment updated");
    } catch (error) {
      toast.error("Failed to update comment");
    }
  };

  const deleteComment = async (id: string) => {
    try {
      await api.delete(`comments/${id}`);
      setComments((prev) => prev.filter((c) => c.id !== id));
      toast.success("Comment deleted");
    } catch (error) {
      toast.error("Failed to delete comment");
      console.error("Delete comment error:", error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-end z-50">
      <div className="w-full sm:w-96 h-full bg-white dark:bg-gray-900 shadow-lg p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Comments</h2>
          <Button variant="ghost" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3">
          {comments.length === 0 ? (
            <p className="text-sm text-gray-500">No comments yet.</p>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="p-3 rounded-md border dark:border-gray-700"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{comment.userName}</p>
                    {editingCommentId === comment.id ? (
                      <Textarea
                        className="mt-2"
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                      />
                    ) : (
                      <p className="text-sm mt-1">{comment.content}</p>
                    )}
                  </div>
                  {user?.id === comment.userId && (
                    <div className="flex gap-2">
                      {editingCommentId === comment.id ? (
                        <Button
                          size="sm"
                          onClick={() => updateComment(comment.id)}
                        >
                          Save
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingCommentId(comment.id);
                            setEditingContent(comment.content);
                          }}
                        >
                          <Edit size={16} />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteComment(comment.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {user && (
          <div className="mt-4">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <Button className="mt-2 w-full" onClick={postComment}>
              Post Comment
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
