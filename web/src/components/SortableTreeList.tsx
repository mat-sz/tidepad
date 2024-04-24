import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  UniqueIdentifier,
  DragStartEvent,
  DragMoveEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

export interface ItemType {
  id: UniqueIdentifier;
  canHaveChildren?: boolean;
  isCollapsed?: boolean;
  canBeCollapsed?: boolean;
  children?: UniqueIdentifier[];
  parent?: UniqueIdentifier;
  depth?: number;
}

interface Props {
  items: ItemType[];
  onChange: (items: ItemType[]) => void;
  ItemComponent: React.FC<{
    item: ItemType;
    isGhost?: boolean;
    isClone?: boolean;
    isProjectedParent?: boolean;
    depth: number;
    projectedDepth?: number;
    onCollapse?: () => void;
  }>;
}

export const SortableTreeList: React.FC<Props> = ({
  items,
  onChange,
  ItemComponent,
}) => {
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 15,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 500,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [activeId, setActiveId] = useState<UniqueIdentifier>();
  const [overId, setOverId] = useState<UniqueIdentifier>();
  const [offsetLeft, setOffsetLeft] = useState(0);

  const allItems: ItemType[] = [];
  const visibleItems: ItemType[] = [];
  const skipIds: Set<UniqueIdentifier> = new Set();

  function handleItem(item: ItemType, isHidden = false) {
    if (skipIds.has(item.id)) {
      return;
    }

    skipIds.add(item.id);

    allItems.push(item);
    if (!isHidden) {
      visibleItems.push(item);
    }

    const { children, depth = 0 } = item;

    if (Array.isArray(children)) {
      for (const id of children) {
        if (skipIds.has(id)) {
          continue;
        }

        const child = items.find(item => item.id === id);
        if (!child) {
          continue;
        }

        handleItem(
          { ...child, depth: depth + 1, parent: item.id },
          item.isCollapsed || isHidden
        );
      }
    }
  }

  for (const item of items) {
    handleItem(item);
  }

  let projectedParentId: string | number | undefined = undefined;
  let projectedDepth: number = 0;
  if (offsetLeft > 0) {
    const overItemIndex = visibleItems.findIndex(({ id }) => id === overId);
    const activeItemIndex = visibleItems.findIndex(({ id }) => id === activeId);
    const newOrder = arrayMove(visibleItems, activeItemIndex, overItemIndex);
    const previousItem = newOrder[overItemIndex - 1];

    if (previousItem) {
      if (previousItem.canHaveChildren && !previousItem.isCollapsed) {
        projectedDepth = (previousItem.depth || 0) + 1;
        projectedParentId = previousItem.id;
      } else if (previousItem.parent) {
        projectedDepth = previousItem.depth || 0;
        projectedParentId = previousItem.parent;
      }
    }
  }

  function resetState() {
    setOverId(undefined);
    setActiveId(undefined);
    setOffsetLeft(0);
    document.body.style.setProperty('cursor', '');
  }

  function handleDragStart({ active: { id: activeId } }: DragStartEvent) {
    setActiveId(activeId);
    setOverId(activeId);
    document.body.style.setProperty('cursor', 'grabbing');
  }

  function handleDragMove({ delta }: DragMoveEvent) {
    setOffsetLeft(delta.x);
  }

  function handleDragOver({ over }: DragOverEvent) {
    setOverId(over?.id);
  }

  function handleDragCancel() {
    resetState();
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    resetState();

    const oldIndex = allItems.findIndex(item => item.id === active.id);
    const newIndex = allItems.findIndex(item => item.id === over?.id);
    const newOrder = arrayMove(allItems, oldIndex, newIndex);

    for (const item of newOrder) {
      if (item.id === active.id) {
        const parent = allItems.find(item => item.id === projectedParentId);

        if (parent) {
          item.parent = projectedParentId as any;
        } else {
          item.parent = undefined;
        }
      }
    }

    for (const item of newOrder) {
      if (item.canHaveChildren) {
        item.children = newOrder
          .filter(child => child.parent === item.id)
          .map(item => item.id);
      } else {
        item.children = [];
      }
    }

    onChange(newOrder);
  }

  const activeItem = activeId
    ? visibleItems.find(({ id }) => id === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext
        items={visibleItems}
        strategy={verticalListSortingStrategy}
      >
        {visibleItems.map(currentItem => (
          <ItemComponent
            item={currentItem}
            key={currentItem.id}
            isProjectedParent={
              !!activeId && currentItem.id === projectedParentId
            }
            isGhost={currentItem.id === activeId}
            depth={currentItem.depth || 0}
            projectedDepth={projectedDepth}
            onCollapse={
              currentItem.canBeCollapsed
                ? () => {
                    onChange(
                      items.map(item =>
                        item.id === currentItem.id
                          ? { ...item, isCollapsed: !currentItem.isCollapsed }
                          : item
                      )
                    );
                  }
                : undefined
            }
          />
        ))}
        {createPortal(
          <DragOverlay>
            {activeId && activeItem ? (
              <ItemComponent
                item={activeItem}
                key={activeItem.id}
                isClone={true}
                isGhost={false}
                depth={projectedDepth}
              />
            ) : null}
          </DragOverlay>,
          document.body
        )}
      </SortableContext>
    </DndContext>
  );
};
