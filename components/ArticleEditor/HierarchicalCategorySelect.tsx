"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Category {
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
    parent?: {
        id: string;
        name: string;
        slug: string;
    };
    children?: {
        id: string;
        name: string;
        slug: string;
    }[];
}

interface HierarchicalCategorySelectProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export function HierarchicalCategorySelect({
    value,
    onChange,
    disabled = false
}: HierarchicalCategorySelectProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const res = await api.get("/categories/all-with-hierarchy");
                setCategories(res.data?.categories || []);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    // Group categories by parent
    const parentCategories = categories.filter(c => !c.parentId);
    const childCategories = categories.filter(c => c.parentId);

    return (
        <Select value={value} onValueChange={onChange} disabled={disabled || loading}>
            <SelectTrigger>
                <SelectValue placeholder={loading ? "Loading categories..." : "Select category"} />
            </SelectTrigger>
            <SelectContent>
                {parentCategories.map((parent) => {
                    const children = childCategories.filter(child => child.parentId === parent.id);

                    return (
                        <SelectGroup key={parent.id}>
                            <SelectLabel className="text-xs font-semibold text-muted-foreground">
                                {parent.name}
                            </SelectLabel>
                            <SelectItem value={parent.id}>{parent.name}</SelectItem>
                            {children.map(child => (
                                <SelectItem key={child.id} value={child.id} className="pl-6">
                                    └─ {child.name}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    );
                })}
            </SelectContent>
        </Select>
    );
}
