import React, { useEffect, useMemo, useRef } from 'react';
import clsx from 'clsx';

import { useVisualViewport } from '../../hooks/useVisualViewport';
import { SidebarContextProvider } from './SidebarContext';
import { useLocation } from 'react-router-dom';
import { usePointerDrag } from 'react-use-pointer-drag';

interface Props {
  className?: string;
  sidebar: React.ReactNode;
}

export const FullScreen: React.FC<React.PropsWithChildren<Props>> = ({
  className,
  sidebar,
  children,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { offsetTop, height } = useVisualViewport();

  const location = useLocation();
  useEffect(() => {
    if (
      typeof location.state === 'string' &&
      location.state === 'keep_sidebar'
    ) {
      return;
    }

    setIsOpen(false);
  }, [location]);

  const divRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const { dragProps } = usePointerDrag({
    dragPredicate: ({ deltaX, deltaY, initialEvent }) =>
      Math.abs(deltaY) <= 10 &&
      Math.abs(deltaX) >= 10 &&
      initialEvent?.pointerType === 'touch',
    preventDefault: true,
    stopPropagation: false,
    onStart: () => {
      if (!contentRef.current || !sidebarRef.current) {
        return;
      }

      contentRef.current.style.setProperty('transition', 'none');
      contentRef.current.style.setProperty('pointer-events', 'none');
      contentRef.current.style.setProperty('opacity', '1');

      sidebarRef.current.style.setProperty('transition', 'none');
    },
    onMove: ({ deltaX }) => {
      if (!contentRef.current || !sidebarRef.current) {
        return;
      }

      contentRef.current.style.setProperty('--left', `${deltaX}px`);
      sidebarRef.current.style.setProperty('--left', `${deltaX}px`);
    },
    onEnd: ({ deltaX }) => {
      if (!contentRef.current || !sidebarRef.current) {
        return;
      }

      contentRef.current.style.setProperty('--left', '0px');
      contentRef.current.style.removeProperty('transition');
      contentRef.current.style.removeProperty('pointer-events');
      contentRef.current.style.removeProperty('opacity');

      sidebarRef.current.style.setProperty('--left', '0px');
      sidebarRef.current.style.removeProperty('transition');

      if (deltaX > 100) {
        setIsOpen(true);
      } else if (deltaX < 0) {
        setIsOpen(false);
      }
    },
  });

  return (
    <SidebarContextProvider isOpen={isOpen} setIsOpen={setIsOpen}>
      <div
        className={clsx('main', className)}
        style={{ top: offsetTop, height }}
        {...dragProps()}
        ref={divRef}
      >
        <div
          className={clsx('sidebar', { sidebar_open: isOpen })}
          ref={sidebarRef}
        >
          {sidebar}
        </div>
        <div
          className="content"
          ref={contentRef}
          onClick={isOpen ? () => setIsOpen(false) : undefined}
        >
          {children}
        </div>
      </div>
    </SidebarContextProvider>
  );
};

export { useSidebar } from './SidebarContext';
