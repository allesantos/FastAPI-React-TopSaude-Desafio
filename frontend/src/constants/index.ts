// ==========================================
// CONSTANTES DA APLICAÇÃO
// ==========================================

// Status de Pedido (sincronizado com backend)
export const ORDER_STATUS = {
  CREATED: 'CREATED',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
} as const;

// Labels traduzidos dos status
export const ORDER_STATUS_LABELS: Record<string, string> = {
  CREATED: 'Criado',
  PAID: 'Pago',
  CANCELLED: 'Cancelado',
};

// Cores para os status (Tailwind)
export const ORDER_STATUS_COLORS: Record<string, string> = {
  CREATED: 'bg-blue-100 text-blue-800',
  PAID: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

// Códigos de retorno da API
export const RESPONSE_CODE = {
  SUCCESS: 0,
  ERROR: 1,
} as const;

// Mensagens de erro (sincronizadas com backend)
export const ERROR_MESSAGES = {
  PRODUCT_NOT_FOUND: 'Produto não encontrado',
  CUSTOMER_NOT_FOUND: 'Cliente não encontrado',
  ORDER_NOT_FOUND: 'Pedido não encontrado',
  INSUFFICIENT_STOCK: 'Estoque insuficiente',
  INVALID_SKU: 'SKU inválido ou já existe',
  INVALID_EMAIL: 'Email inválido ou já existe',
  INVALID_DOCUMENT: 'Documento inválido ou já existe',
  DUPLICATE_IDEMPOTENCY_KEY: 'Pedido já foi criado com esta chave',
  INVALID_ORDER_STATUS: 'Status de pedido inválido',
} as const;

// Configurações de paginação
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// URLs da API
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  PRODUCTS: '/api/products',
  CUSTOMERS: '/api/customers',
  ORDERS: '/api/orders',
  HEALTH: '/health',
} as const;