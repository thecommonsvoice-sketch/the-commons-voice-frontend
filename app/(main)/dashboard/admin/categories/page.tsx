"use client";

import { useEffect, useState, ReactNode } from "react";
import RequireAuth from "@/components/RequireAuth";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, ChevronRight, FolderTree } from "lucide-react";
import { toast } from "sonner";

// Type definitions
type Category = {
    id: string;
    name: string;
    slug: string;
    description?: string;
    parentId?: string | null;
    parent?: { id: string; name: string };
    children?: Category[];
    isActive?: boolean;
};

export default function CategoryManagementPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [flatCategories, setFlatCategories] = useState<Category[]>([]); // For parent selection dropdown
    const [loading, setLoading] = useState(true);

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        parentId: "root", // "root" handles null/top-level
    });

    // Fetch Categories
    const fetchCategories = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/categories/all-with-hierarchy");
            // data.categories is the array
            setCategories(data.categories || []);

            // Also flatten the list for the dropdown
            const flatten = (cats: Category[]): Category[] => {
                let res: Category[] = [];
                cats.forEach(c => {
                    res.push(c);
                    if (c.children) res = [...res, ...flatten(c.children)];
                });
                return res;
            };
            // Just fetching all flat might be better from another endpoint but we can derive it
            // Or actually the endpoint returns top-level parents with children nested?
            // Let's assume the endpoint returns specific structure.
            // If the endpoint returns strictly hierarchical, we need to traverse.
            // Actually, for dropdown, we usually want a flattened list.
            // Let's just traverse the hierarchy we got.
            setFlatCategories(flatten(data.categories || []));

        } catch (error) {
            console.error("Failed to fetch categories", error);
            toast.error("Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Handle Form Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const payload: any = {
                name: formData.name,
                description: formData.description,
            };

            // Handle Parent ID
            if (formData.parentId && formData.parentId !== "root") {
                payload.parentId = formData.parentId;
            } else {
                payload.parentId = null; // Explicitly set to null for root
            }

            if (editingCategory) {
                // Update
                await api.put(`/categories/${editingCategory.id}`, payload);
                toast.success("Category updated successfully");
            } else {
                // Create
                await api.post("/categories", payload);
                toast.success("Category created successfully");
            }

            // Reset and Refresh
            setIsDialogOpen(false);
            setEditingCategory(null);
            setFormData({ name: "", description: "", parentId: "root" });
            fetchCategories();

        } catch (error: any) {
            // Handle specific error messages if available
            const msg = error.response?.data?.message || "Operation failed";
            toast.error(msg);
        }
    };

    // Open Edit Dialog
    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || "",
            parentId: category.parentId || "root", // Note: The fetched hierarchy object might nesting children, so access parentId directly if available. If endpoint returns hierarchical objects, `parentId` field might be present on them. If not, we rely on structure.
            // Based on controller, it includes `parentId` in the object.
        });
        setIsDialogOpen(true);
    };

    // Handle Delete
    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will deactivate the category.")) return;
        try {
            await api.delete(`/categories/${id}`);
            toast.success("Category deleted");
            fetchCategories();
        } catch (error) {
            toast.error("Failed to delete category");
        }
    };

    // Recursive Render Row
    const renderCategoryRow = (category: Category, level: number = 0): ReactNode => {
        return (
            <>
                <TableRow key={category.id}>
                    <TableCell>
                        <div className="flex items-center" style={{ paddingLeft: `${level * 24}px` }}>
                            {level > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground mr-2" />}
                            <span className={level === 0 ? "font-medium" : ""}>{category.name}</span>
                        </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden sm:table-cell">{category.slug}</TableCell>
                    <TableCell className="hidden md:table-cell">{category.description}</TableCell>
                    <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(category.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </TableCell>
                </TableRow>
                {category.children && category.children.map(child => renderCategoryRow(child, level + 1))}
            </>
        );
    };

    return (
        <RequireAuth allowedRoles={["ADMIN"]}>
            <div className="container mx-auto px-4 py-8 space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <FolderTree className="h-8 w-8" />
                            Category Management
                        </h1>
                        <p className="text-muted-foreground">Create and manage content categories and subcategories</p>
                    </div>

                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) {
                            setEditingCategory(null);
                            setFormData({ name: "", description: "", parentId: "root" });
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Add Category
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingCategory ? "Edit Category" : "Create Category"}</DialogTitle>
                                <DialogDescription>
                                    {editingCategory ? "Update category details" : "Add a new category to the platform"}
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="e.g. Technology"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="slug">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Optional description..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="parent">Parent Category</Label>
                                    <Select
                                        value={formData.parentId}
                                        onValueChange={(val) => setFormData({ ...formData, parentId: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Parent" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="root">None (Top Level)</SelectItem>
                                            {flatCategories
                                                .filter(c => c.id !== editingCategory?.id) // Prevent self-parenting loop
                                                .map(cat => (
                                                    <SelectItem key={cat.id} value={cat.id}>
                                                        {cat.name}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <DialogFooter>
                                    <Button type="submit" disabled={loading}>
                                        {editingCategory ? "Update" : "Create"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[300px]">Name</TableHead>
                                    <TableHead className="hidden sm:table-cell">Slug</TableHead>
                                    <TableHead className="hidden md:table-cell">Description</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8">Loading...</TableCell>
                                    </TableRow>
                                ) : categories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8">No categories found</TableCell>
                                    </TableRow>
                                ) : (
                                    categories.map(cat => renderCategoryRow(cat))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </RequireAuth>
    );
}
