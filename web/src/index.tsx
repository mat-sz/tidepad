import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import * as Kreds from '@kreds/react';

import './index.scss';

import { kreds } from './common';
import { App } from './App';
import { AppWithKreds } from './AppWithKreds';
import { Toasts } from './components/Toast';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Toasts>
        {kreds ? (
          <Kreds.Provider client={kreds}>
            <Kreds.Modal />
            <AppWithKreds />
          </Kreds.Provider>
        ) : (
          <App />
        )}
      </Toasts>
    </BrowserRouter>
  </React.StrictMode>
);
