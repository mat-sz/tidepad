import clsx from 'clsx';
import React, { useEffect, useRef } from 'react';

interface Props {
  className?: string;
  hasItemsBefore: boolean;
  hasItemsAfter: boolean;
  stuckToBottom?: boolean;
  setStuckToBottom?: (value: boolean) => void;
  requestItemsBefore(): void;
  requestItemsAfter(): void;

  /**
   * Shown at the top if hasItemsBefore is false.
   */
  topPlaceholder?: React.ReactNode;

  /**
   * Shown at the top and/or bottom if hasItemsBefore and/or hasItemsAfter are true.
   */
  placeholder: React.ReactNode;
}

function isVisible(element: HTMLElement | null) {
  if (!element) {
    return false;
  }

  const rect = element.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom >= 0;
}

// TODO: Highlight
export const Window: React.FC<React.PropsWithChildren<Props>> = ({
  className,
  hasItemsAfter,
  hasItemsBefore,
  placeholder,
  topPlaceholder,
  requestItemsBefore,
  requestItemsAfter,
  stuckToBottom,
  setStuckToBottom,
  children,
}) => {
  const placeholderBeforeRef = useRef<HTMLDivElement>(null);
  const placeholderAfterRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  const onScroll = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isVisible(placeholderBeforeRef.current)) {
      requestItemsBefore();
    }

    if (isVisible(placeholderAfterRef.current)) {
      requestItemsAfter();
    }

    if (!windowRef.current) {
      return;
    }

    // TODO: Fix scrolling issue on initial load
    const element = windowRef.current;
    setStuckToBottom?.(
      Math.abs(
        element.scrollHeight - element.scrollTop - element.clientHeight
      ) < 20
    );
  };

  useEffect(() => {
    const element = windowRef.current;
    if (stuckToBottom && element) {
      element.scrollTo(0, element.scrollHeight);
    }
  }, [children, placeholder, stuckToBottom]);

  // TODO: Handle on resize
  return (
    <div
      className={clsx('window', className)}
      ref={windowRef}
      onScroll={onScroll}
    >
      <div className="window-start"></div>
      {hasItemsBefore ? (
        <div className="window-placeholder" ref={placeholderBeforeRef}>
          {placeholder}
        </div>
      ) : (
        topPlaceholder
      )}
      <div className="window-items" ref={itemsRef}>
        {children}
      </div>
      {hasItemsAfter && (
        <div className="window-placeholder" ref={placeholderAfterRef}>
          {placeholder}
        </div>
      )}
    </div>
  );
};
