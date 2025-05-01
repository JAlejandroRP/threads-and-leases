
import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationComponentProps {
  currentPage: number;
  pageItems: (number | string)[];
  totalPages: number;
  onPageChange: (page: number) => void;
  onPrevious: () => void;
  onNext: () => void;
}

const PaginationComponent: React.FC<PaginationComponentProps> = ({
  currentPage,
  pageItems,
  totalPages,
  onPageChange,
  onPrevious,
  onNext
}) => {
  if (totalPages <= 1) return null;
  
  return (
    <Pagination className="mt-6">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            onClick={onPrevious}
            className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
        
        {pageItems.map((page, i) => (
          <PaginationItem key={i}>
            {page === "..." ? (
              <div className="flex h-9 w-9 items-center justify-center text-gray-400">...</div>
            ) : (
              <PaginationLink
                isActive={currentPage === page}
                onClick={() => typeof page === 'number' && onPageChange(page)}
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        
        <PaginationItem>
          <PaginationNext 
            onClick={onNext}
            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationComponent;
