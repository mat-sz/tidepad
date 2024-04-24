import React, { useCallback } from 'react';

import { Portal } from '../Portal';
import { ToastContextProvider } from './ToastContext';
import { ToastData } from './types';
import { Toast } from './Toast';

export const Toasts: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [toasts, setToasts] = React.useState<ToastData[]>([]);

  const onRemove = useCallback(
    (id: string) =>
      setToasts(toasts => toasts.filter(toast => toast.id !== id)),
    [setToasts]
  );
  const onAdd = useCallback(
    (toast: ToastData) => {
      setToasts(toasts => {
        if (toasts.length < 5) {
          return [...toasts, toast];
        }

        return [...toasts.slice(toasts.length - 4, toasts.length), toast];
      });
      setTimeout(() => onRemove(toast.id), 5000);
    },
    [setToasts, onRemove]
  );

  return (
    <>
      <ToastContextProvider onAdd={onAdd}>{children}</ToastContextProvider>
      <Portal isOpen>
        <div className="toasts">
          {toasts.map(toast => (
            <Toast
              toast={toast}
              onRemove={() => onRemove(toast.id)}
              key={toast.id}
            />
          ))}
        </div>
      </Portal>
    </>
  );
};

export { useToast } from './ToastContext';
