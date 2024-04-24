import React from 'react';
import { IoSettings } from 'react-icons/io5';
import { useKreds } from '@kreds/react';

import { IconButton } from '../../../../components/IconButton';

export const User: React.FC = () => {
  const kreds = useKreds();

  if (!kreds.user) {
    return null;
  }

  return (
    <div className="section-header user">
      <div className="user_info">{kreds.user.name}</div>
      <div className="user_actions">
        <IconButton title="Settings" to="/settings" state="keep_sidebar">
          <IoSettings />
        </IconButton>
      </div>
    </div>
  );
};
