import { useEffect } from 'react';
import { useActionData } from 'react-router';
import toast from 'react-hot-toast';

interface ActionData {
  success?: string;
  error?: string;
}

export function useToast() {
  const actionData = useActionData<ActionData>();

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.success);
    }
    if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  return {
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    loading: (message: string) => toast.loading(message),
    dismiss: toast.dismiss,
    promise: toast.promise,
  };
}

// Hook para confirmar eliminaciones con toast
export function useConfirmDelete() {
  return (message: string, onConfirm: () => Promise<void> | void) => {
    const confirmed = window.confirm(message);
    if (confirmed) {
      const result = onConfirm();
      if (result instanceof Promise) {
        toast.promise(result, {
          loading: 'Eliminando...',
          success: 'Eliminado exitosamente',
          error: 'Error al eliminar',
        });
      }
    }
  };
}