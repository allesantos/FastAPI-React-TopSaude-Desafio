
import React, { useState, useEffect, useRef } from 'react';
import { Search, User, ChevronDown, Loader2 } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import customerService from '../../services/customerService';
import type { Customer } from '../../types';

// ==========================================
// TIPOS
// ==========================================

interface CustomerAutocompleteProps {
  onSelect: (customer: Customer | null) => void;
  selectedCustomer: Customer | null;
  error?: string;
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================


export const CustomerAutocomplete: React.FC<CustomerAutocompleteProps> = ({
  onSelect,
  selectedCustomer,
  error,
}) => {
  // ==========================================
  // ESTADOS
  // ==========================================

  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce do termo de busca
  const debouncedSearch = useDebounce(searchTerm, 500);

  // ==========================================
  //  BUSCAR CLIENTES
  // ==========================================

  useEffect(() => {
    const fetchCustomers = async () => {
      // Se não tem termo de busca, não busca
      if (!debouncedSearch.trim()) {
        setCustomers([]);
        setIsOpen(false);
        return;
      }

      setLoading(true);
      setSearchError('');

      try {
        // Busca todos clientes (API não tem filtro por nome ainda)
        const response = await customerService.listCustomers({
          page: 1,
          page_size: 100, // Pega bastante para filtrar no frontend
        });

        // Filtra por nome ou email no frontend
        const filtered = response.items.filter((customer) => {
          const searchLower = debouncedSearch.toLowerCase();
          return (
            customer.name.toLowerCase().includes(searchLower) ||
            customer.email.toLowerCase().includes(searchLower) ||
            customer.document.includes(debouncedSearch)
          );
        });

        setCustomers(filtered);
        setIsOpen(true);

      } catch (err: any) {
        setSearchError(err.message || 'Erro ao buscar clientes');
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [debouncedSearch]);

  // ==========================================
  // FECHAR DROPDOWN AO CLICAR FORA
  // ==========================================

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ==========================================
  //  HANDLERS
  // ==========================================

  const handleSelect = (customer: Customer) => {
    onSelect(customer);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelect(null);
    setSearchTerm('');
    setCustomers([]);
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Cliente <span className="text-red-500">*</span>
      </label>

      {/* Cliente Selecionado */}
      {selectedCustomer ? (
        <div className="flex items-center justify-between px-4 py-3 bg-green-50 border-2 border-green-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{selectedCustomer.name}</p>
              <p className="text-sm text-gray-600">{selectedCustomer.email}</p>
            </div>
          </div>
          <button
            onClick={handleClear}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Alterar
          </button>
        </div>
      ) : (
        <>
          {/* Input de Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, email ou documento..."
              className={`
                w-full pl-10 pr-10 py-2.5 border rounded-lg transition-all
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${error ? 'border-red-300' : 'border-gray-300'}
              `}
            />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600 animate-spin" />
            )}
            {!loading && isOpen && (
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            )}
          </div>

          {/* Dropdown de Resultados */}
          {isOpen && !loading && (
            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
              {/* Erro na busca */}
              {searchError && (
                <div className="p-4 text-center text-red-600 text-sm">
                  {searchError}
                </div>
              )}

              {/* Nenhum resultado */}
              {!searchError && customers.length === 0 && (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Nenhum cliente encontrado
                </div>
              )}

              {/* Lista de Clientes */}
              {!searchError && customers.length > 0 && (
                <ul className="py-1">
                  {customers.map((customer) => (
                    <li key={customer.id}>
                      <button
                        onClick={() => handleSelect(customer)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3"
                      >
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {customer.name}
                          </p>
                          <p className="text-sm text-gray-600 truncate">
                            {customer.email}
                          </p>
                          <p className="text-xs text-gray-500">
                            Doc: {customer.document}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}

      {/* Mensagem de Erro */}
      {error && (
        <p className="text-xs text-red-600 mt-1.5">{error}</p>
      )}

      {/* Hint */}
      {!selectedCustomer && !error && (
        <p className="text-xs text-gray-500 mt-1.5">
          Digite ao menos 2 caracteres para buscar
        </p>
      )}
    </div>
  );
};

export default CustomerAutocomplete;