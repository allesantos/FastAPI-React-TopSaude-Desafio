import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ShoppingCart, Eye, Filter, XCircle } from 'lucide-react';
import { Table, ColumnDef } from '../../components/common/Table';
import { usePagination } from '../../hooks/usePagination';
import { useApi } from '../../hooks/useApi';
import orderService from '../../services/orderService';
import customerService from '../../services/customerService';
import { formatPrice, formatDate } from '../../services/api';
import type { Order, OrderListResponse, Customer } from '../../types';
import { PAGINATION, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../constants';

const OrderList: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados
  const [orders, setOrders] = useState<OrderListResponse | null>(null);
  const [customersCache, setCustomersCache] = useState<Record<number, Customer>>({});
  const [filterCustomerId, setFilterCustomerId] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { page, pageSize, goToPage } = usePagination(PAGINATION.DEFAULT_PAGE, PAGINATION.DEFAULT_PAGE_SIZE);
  const { loading, error, execute } = useApi<OrderListResponse>();

  // Buscar pedidos
  const fetchOrders = async () => {
    const params: any = {
      page,
      page_size: pageSize,
    };

    if (filterCustomerId && filterCustomerId !== 'all') {
      params.customer_id = parseInt(filterCustomerId);
    }

    const result = await execute(() => orderService.listOrders(params));
    
    if (result) {
      let filtered = result.items;
      
      if (filterStatus !== 'all') {
        filtered = filtered.filter((o) => o.status === filterStatus);
      }

      setOrders({
        ...result,
        items: filtered,
        total: filtered.length,
      });

      fetchCustomersForOrders(filtered);
    }
  };

  // Buscar clientes
  const fetchCustomersForOrders = async (orderList: Order[]) => {
    const customerIds = [...new Set(orderList.map((o) => o.customer_id))];
    const newCache = { ...customersCache };

    for (const customerId of customerIds) {
      if (!newCache[customerId]) {
        try {
          const customer = await customerService.getCustomerById(customerId);
          newCache[customerId] = customer;
        } catch (err) {
          console.error(`Erro ao buscar cliente ${customerId}:`, err);
        }
      }
    }

    setCustomersCache(newCache);
  };

  useEffect(() => {
    fetchOrders();
  }, [page, filterCustomerId, filterStatus]);

  const clearFilters = () => {
    setFilterCustomerId('');
    setFilterStatus('all');
    goToPage(1);
  };

  const handleViewDetails = (order: Order) => {
    navigate(`/orders/${order.id}`);
  };

  // Estatísticas
  const getOrderStats = () => {
    if (!orders) return null;

    const total = orders.items.reduce((sum, o) => sum + o.total_amount, 0);
    const byStatus = orders.items.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, byStatus };
  };

  const stats = getOrderStats();

  // Colunas
  const columns: ColumnDef<Order>[] = [
    {
      key: 'id',
      header: '#ID',
      render: (value) => (
        <span className="font-mono text-sm font-semibold text-gray-900">
          #{value}
        </span>
      ),
    },
    {
      key: 'customer_id',
      header: 'Cliente',
      render: (value) => {
        const customer = customersCache[value];
        return (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center" aria-hidden="true">
              <span className="text-purple-600 font-semibold text-sm">
                {customer?.name.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {customer?.name || 'Carregando...'}
              </p>
              <p className="text-xs text-gray-500">
                {customer?.email || `ID: ${value}`}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'total_amount',
      header: 'Total',
      sortable: true,
      render: (value) => (
        <span className="text-green-600 font-bold text-lg">
          {formatPrice(value)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <span
          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${ORDER_STATUS_COLORS[value]}`}
        >
          {ORDER_STATUS_LABELS[value] || value}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Data do Pedido',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-600">{formatDate(value)}</span>
      ),
    },
  ];

  // Ações
  const renderActions = (order: Order) => (
    <button
      onClick={() => handleViewDetails(order)}
      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label={`Ver detalhes do pedido ${order.id}`}
    >
      <Eye className="w-4 h-4" aria-hidden="true" />
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
              <ShoppingCart className="w-8 h-8 text-orange-600" aria-hidden="true" />
              <span>Pedidos</span>
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie os pedidos realizados no sistema
            </p>
          </div>
          
          <button
            onClick={() => navigate('/orders/create')}
            className="flex items-center space-x-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            aria-label="Criar novo pedido"
          >
            <Plus className="w-5 h-5" aria-hidden="true" />
            <span>Novo Pedido</span>
          </button>
        </header>

        {/* Estatísticas */}
        {stats && !loading && (
          <section aria-label="Estatísticas de pedidos" className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Total de Pedidos</p>
              <p className="text-2xl font-bold text-gray-900">{orders?.total || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-green-600">{formatPrice(stats.total)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Criados</p>
              <p className="text-2xl font-bold text-blue-600">{stats.byStatus['CREATED'] || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Pagos</p>
              <p className="text-2xl font-bold text-green-600">{stats.byStatus['PAID'] || 0}</p>
            </div>
          </section>
        )}

        {/* Filtros */}
        <section aria-label="Filtros de busca" className="bg-white rounded-lg shadow p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Filter className="w-5 h-5" aria-hidden="true" />
              <span>Filtros</span>
            </h2>
            
            {(filterCustomerId || filterStatus !== 'all') && (
              <button
                onClick={clearFilters}
                className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <XCircle className="w-4 h-4" aria-hidden="true" />
                <span>Limpar Filtros</span>
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label htmlFor="filter-customer" className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Cliente
              </label>
              <select
                id="filter-customer"
                value={filterCustomerId}
                onChange={(e) => setFilterCustomerId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-all"
              >
                <option value="">Todos os clientes</option>
                {Object.values(customersCache).map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label htmlFor="filter-status" className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Status
              </label>
              <select
                id="filter-status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-all"
              >
                <option value="all">Todos os status</option>
                <option value="CREATED">📝 Criado</option>
                <option value="PAID">✅ Pago</option>
                <option value="CANCELLED">❌ Cancelado</option>
              </select>
            </div>
          </div>
        </section>

        {/* Erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg" role="alert">
            <p className="font-medium">❌ Erro ao carregar pedidos</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Aviso */}
        {filterStatus !== 'all' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3" role="status">
            <p className="text-yellow-800 text-sm">
              ℹ️ <strong>Nota:</strong> Filtro de status está sendo aplicado localmente. 
              Para melhor performance, considere implementar no backend.
            </p>
          </div>
        )}

        {/* Tabela */}
        <Table
          data={orders?.items || []}
          columns={columns}
          loading={loading}
          pagination={
            orders
              ? {
                  page: orders.page,
                  pageSize: orders.page_size,
                  total: orders.total,
                  totalPages: orders.total_pages,
                }
              : undefined
          }
          onPageChange={goToPage}
          actions={renderActions}
          emptyMessage="Nenhum pedido encontrado. Que tal criar o primeiro?"
          caption="Listagem de pedidos realizados"
        />
      </div>
    </div>
  );
};

export default OrderList;