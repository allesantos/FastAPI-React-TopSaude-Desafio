import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Check, AlertCircle } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../contexts/ToastContext';
import { generateIdempotencyKey } from '../../services/api';
import orderService from '../../services/orderService';
import CustomerAutocomplete from '../../components/orders/CustomerAutocomplete';
import ProductSearch from '../../components/orders/ProductSearch';
import OrderItemsTable, { OrderItemRow } from '../../components/orders/OrderItemsTable';
import OrderSummary from '../../components/orders/OrderSummary';
import Modal, { ModalFooter, ModalButton } from '../../components/common/Modal';
import type { Customer, Product, OrderCreate as OrderCreateDTO } from '../../types';

const OrderCreate: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { loading, execute } = useApi();

  // Estados
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItemRow[]>([]);
  const [idempotencyKey, setIdempotencyKey] = useState<string>('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [customerError, setCustomerError] = useState('');

  // Gerar idempotency key
  useEffect(() => {
    setIdempotencyKey(generateIdempotencyKey());
  }, []);

  // Cálculos
  const totalAmount = orderItems.reduce((sum, item) => sum + item.line_total, 0);
  const canSubmit = selectedCustomer && orderItems.length > 0;

  // Handlers - Produtos
  const handleAddProduct = (product: Product, quantity: number) => {
    const existingItem = orderItems.find((item) => item.product.id === product.id);

    if (existingItem) {
      toast.warning('Produto já adicionado!', 'Use a tabela para editar a quantidade.');
      return;
    }

    if (quantity > product.stock_qty) {
      toast.error('Estoque insuficiente!', `Disponível: ${product.stock_qty}`);
      return;
    }

    const newItem: OrderItemRow = {
      product,
      quantity,
      unit_price: product.price,
      line_total: product.price * quantity,
    };

    setOrderItems((prev) => [...prev, newItem]);
    toast.success('Produto adicionado!', product.name);
  };

  const handleUpdateQuantity = (productId: number, newQuantity: number) => {
    setOrderItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          return {
            ...item,
            quantity: newQuantity,
            line_total: item.unit_price * newQuantity,
          };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (productId: number) => {
    const item = orderItems.find((i) => i.product.id === productId);
    setOrderItems((prev) => prev.filter((i) => i.product.id !== productId));
    
    if (item) {
      toast.info('Produto removido', item.product.name);
    }
  };

  // Handlers - Cliente
  const handleSelectCustomer = (customer: Customer | null) => {
    setSelectedCustomer(customer);
    setCustomerError('');
  };

  // Handlers - Submit
  const handleOpenConfirmModal = () => {
    if (!selectedCustomer) {
      setCustomerError('Selecione um cliente');
      toast.error('Erro de validação', 'Selecione um cliente para continuar');
      return;
    }

    if (orderItems.length === 0) {
      toast.error('Erro de validação', 'Adicione ao menos um produto ao pedido');
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmOrder = async () => {
    if (!selectedCustomer) return;

    const orderData: OrderCreateDTO = {
      customer_id: selectedCustomer.id,
      items: orderItems.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      })),
    };

    const result = await execute(() =>
      orderService.createOrder(orderData, idempotencyKey)
    );

    if (result) {
      toast.success('Pedido criado com sucesso!', `ID: ${result.id}`);
      setShowConfirmModal(false);
      setTimeout(() => navigate('/orders'), 1500);
    } else {
      setShowConfirmModal(false);
    }
  };

  const handleCancelOrder = () => {
    const confirmed = window.confirm(
      'Tem certeza que deseja cancelar? Todos os dados serão perdidos.'
    );

    if (confirmed) {
      navigate('/orders');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <header className="mb-8">
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label="Voltar para listagem de pedidos"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            <span>Voltar para Pedidos</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                <ShoppingCart className="w-8 h-8 text-blue-600" aria-hidden="true" />
                <span>Criar Novo Pedido</span>
              </h1>
              <p className="text-gray-600 mt-2">
                Selecione um cliente e adicione produtos ao pedido
              </p>
            </div>

            {orderItems.length > 0 && (
              <div className="text-right" role="status" aria-live="polite">
                <p className="text-sm text-gray-600">Total do Pedido</p>
                <p className="text-2xl font-bold text-green-600" aria-label={`Total: R$ ${totalAmount.toFixed(2)}`}>
                  R$ {totalAmount.toFixed(2).replace('.', ',')}
                </p>
              </div>
            )}
          </div>
        </header>

        {/* Formulário */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Coluna Esquerda */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Card 1: Cliente */}
            <section aria-labelledby="customer-section" className="bg-white rounded-lg shadow p-6">
              <h2 id="customer-section" className="text-lg font-semibold text-gray-900 mb-4">
                1. Selecionar Cliente
              </h2>
              <CustomerAutocomplete
                onSelect={handleSelectCustomer}
                selectedCustomer={selectedCustomer}
                error={customerError}
              />
            </section>

            {/* Card 2: Produtos */}
            <section aria-labelledby="products-section" className="bg-white rounded-lg shadow p-6">
              <h2 id="products-section" className="text-lg font-semibold text-gray-900 mb-4">
                2. Adicionar Produtos
              </h2>
              <ProductSearch
                onAddProduct={handleAddProduct}
                addedProductIds={orderItems.map((item) => item.product.id)}
              />
            </section>

            {/* Card 3: Items */}
            <section aria-labelledby="items-section" className="bg-white rounded-lg shadow p-6">
              <h2 id="items-section" className="text-lg font-semibold text-gray-900 mb-4">
                3. Items do Pedido
              </h2>
              <OrderItemsTable
                items={orderItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
              />
            </section>
          </div>

          {/* Coluna Direita */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              
              {/* Resumo */}
              <section aria-labelledby="summary-section" className="bg-white rounded-lg shadow p-6">
                <h2 id="summary-section" className="text-lg font-semibold text-gray-900 mb-4">
                  Resumo Rápido
                </h2>
                
                <div className="space-y-3" role="status" aria-live="polite">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Cliente:</span>
                    <span className="font-medium text-gray-900">
                      {selectedCustomer ? '✅ Selecionado' : '⚠️ Não selecionado'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Produtos:</span>
                    <span className="font-medium text-gray-900">
                      {orderItems.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total de Itens:</span>
                    <span className="font-medium text-gray-900">
                      {orderItems.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold text-gray-900">
                        Total:
                      </span>
                      <span className="text-xl font-bold text-green-600">
                        R$ {totalAmount.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Ações */}
              <div className="bg-white rounded-lg shadow p-6 space-y-3">
                <button
                  onClick={handleOpenConfirmModal}
                  disabled={!canSubmit || loading}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Revisar e confirmar pedido"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" aria-hidden="true"></div>
                      <span>Processando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" aria-hidden="true" />
                      <span>Revisar e Confirmar</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleCancelOrder}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancelar
                </button>

                {!canSubmit && (
                  <div className="flex items-start space-x-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg" role="alert">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="font-medium">Ação necessária:</p>
                      <ul className="mt-1 space-y-1 text-xs">
                        {!selectedCustomer && <li>• Selecione um cliente</li>}
                        {orderItems.length === 0 && <li>• Adicione produtos</li>}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Modal de Confirmação */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirmar Pedido"
        size="xl"
      >
        {selectedCustomer && (
          <>
            <OrderSummary
              customer={selectedCustomer}
              items={orderItems}
              totalAmount={totalAmount}
            />

            <ModalFooter className="mt-6">
              <ModalButton
                variant="secondary"
                onClick={() => setShowConfirmModal(false)}
                disabled={loading}
              >
                Voltar
              </ModalButton>
              <ModalButton
                variant="primary"
                onClick={handleConfirmOrder}
                loading={loading}
                disabled={loading}
              >
                Confirmar Pedido
              </ModalButton>
            </ModalFooter>
          </>
        )}
      </Modal>
    </div>
  );
};

export default OrderCreate;