import React from 'react';
import { isSameHour, differenceInMinutes, format } from 'date-fns';
import { IoBook, IoChevronDown, IoCloseCircle } from 'react-icons/io5';
import { isSameDay } from 'date-fns/esm';

import { Note } from '../../../components/Note';
import { Loading } from '../../../components/Loading';
import { useNotesContext } from '../../../contexts/NotesContext';
import { Alert } from '../../../components/Alert';
import { Window } from '../../../components/Window';
import { NotesPlaceholder } from './NotesPlaceholder';
import { Button } from '../../../components/Button';
import { NoteEditor } from '../../../components/NoteEditor';

const NotesContent: React.FC = () => {
  const {
    isLoading,
    error,
    notes,
    stuckToBottom,
    setStuckToBottom,
    requestItemsAfter,
    requestItemsBefore,
    hasItemsAfter,
    hasItemsBefore,
  } = useNotesContext();

  if (isLoading) {
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

  if (notes?.length === 0) {
    return (
      <div className="window">
        <Alert icon={<IoBook />}>
          This space is empty. Consider creating a new note.
        </Alert>
      </div>
    );
  }

  return (
    <Window
      hasItemsAfter={hasItemsAfter}
      hasItemsBefore={hasItemsBefore}
      placeholder={<NotesPlaceholder />}
      topPlaceholder={
        <Alert icon={<IoBook />}>
          This is it. There are no older notes to display.
        </Alert>
      }
      requestItemsAfter={requestItemsAfter}
      requestItemsBefore={requestItemsBefore}
      stuckToBottom={stuckToBottom}
      setStuckToBottom={setStuckToBottom}
    >
      <ul className="notes">
        {notes?.map((note, i) => {
          const noteDate = new Date(note.createdAt);
          const previousNote = notes[i - 1];
          let shouldMergeWithPrevious = false;
          let shouldDisplayDateDivider = true;

          if (previousNote) {
            const previousNoteDate = new Date(previousNote.createdAt);
            shouldMergeWithPrevious =
              isSameHour(previousNoteDate, noteDate) &&
              differenceInMinutes(noteDate, previousNoteDate) < 5;
            shouldDisplayDateDivider = !isSameDay(previousNoteDate, noteDate);
          }

          return (
            <React.Fragment key={note.id}>
              {shouldDisplayDateDivider && (
                <li className="note_divider">
                  <span>{format(noteDate, 'MMMM d, y')}</span>
                </li>
              )}
              <Note note={note} showMetadata={!shouldMergeWithPrevious} />
            </React.Fragment>
          );
        })}
        {notes?.length === 0 && <li>No notes yet.</li>}
      </ul>
      {hasItemsAfter && (
        <div className="infobar">
          <span>You're viewing older notes.</span>
          <Button variant="secondary">
            Jump to present <IoChevronDown />
          </Button>
        </div>
      )}
    </Window>
  );
};

export const Notes: React.FC = () => {
  const { createNote } = useNotesContext();

  return (
    <div className="content-notes">
      <NotesContent />
      <NoteEditor
        className="note_editor_main"
        onSave={createNote}
        isSend
        allowAttachments
        autoFocus
      />
    </div>
  );
};
