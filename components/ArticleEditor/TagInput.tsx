"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

export function TagInput({
  tags,
  onChange,
  placeholder = "Add tags and press Enter",
  maxTags = 10,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Common tags for quick selection
  const commonTags = [
    "breaking",
    "opinion",
    "analysis",
    "feature",
    "interview",
    "lifestyle",
    "politics",
    "business",
    "technology",
    "health",
    "sports",
    "entertainment",
    "world",
    "national",
    "local",
  ];

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (
      trimmedTag &&
      !tags.includes(trimmedTag) &&
      tags.length < maxTags
    ) {
      onChange([...tags, trimmedTag]);
      setInputValue("");
      setSuggestions([]);
    }
  };

  const handleRemoveTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      handleRemoveTag(tags[tags.length - 1]);
    }
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    // Show suggestions based on input
    if (value.length > 0) {
      const filtered = commonTags.filter(
        (tag) =>
          tag.includes(value.toLowerCase()) &&
          !tags.includes(tag)
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="border rounded-lg p-3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
        {/* Tags Display */}
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 rounded-full text-sm font-medium"
            >
              #{tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-indigo-900 dark:hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>

        {/* Input */}
        <div className="relative">
          <Input
            type="text"
            placeholder={tags.length >= maxTags ? `Max ${maxTags} tags reached` : placeholder}
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={tags.length >= maxTags}
            className="bg-white dark:bg-gray-700 border-0 p-0 focus:ring-0 placeholder-gray-400 dark:placeholder-gray-500"
          />

          {/* Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg shadow-lg z-10">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleAddTag(suggestion)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-500 text-sm text-gray-700 dark:text-gray-200 transition-colors first:rounded-t-lg last:rounded-b-lg"
                >
                  #{suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Helper Text */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {tags.length}/{maxTags} tags • Press Enter to add, Backspace to remove
      </p>
    </div>
  );
}
