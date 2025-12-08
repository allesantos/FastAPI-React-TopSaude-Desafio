import api from './api';
import type { 
  Customer, 
  CustomerCreate, 
  CustomerUpdate, 
  CustomerListResponse,
  PaginationParams 
} from '../types';

// ==========================================
// CUSTOMER SERVICE
// ==========================================

/**
 * Service para gerenciamento de clientes
 * Implementa todas operações CRUD + buscas especiais
 */

// ==========================================
// CRIAR CLIENTE
// ==========================================

/**
 * Cria um novo cliente no sistema
 * 
 * @param data - Dados do cliente a ser criado
 * @returns Cliente criado com ID gerado
 * 
 * @example
 * const newCustomer = await customerService.createCustomer({
 *   name: "João Silva",
 *   email: "joao@example.com",
 *   document: "12345678901"  // CPF (11 dígitos) ou CNPJ (14 dígitos)
 * });
 */
export const createCustomer = async (data: CustomerCreate): Promise<Customer> => {
  try {
    const response = await api.post('/api/customers', data);
    
    // O interceptor já tratou o envelope
    return response.data.data;
    
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao criar cliente');
  }
};

// ==========================================
// LISTAR CLIENTES
// ==========================================

/**
 * Lista clientes com paginação
 * 
 * @param params - Parâmetros de paginação (opcionais)
 * @returns Lista de clientes + metadados de paginação
 * 
 * @example
 * // Listar primeira página (padrão)
 * const customers = await customerService.listCustomers();
 * 
 * @example
 * // Listar com paginação customizada
 * const customers = await customerService.listCustomers({
 *   page: 2,
 *   page_size: 15
 * });
 */
export const listCustomers = async (params?: PaginationParams): Promise<CustomerListResponse> => {
  try {
    const response = await api.get('/api/customers', { params });
    
    // Retorna os dados do envelope
    return response.data.data;
    
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao listar clientes');
  }
};

// ==========================================
//  BUSCAR CLIENTE POR ID
// ==========================================

/**
 * Busca um cliente específico por ID
 * 
 * @param id - ID do cliente
 * @returns Cliente encontrado
 * @throws Error se cliente não for encontrado
 * 
 * @example
 * const customer = await customerService.getCustomerById(1);
 */
export const getCustomerById = async (id: number): Promise<Customer> => {
  try {
    const response = await api.get(`/api/customers/${id}`);
    
    return response.data.data;
    
  } catch (error: any) {
    throw new Error(error.message || `Erro ao buscar cliente ${id}`);
  }
};

// ==========================================
// BUSCAR CLIENTE POR EMAIL
// ==========================================

/**
 * Busca um cliente pelo email
 * Útil para validar se email já existe antes de criar
 * 
 * @param email - Email do cliente
 * @returns Cliente encontrado ou null se não existir
 * 
 * @example
 * const customer = await customerService.getCustomerByEmail("joao@example.com");
 * if (customer) {
 *   alert("Email já cadastrado!");
 * }
 */
export const getCustomerByEmail = async (email: string): Promise<Customer | null> => {
  try {
    const response = await api.get(`/api/customers/email/${email}`);
    
    return response.data.data;
    
  } catch (error: any) {
    // Se não encontrar, retorna null ao invés de erro
    if (error.message?.includes('não encontrado')) {
      return null;
    }
    throw new Error(error.message || `Erro ao buscar cliente por email`);
  }
};

// ==========================================
// BUSCAR CLIENTE POR DOCUMENTO
// ==========================================

/**
 * Busca um cliente pelo documento (CPF ou CNPJ)
 * Útil para validar se documento já existe antes de criar
 * 
 * @param document - CPF (11 dígitos) ou CNPJ (14 dígitos)
 * @returns Cliente encontrado ou null se não existir
 * 
 * @example
 * const customer = await customerService.getCustomerByDocument("12345678901");
 * if (customer) {
 *   alert("CPF já cadastrado!");
 * }
 */
export const getCustomerByDocument = async (document: string): Promise<Customer | null> => {
  try {
    const response = await api.get(`/api/customers/document/${document}`);
    
    return response.data.data;
    
  } catch (error: any) {
    // Se não encontrar, retorna null ao invés de erro
    if (error.message?.includes('não encontrado')) {
      return null;
    }
    throw new Error(error.message || `Erro ao buscar cliente por documento`);
  }
};

// ==========================================
// ATUALIZAR CLIENTE
// ==========================================

/**
 * Atualiza um cliente existente
 * Apenas os campos fornecidos serão atualizados
 * 
 * @param id - ID do cliente a ser atualizado
 * @param data - Dados a serem atualizados (todos opcionais)
 * @returns Cliente atualizado
 * 
 * @example
 * // Atualizar apenas o email
 * const updated = await customerService.updateCustomer(1, { 
 *   email: "novo@example.com" 
 * });
 * 
 * @example
 * // Atualizar múltiplos campos
 * const updated = await customerService.updateCustomer(1, {
 *   name: "João da Silva Junior",
 *   email: "joao.junior@example.com"
 * });
 */
export const updateCustomer = async (id: number, data: CustomerUpdate): Promise<Customer> => {
  try {
    const response = await api.put(`/api/customers/${id}`, data);
    
    return response.data.data;
    
  } catch (error: any) {
    throw new Error(error.message || `Erro ao atualizar cliente ${id}`);
  }
};

// ==========================================
// DELETAR CLIENTE
// ==========================================

/**
 * Deleta um cliente
 * 
 * @param id - ID do cliente a ser deletado
 * @returns void
 * 
 * @example
 * await customerService.deleteCustomer(1);
 */
export const deleteCustomer = async (id: number): Promise<void> => {
  try {
    await api.delete(`/api/customers/${id}`);
    
    // Não retorna nada, apenas sucesso
    
  } catch (error: any) {
    throw new Error(error.message || `Erro ao deletar cliente ${id}`);
  }
};

// ==========================================
//  EXPORTAÇÃO DEFAULT
// ==========================================

/**
 * Exporta todas as funções agrupadas em um objeto
 * Facilita imports: import customerService from './services/customerService'
 */
const customerService = {
  createCustomer,
  listCustomers,
  getCustomerById,
  getCustomerByEmail,
  getCustomerByDocument,
  updateCustomer,
  deleteCustomer,
};

export default customerService;