'use client';

import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

const generatePagination = (currentPage: number, totalPages: number) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, '...', totalPages - 1, totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, 2, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
};

export default function ProductsPagination({ currentPage, totalPages, hasNextPage, hasPrevPage, setPage, refetchProducts }) {
  const handlePageChange = async (newPage: number) => {
    if (newPage < 0 || newPage >= totalPages) return;
    await setPage(newPage);
    await refetchProducts();
  };

  const paginationNumbers = generatePagination(currentPage + 1, totalPages);

  return (
    <Pagination className='py-4 mt-8'>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => handlePageChange(currentPage - 1)}
            aria-disabled={!hasPrevPage}
            className={!hasPrevPage ? 'pointer-events-none opacity-50' : 'cursor-pointer rounded-none'}
          />
        </PaginationItem>

        {paginationNumbers.map((pageNumber, index) => (
          <PaginationItem key={`${pageNumber}-${index}`} className='cursor-pointer rounded-none'>
            {pageNumber === '...' ? (
              <PaginationEllipsis className='rounded-none' />
            ) : (
              <PaginationLink onClick={() => handlePageChange(pageNumber - 1)} isActive={currentPage + 1 === pageNumber} className='rounded-none'>
                {pageNumber}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            onClick={() => handlePageChange(currentPage + 1)}
            aria-disabled={!hasNextPage}
            className={!hasNextPage ? 'pointer-events-none opacity-50' : 'cursor-pointer rounded-none'}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
