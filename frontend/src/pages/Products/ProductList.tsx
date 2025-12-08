import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Eye, Edit, Trash2, Package } from 'lucide-react';
import { Table, ColumnDef } from '../../components/common/Table';
import { useDebounce } from '../../hooks/useDebounce';
import { usePagination } from '../../hooks/usePagination';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../contexts/ToastContext';
import ProductForm from '../../components/forms/ProductForm';
import productService from '../../services/productService';
import { formatPrice, formatDate } from '../../services/api';
import type { Product, ProductListResponse } from '../../types';
import { PAGINATION } from '../../constants';

const ProductList: React.FC = () => {
  // Estados
  const [products, setProducts] = useState<ProductListResponse | null>(null);
  const [searchName, setSearchName] = useState('');
  const [searchSku, setSearchSku] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { page, pageSize, goToPage } = usePagination(PAGINATION.DEFAULT_PAGE, PAGINATION.DEFAULT_PAGE_SIZE);
  const { loading, error, execute } = useApi<ProductListResponse>();
  const toast = useToast();

  const debouncedName = useDebounce(searchName, 500);
  const debouncedSku = useDebounce(searchSku, 500);

  // Buscar produtos
  const fetchProducts = async () => {
    const params: any = {
      page,
      page_size: pageSize,
      order_by: sortBy,
      order_direction: sortOrder,
    };

    if (filterStatus !== 'all') {
      params.is_active = filterStatus === 'active';
    }
    if (debouncedName) params.name = debouncedName;
    if (debouncedSku) params.sku = debouncedSku;

    const result = await execute(() => productService.listProducts(params));
    if (result) setProducts(result);
  };

  useEffect(() => {
    fetchProducts();
  }, [page, debouncedName, debouncedSku, filterStatus, sortBy, sortOrder]);

  // Handlers
  const handleCreate = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm(`Tem certeza que deseja deletar o produto "${product.name}"?`);
    if (!confirmed) return;

    try {
      await productService.deleteProduct(product.id);
      toast.success('Produto deletado!', `${product.name} foi removido com sucesso.`);
      fetchProducts();
    } catch (err: any) {
      toast.error('Erro ao deletar', err.message || 'Tente novamente.');
    }
  };

  const clearFilters = () => {
    setSearchName('');
    setSearchSku('');
    setFilterStatus('all');
    goToPage(1);
  };

  // Colunas
  const columns: ColumnDef<Product>[] = [
    {
      key: 'sku',
      header: 'SKU',
      sortable: true,
      render: (value) => (
        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
          {value}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Nome',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-gray-900">{value}</span>
      ),
    },
    {
      key: 'price',
      header: 'Preço',
      sortable: true,
      render: (value) => (
        <span className="text-green-600 font-semibold">
          {formatPrice(value)}
        </span>
      ),
    },
    {
      key: 'stock_qty',
      header: 'Estoque',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Package className="w-4 h-4 text-gray-400" aria-hidden="true" />
          <span
            className={`font-medium ${
              value === 0 ? 'text-red-600' : value < 10 ? 'text-yellow-600' : 'text-green-600'
            }`}
          >
            {value} un.
          </span>
        </div>
      ),
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (value) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {value ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Cadastrado em',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-500">{formatDate(value)}</span>
      ),
    },
  ];

  // Ações
  const renderActions = (product: Product) => (
    <>
      <button
        onClick={() => toast.info('Em breve!', 'Visualização detalhada do produto.')}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={`Visualizar ${product.name}`}
      >
        <Eye className="w-4 h-4" aria-hidden="true" />
      </button>
      <button
        onClick={() => handleEdit(product)}
        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500"
        aria-label={`Editar ${product.name}`}
      >
        <Edit className="w-4 h-4" aria-hidden="true" />
      </button>
      <button
        onClick={() => handleDelete(product)}
        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
        aria-label={`Deletar ${product.name}`}
      >
        <Trash2 className="w-4 h-4" aria-hidden="true" />
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
              <Package className="w-8 h-8 text-blue-600" aria-hidden="true" />
              <span>Produtos</span>
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie o catálogo de produtos da farmácia
            </p>
          </div>

          <button
            onClick={handleCreate}
            className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Criar novo produto"
          >
            <Plus className="w-5 h-5" aria-hidden="true" />
            <span>Novo Produto</span>
          </button>
        </header>

        {/* Filtros */}
        <section aria-label="Filtros de busca" className="bg-white rounded-lg shadow p-4 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label htmlFor="search-name" className="sr-only">Buscar por nome</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
                <input
                  id="search-name"
                  type="text"
                  placeholder="Buscar por nome..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex-1">
              <label htmlFor="search-sku" className="sr-only">Buscar por SKU</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
                <input
                  id="search-sku"
                  type="text"
                  placeholder="Buscar por SKU..."
                  value={searchSku}
                  onChange={(e) => setSearchSku(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="w-48">
              <label htmlFor="filter-status" className="sr-only">Filtrar por status</label>
              <select
                id="filter-status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
              >
                <option value="all">Todos os status</option>
                <option value="active">✅ Ativos</option>
                <option value="inactive">❌ Inativos</option>
              </select>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              aria-expanded={showFilters}
              aria-controls="advanced-filters"
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Filter className="w-4 h-4" aria-hidden="true" />
              <span>Filtros</span>
            </button>

            {(searchName || searchSku || filterStatus !== 'all') && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Limpar
              </button>
            )}
          </div>

          {showFilters && (
            <div id="advanced-filters" className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-2">
                    Ordenar por
                  </label>
                  <select
                    id="sort-by"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="created_at">Data de cadastro</option>
                    <option value="name">Nome</option>
                    <option value="price">Preço</option>
                    <option value="stock_qty">Estoque</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="sort-order" className="block text-sm font-medium text-gray-700 mb-2">
                    Direção
                  </label>
                  <select
                    id="sort-order"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="asc">↑ Crescente</option>
                    <option value="desc">↓ Decrescente</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg" role="alert">
            <p className="font-medium">❌ Erro ao carregar produtos</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Estatísticas */}
        {products && !loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3" role="status" aria-live="polite">
            <p className="text-blue-800">
              <span className="font-bold">{products.total}</span> produtos encontrados
              {searchName && ` com "${searchName}"`}
              {searchSku && ` com SKU "${searchSku}"`}
            </p>
          </div>
        )}

        {/* Tabela */}
        <Table
          data={products?.items || []}
          columns={columns}
          loading={loading}
          pagination={
            products
              ? {
                  page: products.page,
                  pageSize: products.page_size,
                  total: products.total,
                  totalPages: products.total_pages,
                }
              : undefined
          }
          onPageChange={goToPage}
          actions={renderActions}
          emptyMessage="Nenhum produto encontrado. Que tal criar o primeiro?"
          caption="Listagem de produtos do catálogo"
        />
      </div>

      {/* Modal */}
      <ProductForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => fetchProducts()}
        product={selectedProduct}
      />
    </div>
  );
};

export default ProductList;