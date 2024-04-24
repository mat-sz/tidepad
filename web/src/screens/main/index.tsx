import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import { ModalContextProvider } from '../../contexts/ModalContext';
import { FullScreen } from '../../components/FullScreen';
import { Sidebar } from './sidebar';
import { Dashboard } from './dashboard';
import { Content } from './content';
import { Settings } from './settings';
import { DataContextProvider } from '../../contexts/DataContext';
import { APIDataSource } from '../../sources/api';
import { DataSource } from '../../sources/types';

interface Props {
  userId?: number | string;
}

export const Main: React.FC<Props> = ({ userId = 'local' }) => {
  const [source, setSource] = useState<DataSource>();

  useEffect(() => {
    setSource(new APIDataSource());
  }, [userId]);

  if (!source) {
    return null;
  }

  return (
    <DataContextProvider source={source}>
      <ModalContextProvider>
        <FullScreen sidebar={<Sidebar />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/space/:id" element={<Content />} />
          </Routes>
        </FullScreen>
      </ModalContextProvider>
    </DataContextProvider>
  );
};
