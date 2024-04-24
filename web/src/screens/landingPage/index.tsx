import React from 'react';
import { useKreds } from '@kreds/react';

import { Button } from '../../components/Button';

export const LandingPage: React.FC = () => {
  const kreds = useKreds();

  if (kreds.isLoading) {
    return (
      <div className="landing_page">
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div className="landing_page">
      <h1>tidepad</h1>
      <p>You must authenticate before continuing.</p>
      <Button onClick={() => kreds.open()}>Log in</Button>
    </div>
  );
};
