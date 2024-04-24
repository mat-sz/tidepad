import React from 'react';
import { useLocation } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { isKredsEnabled } from '../../../common';
import { useDataContext } from '../../../contexts/DataContext';
import { User as KredsUser } from './kreds/User';
import { SpaceList } from './SpaceList';
import { SettingsList } from './SettingsList';
import { User } from './User';
import { Synchronization } from './Synchronization';

export const Sidebar: React.FC = observer(() => {
  const location = useLocation();
  const { isSynchronizable } = useDataContext();

  return (
    <>
      {isKredsEnabled ? <KredsUser /> : <User />}
      {isSynchronizable && <Synchronization />}
      {location.pathname === '/settings' ? <SettingsList /> : <SpaceList />}
    </>
  );
});
