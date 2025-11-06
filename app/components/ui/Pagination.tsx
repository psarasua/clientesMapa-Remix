interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  total,
  itemsPerPage,
  hasNext,
  hasPrev,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, total);

  return (
    <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
      <div className="text-sm text-gray-700">
        Mostrando {startItem} a {endItem} de {total} resultados
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrev}
          className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        
        <span className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md">
          {currentPage}
        </span>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNext}
          className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white disabled:cursor-not-allowed"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}