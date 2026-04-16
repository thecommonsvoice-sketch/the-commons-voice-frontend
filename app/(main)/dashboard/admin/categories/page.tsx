"use client";

import { useEffect, useState, ReactNode } from "react";
import RequireAuth from "@/components/RequireAuth";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, ChevronRight, FolderTree, RotateCcw, AlertTriangle } from "lucide-react";
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
    const [inactiveCategories, setInactiveCategories] = useState<Category[]>([]);
    const [flatCategories, setFlatCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [inactiveLoading, setInactiveLoading] = useState(true);

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    // Confirm hard-delete dialog
    const [hardDeleteTarget, setHardDeleteTarget] = useState<Category | null>(null);
    const [isHardDeleteOpen, setIsHardDeleteOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        parentId: "root",
    });

    // Fetch Active Categories
    const fetchCategories = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/categories/all-with-hierarchy");
            setCategories(data.categories || []);

            const flatten = (cats: Category[]): Category[] => {
                let res: Category[] = [];
                cats.forEach(c => {
                    res.push(c);
                    if (c.children) res = [...res, ...flatten(c.children)];
                });
                return res;
            };
            setFlatCategories(flatten(data.categories || []));
        } catch (error) {
            console.error("Failed to fetch categories", error);
            toast.error("Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    // Fetch Inactive Categories
    const fetchInactiveCategories = async () => {
        setInactiveLoading(true);
        try {
            const { data } = await api.get("/categories/inactive");
            setInactiveCategories(data.categories || []);
        } catch (error) {
            console.error("Failed to fetch inactive categories", error);
            toast.error("Failed to load inactive categories");
        } finally {
            setInactiveLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchInactiveCategories();
    }, []);

    // Handle Form Submit (create / edit)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: { name: string; description: string; parentId: string | null } = {
                name: formData.name,
                description: formData.description,
                parentId: formData.parentId && formData.parentId !== "root" ? formData.parentId : null,
            };

            if (editingCategory) {
                await api.put(`/categories/${editingCategory.id}`, payload);
                toast.success("Category updated successfully");
            } else {
                await api.post("/categories", payload);
                toast.success("Category created successfully");
            }

            setIsDialogOpen(false);
            setEditingCategory(null);
            setFormData({ name: "", description: "", parentId: "root" });
            fetchCategories();
        } catch (error: unknown) {
            const msg = (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Operation failed";
            toast.error(msg);
        }
    };

    // Open Edit Dialog
    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || "",
            parentId: category.parentId || "root",
        });
        setIsDialogOpen(true);
    };

    // Soft Delete
    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will deactivate the category (can be restored later).")) return;
        try {
            await api.delete(`/categories/${id}`);
            toast.success("Category deactivated");
            fetchCategories();
            fetchInactiveCategories();
        } catch {
            toast.error("Failed to deactivate category");
        }
    };

    // Restore
    const handleRestore = async (id: string) => {
        try {
            await api.patch(`/categories/${id}/restore`);
            toast.success("Category restored");
            fetchCategories();
            fetchInactiveCategories();
        } catch {
            toast.error("Failed to restore category");
        }
    };

    // Confirm & Hard Delete
    const handleHardDeleteConfirm = async () => {
        if (!hardDeleteTarget) return;
        try {
            await api.delete(`/categories/${hardDeleteTarget.id}/permanent`);
            toast.success("Category permanently deleted");
            setIsHardDeleteOpen(false);
            setHardDeleteTarget(null);
            fetchInactiveCategories();
        } catch (error: unknown) {
            const msg = (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to permanently delete category";
            toast.error(msg);
            setIsHardDeleteOpen(false);
        }
    };

    // Recursive row renderer for active categories
    const renderCategoryRow = (category: Category, level: number = 0): ReactNode => (
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

                    {/* Create Category Dialog */}
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
                                    <Label htmlFor="description">Description</Label>
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
                                                .filter(c => c.id !== editingCategory?.id)
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

                {/* Tabs: Active / Inactive */}
                <Tabs defaultValue="active">
                    <TabsList>
                        <TabsTrigger value="active">
                            Active
                            <Badge variant="secondary" className="ml-2">{categories.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="inactive">
                            Inactive
                            {inactiveCategories.length > 0 && (
                                <Badge variant="destructive" className="ml-2">{inactiveCategories.length}</Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    {/* Active Categories Tab */}
                    <TabsContent value="active">
                        <Card>
                            <CardHeader>
                                <CardTitle>Active Categories</CardTitle>
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
                                                <TableCell colSpan={4} className="text-center py-8">No active categories found</TableCell>
                                            </TableRow>
                                        ) : (
                                            categories.map(cat => renderCategoryRow(cat))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Inactive Categories Tab */}
                    <TabsContent value="inactive">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    Inactive Categories
                                    <span className="text-sm font-normal text-muted-foreground">— deactivated or soft-deleted</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[300px]">Name</TableHead>
                                            <TableHead className="hidden sm:table-cell">Slug</TableHead>
                                            <TableHead className="hidden md:table-cell">Parent</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {inactiveLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-8">Loading...</TableCell>
                                            </TableRow>
                                        ) : inactiveCategories.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                    No inactive categories 🎉
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            inactiveCategories.map(cat => (
                                                <TableRow key={cat.id}>
                                                    <TableCell className="font-medium text-muted-foreground">{cat.name}</TableCell>
                                                    <TableCell className="hidden sm:table-cell text-muted-foreground">{cat.slug}</TableCell>
                                                    <TableCell className="hidden md:table-cell text-muted-foreground">
                                                        {cat.parent?.name || "—"}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                                                                onClick={() => handleRestore(cat.id)}
                                                            >
                                                                <RotateCcw className="h-3 w-3 mr-1" /> Restore
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setHardDeleteTarget(cat);
                                                                    setIsHardDeleteOpen(true);
                                                                }}
                                                            >
                                                                <Trash2 className="h-3 w-3 mr-1" /> Delete Forever
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Hard Delete Confirmation Dialog */}
                <Dialog open={isHardDeleteOpen} onOpenChange={setIsHardDeleteOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-red-600">
                                <AlertTriangle className="h-5 w-5" />
                                Permanently Delete Category
                            </DialogTitle>
                            <DialogDescription>
                                This will <strong>permanently</strong> remove &quot;<strong>{hardDeleteTarget?.name}</strong>&quot; from the database.
                                This action <strong>cannot be undone</strong>. If any articles are assigned to this category, the deletion will be blocked.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={() => setIsHardDeleteOpen(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleHardDeleteConfirm}>
                                Yes, Delete Forever
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </RequireAuth>
    );
}
