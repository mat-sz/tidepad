import React from 'react';

import { SidebarItem, SidebarItemProps } from './SidebarItem';
import clsx from 'clsx';

export const SidebarAction = React.forwardRef<
  HTMLLIElement,
  React.PropsWithChildren<SidebarItemProps>
>(({ className, ...props }, ref) => {
  return (
    <SidebarItem
      className={clsx('sidebar_action', className)}
      {...props}
      ref={ref}
    />
  );
});
