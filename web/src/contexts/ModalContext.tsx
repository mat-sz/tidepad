import React, { useState } from 'react';
import { NoteType, SpaceType } from '../api';
import { useHotkey } from '../hooks/useHotkey';
import { ConfirmDeleteNote } from '../modals/ConfirmDeleteNote';
import { CreateCategory } from '../modals/CreateCategory';
import { CreateSpace } from '../modals/CreateSpace';
import { UpdateSpace } from '../modals/UpdateSpace';
import { UpdateCategory } from '../modals/UpdateCategory';

interface ModalContextType {
  openModal(
    name: 'create_space',
    payload: { onCreate(name: string): Promise<void> }
  ): void;
  openModal(
    name: 'update_space',
    payload: {
      space: SpaceType;
      onUpdate(id: number, name: string): Promise<void>;
    }
  ): void;
  openModal(
    name: 'create_category',
    payload: { onCreate(name: string): Promise<void> }
  ): void;
  openModal(
    name: 'update_category',
    payload: {
      category: any;
      onCreate(id: string, name: string): Promise<void>;
      onDelete(id: string): Promise<void>;
    }
  ): void;
  openModal(
    name: 'confirm_delete_note',
    payload: { onConfirm(id: number): Promise<void>; note: NoteType }
  ): void;
  openModal(name: string, payload?: any): void;
  closeModal(): void;
  currentModal?: {
    name: string;
    payload?: any;
  };
}

const ModalContext = React.createContext<ModalContextType>(undefined!);

export const ModalContextProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [currentModal, setCurrentModal] =
    useState<ModalContextType['currentModal']>();

  useHotkey('Escape', () => setCurrentModal(undefined), !!currentModal);

  const context: ModalContextType = {
    openModal(name, payload?: any) {
      setCurrentModal({ name, payload });
    },
    closeModal() {
      setCurrentModal(undefined);
    },
    currentModal,
  };

  return (
    <ModalContext.Provider value={context}>
      <CreateSpace />
      <UpdateSpace />
      <CreateCategory />
      <UpdateCategory />
      <ConfirmDeleteNote />
      {children}
    </ModalContext.Provider>
  );
};
export const useModalContext = () => React.useContext(ModalContext);
