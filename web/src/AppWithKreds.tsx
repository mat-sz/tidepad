import React from 'react';
import { useKreds } from '@kreds/react';

import { LandingPage } from './screens/landingPage';
import { Main } from './screens/main';

export const AppWithKreds: React.FC = () => {
  const kreds = useKreds();

  return (
    <div className="App">
      {kreds.user ? <Main userId={kreds.user.id} /> : <LandingPage />}
    </div>
  );
};
