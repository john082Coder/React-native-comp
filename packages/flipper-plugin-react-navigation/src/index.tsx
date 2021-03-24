import * as React from 'react';
import { styled } from 'flipper';
import { Tabs } from 'antd';
import { useStore } from './useStore';
import { Logs } from './Logs';

const { TabPane } = Tabs;

export function Component() {
  const store = useStore();

  return (
    <Tabs defaultActiveKey="1" tabBarStyle={{ marginBottom: 0 }}>
      <TabsContent tab={<TabLabel>Logs</TabLabel>} key="1">
        <Logs {...store} />
      </TabsContent>
      <TabsContent tab={<TabLabel>Test</TabLabel>} key="2">
        Test Tab
      </TabsContent>
    </Tabs>
  );
}

const TabLabel = styled.span({
  padding: '0 20px',
});

const TabsContent = styled(TabPane)({
  height: 'calc(100vh - 80px)',
});

export * from './plugin';
