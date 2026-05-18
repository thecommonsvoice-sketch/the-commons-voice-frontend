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
  const [useCurrentDate, setUseCurrentDate] = useState(true);
  const [customDate, setCustomDate] = useState("");

  const handleConfirm = () => {
    const publishedAt = useCurrentDate ? null : customDate || null;
    onConfirm(publishedAt);
    setUseCurrentDate(true);
    setCustomDate("");
    onOpenChange(false);
  };

  const handleCancel = () => {
    setUseCurrentDate(true);
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

  const minDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

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
          <div className="flex items-center gap-3">
            <input
              type="radio"
              id="use-current"
              name="date-option"
              checked={useCurrentDate}
              onChange={() => setUseCurrentDate(true)}
              className="h-4 w-4 accent-primary"
            />
            <Label htmlFor="use-current" className="cursor-pointer flex-1">
              <span className="text-sm font-medium">Use current time</span>
              <p className="text-xs text-muted-foreground">{formattedNow}</p>
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="radio"
              id="use-custom"
              name="date-option"
              checked={!useCurrentDate}
              onChange={() => setUseCurrentDate(false)}
              className="h-4 w-4 accent-primary"
            />
            <Label htmlFor="use-custom" className="cursor-pointer flex-1">
              <span className="text-sm font-medium">Set custom date</span>
              <p className="text-xs text-muted-foreground">
                Choose a specific date and time
              </p>
            </Label>
          </div>

          {!useCurrentDate && (
            <div className="ml-7">
              <Input
                type="datetime-local"
                value={customDate}
                min={minDateTime}
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
            disabled={!useCurrentDate && !customDate}
          >
            Publish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
