import React from 'react';
import { Trash2, Package, Minus, Plus } from 'lucide-react';
import { formatPrice } from '../../services/api';
import type { Product } from '../../types';

// ==========================================
//  TIPOS
// ==========================================

export interface OrderItemRow {
  product: Product;
  quantity: number;
  unit_price: number;
  line_total: number;
}

interface OrderItemsTableProps {
  items: OrderItemRow[];
  onUpdateQuantity: (productId: number, newQuantity: number) => void;
  onRemoveItem: (productId: number) => void;
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export const OrderItemsTable: React.FC<OrderItemsTableProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  // ==========================================
  // CÁLCULOS
  // ==========================================

  const totalAmount = items.reduce((sum, item) => sum + item.line_total, 0);

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleIncrement = (item: OrderItemRow) => {
    const newQuantity = item.quantity + 1;

    // Validação de estoque
    if (newQuantity > item.product.stock_qty) {
      alert(`Estoque insuficiente! Máximo: ${item.product.stock_qty}`);
      return;
    }

    onUpdateQuantity(item.product.id, newQuantity);
  };

  const handleDecrement = (item: OrderItemRow) => {
    const newQuantity = item.quantity - 1;

    // Mínimo 1
    if (newQuantity < 1) {
      return;
    }

    onUpdateQuantity(item.product.id, newQuantity);
  };

  const handleInputChange = (item: OrderItemRow, value: string) => {
    const newQuantity = parseInt(value) || 1;

    // Validação de estoque
    if (newQuantity > item.product.stock_qty) {
      alert(`Estoque insuficiente! Máximo: ${item.product.stock_qty}`);
      return;
    }

    // Mínimo 1
    if (newQuantity < 1) {
      return;
    }

    onUpdateQuantity(item.product.id, newQuantity);
  };

  // ==========================================
  // EMPTY STATE
  // ==========================================

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">Nenhum produto adicionado</p>
        <p className="text-gray-400 text-sm mt-2">
          Use a busca acima para adicionar produtos ao pedido
        </p>
      </div>
    );
  }

  // ==========================================
  // TABELA COM ITEMS
  // ==========================================

  return (
    <div className="space-y-4">
      {/* Tabela */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Header */}
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produto
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preço Unit.
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantidade
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subtotal
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.product.id} className="hover:bg-gray-50">
                {/* Produto */}
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {item.product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        SKU: {item.product.sku}
                      </p>
                      <p className="text-xs text-gray-400">
                        Estoque: {item.product.stock_qty}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Preço Unitário */}
                <td className="px-6 py-4 text-center">
                  <p className="text-sm font-medium text-gray-900">
                    {formatPrice(item.unit_price)}
                  </p>
                </td>

                {/* Quantidade */}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center space-x-2">
                    {/* Botão - */}
                    <button
                      onClick={() => handleDecrement(item)}
                      disabled={item.quantity <= 1}
                      className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="w-4 h-4 text-gray-600" />
                    </button>

                    {/* Input */}
                    <input
                      type="number"
                      min="1"
                      max={item.product.stock_qty}
                      value={item.quantity}
                      onChange={(e) => handleInputChange(item, e.target.value)}
                      className="w-16 px-2 py-1.5 border border-gray-300 rounded text-center text-sm font-medium"
                    />

                    {/* Botão + */}
                    <button
                      onClick={() => handleIncrement(item)}
                      disabled={item.quantity >= item.product.stock_qty}
                      className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </td>

                {/* Subtotal */}
                <td className="px-6 py-4 text-center">
                  <p className="text-sm font-semibold text-green-600">
                    {formatPrice(item.line_total)}
                  </p>
                </td>

                {/* Ações */}
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remover item"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

          {/* Footer com Total */}
          <tfoot className="bg-gray-50 border-t-2 border-gray-300">
            <tr>
              <td colSpan={3} className="px-6 py-4 text-right">
                <p className="text-lg font-bold text-gray-900">Total Geral:</p>
              </td>
              <td className="px-6 py-4 text-center">
                <p className="text-lg font-bold text-green-600">
                  {formatPrice(totalAmount)}
                </p>
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Info adicional */}
      <div className="flex items-center justify-between text-sm text-gray-600 px-2">
        <p>
          <span className="font-medium">{items.length}</span>{' '}
          {items.length === 1 ? 'produto adicionado' : 'produtos adicionados'}
        </p>
        <p>
          Total de itens:{' '}
          <span className="font-medium">
            {items.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
        </p>
      </div>
    </div>
  );
};

export default OrderItemsTable;