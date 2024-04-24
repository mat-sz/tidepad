import React from 'react';
import { IoArrowBack } from 'react-icons/io5';

import { SidebarAction } from '../../../components/FullScreen/SidebarAction';
import { isKredsEnabled } from '../../../common';
import { LogOut } from './kreds/LogOut';

export const SettingsList: React.FC = () => {
  return (
    <>
      <ul className="space_list">
        <SidebarAction to="/">
          <IoArrowBack /> Back
        </SidebarAction>
        {isKredsEnabled && <LogOut />}
      </ul>
    </>
  );
};
