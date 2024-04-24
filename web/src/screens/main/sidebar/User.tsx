import React from 'react';
import { IoSettings } from 'react-icons/io5';
import { IconButton } from '../../../components/IconButton';

export const User: React.FC = () => {
  return (
    <div className="section-header user">
      <div className="user_info">Local</div>
      <div className="user_actions">
        <IconButton title="Settings" to="/settings" state="keep_sidebar">
          <IoSettings />
        </IconButton>
      </div>
    </div>
  );
};
