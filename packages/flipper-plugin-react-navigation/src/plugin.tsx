import { PluginClient, createState } from 'flipper-plugin';
import type { Log, NavigationState } from './types';

type Events = {
  action: Log;
  init: { id: string; state: NavigationState | undefined };
};

type Methods = {
  resetRoot: (state: NavigationState | undefined) => Promise<void>;
  invoke: (params: { method: string; params: any }) => Promise<any>;
};

export function plugin(client: PluginClient<Events, Methods>) {
  const logs = createState<Log[]>([], { persist: 'logs' });
  const index = createState<number | null>(null, { persist: 'index' });

  client.onMessage('init', () => {
    logs.set([]);
    index.set(null);
  });

  client.onMessage('action', (action) => {
    const indexValue = index.get();
    index.set(null);
    logs.update((draft) => {
      if (indexValue != null) {
        draft.splice(indexValue + 1);
      }
      draft.push(action);
    });
  });

  function invoke(method: string, params: object) {
    return client.send('invoke', { method, params });
  }

  function resetTo(id: string) {
    const logsValue = logs.get();
    const indexValue = logsValue.findIndex((update) => update.id === id)!;
    const { state } = logsValue[indexValue];
    index.set(indexValue);
    return client.send('resetRoot', state);
  }

  return {
    logs,
    index,
    invoke,
    resetTo,
  };
}
