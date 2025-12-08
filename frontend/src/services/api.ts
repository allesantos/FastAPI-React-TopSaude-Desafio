import axios from 'axios';
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse } from '../types';
import { API_BASE_URL, RESPONSE_CODE } from '../constants';


// ==========================================
// CONFIGURAÇÃO DO AXIOS
// ==========================================

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==========================================
//  INTERCEPTOR DE REQUEST
// ==========================================

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Aqui você pode adicionar tokens de autenticação no futuro
    // config.headers.Authorization = `Bearer ${token}`;
    
    console.log(`🚀 [${config.method?.toUpperCase()}] ${config.url}`);
    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// ==========================================
// INTERCEPTOR DE RESPONSE
// ==========================================

api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // Log de sucesso
    console.log(`✅ [${response.config.method?.toUpperCase()}] ${response.config.url} - ${response.status}`);
    
    // Verifica se a resposta tem o envelope padrão
    const data = response.data;
    
    if (data && typeof data === 'object' && 'cod_retorno' in data) {
      // Resposta com envelope
      if (data.cod_retorno === RESPONSE_CODE.SUCCESS) {
        // Sucesso - retorna apenas os dados
        return response;
      } else {
        // Erro retornado pela API com cod_retorno = 1
        console.error('❌ Erro da API:', data.mensagem);
        return Promise.reject({
          message: data.mensagem,
          data: data.data,
          isApiError: true,
        });
      }
    }
    
    // Resposta sem envelope (não deveria acontecer, mas tratamos)
    return response;
  },
  (error: AxiosError<ApiResponse>) => {
    // Erro de rede ou timeout
    if (!error.response) {
      console.error('❌ Erro de rede:', error.message);
      return Promise.reject({
        message: 'Erro de conexão com o servidor. Verifique sua internet.',
        isNetworkError: true,
      });
    }
    
    // Erro HTTP (4xx, 5xx)
    const status = error.response.status;
    const data = error.response.data;
    
    console.error(`❌ [${status}] ${error.config?.url}`, data);
    
    // Se a API retornou um envelope de erro
    if (data && typeof data === 'object' && 'mensagem' in data) {
      return Promise.reject({
        message: data.mensagem,
        data: data.data,
        status,
        isApiError: true,
      });
    }
    
    // Erro genérico
    const errorMessages: Record<number, string> = {
      400: 'Requisição inválida',
      401: 'Não autorizado',
      403: 'Acesso negado',
      404: 'Recurso não encontrado',
      422: 'Dados inválidos',
      500: 'Erro interno do servidor',
      502: 'Servidor indisponível',
      503: 'Serviço temporariamente indisponível',
    };
    
    return Promise.reject({
      message: errorMessages[status] || `Erro: ${status}`,
      status,
      isApiError: false,
    });
  }
);

// ==========================================
// FUNÇÕES UTILITÁRIAS
// ==========================================

/**
 * Gera uma chave de idempotência única para pedidos
 */
export const generateIdempotencyKey = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `order-${timestamp}-${random}`;
};

/**
 * Formata documento (CPF ou CNPJ)
 */
export const formatDocument = (doc: string): string => {
  const numbers = doc.replace(/\D/g, '');
  
  if (numbers.length === 11) {
    // CPF: 000.000.000-00
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (numbers.length === 14) {
    // CNPJ: 00.000.000/0000-00
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  
  return doc;
};

/**
 * Formata preço para exibição (R$ 0,00)
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);
};

/**
 * Formata data para exibição (dd/mm/yyyy HH:mm)
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export default api;