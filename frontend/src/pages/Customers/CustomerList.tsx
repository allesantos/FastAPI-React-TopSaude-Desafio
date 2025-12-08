import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Eye, Edit, Trash2, Users } from 'lucide-react';
import { Table, ColumnDef } from '../../components/common/Table';
import { useDebounce } from '../../hooks/useDebounce';
import { usePagination } from '../../hooks/usePagination';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../contexts/ToastContext';
import CustomerForm from '../../components/forms/CustomerForm';
import customerService from '../../services/customerService';
import { formatDocument, formatDate } from '../../services/api';
import type { Customer, CustomerListResponse } from '../../types';
import { PAGINATION } from '../../constants';

const CustomerList: React.FC = () => {
  // Estados
  const [customers, setCustomers] = useState<CustomerListResponse | null>(null);
  const [searchName, setSearchName] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchDocument, setSearchDocument] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const { page, pageSize, goToPage } = usePagination(PAGINATION.DEFAULT_PAGE, PAGINATION.DEFAULT_PAGE_SIZE);
  const { loading, error, execute } = useApi<CustomerListResponse>();
  const toast = useToast();

  const debouncedName = useDebounce(searchName, 500);
  const debouncedEmail = useDebounce(searchEmail, 500);
  const debouncedDocument = useDebounce(searchDocument, 500);

  // Buscar clientes
  const fetchCustomers = async () => {
    const params: any = {
      page,
      page_size: pageSize,
      order_by: sortBy,
      order_direction: sortOrder,
    };

    if (debouncedName) params.name = debouncedName;
    if (debouncedEmail) params.email = debouncedEmail;
    if (debouncedDocument) params.document = debouncedDocument.replace(/\D/g, '');

    const result = await execute(() => customerService.listCustomers(params));
    if (result) setCustomers(result);
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, debouncedName, debouncedEmail, debouncedDocument, sortBy, sortOrder]);

  // Handlers
  const handleCreate = () => {
    setSelectedCustomer(null);
    setIsFormOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  };

  const handleDelete = async (customer: Customer) => {
    const confirmed = window.confirm(`Tem certeza que deseja deletar o cliente "${customer.name}"?`);
    if (!confirmed) return;

    try {
      await customerService.deleteCustomer(customer.id);
      toast.success('Cliente deletado!', `${customer.name} foi removido com sucesso.`);
      fetchCustomers();
    } catch (err: any) {
      toast.error('Erro ao deletar', err.message || 'Tente novamente.');
    }
  };

  const clearFilters = () => {
    setSearchName('');
    setSearchEmail('');
    setSearchDocument('');
    goToPage(1);
  };

  // Colunas
  const columns: ColumnDef<Customer>[] = [
    {
      key: 'name',
      header: 'Nome',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-gray-900">{value}</span>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      render: (value) => (
        <span className="text-gray-600">{value}</span>
      ),
    },
    {
      key: 'document',
      header: 'CPF/CNPJ',
      sortable: true,
      render: (value) => (
        <span className="font-mono text-sm text-gray-700">
          {formatDocument(value)}
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
  const renderActions = (customer: Customer) => (
    <>
      <button
        onClick={() => toast.info('Em breve!', 'Visualização detalhada do cliente.')}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={`Visualizar ${customer.name}`}
      >
        <Eye className="w-4 h-4" aria-hidden="true" />
      </button>
      <button
        onClick={() => handleEdit(customer)}
        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500"
        aria-label={`Editar ${customer.name}`}
      >
        <Edit className="w-4 h-4" aria-hidden="true" />
      </button>
      <button
        onClick={() => handleDelete(customer)}
        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
        aria-label={`Deletar ${customer.name}`}
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
              <Users className="w-8 h-8 text-purple-600" aria-hidden="true" />
              <span>Clientes</span>
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie os clientes da farmácia
            </p>
          </div>

          <button
            onClick={handleCreate}
            className="flex items-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            aria-label="Criar novo cliente"
          >
            <Plus className="w-5 h-5" aria-hidden="true" />
            <span>Novo Cliente</span>
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex-1">
              <label htmlFor="search-email" className="sr-only">Buscar por email</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
                <input
                  id="search-email"
                  type="text"
                  placeholder="Buscar por email..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex-1">
              <label htmlFor="search-document" className="sr-only">Buscar por CPF/CNPJ</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
                <input
                  id="search-document"
                  type="text"
                  placeholder="Buscar por CPF/CNPJ..."
                  value={searchDocument}
                  onChange={(e) => setSearchDocument(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              aria-expanded={showFilters}
              aria-controls="advanced-filters"
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <Filter className="w-4 h-4" aria-hidden="true" />
              <span>Filtros</span>
            </button>

            {(searchName || searchEmail || searchDocument) && (
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="created_at">Data de cadastro</option>
                    <option value="name">Nome</option>
                    <option value="email">Email</option>
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
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
            <p className="font-medium">❌ Erro ao carregar clientes</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Estatísticas */}
        {customers && !loading && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-3" role="status" aria-live="polite">
            <p className="text-purple-800">
              <span className="font-bold">{customers.total}</span> clientes encontrados
              {searchName && ` com "${searchName}"`}
              {searchEmail && ` com email "${searchEmail}"`}
            </p>
          </div>
        )}

        {/* Tabela */}
        <Table
          data={customers?.items || []}
          columns={columns}
          loading={loading}
          pagination={
            customers
              ? {
                  page: customers.page,
                  pageSize: customers.page_size,
                  total: customers.total,
                  totalPages: customers.total_pages,
                }
              : undefined
          }
          onPageChange={goToPage}
          actions={renderActions}
          emptyMessage="Nenhum cliente encontrado. Que tal cadastrar o primeiro?"
          caption="Listagem de clientes cadastrados"
        />
      </div>

      {/* Modal */}
      <CustomerForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => fetchCustomers()}
        customer={selectedCustomer}
      />
    </div>
  );
};

export default CustomerList;