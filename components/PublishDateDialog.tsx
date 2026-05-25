"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PublishDateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (publishedAt: string | null) => void;
  articleCount?: number;
};

export function PublishDateDialog({
  open,
  onOpenChange,
  onConfirm,
  articleCount = 1,
}: PublishDateDialogProps) {
  const [dateOption, setDateOption] = useState<"original" | "current" | "custom">("original");
  const [customDate, setCustomDate] = useState("");

  const handleConfirm = () => {
    let publishedAt: string | null = null;
    if (dateOption === "original") {
      publishedAt = "original";
    } else if (dateOption === "custom") {
      publishedAt = customDate || null;
    } // if "current", it remains null
    onConfirm(publishedAt);
    setDateOption("original");
    setCustomDate("");
    onOpenChange(false);
  };

  const handleCancel = () => {
    setDateOption("original");
    setCustomDate("");
    onOpenChange(false);
  };

  const now = new Date();
  const formattedNow = now.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {articleCount > 1 ? "Set Publish Date" : "Set Publish Date"}
          </DialogTitle>
          <DialogDescription>
            {articleCount > 1
              ? `${articleCount} articles will be published. Choose the publish date.`
              : "Choose when this article should appear as published."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Option 1: Original Creation Time */}
          <div className="flex items-center gap-3">
            <input
              type="radio"
              id="use-original"
              name="date-option"
              checked={dateOption === "original"}
              onChange={() => setDateOption("original")}
              className="h-4 w-4 accent-primary cursor-pointer"
            />
            <Label htmlFor="use-original" className="cursor-pointer flex-1">
              <span className="text-sm font-medium">Use original creation time</span>
              <p className="text-xs text-muted-foreground">Keep the time when the reporter created the article</p>
            </Label>
          </div>

          {/* Option 2: Current Time */}
          <div className="flex items-center gap-3">
            <input
              type="radio"
              id="use-current"
              name="date-option"
              checked={dateOption === "current"}
              onChange={() => setDateOption("current")}
              className="h-4 w-4 accent-primary cursor-pointer"
            />
            <Label htmlFor="use-current" className="cursor-pointer flex-1">
              <span className="text-sm font-medium">Use current time</span>
              <p className="text-xs text-muted-foreground">{formattedNow}</p>
            </Label>
          </div>

          {/* Option 3: Custom Date */}
          <div className="flex items-center gap-3">
            <input
              type="radio"
              id="use-custom"
              name="date-option"
              checked={dateOption === "custom"}
              onChange={() => setDateOption("custom")}
              className="h-4 w-4 accent-primary cursor-pointer"
            />
            <Label htmlFor="use-custom" className="cursor-pointer flex-1">
              <span className="text-sm font-medium">Set custom date</span>
              <p className="text-xs text-muted-foreground">
                Choose a specific date and time
              </p>
            </Label>
          </div>

          {dateOption === "custom" && (
            <div className="ml-7">
              <Input
                type="datetime-local"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="w-full"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={dateOption === "custom" && !customDate}
          >
            Publish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
