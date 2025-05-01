
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

/**
 * Pagination utility: Generates an array of page numbers for pagination
 */
export const generatePagination = (currentPage: number, totalPages: number) => {
  // If we have 7 or fewer pages, show all pages
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  
  // If current page is among the first 3 pages
  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }
  
  // If current page is among the last 3 pages
  if (currentPage >= totalPages - 2) {
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  
  // If current page is in the middle
  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
};
