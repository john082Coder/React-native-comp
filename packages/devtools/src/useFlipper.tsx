import * as React from 'react';
import { addPlugin, Flipper } from 'react-native-flipper';
import type { NavigationContainerRef } from '@react-navigation/core';
import shortid from 'shortid';
import useDevToolsBase from './useDevToolsBase';

export default function useFlipper(
  ref: React.RefObject<NavigationContainerRef>
) {
  const connectionRef = React.useRef<Flipper.FlipperConnection>();

  useDevToolsBase(ref, (...args) => {
    const connection = connectionRef.current;

    if (!connection) {
      return;
    }

    switch (args[0]) {
      case 'init':
        connection.send('init', {
          id: shortid(),
          state: args[1],
        });
        break;
      case 'action':
        connection.send('action', {
          id: shortid(),
          action: args[1],
          state: args[2],
        });
        break;
    }
  });

  React.useEffect(() => {
    addPlugin({
      getId() {
        return 'react-navigation';
      },
      async onConnect(connection) {
        connectionRef.current = connection;
      },
      onDisconnect() {
        connectionRef.current = undefined;
      },
      runInBackground() {
        return false;
      },
    });
  }, [ref]);
}
