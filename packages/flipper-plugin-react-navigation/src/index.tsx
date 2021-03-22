import React from 'react';
import { Typography } from 'antd';
import { CompassOutlined } from '@ant-design/icons';
import { PluginClient, usePlugin, createState, useValue } from 'flipper-plugin';
import {
  Layout,
  ManagedDataInspector,
  DetailSidebar,
  VirtualList,
  styled,
} from 'flipper';

type NavigationState = {
  key: string;
  index: number;
  routes: { key: string; name: string; params?: object }[];
};

type NavigationAction = {
  type: string;
  payload: object;
};

type Update = {
  id: string;
  action: NavigationAction;
  state: NavigationState | undefined;
};

type Events = {
  action: Update;
  init: { id: string; state: NavigationState | undefined };
};

type Methods = {
  resetRoot: (state: NavigationState | undefined) => Promise<void>;
  invoke: (params: { method: string; params: any }) => Promise<any>;
};

export function plugin(client: PluginClient<Events, Methods>) {
  const updates = createState<Update[]>([], { persist: 'actions' });
  const selectedID = createState<string | null>(null, { persist: 'selection' });
  const activeIndex = createState<number | null>(null, { persist: 'active' });

  client.onMessage('init', () => {
    updates.set([]);
    selectedID.set(null);
    activeIndex.set(null);
  });

  client.onMessage('action', (action) => {
    const index = activeIndex.get();
    activeIndex.set(null);
    updates.update((draft) => {
      if (index != null) {
        draft.splice(index + 1);
      }
      draft.push(action);
    });
  });

  function setSelection(id: string) {
    const updatesData = updates.get();
    const lastId = updatesData[updatesData.length - 1]?.id;

    if (id === lastId) {
      selectedID.set(null);
    } else {
      selectedID.set(id);
    }
  }

  function invoke(method: string, params: object) {
    return client.send('invoke', { method, params });
  }

  function resetTo(id: string) {
    const index = updates.get().findIndex((update) => update.id === id)!;
    const { state } = updates.get()[index];
    activeIndex.set(index);
    return client.send('resetRoot', state);
  }

  return {
    updates,
    activeIndex,
    selectedID,
    setSelection,
    invoke,
    resetTo,
  };
}

const Row = styled.button<{ selected: boolean; faded: boolean }>((props) => ({
  'appearance': 'none',
  'display': 'flex',
  'alignItems': 'center',
  'justifyContent': 'space-between',
  'fontFamily':
    'SFMono-Regular,Consolas,Liberation Mono,Menlo,Courier,monospace',
  'textAlign': 'left',
  'padding': '12px 18px',
  'color': props.selected ? '#fff' : '#000',
  'backgroundColor': props.selected ? '#4D85F5' : 'transparent',
  'opacity': props.faded ? 0.5 : 1,
  'border': 0,
  'boxShadow': 'inset 0 -1px 0 0 rgba(0, 0, 0, 0.1)',
  'width': '100%',
  'cursor': 'pointer',

  '&:hover': {
    backgroundColor: props.selected ? '#4D85F5' : 'rgba(0, 0, 0, 0.05)',
  },
}));

const JumpButton = styled.button({
  'appearance': 'none',
  'backgroundColor': 'rgba(0, 0, 0, 0.1)',
  'border': 0,
  'margin': 0,
  'padding': '5px 10px',
  'color': 'inherit',
  'cursor': 'pointer',
  'fontSize': 12,
  'borderRadius': 3,

  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
});

const Center = styled.div({
  display: 'flex',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
});

const Faded = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  opacity: 0.3,
});

const EmptyIcon = styled(CompassOutlined)({
  display: 'block',
  fontSize: 48,
  margin: 16,
  opacity: 0.8,
});

export function Component() {
  const instance = usePlugin(plugin);
  const updates = useValue(instance.updates);
  const selectedID = useValue(instance.selectedID);
  const activeIndex = useValue(instance.activeIndex);

  const selectedItem = selectedID
    ? updates.find((update) => update.id === selectedID)
    : updates[updates.length - 1];

  return updates.length ? (
    <>
      <VirtualList
        data={updates}
        rowHeight={48}
        renderRow={({ id, action }, i) => (
          <Row
            key={id}
            selected={selectedItem?.id === id}
            faded={
              activeIndex != null ? activeIndex > -1 && i > activeIndex : false
            }
            onClick={() => instance.setSelection(id)}
          >
            {action.type}
            <JumpButton type="button" onClick={() => instance.resetTo(id)}>
              Reset to this
            </JumpButton>
          </Row>
        )}
      />
      <DetailSidebar>
        {selectedItem && <Sidebar update={selectedItem} />}
      </DetailSidebar>
    </>
  ) : (
    <Center>
      <Faded>
        <EmptyIcon />
        <Typography.Title level={5}>
          Navigate in the app to see actions
        </Typography.Title>
      </Faded>
    </Center>
  );
}

function Sidebar({ update }: { update: Update }) {
  const { action, state } = update;

  return (
    <Layout.Container gap pad>
      <Typography.Title level={4}>Action</Typography.Title>
      <ManagedDataInspector data={action} expandRoot={false} />
      <Typography.Title level={4}>State</Typography.Title>
      <ManagedDataInspector data={state} expandRoot={false} />
    </Layout.Container>
  );
}
