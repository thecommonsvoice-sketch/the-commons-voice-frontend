"use client";

import { useEffect, useState } from "react";
import DOMPurify from "dompurify";

interface SanitizedContentProps {
  html: string;
  className?: string;
}

export function SanitizedContent({ html, className }: SanitizedContentProps) {
  const [sanitizedHtml, setSanitizedHtml] = useState(html);

  useEffect(() => {
    setSanitizedHtml(DOMPurify.sanitize(html));
  }, [html]);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{
        __html: sanitizedHtml,
      }}
    />
  );
}
