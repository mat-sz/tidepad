import React from 'react';
import { IoApps } from 'react-icons/io5';

import { Alert } from '../../../components/Alert';
import { TopBar } from '../../../components/TopBar';

export const Dashboard: React.FC = () => {
  return (
    <>
      <TopBar
        title={
          <>
            <IoApps />
            <span>Dashboard</span>
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
