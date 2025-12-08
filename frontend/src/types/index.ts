// ==========================================
// ENVELOPE DE RESPOSTA DA API
// ==========================================
export {};
export interface ApiResponse<T = any> {
  cod_retorno: 0 | 1; // 0 = sucesso, 1 = erro
  mensagem: string;
  data?: T;
}

// ==========================================
//  PRODUCT (Produto)
// ==========================================

export interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock_qty: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ProductCreate {
  name: string;
  sku: string;
  price: number;
  stock_qty: number;
  is_active?: boolean;
}

export interface ProductUpdate {
  name?: string;
  sku?: string;
  price?: number;
  stock_qty?: number;
  is_active?: boolean;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ==========================================
//  CUSTOMER (Cliente)
// ==========================================

export interface Customer {
  id: number;
  name: string;
  email: string;
  document: string; // CPF (11) ou CNPJ (14)
  created_at: string;
  updated_at?: string;
}

export interface CustomerCreate {
  name: string;
  email: string;
  document: string;
}

export interface CustomerUpdate {
  name?: string;
  email?: string;
  document?: string;
}

export interface CustomerListResponse {
  items: Customer[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ==========================================
//  ORDER (Pedido)
// ==========================================

export type OrderStatus = 'CREATED' | 'PAID' | 'CANCELLED';

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface OrderItemCreate {
  product_id: number;
  quantity: number;
}

export interface Order {
  id: number;
  customer_id: number;
  total_amount: number;
  status: OrderStatus;
  idempotency_key?: string;
  created_at: string;
  updated_at?: string;
  items: OrderItem[];
}

export interface OrderCreate {
  customer_id: number;
  items: OrderItemCreate[];
}

export interface OrderListResponse {
  items: Order[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ==========================================
// TIPOS UTILITÁRIOS
// ==========================================

export interface PaginationParams {
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface ApiError {
  cod_retorno: 1;
  mensagem: string;
  data?: any;
}