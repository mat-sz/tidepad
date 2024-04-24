import React from 'react';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';

import { useDataContext } from '../../../contexts/DataContext';
import { DataSourceState } from '../../../sources/types';

export const Synchronization: React.FC = observer(() => {
  const { state } = useDataContext();

  return (
    <div
      className={clsx('section-header', 'sync', {
        bg_danger: state === DataSourceState.OFFLINE,
        // bg_success: state === DataSourceState.SYNCHRONIZED,
      })}
    >
      {state === DataSourceState.SYNCHRONIZED && 'Synchronized'}
      {state === DataSourceState.SYNCHRONIZING && 'Synchronizing'}
      {state === DataSourceState.OFFLINE && 'Offline'}
      {state === DataSourceState.UNKNOWN && 'Unknown'}
    </div>
  );
});
