import { useState, useCallback } from 'react';

// ==========================================
// HOOK GENÉRICO PARA CHAMADAS DE API
// ==========================================

/**
 * Hook personalizado para gerenciar estados de chamadas de API
 * 
 * @template T - Tipo dos dados retornados pela API
 * 
 * @example
 * const { data, loading, error, execute } = useApi<Product>();
 * 
 * const handleCreate = async () => {
 *   await execute(() => productService.createProduct(formData));
 * };
 */

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (apiCall: () => Promise<T>) => Promise<T | null>;
  reset: () => void;
}

export function useApi<T = any>(): UseApiReturn<T> {
  // Estados do hook
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  //  Função para executar chamada de API
  const execute = useCallback(async (apiCall: () => Promise<T>): Promise<T | null> => {
    // Limpa erros anteriores e ativa loading
    setState({
      data: null,
      loading: true,
      error: null,
    });

    try {
      // Chama a API
      const result = await apiCall();
      
      // Sucesso! Armazena os dados
      setState({
        data: result,
        loading: false,
        error: null,
      });
      
      return result;
      
    } catch (err: any) {
      // Erro! Armazena a mensagem de erro
      const errorMessage = err.message || 'Erro desconhecido ao executar operação';
      
      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });
      
      console.error('❌ Erro na API:', errorMessage);
      return null;
    }
  }, []);

  // 🧹 Função para resetar todos os estados
  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}
