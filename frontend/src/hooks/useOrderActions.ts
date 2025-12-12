import { useState } from 'react';
import orderService from '../services/orderService';
import { useToast } from '../contexts/ToastContext';

export function useOrderActions() {
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const cancelOrder = async (orderId: number): Promise<boolean> => {
    try {
      setLoading(true);
      await orderService.cancelOrder(orderId);
      success('Pedido cancelado com sucesso!');
      return true;
    } catch (err: any) {
      const message = err.message || 'Erro ao cancelar pedido';
      error('Erro ao cancelar', message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (orderId: number): Promise<boolean> => {
    try {
      setLoading(true);
      await orderService.markAsPaid(orderId);
      success('Pedido marcado como pago!');
      return true;
    } catch (err: any) {
      const message = err.message || 'Erro ao marcar como pago';
      error('Erro ao marcar como pago', message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { cancelOrder, markAsPaid, loading };
}