import React from 'react';
import { useParams } from 'react-router-dom';

import { NotesTopBar } from './NotesTopBar';
import { Notes } from './Notes';
import { NotesContextProvider } from '../../../contexts/NotesContext';
import { Search } from './Search';

export const Content: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return null;
  }

  return (
    <NotesContextProvider spaceId={id}>
      <NotesTopBar />
      <div className="content-main">
        <Notes />
        <Search />
      </div>
    </NotesContextProvider>
  );
};
