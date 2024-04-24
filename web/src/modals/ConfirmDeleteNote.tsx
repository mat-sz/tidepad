import React, { useState } from 'react';

import { NoteType } from '../api';
import { Note } from '../components/Note';
import { useModalContext } from '../contexts/ModalContext';
import { BaseModal } from './BaseModal';

export const ConfirmDeleteNote: React.FC = () => {
  const { currentModal, closeModal } = useModalContext();
  const [isLoading, setIsLoading] = useState(false);

  const note = currentModal?.payload.note as NoteType;

  if (!note) {
    return null;
  }

  const onConfirm = currentModal?.payload.onConfirm as (
    id: number
  ) => Promise<void>;

  const onSubmit = async () => {
    setIsLoading(true);
    await onConfirm(note.id);
    setIsLoading(false);
    closeModal();
  };

  return (
    <BaseModal
      name="confirm_delete_note"
      isLoading={isLoading}
      showCancelButton
      title="Delete Note"
      submitButtonLabel="Delete note"
      submitButtonVariant="danger"
      onSubmit={onSubmit}
      content={
        <>
          <div>Are you sure you want to delete this note?</div>
          <Note note={note} preview />
        </>
      }
    />
  );
};
