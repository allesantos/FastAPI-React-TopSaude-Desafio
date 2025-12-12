
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Users, Eye, Edit, Trash2, Mail, FileText } from 'lucide-react';
import { Table, ColumnDef } from '../../components/common/Table';
import { useDebounce } from '../../hooks/useDebounce';
import { usePagination } from '../../hooks/usePagination';
import { useApi } from '../../hooks/useApi';
import customerService from '../../services/customerService';
import { formatDocument, formatDate } from '../../services/api';
import type { Customer, CustomerListResponse } from '../../types';
import { PAGINATION } from '../../constants';

/**
 * Página de Listagem de Clientes
 */
const CustomerList: React.FC = () => {
  // ==========================================
  // 🎯 ESTADOS
  // ==========================================

  // Dados da listagem
  const [customers, setCustomers] = useState<CustomerListResponse | null>(null);
  
  // Filtros
  const [searchName, setSearchName] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchDocument, setSearchDocument] = useState('');
  
  // Paginação
  const { page, pageSize, goToPage } = usePagination(
    PAGINATION.DEFAULT_PAGE,
    PAGINATION.DEFAULT_PAGE_SIZE
  );
  
  // API Hook
  const { loading, error, execute } = useApi<CustomerListResponse>();
  
  // Debounce para buscas (500ms)
  const debouncedName = useDebounce(searchName, 500);
  const debouncedEmail = useDebounce(searchEmail, 500);
  const debouncedDocument = useDebounce(searchDocument, 500);

// ==========================================
  // BUSCAR CLIENTES (ENVIA FILTROS AO BACKEND)
  // ==========================================

  // Envolver a função em useCallback
  const fetchCustomers = useCallback(async () => {
    
    // Definir params, incluindo os filtros de busca
    const params: any = {
      page,
      page_size: pageSize,
      
      // ENVIAR OS VALORES DEBOUNCEADOS PARA O BACKEND
      name: debouncedName || undefined,
      email: debouncedEmail || undefined,
      document: debouncedDocument?.replace(/\D/g, '') || undefined,
    };

    // Executar a chamada à API com os novos parâmetros
    const result = await execute(() => customerService.listCustomers(params));
    
    if (result) {
      // Apenas salvar o resultado 
      setCustomers(result);
    }
  }, [
    execute, 
    page, 
    pageSize, 
    debouncedName, 
    debouncedEmail, 
    debouncedDocument
  ]);
    
  // ==========================================
  // 📡 EFFECTS
  // ==========================================

  useEffect(() => {
    fetchCustomers();
  }, [page, debouncedName, debouncedEmail, debouncedDocument]);

  // ==========================================
  // DELETAR CLIENTE
  // ==========================================

  const handleDelete = async (customer: Customer) => {
    const confirmed = window.confirm(
      `Tem certeza que deseja deletar o cliente "${customer.name}"?\n\nEmail: ${customer.email}`
    );

    if (!confirmed) return;

    try {
      await customerService.deleteCustomer(customer.id);
      alert('✅ Cliente deletado com sucesso!');
      fetchCustomers(); // Recarrega a lista
    } catch (err: any) {
      alert(`❌ Erro ao deletar: ${err.message}`);
    }
  };

  // ==========================================
  // 🧹 LIMPAR FILTROS
  // ==========================================

  

  // ==========================================
  // DEFINIÇÃO DAS COLUNAS
  // ==========================================

  const columns: ColumnDef<Customer>[] = [
    {
      key: 'name',
      header: 'Nome',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-sm">
              {value.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="font-medium text-gray-900">{value}</span>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Mail className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700">{value}</span>
        </div>
      ),
    },
    {
      key: 'document',
      header: 'Documento',
      render: (value) => (
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-gray-400" />
          <span className="font-mono text-sm text-gray-700">
            {formatDocument(value)}
          </span>
        </div>
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

  // ==========================================
  //  AÇÕES POR CLIENTE
  // ==========================================

  const renderActions = (customer: Customer) => (
    <>
      <button
        onClick={() => alert(`🔍 Ver detalhes do cliente #${customer.id}`)}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        title="Visualizar"
      >
        <Eye className="w-4 h-4" />
      </button>
      <button
        onClick={() => alert(`✏️ Editar cliente #${customer.id} (Parte 14)`)}
        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
        title="Editar"
      >
        <Edit className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleDelete(customer)}
        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        title="Deletar"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </>
  );

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
              <Users className="w-8 h-8 text-purple-600" />
              <span>Clientes</span>
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie os clientes cadastrados no sistema
            </p>
          </div>
          
          <button
            onClick={() => alert('➕ Criar novo cliente (Parte 14)')}
            className="flex items-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span>Novo Cliente</span>
          </button>
        </div>

        {/* Barra de Filtros */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Busca por Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar por Nome
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Digite o nome..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                />
              </div>
            </div>

            {/* Busca por Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar por Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="Digite o email..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                />
              </div>
            </div>

            {/* Busca por Documento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar por CPF/CNPJ
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Digite o documento..."
                  value={searchDocument}
                  onChange={(e) => setSearchDocument(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            <p className="font-medium">❌ Erro ao carregar clientes</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Estatísticas Rápidas */}
        {customers && !loading && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-3">
            <p className="text-purple-800">
              <span className="font-bold">{customers.total}</span> clientes encontrados
              {searchName && ` com nome "${searchName}"`}
              {searchEmail && ` com email "${searchEmail}"`}
              {searchDocument && ` com documento "${searchDocument}"`}
            </p>
          </div>
        )}

        {/* Aviso sobre Filtros */}
        {(searchName || searchEmail || searchDocument) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
            <p className="text-yellow-800 text-sm">
              ℹ️ <strong>Nota:</strong> Filtros estão sendo aplicados localmente. 
              Para melhor performance, considere implementar filtros no backend.
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
        />
      </div>
    </div>
  );
};

export default CustomerList;