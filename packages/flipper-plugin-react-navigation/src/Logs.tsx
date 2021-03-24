import * as React from 'react';
import { Typography } from 'antd';
import { CompassOutlined } from '@ant-design/icons';
import {
  Layout,
  ManagedDataInspector,
  DetailSidebar,
  VirtualList,
  styled,
} from 'flipper';
import type { StoreType, Log } from './types';

export function Logs({ logs, index, resetTo }: StoreType) {
  const [selectedID, setSelectedID] = React.useState<string | null>(null);

  const selectedItem = selectedID
    ? logs.find((log) => log.id === selectedID)
    : logs[logs.length - 1];

  return logs.length ? (
    <>
      <VirtualList
        data={logs}
        rowHeight={51}
        renderRow={({ id, action }, i) => (
          <Row
            key={id}
            selected={selectedItem?.id === id}
            faded={index != null ? index > -1 && i > index : false}
            onClick={() => {
              if (id === logs[logs.length - 1].id) {
                setSelectedID(null);
              } else {
                setSelectedID(id);
              }
            }}
          >
            {action.type}
            <JumpButton type="button" onClick={() => resetTo(id)}>
              Reset to this
            </JumpButton>
          </Row>
        )}
      />
      <DetailSidebar>
        {selectedItem && <Sidebar log={selectedItem} />}
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

function Sidebar({ log }: { log: Log }) {
  const { action, state } = log;

  return (
    <Layout.Container gap pad>
      <Typography.Title level={4}>Action</Typography.Title>
      <ManagedDataInspector data={action} expandRoot={false} />
      <Typography.Title level={4}>State</Typography.Title>
      <ManagedDataInspector data={state} expandRoot={false} />
    </Layout.Container>
  );
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
  'backgroundColor': props.selected ? '#722ED1' : 'transparent',
  'opacity': props.faded ? 0.5 : 1,
  'border': 0,
  'boxShadow': 'inset 0 -1px 0 0 rgba(0, 0, 0, 0.1)',
  'width': '100%',
  'cursor': 'pointer',

  '&:hover': {
    backgroundColor: props.selected ? '#722ED1' : 'rgba(0, 0, 0, 0.05)',
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
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
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
