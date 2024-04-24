import React from 'react';
import { IoBook, IoClose, IoCloseCircle } from 'react-icons/io5';

import { Note } from '../../../components/Note';
import { Loading } from '../../../components/Loading';
import { useNotesContext } from '../../../contexts/NotesContext';
import { Alert } from '../../../components/Alert';
import { IconButton } from '../../../components/IconButton';

export const SearchContent: React.FC = () => {
  const { searchIsLoading, searchIsVisible, error, searchItems } =
    useNotesContext();

  if (!searchIsVisible) {
    return null;
  }

  if (searchIsLoading) {
    // TODO: better
    return (
      <div className="window flex_center">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="window">
        <Alert variant="danger" icon={<IoCloseCircle />}>
          An error occured while loading notes.
        </Alert>
      </div>
    );
  }

  if (!searchItems?.length) {
    return (
      <div className="window">
        <Alert icon={<IoBook />}>No results.</Alert>
      </div>
    );
  }

  return (
    <div className="window">
      <ul>
        {searchItems?.map((note, i) => (
          <Note note={note} preview key={note.id} />
        ))}
      </ul>
    </div>
  );
};

export const Search: React.FC = () => {
  const { searchIsLoading, searchIsVisible, closeSearch } = useNotesContext();

  if (!searchIsVisible) {
    return null;
  }

  return (
    <div className="content-search">
      <div className="section-header hidden_mobile">
        <span>{searchIsLoading ? 'Searching...' : 'Search results'}</span>
        <IconButton title="Close" onClick={closeSearch}>
          <IoClose />
        </IconButton>
      </div>
      <SearchContent />
    </div>
  );
};
