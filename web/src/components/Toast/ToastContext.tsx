import React, { useMemo } from 'react';
import { v4 } from 'uuid';
import { ToastData } from './types';

interface ToastContextType {
  toast(toast: Omit<ToastData, 'id'>): void;
}

const ToastContext = React.createContext<ToastContextType>(undefined!);

interface Props {
  onAdd: (toast: ToastData) => void;
}

export const ToastContextProvider: React.FC<React.PropsWithChildren<Props>> = ({
  onAdd,
  children,
}) => {
  const context: ToastContextType = useMemo(() => {
    return {
      toast(toast) {
        onAdd({
          id: v4(),
          ...toast,
        });
      },
    };
  }, [onAdd]);

  return (
    <ToastContext.Provider value={context}>{children}</ToastContext.Provider>
  );
};
export const useToast = () => React.useContext(ToastContext);
