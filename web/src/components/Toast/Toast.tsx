import React from 'react';
import { ToastData } from './types';
import { Alert } from '../Alert';

interface ToastProps {
  toast: ToastData;
  onRemove: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  return (
    <Alert variant={toast.variant} icon={toast.icon} onClick={onRemove}>
      <div className="title">{toast.title}</div>
      <div>{toast.description}</div>
    </Alert>
  );
};
