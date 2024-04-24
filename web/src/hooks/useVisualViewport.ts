import React, { useEffect, useState } from 'react';

interface ViewportState {
  offsetTop: number;
  offsetLeft: number;
  width?: number;
  height?: number;
}

export function useVisualViewport(): ViewportState {
  const [state, setState] = useState<ViewportState>({
    offsetLeft: 0,
    offsetTop: 0,
    width: undefined,
    height: undefined,
  });

  React.useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) {
      return;
    }

    const handleResize = () => {
      setState({
        offsetLeft: viewport.offsetLeft,
        offsetTop: viewport.offsetTop,
        width: viewport.width,
        height: viewport.height,
      });
    };
    const preventDefault = (e: Event) => e.preventDefault();

    viewport.addEventListener('scroll', preventDefault);
    viewport.addEventListener('resize', handleResize);

    return () => {
      viewport.removeEventListener('scroll', preventDefault);
      viewport.removeEventListener('resize', handleResize);
    };
  }, [setState]);

  useEffect(() => {
    if (state.offsetTop !== 0) {
      const preventDefault = (e: TouchEvent) => {
        e.preventDefault();
      };

      document.body.addEventListener('touchmove', preventDefault, {
        passive: false,
      });

      return () =>
        document.body.removeEventListener('touchmove', preventDefault);
    }
  }, [state]);

  return state;
}
