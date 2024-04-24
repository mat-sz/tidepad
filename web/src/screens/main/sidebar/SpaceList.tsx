import React from 'react';
import { IoAdd } from 'react-icons/io5';
import { UniqueIdentifier } from '@dnd-kit/core';
import { v4 } from 'uuid';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';

import { SpaceItemType, SpaceListItem } from './SpaceListItem';
import { SortableTreeList } from '../../../components/SortableTreeList';
import { useModalContext } from '../../../contexts/ModalContext';
import { SidebarAction } from '../../../components/FullScreen/SidebarAction';
import { SidebarDivider } from '../../../components/FullScreen/SidebarDivider';
import { useDataContext } from '../../../contexts/DataContext';
import { useToast } from '../../../components/Toast';
import { OrderItem } from '../../../sources/types';

export const SpaceList: React.FC = observer(() => {
  const { config, spaces } = useDataContext();
  const { toast } = useToast();
  const { openModal } = useModalContext();

  if (spaces.isLoading) {
    // TODO: better
    return <>Loading...</>;
  }

  const items: SpaceItemType[] = [];
  const skipIds: Set<UniqueIdentifier> = new Set();

  function resolveItem(
    id: UniqueIdentifier,
    parentId?: UniqueIdentifier,
    resolveAs?: 'space'
  ): SpaceItemType | undefined {
    let item: SpaceItemType | undefined = config.order.find(
      item => item.id === id
    );
    if (!item) {
      if (resolveAs === 'space') {
        item = {
          type: 'space',
          id: id,
          name: spaces.items.find(space => space.id === id)?.name,
          href: `/space/${id}`,
          parent: parentId,
        };

        if (!item.name) {
          return undefined;
        }
      }
    }

    if (!item) {
      return undefined;
    }

    if (item.type === 'space') {
      item.name = spaces.items.find(space => space.id === item!.id)?.name;
      item.href = `/space/${id}`;
      item.parent = parentId;
      item.children = undefined;

      if (!item.name) {
        return undefined;
      }
    } else if (item.type === 'category') {
      item.canHaveChildren = true;
      item.canBeCollapsed = true;
    }
    return item;
  }

  function handleItem(
    orderItem?: OrderItem | SpaceItemType,
    parentId?: UniqueIdentifier,
    isResolved?: boolean
  ) {
    if (!orderItem) {
      return;
    }

    const item = isResolved ? orderItem : resolveItem(orderItem.id, parentId);
    if (!item || skipIds.has(item.id)) {
      return;
    }

    skipIds.add(item.id);
    items.push(item);

    if (item.type === 'category' && Array.isArray(item.children)) {
      for (const childId of item.children) {
        handleItem(resolveItem(childId, item.id), item.id);
      }
    }
  }

  if (spaces) {
    for (const element of config.order) {
      handleItem(element);
    }

    items.push();

    for (const space of spaces.items) {
      const resolved = resolveItem(space.id, undefined, 'space');
      if (!resolved) {
        continue;
      }

      handleItem(resolved, undefined, true);
    }
  }

  function onChange(items: SpaceItemType[]) {
    runInAction(() => {
      config.order = items.map(item => ({
        id: item.id,
        name: item.type === 'category' ? item.name : undefined,
        type: item.type!,
        children: item.children,
        isCollapsed: item.isCollapsed,
      }));
    });
  }

  return (
    <>
      <ul className="space_list">
        {items.length === 0 ? (
          <div>No spaces available. Create one below.</div>
        ) : (
          <SortableTreeList
            items={items}
            ItemComponent={SpaceListItem}
            onChange={onChange}
          />
        )}
        <SidebarDivider />
        <SidebarAction
          onClick={() =>
            openModal('create_space', {
              onCreate: async (name: string) => {
                try {
                  const space = await spaces.create({ name });
                  return space.id;
                } catch {
                  toast({
                    variant: 'danger',
                    title: 'An error occured while adding space.',
                  });
                }
              },
            })
          }
        >
          <IoAdd /> Create space
        </SidebarAction>
        <SidebarAction
          onClick={() =>
            openModal('create_category', {
              onCreate: name => {
                runInAction(() => {
                  config.order = [
                    ...config.order,
                    { id: v4(), type: 'category', name, children: [] },
                  ];
                });
              },
            })
          }
        >
          <IoAdd /> Create category
        </SidebarAction>
      </ul>
    </>
  );
});
