import React from 'react';
import { IoPencil, IoPin, IoTrash } from 'react-icons/io5';

import { NoteType } from '../../api';
import { Body } from './Body';
import { useNotesContext } from '../../contexts/NotesContext';
import { NoteEditor } from '../NoteEditor';
import { QuickActions } from '../QuickActions';
import { useModalContext } from '../../contexts/ModalContext';

interface Props {
  note: NoteType;
}

export const Editable: React.FC<Props> = ({ note }) => {
  const { updateNote, deleteNote, editingNoteId, setEditingNoteId } =
    useNotesContext();
  const { openModal } = useModalContext();

  const setBody = note.canEdit
    ? (body: string) => updateNote(note.id, { body })
    : undefined;

  const isEditing = editingNoteId === note.id;
  const startEditing = () => setEditingNoteId(note.id);
  const stopEditing = () => setEditingNoteId(undefined);

  return (
    <>
      {!isEditing && (
        <QuickActions
          actions={[
            {
              key: 'pin',
              label: note.pinned ? 'Unpin' : 'Pin',
              icon: <IoPin />,
              onClick: () => updateNote(note.id, { pinned: !note.pinned }),
              hidden: !note.canEdit,
            },
            {
              key: 'edit',
              label: 'Edit',
              icon: <IoPencil />,
              onClick: () => startEditing(),
              hidden: !note.canEdit,
            },
            {
              key: 'delete',
              label: 'Delete',
              icon: <IoTrash />,
              onClick: e => {
                if (e.shiftKey) {
                  deleteNote(note.id);
                } else {
                  openModal('confirm_delete_note', {
                    onConfirm: deleteNote,
                    note,
                  });
                }
              },
              hidden: !note.canDelete,
            },
          ]}
        />
      )}
      {isEditing ? (
        <NoteEditor
          initialBody={note.body}
          onSave={body => {
            setBody?.(body);
            stopEditing();
          }}
          onCancel={() => stopEditing()}
        />
      ) : (
        <div className="body">
          <Body body={note.body} setBody={setBody} />
        </div>
      )}
    </>
  );
};
