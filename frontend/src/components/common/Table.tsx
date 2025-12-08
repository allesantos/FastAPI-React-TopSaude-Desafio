
import React from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

/**
 * Definição de coluna da tabela
 */
export interface ColumnDef<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
  className?: string;
}

/**
 * Metadados de paginação
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/**
 * Props do componente Table
 */
interface TableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  pagination?: PaginationMeta;
  onPageChange?: (page: number) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  actions?: (item: T) => React.ReactNode;
  emptyMessage?: string;
  keyExtractor?: (item: T) => string | number;
  caption?: string; // Novo: descrição da tabela para acessibilidade
}

export function Table<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  pagination,
  onPageChange,
  onSort,
  actions,
  emptyMessage = 'Nenhum registro encontrado',
  keyExtractor = (item) => item.id,
  caption,
}: TableProps<T>) {
  
  // ==========================================
  // LOADING STATE (Skeleton)
  // ==========================================
  
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            {caption && (
              <caption className="sr-only">{caption}</caption>
            )}
            <thead className="bg-gray-50">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {col.header}
                  </th>
                ))}
                {actions && (
                  <th 
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Ações
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[1, 2, 3].map((i) => (
                <tr key={i} className="animate-pulse">
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4">
                      <div className="h-8 bg-gray-200 rounded w-24 ml-auto"></div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center py-4" role="status" aria-live="polite">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" aria-hidden="true" />
          <span className="sr-only">Carregando dados da tabela</span>
        </div>
      </div>
    );
  }

  // ==========================================
  // 🔍 EMPTY STATE
  // ==========================================
  
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center" role="status">
        <div className="text-gray-400 mb-4" aria-hidden="true">
          <svg
            className="mx-auto h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  // ==========================================
  // TABELA COM DADOS
  // ==========================================
  
  return (
    <div className="space-y-4">
      {/* Tabela */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Caption para acessibilidade */}
          {caption && (
            <caption className="sr-only">{caption}</caption>
          )}

          {/* Header */}
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    col.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  } ${col.className || ''}`}
                  onClick={() => {
                    if (col.sortable && onSort) {
                      onSort(col.key, 'asc');
                    }
                  }}
                  {...(col.sortable && {
                    role: 'button',
                    tabIndex: 0,
                    'aria-label': `Ordenar por ${col.header}`,
                    onKeyDown: (e) => {
                      if ((e.key === 'Enter' || e.key === ' ') && onSort) {
                        e.preventDefault();
                        onSort(col.key, 'asc');
                      }
                    },
                  })}
                >
                  <div className="flex items-center space-x-1">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                        />
                      </svg>
                    )}
                  </div>
                </th>
              ))}
              {actions && (
                <th 
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Ações
                </th>
              )}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                className="hover:bg-gray-50 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                      col.className || ''
                    }`}
                  >
                    {col.render
                      ? col.render(item[col.key], item)
                      : item[col.key]}
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex justify-end space-x-2" role="group" aria-label="Ações do item">
                      {actions(item)}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {pagination && onPageChange && (
        <nav 
          className="bg-white rounded-lg shadow px-6 py-4"
          role="navigation"
          aria-label="Paginação da tabela"
        >
          <div className="flex items-center justify-between">
            {/* Info */}
            <div className="text-sm text-gray-700" role="status" aria-live="polite">
              Mostrando{' '}
              <span className="font-medium">
                {(pagination.page - 1) * pagination.pageSize + 1}
              </span>{' '}
              até{' '}
              <span className="font-medium">
                {Math.min(
                  pagination.page * pagination.pageSize,
                  pagination.total
                )}
              </span>{' '}
              de <span className="font-medium">{pagination.total}</span>{' '}
              resultados
            </div>

            {/* Controles */}
            <div className="flex items-center space-x-2">
              {/* Botão Anterior */}
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                aria-label="Página anterior"
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex items-center space-x-1">
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                  <span>Anterior</span>
                </div>
              </button>

              {/* Página Atual */}
              <div 
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-md"
                aria-current="page"
              >
                Página {pagination.page} de {pagination.totalPages}
              </div>

              {/* Botão Próximo */}
              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                aria-label="Próxima página"
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex items-center space-x-1">
                  <span>Próximo</span>
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </div>
              </button>
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}

export default Table;