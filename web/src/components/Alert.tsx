import clsx from 'clsx';
import React from 'react';

interface Props {
  className?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  variant?:
    | 'primary'
    | 'secondary'
    | 'danger'
    | 'warning'
    | 'success'
    | 'default';
}

export const Alert: React.FC<React.PropsWithChildren<Props>> = ({
  className,
  variant = 'default',
  icon,
  children,
  onClick,
}) => {
  return (
    <div
      className={clsx('alert', `bg_${variant}`, className)}
      onClick={onClick}
    >
      {icon}
      <span>{children}</span>
    </div>
  );
};
