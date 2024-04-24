import React from 'react';

// TODO: ctrlkey
export function useHotkey(key: string, onPress: () => void, isEnabled = true) {
  React.useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === key) {
        onPress();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [key, onPress, isEnabled]);
}
