import React from 'react';
import clsx from 'clsx';

import { BaseButton } from '../BaseButton';
import { useLocation } from 'react-router-dom';

export interface SidebarItemProps
  extends React.LiHTMLAttributes<HTMLLIElement> {
  actions?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  to?: string;
}

export const SidebarItem = React.forwardRef<
  HTMLLIElement,
  React.PropsWithChildren<SidebarItemProps>
>(({ children, actions, onClick, className, to, ...props }, ref) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <li
      className={clsx('sidebar_item', { active: isActive }, className)}
      ref={ref}
      {...props}
    >
      <BaseButton onClick={onClick} to={to}>
        {children}
      </BaseButton>
      {actions && <div className="sidebar_item_actions">{actions}</div>}
    </li>
  );
});
