import React from 'react';
import { User, Package, DollarSign, Hash } from 'lucide-react';
import { formatPrice } from '../../services/api';
import type { Customer } from '../../types';
import type { OrderItemRow } from './OrderItemsTable';

// ==========================================
// TIPOS
// ==========================================

interface OrderSummaryProps {
  customer: Customer;
  items: OrderItemRow[];
  totalAmount: number;
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  customer,
  items,
  totalAmount,
}) => {
  // ==========================================
  // CÁLCULOS
  // ==========================================

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const uniqueProducts = items.length;

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <h3 className="text-xl font-bold text-white flex items-center space-x-2">
          <Package className="w-6 h-6" />
          <span>Resumo do Pedido</span>
        </h3>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Informações do Cliente */}
        <div>
          <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Cliente</span>
          </h4>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="font-semibold text-gray-900 text-lg mb-1">
              {customer.name}
            </p>
            <p className="text-sm text-gray-600 mb-0.5">
              📧 {customer.email}
            </p>
            <p className="text-sm text-gray-600">
              📄 Doc: {customer.document}
            </p>
          </div>
        </div>

        {/* Lista de Produtos */}
        <div>
          <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center space-x-2">
            <Package className="w-4 h-4" />
            <span>Produtos ({uniqueProducts})</span>
          </h4>
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-start justify-between">
                  {/* Info do Produto */}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {item.product.name}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      SKU: {item.product.sku}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm">
                      <p className="text-gray-600">
                        <span className="font-medium">Quantidade:</span>{' '}
                        {item.quantity}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Preço Unit.:</span>{' '}
                        {formatPrice(item.unit_price)}
                      </p>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right ml-4">
                    <p className="text-xs text-gray-500 mb-1">Subtotal</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatPrice(item.line_total)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center space-x-2 mb-1">
              <Hash className="w-4 h-4 text-blue-600" />
              <p className="text-sm font-medium text-gray-600">Total de Itens</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">{totalItems}</p>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center space-x-2 mb-1">
              <Package className="w-4 h-4 text-green-600" />
              <p className="text-sm font-medium text-gray-600">Produtos Únicos</p>
            </div>
            <p className="text-2xl font-bold text-green-600">{uniqueProducts}</p>
          </div>
        </div>

        {/* Total Geral */}
        <div className="border-t-2 border-gray-300 pt-4">
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 border-2 border-green-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Geral</p>
                  <p className="text-xs text-gray-500">
                    {uniqueProducts} produtos • {totalItems} itens
                  </p>
                </div>
              </div>
              <p className="text-3xl font-bold text-green-600">
                {formatPrice(totalAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;