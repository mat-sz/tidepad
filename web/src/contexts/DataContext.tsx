import React from 'react';
import { DataSource } from '../sources/types';

const DataContext = React.createContext<DataSource>(undefined!);

interface Props {
  source: DataSource;
}

export const DataContextProvider: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  source,
}) => {
  return <DataContext.Provider value={source}>{children}</DataContext.Provider>;
};
export const useDataContext = () => React.useContext(DataContext);
