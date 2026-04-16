"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CategoryCreateDialogProps {
  onCategoryCreated: (categoryId: string, categoryName: string) => void;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export function CategoryCreateDialog({ onCategoryCreated }: CategoryCreateDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string>("");

  // Fetch parent categories when dialog opens
  useEffect(() => {
    if (open) {
      const fetchParentCategories = async () => {
        try {
          const res = await api.get("/categories");
          setParentCategories(res.data?.categories || []);
        } catch (error) {
          console.error("Failed to fetch categories:", error);
        }
      };
      fetchParentCategories();
    }
  }, [open]);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/categories", {
        name: name.trim(),
        description: description.trim() || undefined,
        isActive: true,
        parentId: selectedParentId || undefined,
      });

      const newCategory = res.data?.category;
      if (newCategory) {
        toast.success(`Category "${newCategory.name}" created!`);
        onCategoryCreated(newCategory.id, newCategory.name);
        setName("");
        setDescription("");
        setSelectedParentId("");
        setOpen(false);
      }
    } catch (error) {
      console.error("Failed to create category:", error);
      toast.error("Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full mt-2">
          + Create New Category
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
          <DialogDescription>
            Add a new category for your article
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium mb-2">Category Name *</label>
            <Input
              placeholder="e.g., Technology, Health, Sports"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Parent Category (optional)</label>
            <Select value={selectedParentId} onValueChange={setSelectedParentId} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="None (create as main category)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None (main category)</SelectItem>
                {parentCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Select a parent to create this as a subcategory
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description (optional)</label>
            <Textarea
              placeholder="Brief description of this category"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={loading}
            />
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              setName("");
              setDescription("");
              setSelectedParentId("");
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={loading || !name.trim()}
          >
            {loading ? "Creating..." : "Create Category"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
