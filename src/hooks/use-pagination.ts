
import { useState } from 'react';
import { generatePagination } from '@/lib/utils';

interface UsePaginationProps {
  totalItems: number;
  itemsPerPage: number;
  initialPage?: number;
}

export function usePagination({ totalItems, itemsPerPage, initialPage = 1 }: UsePaginationProps) {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const pageItems = generatePagination(currentPage, totalPages);
  
  const from = (currentPage - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;
  
  const goToNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
  const goToPage = (page: number) => setCurrentPage(page);
  
  return {
    currentPage,
    pageItems,
    totalPages,
    from,
    to,
    goToNextPage,
    goToPreviousPage,
    goToPage
  };
}
