"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
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
  placeholder = "Add tags separated by comma or press Enter",
  maxTags = 25,
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
    "defence",
    "economy",
    "environment",
  ];

  // Parses single or comma-separated string of tags and adds them
  const addTags = (rawInput: string) => {
    if (!rawInput.trim()) return;

    // Split by comma or newline
    const incomingTags = rawInput
      .split(/[,\n]+/)
      .map((t) => t.trim().replace(/^#+/, "").toLowerCase())
      .filter((t) => t.length > 0);

    if (incomingTags.length === 0) return;

    const newTags = [...tags];
    for (const tag of incomingTags) {
      if (!newTags.includes(tag) && newTags.length < maxTags) {
        newTags.push(tag);
      }
    }

    onChange(newTags);
    setInputValue("");
    setSuggestions([]);
  };

  const handleRemoveTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (inputValue.trim()) {
        addTags(inputValue);
      }
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      handleRemoveTag(tags[tags.length - 1]);
    }
  };

  const handleInputChange = (value: string) => {
    // If the input contains a comma (typed or pasted), add immediately
    if (value.includes(",")) {
      addTags(value);
      return;
    }

    setInputValue(value);

    // Show suggestions based on input
    const clean = value.trim().replace(/^#+/, "").toLowerCase();
    if (clean.length > 0) {
      const filtered = commonTags.filter(
        (tag) => tag.includes(clean) && !tags.includes(tag)
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    if (text.includes(",") || text.includes("\n")) {
      e.preventDefault();
      addTags(text);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addTags(inputValue);
    }
    setSuggestions([]);
  };

  return (
    <div className="space-y-2">
      <div className="border rounded-lg p-3 bg-white border-gray-300">
        {/* Tags Display */}
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
            >
              #{tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-indigo-900 transition-colors cursor-pointer"
                title="Remove tag"
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
            onPaste={handlePaste}
            onBlur={handleBlur}
            disabled={tags.length >= maxTags}
            className="bg-white border-0 p-0 focus:ring-0 placeholder-gray-400"
          />

          {/* Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => addTags(suggestion)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm text-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg cursor-pointer"
                >
                  #{suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Helper Text */}
      <p className="text-xs text-gray-500">
        {tags.length}/{maxTags} tags • Type or paste comma-separated tags (e.g. <code>politics, climate, world</code>) or press Enter
      </p>
    </div>
  );
}
