import React from 'react';

interface SidebarContextType {
  readonly isOpen: boolean;
  toggle(): void;
  open(): void;
  close(): void;
}

const SidebarContext = React.createContext<SidebarContextType>(undefined!);

interface Props {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SidebarContextProvider: React.FC<
  React.PropsWithChildren<Props>
> = ({ isOpen, setIsOpen, children }) => {
  const context: SidebarContextType = {
    isOpen,
    toggle() {
      setIsOpen(value => !value);
    },
    open() {
      setIsOpen(true);
    },
    close() {
      setIsOpen(false);
    },
  };

  return (
    <SidebarContext.Provider value={context}>
      {children}
    </SidebarContext.Provider>
  );
};
export const useSidebar = () => React.useContext(SidebarContext);
