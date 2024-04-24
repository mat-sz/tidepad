import clsx from 'clsx';
import React from 'react';
import { IoAdd, IoPencil, IoReader } from 'react-icons/io5';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { observer } from 'mobx-react-lite';

import { ItemType } from '../../../components/SortableTreeList';
import { IconButton } from '../../../components/IconButton';
import { useModalContext } from '../../../contexts/ModalContext';
import { SidebarItem } from '../../../components/FullScreen/SidebarItem';
import { SidebarCategory } from '../../../components/FullScreen/SidebarCategory';
import { useToast } from '../../../components/Toast';
import { useDataContext } from '../../../contexts/DataContext';

export interface SpaceItemType extends ItemType {
  type?: 'category' | 'space';
  name?: string;
  href?: string;
}

interface Props {
  item: SpaceItemType;
  depth: number;
  isGhost?: boolean;
  isClone?: boolean;
  isProjectedParent?: boolean;
  onCollapse?: () => void;
  projectedDepth?: number;
}

export const SpaceListItem: React.FC<Props> = observer(
  ({
    item,
    depth,
    isGhost,
    isClone,
    isProjectedParent,
    onCollapse,
    projectedDepth,
  }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: item.id });
    const { config, spaces } = useDataContext();
    const { toast } = useToast();
    const { openModal } = useModalContext();

    if (!item.type || !item.name) {
      return null;
    }

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      '--depth': depth,
    };

    const Component = item.type === 'category' ? SidebarCategory : SidebarItem;
    const onClick = item.type === 'category' ? onCollapse : undefined;

    const props =
      item.type === 'space'
        ? {
            actions: (
              <IconButton
                title="Settings"
                onClick={() =>
                  openModal('update_space', {
                    space: item,
                    onUpdate: async (id: number, name: string) => {
                      try {
                        await spaces.update(id, { name });
                      } catch {
                        toast({
                          variant: 'danger',
                          title: 'An error occured while updating space.',
                        });
                      }
                    },
                  })
                }
              >
                <IoPencil />
              </IconButton>
            ),
            to: item.href,
          }
        : {
            actions: (
              <>
                <IconButton
                  title="Create space"
                  onClick={e => {
                    e.stopPropagation();
                    openModal('create_space', {
                      onCreate: async (name: string) => {
                        try {
                          const space = await spaces.create({ name });

                          config.order = config.order.map(orderItem => {
                            if (orderItem.id !== item.id) {
                              return orderItem;
                            }

                            if (!orderItem.children) {
                              orderItem.children = [];
                            }

                            orderItem.children.push(space.id);
                            return orderItem;
                          });

                          return space.id;
                        } catch {
                          toast({
                            variant: 'danger',
                            title: 'An error occured while adding space.',
                          });
                        }
                      },
                    });
                  }}
                >
                  <IoAdd />
                </IconButton>
                <IconButton
                  title="Settings"
                  onClick={e => {
                    e.stopPropagation();
                    openModal('update_category', {
                      category: item,
                      onUpdate: (id: string, name: string) =>
                        (config.order = config.order.map(item => {
                          if (item.id !== id) {
                            return item;
                          }

                          item.name = name;
                          return item;
                        })),
                      onDelete: (id: string) =>
                        (config.order = config.order.filter(
                          item => item.id !== id
                        )),
                    });
                  }}
                >
                  <IoPencil />
                </IconButton>
              </>
            ),
            isCollapsed: item.isCollapsed,
          };

    return (
      <Component
        className={clsx('sidebar_item_' + item.type, {
          ghost: isGhost,
          clone: isClone,
          projected_parent: isProjectedParent,
          'no-pointer-events': isDragging,
        })}
        onClick={onClick}
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        {...props}
      >
        {isGhost && (
          <div
            className="sortable_tree_list_indicator"
            style={{ '--projected-depth': projectedDepth } as any}
          ></div>
        )}
        {item.type === 'space' && <IoReader />}
        {item.name}
      </Component>
    );
  }
);
