import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ShoppingCart, User, Mail, FileText, Calendar,
  DollarSign, Package, CheckCircle, XCircle, Clock, Key, Loader2
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import orderService from '../../services/orderService';
import customerService from '../../services/customerService';
import productService from '../../services/productService';
import { formatPrice, formatDate, formatDocument } from '../../services/api';
import type { Order, Customer, Product } from '../../types';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../constants';

const OrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  // Estados
  const [order, setOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [productsCache, setProductsCache] = useState<Record<number, Product>>({});

  const { loading: orderLoading, error: orderError, execute: executeOrder } = useApi<Order>();
  const { loading: customerLoading, execute: executeCustomer } = useApi<Customer>();

  // Buscar dados
  const fetchOrderData = async () => {
    if (!orderId) return;

    try {
      const orderData = await executeOrder(() => 
        orderService.getOrderById(parseInt(orderId))
      );

      if (orderData) {
        setOrder(orderData);

        const customerData = await executeCustomer(() => 
          customerService.getCustomerById(orderData.customer_id)
        );

        if (customerData) {
          setCustomer(customerData);
        }

        await fetchProducts(orderData);
      }
    } catch (err) {
      console.error('Erro ao buscar dados do pedido:', err);
    }
  };

  const fetchProducts = async (orderData: Order) => {
    const productIds = [...new Set(orderData.items.map((item) => item.product_id))];
    const newCache = { ...productsCache };

    for (const productId of productIds) {
      if (!newCache[productId]) {
        try {
          const product = await productService.getProductById(productId);
          newCache[productId] = product;
        } catch (err) {
          console.error(`Erro ao buscar produto ${productId}:`, err);
        }
      }
    }

    setProductsCache(newCache);
  };

  useEffect(() => {
    fetchOrderData();
  }, [orderId]);

  // Componente: Status Badge
  const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const icons: Record<string, React.ReactNode> = {
      CREATED: <Clock className="w-4 h-4" aria-hidden="true" />,
      PAID: <CheckCircle className="w-4 h-4" aria-hidden="true" />,
      CANCELLED: <XCircle className="w-4 h-4" aria-hidden="true" />,
    };

    return (
      <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full font-semibold ${ORDER_STATUS_COLORS[status]}`}>
        {icons[status]}
        <span>{ORDER_STATUS_LABELS[status] || status}</span>
      </div>
    );
  };

  // Componente: Info Card
  const InfoCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string | React.ReactNode;
    color?: string;
  }> = ({ icon, label, value, color = 'text-gray-600' }) => (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-lg ${color} bg-opacity-10`} aria-hidden="true">
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <div className="font-semibold text-gray-900">{value}</div>
        </div>
      </div>
    </div>
  );

  // Loading
  if (orderLoading || customerLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" role="status" aria-live="polite">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" aria-hidden="true" />
          <p className="text-gray-600 text-lg">Carregando detalhes do pedido...</p>
        </div>
      </div>
    );
  }

  // Erro
  if (orderError || !order) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center" role="alert">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" aria-hidden="true" />
            <h2 className="text-2xl font-bold text-red-800 mb-2">
              Erro ao Carregar Pedido
            </h2>
            <p className="text-red-600 mb-6">
              {orderError || 'Pedido não encontrado'}
            </p>
            <button
              onClick={() => navigate('/orders')}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Voltar para Pedidos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/orders')}
              className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Voltar para listagem de pedidos"
            >
              <ArrowLeft className="w-6 h-6" aria-hidden="true" />
            </button>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
                <ShoppingCart className="w-8 h-8 text-orange-600" aria-hidden="true" />
                <span>Pedido #{order.id}</span>
              </h1>
              <p className="text-gray-600 mt-1">
                Detalhes completos do pedido
              </p>
            </div>
          </div>

          <StatusBadge status={order.status} />
        </header>

        {/* Grid de Info */}
        <section aria-label="Informações principais do pedido" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoCard
            icon={<DollarSign className="w-5 h-5" />}
            label="Valor Total"
            value={
              <span className="text-2xl text-green-600">
                {formatPrice(order.total_amount)}
              </span>
            }
            color="text-green-600"
          />

          <InfoCard
            icon={<Package className="w-5 h-5" />}
            label="Quantidade de Itens"
            value={`${order.items.length} ${order.items.length === 1 ? 'item' : 'itens'}`}
            color="text-blue-600"
          />

          <InfoCard
            icon={<Calendar className="w-5 h-5" />}
            label="Data do Pedido"
            value={formatDate(order.created_at)}
            color="text-purple-600"
          />

          <InfoCard
            icon={<Key className="w-5 h-5" />}
            label="Idempotency Key"
            value={
              <span className="text-xs font-mono break-all">
                {order.idempotency_key || 'N/A'}
              </span>
            }
            color="text-gray-600"
          />
        </section>

        {/* Cliente */}
        {customer && (
          <section aria-labelledby="customer-info" className="bg-white rounded-lg shadow p-6">
            <h2 id="customer-info" className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <User className="w-6 h-6 text-purple-600" aria-hidden="true" />
              <span>Informações do Cliente</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center" aria-hidden="true">
                  <span className="text-purple-600 font-bold text-lg">
                    {customer.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Nome</p>
                  <p className="font-semibold text-gray-900">{customer.name}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail className="w-6 h-6 text-gray-400 mt-1" aria-hidden="true" />
                <div>
                  <p className="text-sm text-gray-500">E-mail</p>
                  <p className="font-semibold text-gray-900">{customer.email}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <FileText className="w-6 h-6 text-gray-400 mt-1" aria-hidden="true" />
                <div>
                  <p className="text-sm text-gray-500">Documento</p>
                  <p className="font-semibold text-gray-900">
                    {formatDocument(customer.document)}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Items */}
        <section aria-labelledby="order-items" className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 id="order-items" className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <Package className="w-6 h-6 text-blue-600" aria-hidden="true" />
              <span>Itens do Pedido</span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <caption className="sr-only">Lista de produtos do pedido</caption>
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantidade
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço Unitário
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.items.map((item) => {
                  const product = productsCache[item.product_id];
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center" aria-hidden="true">
                            <Package className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {product?.name || `Produto #${item.product_id}`}
                            </p>
                            {product && (
                              <p className="text-sm text-gray-500">
                                SKU: {product.sku}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg font-bold text-gray-900">
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-gray-700 font-medium">
                          {formatPrice(item.unit_price)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-green-600 font-bold text-lg">
                          {formatPrice(item.line_total)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-right font-bold text-gray-900 text-lg">
                    TOTAL DO PEDIDO:
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-2xl font-bold text-green-600">
                      {formatPrice(order.total_amount)}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* Info Adicional */}
        <section aria-labelledby="additional-info" className="bg-white rounded-lg shadow p-6">
          <h2 id="additional-info" className="text-xl font-bold text-gray-900 mb-4">
            Informações Adicionais
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Data de Criação</p>
              <p className="font-semibold text-gray-900">
                {formatDate(order.created_at)}
              </p>
            </div>

            {order.updated_at && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Última Atualização</p>
                <p className="font-semibold text-gray-900">
                  {formatDate(order.updated_at)}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-500 mb-1">Status do Pedido</p>
              <StatusBadge status={order.status} />
            </div>

            {order.idempotency_key && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Chave de Idempotência</p>
                <p className="font-mono text-sm font-semibold text-gray-900 break-all bg-gray-50 p-2 rounded">
                  {order.idempotency_key}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Botão Voltar */}
        <div className="flex justify-start">
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            <span>Voltar para Pedidos</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;