export type NavigationState = {
  key: string;
  index: number;
  routes: { key: string; name: string; params?: object }[];
};

export type NavigationAction = {
  type: string;
  payload: object;
};

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
