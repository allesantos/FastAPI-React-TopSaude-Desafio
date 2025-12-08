import api, { generateIdempotencyKey } from './api';
import type { 
  Order, 
  OrderCreate, 
  OrderListResponse,
  PaginationParams 
} from '../types';

// ==========================================
// ORDER SERVICE
// ==========================================

/**
 * Service para gerenciamento de pedidos
 * Implementa criação com idempotência e operações de consulta
 */

// Interface para parâmetros de listagem de pedidos
interface OrderListParams extends PaginationParams {
  customer_id?: number;  // Filtro opcional por cliente
}

// ==========================================
// CRIAR PEDIDO (COM IDEMPOTÊNCIA!)
// ==========================================

/**
 * 
 * @param data - Dados do pedido (customer_id + items)
 * @param customKey - Chave de idempotência customizada (opcional, gera automaticamente)
 * @returns Pedido criado com todos os detalhes
 * 
 * @example
 * // Criar pedido (key gerada automaticamente)
 * const newOrder = await orderService.createOrder({
 *   customer_id: 1,
 *   items: [
 *     { product_id: 1, quantity: 2 },
 *     { product_id: 3, quantity: 1 }
 *   ]
 * });
 * 
 * @example
 * // Criar pedido com key customizada
 * const customKey = `order-${userId}-${Date.now()}`;
 * const newOrder = await orderService.createOrder(orderData, customKey);
 */
export const createOrder = async (
  data: OrderCreate,
  customKey?: string
): Promise<Order> => {
  try {
    // 🔑 Gera chave de idempotência (ou usa a customizada)
    const idempotencyKey = customKey || generateIdempotencyKey();
    
    // 📤 Envia requisição com header Idempotency-Key
    const response = await api.post('/api/orders', data, {
      headers: {
        'Idempotency-Key': idempotencyKey
      }
    });
    
    // O interceptor já tratou o envelope
    return response.data.data;
    
  } catch (error: any) {
    // Tratamento especial para erros de pedido
    if (error.message?.includes('estoque insuficiente')) {
      throw new Error(`❌ Estoque insuficiente para um ou mais produtos. ${error.message}`);
    }
    
    if (error.message?.includes('não encontrado')) {
      throw new Error(`❌ Cliente ou produto não encontrado. ${error.message}`);
    }
    
    if (error.message?.includes('já foi criado')) {
      throw new Error(`⚠️ Pedido duplicado detectado! ${error.message}`);
    }
    
    throw new Error(error.message || 'Erro ao criar pedido');
  }
};

// ==========================================
// LISTAR PEDIDOS
// ==========================================

/**
 * Lista pedidos com paginação e filtros opcionais
 * 
 * @param params - Parâmetros de paginação e filtros (todos opcionais)
 * @returns Lista de pedidos + metadados de paginação
 * 
 * @example
 * // Listar primeira página (padrão)
 * const orders = await orderService.listOrders();
 * 
 * @example
 * // Listar pedidos de um cliente específico
 * const orders = await orderService.listOrders({
 *   customer_id: 1,
 *   page: 1,
 *   page_size: 10
 * });
 * 
 * @example
 * // Listar com paginação customizada
 * const orders = await orderService.listOrders({
 *   page: 2,
 *   page_size: 5
 * });
 */
export const listOrders = async (params?: OrderListParams): Promise<OrderListResponse> => {
  try {
    const response = await api.get('/api/orders', { params });
    
    // Retorna os dados do envelope (items, total, page, etc)
    return response.data.data;
    
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao listar pedidos');
  }
};

// ==========================================
// BUSCAR PEDIDO POR ID
// ==========================================

/**
 * Busca um pedido específico por ID
 * Retorna todos os detalhes incluindo items, totais e status
 * 
 * @param id - ID do pedido
 * @returns Pedido completo com todos os items
 * @throws Error se pedido não for encontrado
 * 
 * @example
 * const order = await orderService.getOrderById(1);
 * console.log('Total do pedido:', order.total_amount);
 * console.log('Quantidade de items:', order.items.length);
 */
export const getOrderById = async (id: number): Promise<Order> => {
  try {
    const response = await api.get(`/api/orders/${id}`);
    
    return response.data.data;
    
  } catch (error: any) {
    throw new Error(error.message || `Erro ao buscar pedido ${id}`);
  }
};

// ==========================================
// 📦 EXPORTAÇÃO DEFAULT
// ==========================================

const orderService = {
  createOrder,
  listOrders,
  getOrderById,
};

export default orderService;

