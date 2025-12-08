import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

// ==========================================
// TIPOS
// ==========================================

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextData {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

// ==========================================
// CONTEXT
// ==========================================

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

// ==========================================
// TOAST PROVIDER
// ==========================================

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Adicionar toast
  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const duration = toast.duration || 5000;

    const newToast: Toast = {
      ...toast,
      id,
      duration,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto-remover após duração
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  //  Remover toast
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  //  Atalhos
  const success = useCallback(
    (title: string, message?: string) => {
      showToast({ type: 'success', title, message });
    },
    [showToast]
  );

  const error = useCallback(
    (title: string, message?: string) => {
      showToast({ type: 'error', title, message });
    },
    [showToast]
  );

  const warning = useCallback(
    (title: string, message?: string) => {
      showToast({ type: 'warning', title, message });
    },
    [showToast]
  );

  const info = useCallback(
    (title: string, message?: string) => {
      showToast({ type: 'info', title, message });
    },
    [showToast]
  );

  // ==========================================
  // CONFIGURAÇÕES VISUAIS
  // ==========================================

  const toastConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-500',
      ariaLive: 'polite' as const,
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-500',
      ariaLive: 'assertive' as const, // Erro é mais urgente
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-500',
      ariaLive: 'polite' as const,
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-500',
      ariaLive: 'polite' as const,
    },
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}

      {/* Container de Toasts */}
      <div 
        className="fixed top-4 right-4 z-50 space-y-3 max-w-md"
        aria-live="polite"
        aria-atomic="false"
        role="region"
        aria-label="Notificações"
      >
        {toasts.map((toast) => {
          const config = toastConfig[toast.type];
          const Icon = config.icon;

          return (
            <div
              key={toast.id}
              role="alert"
              aria-live={config.ariaLive}
              aria-atomic="true"
              className={`${config.bgColor} ${config.borderColor} border-l-4 rounded-lg shadow-lg p-4 animate-slide-in`}
            >
              <div className="flex items-start space-x-3">
                {/* Ícone */}
                <Icon 
                  className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`}
                  aria-hidden="true"
                />

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold ${config.textColor} text-sm`}>
                    {toast.title}
                  </h4>
                  {toast.message && (
                    <p className={`${config.textColor} text-sm mt-1 opacity-90`}>
                      {toast.message}
                    </p>
                  )}
                </div>

                {/* Botão Fechar */}
                <button
                  onClick={() => removeToast(toast.id)}
                  aria-label={`Fechar notificação: ${toast.title}`}
                  className={`${config.textColor} hover:opacity-70 transition-opacity flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${toast.type === 'error' ? 'red' : toast.type === 'success' ? 'green' : toast.type === 'warning' ? 'yellow' : 'blue'}-500 rounded`}
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Animações CSS */}
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </ToastContext.Provider>
  );
};

// ==========================================
// HOOK
// ==========================================

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return context;
};