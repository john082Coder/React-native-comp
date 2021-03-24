import type { NavigationState, NavigationAction } from '@react-navigation/core';

export type Log = {
  id: string;
  action: NavigationAction;
  state: NavigationState | undefined;
};

export type StoreType = {
  logs: Log[];
  index: number;
  invoke: (method: string, params: object) => Promise<any>;
  resetTo: (id: string) => Promise<void>;
};
