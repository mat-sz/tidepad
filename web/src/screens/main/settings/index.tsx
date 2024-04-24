import React from 'react';
import { IoSettings } from 'react-icons/io5';

import { Alert } from '../../../components/Alert';
import { TopBar } from '../../../components/TopBar';

export const Settings: React.FC = () => {
  return (
    <>
      <TopBar
        title={
          <>
            <IoSettings />
            <span>Settings</span>
          </>
        }
      />
      <div className="content-main">
        <div className="content-notes">
          <Alert variant="default">There's nothing here yet.</Alert>
        </div>
      </div>
    </>
  );
};
