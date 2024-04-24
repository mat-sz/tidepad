import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useForm } from 'react-hook-form';
import {
  IoClose,
  IoCloseCircle,
  IoPin,
  IoReader,
  IoSearch,
  IoTime,
} from 'react-icons/io5';
import { useParams } from 'react-router-dom';

import { IconButton } from '../../../components/IconButton';
import { useNotesContext } from '../../../contexts/NotesContext';
import { useDataContext } from '../../../contexts/DataContext';
import { TopBar } from '../../../components/TopBar';

interface Inputs {
  query: string;
}

export const NotesTopBar: React.FC = () => {
  const { register, handleSubmit, reset, watch, setFocus, setValue } =
    useForm<Inputs>();
  const value = watch('query');
  const [isSearchInputVisible, setSearchInputVisible] = useState(false);

  const { search, closeSearch, searchIsVisible } = useNotesContext();
  const { id } = useParams<{ id: string }>();
  const { spaces } = useDataContext();

  useEffect(() => {
    if (!searchIsVisible) {
      setValue('query', '');
    }
  }, [searchIsVisible, setValue]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key === 'f') || e.key === 'F3') {
        e.preventDefault();
        setFocus('query');
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [setFocus]);

  if (spaces.isLoading) {
    // TODO: better
    return (
      <TopBar
        title={
          <>
            <IoTime />
            <span>Loading...</span>
          </>
        }
      />
    );
  }

  const spaceId = typeof id === 'string' ? parseInt(id) : undefined;
  const space =
    typeof spaceId === 'number'
      ? spaces.items.find(space => space.id === spaceId)
      : undefined;
  if (!space) {
    return (
      <TopBar
        title={
          <>
            <IoCloseCircle />
            <span>Error</span>
          </>
        }
      />
    );
  }

  return (
    <TopBar
      title={
        <>
          <IoReader />
          <span>{space?.name}</span>
        </>
      }
      actions={
        <>
          <IconButton
            title="Show pins"
            onClick={() => search({ pinned: true })}
          >
            <IoPin />
          </IconButton>
          <div
            className={clsx('space_search', {
              hidden_mobile: !isSearchInputVisible,
            })}
          >
            <form
              onSubmit={handleSubmit(({ query }) => search({ content: query }))}
            >
              <input
                type="text"
                placeholder="Search"
                {...register('query', { required: true })}
              />
            </form>
            <div className="hidden_mobile">
              {value ? (
                <button
                  onClick={() => {
                    reset();
                    closeSearch();
                  }}
                >
                  <IoClose />
                </button>
              ) : (
                <IoSearch />
              )}
            </div>
          </div>
          <IconButton
            title="Search"
            className="hidden_desktop"
            onClick={() => {
              setSearchInputVisible(!(isSearchInputVisible || searchIsVisible));
              closeSearch();
            }}
          >
            {isSearchInputVisible || searchIsVisible ? (
              <IoClose />
            ) : (
              <IoSearch />
            )}
          </IconButton>
        </>
      }
    />
  );
};
