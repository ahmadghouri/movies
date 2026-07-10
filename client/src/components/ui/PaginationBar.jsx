import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./pagination";

/**
 * Smart pagination bar.
 * Props:
 *   currentPage  – 1-indexed current page
 *   totalPages   – total number of pages
 *   onPageChange – (page: number) => void
 *   className    – optional extra classes
 */
const PaginationBar = ({ currentPage, totalPages, onPageChange, className }) => {
  if (totalPages <= 1) return null;

  /* Build the page number list with ellipsis */
  const pages = [];
  const delta = 1; // pages shown on each side of current

  const range = (start, end) => {
    const r = [];
    for (let i = start; i <= end; i++) r.push(i);
    return r;
  };

  const left  = Math.max(2, currentPage - delta);
  const right = Math.min(totalPages - 1, currentPage + delta);

  pages.push(1);

  if (left > 2)          pages.push("...");
  pages.push(...range(left, right));
  if (right < totalPages - 1) pages.push("...");

  if (totalPages > 1) pages.push(totalPages);

  return (
    <Pagination className={className}>
      <PaginationContent>
        {/* Previous */}
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={currentPage === 1 ? "opacity-40 cursor-not-allowed" : ""}
          />
        </PaginationItem>

        {/* Page numbers */}
        {pages.map((page, idx) =>
          page === "..." ? (
            <PaginationItem key={`ellipsis-${idx}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <PaginationLink
                isActive={page === currentPage}
                onClick={() => onPageChange(page)}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        {/* Next */}
        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={currentPage === totalPages ? "opacity-40 cursor-not-allowed" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationBar;
