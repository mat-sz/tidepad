import React from 'react';
import { IoLogOut } from 'react-icons/io5';
import { useKreds } from '@kreds/react';

import { SidebarAction } from '../../../../components/FullScreen/SidebarAction';

export const LogOut: React.FC = () => {
  const { unauthenticate } = useKreds();

  return (
    <SidebarAction onClick={unauthenticate}>
      <IoLogOut /> Log out
    </SidebarAction>
  );
};
