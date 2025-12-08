import { useState } from 'react';

interface UsePaginationReturn {
  page: number;
  pageSize: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  canGoNext: (totalPages: number) => boolean;
  canGoPrev: () => boolean;
  reset: () => void;
}

/**
 * Hook para gerenciar estado de paginação
 * 
 * @param initialPage - Página inicial (padrão: 1)
 * @param initialPageSize - Tamanho da página (padrão: 20)
 * @returns Objeto com estado e funções de paginação
 * 
 * @example
 * const { page, pageSize, goToPage, nextPage, prevPage } = usePagination(1, 20);
 */
export function usePagination(
  initialPage: number = 1,
  initialPageSize: number = 20
): UsePaginationReturn {
  const [page, setPage] = useState(initialPage);
  const [pageSize] = useState(initialPageSize);

  const goToPage = (newPage: number) => {
    if (newPage >= 1) {
      setPage(newPage);
    }
  };

  const nextPage = () => setPage((p) => p + 1);
  const prevPage = () => setPage((p) => Math.max(1, p - 1));
  const canGoNext = (totalPages: number) => page < totalPages;
  const canGoPrev = () => page > 1;
  const reset = () => setPage(initialPage);

  return {
    page,
    pageSize,
    goToPage,
    nextPage,
    prevPage,
    canGoNext,
    canGoPrev,
    reset,
  };
}