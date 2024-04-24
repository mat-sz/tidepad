import clsx from 'clsx';
import React from 'react';

import { BaseButton, BaseButtonProps } from './BaseButton';

export interface ButtonProps extends BaseButtonProps {
  variant?:
    | 'primary'
    | 'secondary'
    | 'danger'
    | 'success'
    | 'default'
    | 'secondary-danger';
}

export const Button: React.FC<React.PropsWithChildren<ButtonProps>> = ({
  variant = 'default',
  className,
  ...props
}) => {
  return (
    <BaseButton
      className={clsx(
        'button',
        `bg_${variant}`,
        `bg_${variant}_hover`,
        className
      )}
      {...props}
    />
  );
};
