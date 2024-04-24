import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';

import { NoteType } from '../api';
import { useHotkey } from '../hooks/useHotkey';
import { useDataContext } from './DataContext';

// notes context

// - highlightItem(id?: string | number)

interface SearchOptions {
  content?: string;
  pinned?: boolean;
}

interface NotesContextType {
  readonly notes?: NoteType[];
  readonly error?: string;
  readonly isLoading: boolean;
  refresh(): void;
  requestItemsBefore(): void;
  requestItemsAfter(): void;
  readonly hasItemsBefore: boolean;
  readonly hasItemsAfter: boolean;
  createNote(body: string, attachments?: File[]): Promise<void>;
  updateNote(
    id: number,
    data: { body?: string; pinned?: boolean }
  ): Promise<void>;
  deleteNote(id: number): Promise<void>;
  readonly editingNoteId?: number;
  setEditingNoteId(id?: number): void;
  readonly stuckToBottom: boolean;
  setStuckToBottom(value: boolean): void;
  readonly searchItems?: NoteType[];
  readonly searchIsVisible: boolean;
  readonly searchIsLoading: boolean;
  search(options: SearchOptions): void;
  closeSearch(): void;
}

const NotesContext = React.createContext<NotesContextType>(undefined!);

export const NotesContextProvider: React.FC<
  React.PropsWithChildren<{ spaceId: string }>
> = observer(({ children, spaceId }) => {
  const source = useDataContext().notes(spaceId);
  const [editingNoteId, setEditingNoteId] = useState<number>();
  const [stuckToBottom, setStuckToBottom] = useState(true);

  const [searchItems, setSearchItems] = useState<NoteType[]>();
  const [searchIsLoading, setSearchIsLoading] = useState(false);
  const [searchIsVisible, setSearchIsVisible] = useState(true);

  const limit = 50;

  const search = async (
    options: SearchOptions,
    mode?: 'before' | 'after',
    id?: number
  ) => {
    setSearchIsVisible(true);
    setSearchIsLoading(true);

    const loadedItems = await source.fetch({
      ...options,
      limit,
      before: mode === 'before' ? id : undefined,
    });
    loadedItems.reverse();

    setSearchItems(loadedItems);
    setSearchIsLoading(false);
  };

  useHotkey('Escape', () => setEditingNoteId(undefined), !!editingNoteId);

  useEffect(() => {
    setStuckToBottom(true);
    setSearchIsVisible(false);
    setSearchItems(undefined);
    source.load({});
  }, [setStuckToBottom, source, setSearchIsVisible, setSearchItems]);

  const context: NotesContextType = {
    notes: source.items,

    isLoading: source.isLoading,
    refresh() {
      source.load({});
    },
    requestItemsBefore() {
      const firstItem = source.items[0];
      if (firstItem && source.hasMoreBefore) {
        source.load({ before: firstItem.id });
      }
    },
    requestItemsAfter() {
      const lastItem = source.items[source.items.length - 1];
      if (lastItem && source.hasMoreAfter) {
        source.load({ after: lastItem.id });
      }
    },
    hasItemsBefore: source.hasMoreBefore,
    hasItemsAfter: source.hasMoreAfter,
    async createNote(body, attachments) {
      setStuckToBottom(true);
      try {
        await source.create({
          body,
          attachments,
        });
      } catch {
        //TODO: display error
      }
    },
    async updateNote(id, data) {
      try {
        await source.update(id, data);
      } catch {
        // TODO: display
      }
    },
    async deleteNote(id) {
      try {
        await source.delete(id);
      } catch {
        // TODO: display
      }
    },
    editingNoteId,
    setEditingNoteId,
    stuckToBottom,
    setStuckToBottom,
    search(options) {
      search(options);
    },
    searchItems,
    searchIsLoading,
    searchIsVisible,
    closeSearch() {
      setSearchIsVisible(false);
    },
  };

  return (
    <NotesContext.Provider value={context}>{children}</NotesContext.Provider>
  );
});
export const useNotesContext = () => React.useContext(NotesContext);
