
import React, { useState, useEffect, useRef } from 'react';
import { Search, Package, Plus, AlertCircle, Loader2 } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import productService from '../../services/productService';
import { formatPrice } from '../../services/api';
import type { Product } from '../../types';

// ==========================================
//  TIPOS
// ==========================================

interface ProductSearchProps {
  onAddProduct: (product: Product, quantity: number) => void;
  addedProductIds: number[]; // IDs dos produtos já adicionados
}

interface ProductWithQuantity extends Product {
  inputQuantity: number;
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export const ProductSearch: React.FC<ProductSearchProps> = ({
  onAddProduct,
  addedProductIds,
}) => {
  // ==========================================
  //  ESTADOS
  // ==========================================

  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<ProductWithQuantity[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce do termo de busca
  const debouncedSearch = useDebounce(searchTerm, 500);

  // ==========================================
  // BUSCAR PRODUTOS
  // ==========================================

  useEffect(() => {
    const fetchProducts = async () => {
      // Se não tem termo de busca, não busca
      if (!debouncedSearch.trim() || debouncedSearch.length < 2) {
        setProducts([]);
        setIsOpen(false);
        return;
      }

      setLoading(true);
      setSearchError('');

      try {
        // Busca produtos ativos
        const response = await productService.listProducts({
          page: 1,
          page_size: 50,
          is_active: true,
        });

        // Filtra por nome ou SKU no frontend
        const filtered = response.items.filter((product) => {
          const searchLower = debouncedSearch.toLowerCase();
          return (
            product.name.toLowerCase().includes(searchLower) ||
            product.sku.toLowerCase().includes(searchLower)
          );
        });

        // Adiciona campo de quantidade para cada produto
        const productsWithQty: ProductWithQuantity[] = filtered.map((p) => ({
          ...p,
          inputQuantity: 1, // Quantidade padrão
        }));

        setProducts(productsWithQty);
        setIsOpen(true);

      } catch (err: any) {
        setSearchError(err.message || 'Erro ao buscar produtos');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
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

  const handleQuantityChange = (productId: number, quantity: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, inputQuantity: Math.max(1, quantity) } : p
      )
    );
  };

  const handleAddProduct = (product: ProductWithQuantity) => {
    // Validação de estoque
    if (product.inputQuantity > product.stock_qty) {
      alert(`Estoque insuficiente! Disponível: ${product.stock_qty}`);
      return;
    }

    // Adiciona o produto
    onAddProduct(product, product.inputQuantity);

    // Limpa a busca
    setSearchTerm('');
    setIsOpen(false);
  };

  // ==========================================
  //  RENDER
  // ==========================================

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Buscar Produtos
      </label>

      {/* Input de Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nome ou SKU..."
          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600 animate-spin" />
        )}
      </div>

      {/* Hint */}
      <p className="text-xs text-gray-500 mt-1.5">
        Digite ao menos 2 caracteres para buscar
      </p>

      {/* Dropdown de Resultados */}
      {isOpen && !loading && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {/* Erro na busca */}
          {searchError && (
            <div className="p-4 text-center text-red-600 text-sm">
              {searchError}
            </div>
          )}

          {/* Nenhum resultado */}
          {!searchError && products.length === 0 && (
            <div className="p-4 text-center text-gray-500 text-sm">
              Nenhum produto encontrado
            </div>
          )}

          {/* Lista de Produtos */}
          {!searchError && products.length > 0 && (
            <ul className="py-1">
              {products.map((product) => {
                const isAdded = addedProductIds.includes(product.id);
                const hasStock = product.stock_qty > 0;

                return (
                  <li
                    key={product.id}
                    className={`px-4 py-3 border-b border-gray-100 last:border-b-0 ${
                      isAdded ? 'bg-gray-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between space-x-3">
                      {/* Info do Produto */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <p className="font-medium text-gray-900 truncate">
                            {product.name}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5">
                          SKU: {product.sku}
                        </p>
                        <div className="flex items-center space-x-3 mt-1">
                          <p className="text-sm font-semibold text-green-600">
                            {formatPrice(product.price)}
                          </p>
                          <p
                            className={`text-xs ${
                              hasStock ? 'text-gray-500' : 'text-red-600'
                            }`}
                          >
                            Estoque: {product.stock_qty}
                          </p>
                        </div>
                      </div>

                      {/* Controles */}
                      <div className="flex items-center space-x-2">
                        {/* Já Adicionado */}
                        {isAdded ? (
                          <div className="text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                            Já adicionado
                          </div>
                        ) : hasStock ? (
                          <>
                            {/* Input de Quantidade */}
                            <input
                              type="number"
                              min="1"
                              max={product.stock_qty}
                              value={product.inputQuantity}
                              onChange={(e) =>
                                handleQuantityChange(
                                  product.id,
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="w-16 px-2 py-1.5 border border-gray-300 rounded text-sm text-center"
                              onClick={(e) => e.stopPropagation()}
                            />

                            {/* Botão Adicionar */}
                            <button
                              onClick={() => handleAddProduct(product)}
                              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
                            >
                              <Plus className="w-4 h-4" />
                              <span className="text-sm">Adicionar</span>
                            </button>
                          </>
                        ) : (
                          // Sem Estoque
                          <div className="flex items-center space-x-1 text-red-600 text-xs bg-red-50 px-3 py-2 rounded-lg">
                            <AlertCircle className="w-4 h-4" />
                            <span>Sem estoque</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductSearch;