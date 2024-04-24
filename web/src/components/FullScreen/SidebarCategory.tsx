import React from 'react';
import { IoChevronDown, IoChevronForward } from 'react-icons/io5';

import { SidebarItem, SidebarItemProps } from './SidebarItem';
import clsx from 'clsx';

export interface SidebarCategoryProps extends SidebarItemProps {
  isCollapsed?: boolean;
}

export const SidebarCategory = React.forwardRef<
  HTMLLIElement,
  React.PropsWithChildren<SidebarCategoryProps>
>(({ children, isCollapsed, className, ...props }, ref) => {
  return (
    <SidebarItem
      className={clsx('sidebar_category', className)}
      {...props}
      ref={ref}
    >
      {isCollapsed ? <IoChevronForward /> : <IoChevronDown />} {children}
    </SidebarItem>
  );
});
