import React from 'react';
import { IoMenuSharp } from 'react-icons/io5';

import { IconButton } from './IconButton';
import { useSidebar } from './FullScreen';

interface Props {
  title?: React.ReactNode;
  actions?: React.ReactNode;
}

export const TopBar: React.FC<Props> = ({ title, actions }) => {
  const { toggle } = useSidebar();

  return (
    <div className="section-header space">
      <IconButton title="Menu" className="mobile_menu_trigger" onClick={toggle}>
        <IoMenuSharp />
      </IconButton>
      <div className="space_name">{title}</div>
      <div className="space_actions">{actions}</div>
    </div>
  );
};
