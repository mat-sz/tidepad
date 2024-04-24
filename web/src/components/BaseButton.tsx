import clsx from 'clsx';
import React from 'react';
import { NavLink } from 'react-router-dom';

export interface BaseButtonProps {
  title?: string;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  to?: string;
  state?: any;
  submit?: boolean;
}

export const BaseButton: React.FC<React.PropsWithChildren<BaseButtonProps>> = ({
  title,
  className,
  onClick,
  disabled,
  children,
  to,
  state,
  submit,
}) => {
  if (to) {
    return (
      <NavLink
        to={to}
        state={state}
        title={title}
        className={({ isActive }) =>
          clsx(className, { disabled, active: isActive })
        }
        onClick={onClick}
      >
        {children}
      </NavLink>
    );
  }

  return (
    <button
      title={title}
      className={className}
      onClick={onClick}
      disabled={disabled}
      type={submit ? 'submit' : 'button'}
    >
      {children}
    </button>
  );
};
