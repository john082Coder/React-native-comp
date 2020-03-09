import * as React from 'react';
import { NavigationContext, NavigationProp } from '@react-navigation/core';

type Props = {
  value: NavigationProp<
    Record<string, object | undefined>,
    string,
    NavigationState,
    {},
    {}
  >;
  children: React.ReactNode;
};

export default function ThemeProvider({ value, children }: Props) {
  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}
