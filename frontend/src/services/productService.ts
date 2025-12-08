import api from './api';
import type { 
  Product, 
  ProductCreate, 
  ProductUpdate, 
  ProductListResponse,
  PaginationParams 
} from '../types';

// ==========================================
// PRODUCT SERVICE
// ==========================================

/**
 * Service para gerenciamento de produtos
 * Implementa todas operações CRUD + listagem com filtros
 */

// Interface para parâmetros de listagem
interface ProductListParams extends PaginationParams {
  is_active?: boolean;
  name?: string;
  sku?: string;
}

// ==========================================
// CRIAR PRODUTO
// ==========================================

/**
 * Cria um novo produto no sistema
 * 
 * @param data - Dados do produto a ser criado
 * @returns Produto criado com ID gerado
 * 
 * @example
 * const newProduct = await productService.createProduct({
 *   name: "Produto Teste",
 *   sku: "SKU001",
 *   price: 99.90,
 *   stock_qty: 100,
 *   is_active: true
 * });
 */
export const createProduct = async (data: ProductCreate): Promise<Product> => {
  try {
    const response = await api.post('/api/products', data);
    
    // O interceptor já tratou o envelope, então response.data.data contém o produto
    return response.data.data;
    
  } catch (error: any) {
    // O interceptor já formatou o erro, apenas repassa
    throw new Error(error.message || 'Erro ao criar produto');
  }
};

// ==========================================
// LISTAR PRODUTOS
// ==========================================

/**
 * Lista produtos com paginação e filtros
 * 
 * @param params - Parâmetros de paginação e filtros (todos opcionais)
 * @returns Lista de produtos + metadados de paginação
 * 
 * @example
 * // Listar primeira página (padrão)
 * const products = await productService.listProducts();
 * 
 * @example
 * // Listar com filtros
 * const products = await productService.listProducts({
 *   page: 2,
 *   page_size: 10,
 *   is_active: true,
 *   name: "vitamina",
 *   order_by: "name",
 *   order_direction: "asc"
 * });
 */
export const listProducts = async (params?: ProductListParams): Promise<ProductListResponse> => {
  try {
    const response = await api.get('/api/products', { params });
    
    // Retorna os dados do envelope (items, total, page, page_size, total_pages)
    return response.data.data;
    
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao listar produtos');
  }
};

// ==========================================
// BUSCAR PRODUTO POR ID
// ==========================================

/**
 * Busca um produto específico por ID
 * 
 * @param id - ID do produto
 * @returns Produto encontrado
 * @throws Error se produto não for encontrado
 * 
 * @example
 * const product = await productService.getProductById(1);
 */
export const getProductById = async (id: number): Promise<Product> => {
  try {
    const response = await api.get(`/api/products/${id}`);
    
    return response.data.data;
    
  } catch (error: any) {
    throw new Error(error.message || `Erro ao buscar produto ${id}`);
  }
};

// ==========================================
// ATUALIZAR PRODUTO
// ==========================================

/**
 * Atualiza um produto existente
 * Apenas os campos fornecidos serão atualizados
 * 
 * @param id - ID do produto a ser atualizado
 * @param data - Dados a serem atualizados (todos opcionais)
 * @returns Produto atualizado
 * 
 * @example
 * // Atualizar apenas o preço
 * const updated = await productService.updateProduct(1, { price: 149.90 });
 * 
 * @example
 * // Atualizar múltiplos campos
 * const updated = await productService.updateProduct(1, {
 *   name: "Novo Nome",
 *   stock_qty: 50,
 *   is_active: false
 * });
 */
export const updateProduct = async (id: number, data: ProductUpdate): Promise<Product> => {
  try {
    const response = await api.put(`/api/products/${id}`, data);
    
    return response.data.data;
    
  } catch (error: any) {
    throw new Error(error.message || `Erro ao atualizar produto ${id}`);
  }
};

// ==========================================
//  DELETAR PRODUTO
// ==========================================

/**
 * Deleta um produto (soft delete - marca como inativo)
 * 
 * @param id - ID do produto a ser deletado
 * @returns void
 * 
 * @example
 * await productService.deleteProduct(1);
 */
export const deleteProduct = async (id: number): Promise<void> => {
  try {
    await api.delete(`/api/products/${id}`);
    
    // Não retorna nada, apenas sucesso
    
  } catch (error: any) {
    throw new Error(error.message || `Erro ao deletar produto ${id}`);
  }
};

// ==========================================
//  EXPORTAÇÃO DEFAULT
// ==========================================

/**
 * Exporta todas as funções agrupadas em um objeto
 * Facilita imports: import productService from './services/productService'
 */
const productService = {
  createProduct,
  listProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};

export default productService;