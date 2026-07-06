"use client";

import DOMPurify from "isomorphic-dompurify";

interface SanitizedContentProps {
  html: string;
  className?: string;
}

export function SanitizedContent({ html, className }: SanitizedContentProps) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(html),
      }}
    />
  );
}
