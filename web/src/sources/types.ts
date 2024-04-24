import { UniqueIdentifier } from '@dnd-kit/core';
import { NoteType, SpaceType } from '../api';

export enum DataSourceState {
  UNKNOWN,
  OFFLINE,
  SYNCHRONIZING,
  SYNCHRONIZED,
}

export interface EntitySource<
  TEntity,
  TOptions,
  TId = number,
  TQuery = undefined,
  TLoadOptions = undefined
> {
  items: TEntity[];
  readonly isLoading: boolean;
  readonly hasMoreBefore: boolean;
  readonly hasMoreAfter: boolean;

  load(options: TLoadOptions): Promise<void>;
  fetch(query: TQuery): Promise<TEntity[]>;
  get(id: TId): Promise<TEntity>;
  create(options: TOptions): Promise<TEntity>;
  update(id: TId, options: TOptions): Promise<TEntity>;
  delete(id: TId): Promise<void>;
}

export interface ConfigSource {
  order: OrderItem[];
  settings: Record<string, any>;
}

export interface NoteOptions {
  body?: string;
  attachments?: File[];
  pinned?: boolean;
}

export interface NoteQuery {
  around?: number;
  after?: number;
  before?: number;
  limit?: number;
  has?: string;
  content?: string;
  pinned?: boolean;
}

export interface NoteLoadQuery {
  after?: number;
  before?: number;
}

export interface SpaceOptions {
  name: string;
}

export interface DataSource {
  readonly isSynchronizable: boolean;
  readonly state: DataSourceState;
  readonly lastSynchronized?: Date;

  notes(
    spaceId: string
  ): EntitySource<NoteType, NoteOptions, number, NoteQuery, NoteLoadQuery>;
  readonly spaces: EntitySource<SpaceType, SpaceOptions, number>;
  readonly config: ConfigSource;
}

export type Settings = Record<string, any>;
export interface OrderItem {
  id: UniqueIdentifier;
  type: 'space' | 'category';
  children?: UniqueIdentifier[];
  isCollapsed?: boolean;
  name?: string;
}
export type Order = OrderItem[];
