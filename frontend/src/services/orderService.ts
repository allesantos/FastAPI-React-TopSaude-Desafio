import api, { generateIdempotencyKey } from './api';
import type { 
  Order, 
  OrderCreate, 
  OrderListResponse,
  PaginationParams 
} from '../types';

interface OrderListParams extends PaginationParams {
  customer_id?: number;
}

export const createOrder = async (
  data: OrderCreate,
  customKey?: string
): Promise<Order> => {
  try {
    const idempotencyKey = customKey || generateIdempotencyKey();
    
    const response = await api.post('/api/orders', data, {
      headers: {
        'Idempotency-Key': idempotencyKey
      }
    });
    
    return response.data.data;
    
  } catch (error: any) {
    if (error.message?.includes('estoque insuficiente')) {
      throw new Error(`Estoque insuficiente para um ou mais produtos. ${error.message}`);
    }
    
    if (error.message?.includes('não encontrado')) {
      throw new Error(`Cliente ou produto não encontrado. ${error.message}`);
    }
    
    if (error.message?.includes('já foi criado')) {
      throw new Error(`Pedido duplicado detectado! ${error.message}`);
    }
    
    throw new Error(error.message || 'Erro ao criar pedido');
  }
};

export const listOrders = async (params?: OrderListParams): Promise<OrderListResponse> => {
  try {
    const response = await api.get('/api/orders', { params });
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao listar pedidos');
  }
};

export const getOrderById = async (id: number): Promise<Order> => {
  try {
    const response = await api.get(`/api/orders/${id}`);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.message || `Erro ao buscar pedido ${id}`);
  }
};

export const cancelOrder = async (orderId: number): Promise<Order> => {
  try {
    const response = await api.patch(`/api/orders/${orderId}/cancel`);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao cancelar pedido');
  }
};

export const markAsPaid = async (orderId: number): Promise<Order> => {
  try {
    const response = await api.patch(`/api/orders/${orderId}/pay`);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao marcar pedido como pago');
  }
};

const orderService = {
  createOrder,
  listOrders,
  getOrderById,
  cancelOrder,
  markAsPaid,
};

export default orderService;