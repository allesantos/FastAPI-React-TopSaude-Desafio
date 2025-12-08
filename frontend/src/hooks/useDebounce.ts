import { useState, useEffect } from 'react';

/**
 *  Hook para debounce de valores
 * Útil para filtros de busca - evita muitas requisições
 * 
 * @param value - Valor a ser "atrasado"
 * @param delay - Tempo de espera em ms (padrão: 500ms)
 * @returns Valor com debounce aplicado
 * 
 * @example
 * const [search, setSearch] = useState('');
 * const debouncedSearch = useDebounce(search, 500);
 * 
 * useEffect(() => {
 *   // Só executa 500ms após parar de digitar
 *   fetchProducts({ name: debouncedSearch });
 * }, [debouncedSearch]);
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}