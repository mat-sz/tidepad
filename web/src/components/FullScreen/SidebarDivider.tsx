import React from 'react';
import clsx from 'clsx';

interface SidebarDividerProps {
  className?: string;
}

export const SidebarDivider: React.FC<SidebarDividerProps> = ({
  className,
}) => {
  return <li className={clsx('sidebar_divider', className)} />;
};
