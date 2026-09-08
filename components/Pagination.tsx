import Link from "next/link";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  /** Base path like "/articles" for Link-based pagination */
  basePath?: string;
  /** Optional search query to preserve in URL */
  searchQuery?: string;
  /** Additional query parameters to preserve (e.g. category) */
  extraParams?: Record<string, string>;
  /** Optional client-side click handler */
  onPageChange?: (page: number) => void;
  /** Number of page buttons to show around current page */
  siblingCount?: number;
}

function buildPageUrl(
  basePath: string,
  page: number,
  searchQuery?: string,
  extraParams?: Record<string, string>
) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (searchQuery) params.set("q", searchQuery);
  if (extraParams) {
    Object.entries(extraParams).forEach(([key, val]) => {
      if (val) params.set(key, val);
    });
  }
  return `${basePath}?${params.toString()}`;
}

/**
 * Generates an array of page numbers and ellipsis markers.
 * Example: [1, '...', 4, 5, 6, '...', 20]
 */
function generatePageRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number
): (number | "...")[] {
  const totalSlots = siblingCount * 2 + 5;

  if (totalPages <= totalSlots) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(currentPage - siblingCount, 1);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages);

  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftRange = Array.from({ length: siblingCount * 2 + 3 }, (_, i) => i + 1);
    return [...leftRange, "...", totalPages];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightRange = Array.from(
      { length: siblingCount * 2 + 3 },
      (_, i) => totalPages - (siblingCount * 2 + 2) + i
    );
    return [1, "...", ...rightRange];
  }

  const middleRange = Array.from(
    { length: rightSibling - leftSibling + 1 },
    (_, i) => leftSibling + i
  );
  return [1, "...", ...middleRange, "...", totalPages];
}

export function Pagination({
  currentPage,
  totalPages,
  basePath = "/articles",
  searchQuery,
  extraParams,
  onPageChange,
  siblingCount = 1,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = generatePageRange(currentPage, totalPages, siblingCount);
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  const renderButtonOrLink = (
    targetPage: number,
    disabled: boolean,
    ariaLabel: string,
    children: React.ReactNode,
    className: string,
    key?: React.Key
  ) => {
    if (onPageChange) {
      return (
        <button
          key={key}
          type="button"
          onClick={() => !disabled && onPageChange(targetPage)}
          disabled={disabled}
          className={className}
          aria-label={ariaLabel}
        >
          {children}
        </button>
      );
    }

    return (
      <Link
        key={key}
        href={buildPageUrl(basePath, targetPage, searchQuery, extraParams)}
        className={`${className} ${disabled ? "pointer-events-none text-muted-foreground/40 cursor-not-allowed" : ""}`}
        aria-label={ariaLabel}
        tabIndex={disabled ? -1 : undefined}
      >
        {children}
      </Link>
    );
  };

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex flex-col items-center gap-4"
    >
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* First Page */}
        {totalPages > 5 &&
          renderButtonOrLink(
            1,
            isFirstPage,
            "First page",
            <ChevronsLeft className="h-4 w-4" />,
            `inline-flex items-center justify-center h-9 w-9 rounded-lg text-sm font-medium transition-colors ${
              isFirstPage
                ? "text-muted-foreground/40 cursor-not-allowed"
                : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
            }`
          )}

        {/* Previous */}
        {renderButtonOrLink(
          Math.max(1, currentPage - 1),
          isFirstPage,
          "Previous page",
          <>
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Prev</span>
          </>,
          `inline-flex items-center justify-center h-9 px-2.5 rounded-lg text-sm font-medium transition-colors gap-1 ${
            isFirstPage
              ? "text-muted-foreground/40 cursor-not-allowed"
              : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
          }`
        )}

        {/* Page Numbers */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          {pages.map((page, idx) => {
            if (page === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="inline-flex items-center justify-center h-9 w-7 text-sm text-muted-foreground select-none"
                >
                  …
                </span>
              );
            }

            const isActive = page === currentPage;
            const className = `inline-flex items-center justify-center h-9 min-w-[2.25rem] rounded-lg text-sm font-semibold transition-all ${
              isActive
                ? "bg-primary text-primary-foreground shadow-sm pointer-events-none"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`;

            return renderButtonOrLink(
              page,
              isActive,
              `Page ${page}`,
              page,
              className,
              page
            );
          })}
        </div>

        {/* Next */}
        {renderButtonOrLink(
          Math.min(totalPages, currentPage + 1),
          isLastPage,
          "Next page",
          <>
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </>,
          `inline-flex items-center justify-center h-9 px-2.5 rounded-lg text-sm font-medium transition-colors gap-1 ${
            isLastPage
              ? "text-muted-foreground/40 cursor-not-allowed"
              : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
          }`
        )}

        {/* Last Page */}
        {totalPages > 5 &&
          renderButtonOrLink(
            totalPages,
            isLastPage,
            "Last page",
            <ChevronsRight className="h-4 w-4" />,
            `inline-flex items-center justify-center h-9 w-9 rounded-lg text-sm font-medium transition-colors ${
              isLastPage
                ? "text-muted-foreground/40 cursor-not-allowed"
                : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
            }`
          )}
      </div>

      {/* Page info text */}
      <p className="text-xs text-muted-foreground">
        Page <span className="font-semibold text-foreground">{currentPage}</span> of{" "}
        <span className="font-semibold text-foreground">{totalPages}</span>
      </p>
    </nav>
  );
}
