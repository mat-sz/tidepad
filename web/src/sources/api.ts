import { makeAutoObservable, reaction } from 'mobx';
import {
  NoteType,
  NotesResponse,
  SpaceType,
  httpDelete,
  httpGet,
  httpPatch,
  httpPost,
} from '../api';
import { kreds } from '../common';
import { debounce, tryParse } from '../helpers';
import {
  ConfigSource,
  DataSource,
  DataSourceState,
  EntitySource,
  NoteLoadQuery,
  NoteOptions,
  NoteQuery,
  OrderItem,
  SpaceOptions,
} from './types';

const limit = 50;
const maxItems = 150;

export class APINotesEntitySource
  implements
    EntitySource<NoteType, NoteOptions, number, NoteQuery, NoteLoadQuery>
{
  readonly basePath;
  items: NoteType[] = [];
  isLoading = false;
  hasMoreBefore = false;
  hasMoreAfter = false;

  constructor(spaceId: string) {
    this.basePath = `./spaces/${spaceId}/notes`;
    makeAutoObservable(this);
  }

  private reconcileItems(
    currentItems: NoteType[],
    newItems: NoteType[]
  ): NoteType[] {
    const items: Record<number, NoteType> = {};
    for (const item of currentItems) {
      items[item.id] = item;
    }

    for (const item of newItems) {
      items[item.id] = item;
    }

    return Object.values(items);
  }

  async load(query: NoteLoadQuery): Promise<void> {
    if (
      !query ||
      (typeof query.before === 'undefined' &&
        typeof query.after === 'undefined')
    ) {
      this.isLoading = true;
    } else if (typeof query.before !== 'undefined') {
      this.hasMoreBefore = false;
    } else if (typeof query.after !== 'undefined') {
      this.hasMoreAfter = false;
    }

    const res = await this.fetchResponse({ limit, ...query });
    const loadedItems = res.notes;

    if (typeof query.before !== 'undefined') {
      this.items = this.reconcileItems(this.items, loadedItems).slice(
        0,
        maxItems
      );
    } else if (typeof query.after !== 'undefined') {
      const newItems = this.reconcileItems(this.items, loadedItems);
      const startIndex = Math.max(newItems.length - maxItems - 1, 0);
      this.items = newItems.slice(startIndex);
    } else {
      this.items = loadedItems;
    }

    const first = this.items[0];
    const last = this.items[this.items.length - 1];
    console.log(first?.id, res.firstId, last?.id, res.lastId);
    this.isLoading = false;
    this.hasMoreBefore = !!(
      typeof res.firstId !== 'undefined' &&
      first &&
      first.id > res.firstId
    );
    this.hasMoreAfter = !!(
      typeof res.lastId !== 'undefined' &&
      last &&
      last.id < res.lastId
    );
  }

  private fetchResponse(query: NoteQuery): Promise<NotesResponse> {
    return httpGet<NotesResponse>(this.basePath, query as any);
  }

  async fetch(query: NoteQuery): Promise<NoteType[]> {
    const res = await this.fetchResponse(query);
    return res.notes;
  }

  get(id: number): Promise<NoteType> {
    return httpGet([`${this.basePath}/:1`, id.toString()]);
  }

  async create(options: NoteOptions): Promise<NoteType> {
    const temporaryItem: NoteType = {
      id: -1 * new Date().getTime(),
      body: '',
      authorId: 0,
      createdAt: new Date().toISOString(),
      pinned: false,
      ...options,
      clientSideType: 'sending',
      canDelete: true,
      canEdit: true,
    };

    this.items.push(temporaryItem);

    const newItem = (await httpPost(this.basePath, options)) as NoteType;
    this.items = [
      ...this.items.filter(item => item.id !== temporaryItem.id),
      newItem,
    ];
    return newItem;
  }

  async update(id: number, options: NoteOptions): Promise<NoteType> {
    this.items = this.items.map(item =>
      item.id === id
        ? { ...item, ...options, clientSideType: 'updating' }
        : item
    );
    const updatedItem = (await httpPatch(
      [`${this.basePath}/:1`, id.toString()],
      options
    )) as NoteType;
    this.items = this.items.map(item => (item.id === id ? updatedItem : item));
    return updatedItem;
  }

  delete(id: number): Promise<void> {
    this.items = this.items.filter(item => item.id !== id);
    return httpDelete([`${this.basePath}/:1`, id.toString()]);
  }
}

export class APISpacesEntitySource
  implements EntitySource<SpaceType, SpaceOptions, number>
{
  readonly basePath = './spaces';
  items: SpaceType[] = [];
  isLoading = false;
  hasMoreBefore = false;
  hasMoreAfter = false;

  constructor() {
    makeAutoObservable(this);
    this.load();
  }

  async load(): Promise<void> {
    this.isLoading = true;
    const items = await this.fetch();
    this.items = items;
    this.isLoading = false;
  }

  fetch(): Promise<SpaceType[]> {
    return httpGet(this.basePath);
  }

  get(id: number): Promise<SpaceType> {
    return httpGet([`${this.basePath}/:1`, id.toString()]);
  }

  async create(options: SpaceOptions): Promise<SpaceType> {
    const result = await httpPost<SpaceType, SpaceOptions>(
      this.basePath,
      options
    );
    this.items.push(result);
    return result;
  }

  async update(id: number, options: SpaceOptions): Promise<SpaceType> {
    const result = await httpPatch<SpaceType, SpaceOptions>(
      [`${this.basePath}/:1`, id.toString()],
      options
    );
    this.items = this.items.map(item => (item.id === id ? result : item));
    return result;
  }

  delete(id: number): Promise<void> {
    this.items = this.items.filter(item => item.id !== id);
    return httpDelete([`${this.basePath}/:1`, id.toString()]);
  }
}

export class APIConfigSource implements ConfigSource {
  readonly basePath = './user/data';

  order: OrderItem[] = [];
  settings: Record<string, any> = {};

  constructor() {
    this.order = tryParse((kreds?.user as any)?.orderJson, []);
    this.settings = tryParse((kreds?.user as any)?.settingsJson, {});

    makeAutoObservable(this);

    reaction(
      () => this.order,
      () => {
        const order = this.order;
        debounce('updateOrder', async () => {
          await httpPatch(this.basePath, { orderJson: JSON.stringify(order) });
          await kreds?.updateUser();
        });
      },
      { fireImmediately: false }
    );

    reaction(
      () => this.settings,
      async () => {
        const settings = this.settings;
        await httpPatch(this.basePath, {
          settingsJson: JSON.stringify(settings),
        });
        await kreds?.updateUser();
      },
      { fireImmediately: false }
    );
  }
}

export class APIDataSource implements DataSource {
  isSynchronizable = false;
  state = DataSourceState.SYNCHRONIZED;
  lastSynchronized = undefined;

  private _notes: Record<string, APINotesEntitySource> = {};
  spaces = new APISpacesEntitySource();
  config = new APIConfigSource();

  constructor() {
    makeAutoObservable(this);
  }

  notes(spaceId: string) {
    if (this._notes[spaceId]) {
      return this._notes[spaceId];
    } else {
      const notes = new APINotesEntitySource(spaceId);
      this._notes[spaceId] = notes;
      return notes;
    }
  }
}
