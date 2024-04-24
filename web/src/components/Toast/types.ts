import React from 'react';

export interface ToastData {
  id: string;
  variant: 'danger' | 'success' | 'warning' | 'default';
  title: string;
  description?: string;
  icon?: React.ReactNode;
}
