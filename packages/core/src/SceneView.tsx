import * as React from 'react';
import type {
  Route,
  ParamListBase,
  NavigationState,
  PartialState,
} from '@react-navigation/routers';
import NavigationStateContext from './NavigationStateContext';
import StaticContainer from './StaticContainer';
import EnsureSingleNavigator from './EnsureSingleNavigator';
import useOptionsGetters from './useOptionsGetters';
import type { NavigationProp, RouteConfig, EventMapBase } from './types';

type Props<
  State extends NavigationState,
  ScreenOptions extends {},
  EventMap extends EventMapBase
> = {
  screen: RouteConfig<ParamListBase, string, State, ScreenOptions, EventMap>;
  navigation: NavigationProp<ParamListBase, string, State, ScreenOptions>;
  route: Route<string>;
  routeState: NavigationState | PartialState<NavigationState> | undefined;
  getState: () => State;
  setState: (state: State) => void;
  options: object;
};

/**
 * Component which takes care of rendering the screen for a route.
 * It provides all required contexts and applies optimizations when applicable.
 */
export default function SceneView<
  State extends NavigationState,
  ScreenOptions extends {},
  EventMap extends EventMapBase
>({
  screen,
  route,
  navigation,
  routeState,
  getState,
  setState,
  options,
}: Props<State, ScreenOptions, EventMap>) {
  const navigatorKeyRef = React.useRef<string | undefined>();
  const getKey = React.useCallback(() => navigatorKeyRef.current, []);

  const { addOptionsGetter } = useOptionsGetters({
    key: route.key,
    options,
    navigation,
  });

  const setKey = React.useCallback((key: string) => {
    navigatorKeyRef.current = key;
  }, []);

  const getCurrentState = React.useCallback(() => {
    const state = getState();
    const currentRoute = state.routes.find((r) => r.key === route.key);

    return currentRoute ? currentRoute.state : undefined;
  }, [getState, route.key]);

  const setCurrentState = React.useCallback(
    (child: NavigationState | PartialState<NavigationState> | undefined) => {
      const state = getState();

      setState({
        ...state,
        routes: state.routes.map((r) =>
          r.key === route.key ? { ...r, state: child } : r
        ),
      });
    },
    [getState, route.key, setState]
  );

  const isInitialRef = React.useRef(true);

  React.useEffect(() => {
    isInitialRef.current = false;
  });

  const getIsInitial = React.useCallback(() => isInitialRef.current, []);

  const context = React.useMemo(
    () => ({
      state: routeState,
      getState: getCurrentState,
      setState: setCurrentState,
      getKey,
      setKey,
      getIsInitial,
      addOptionsGetter,
    }),
    [
      routeState,
      getCurrentState,
      setCurrentState,
      getKey,
      setKey,
      getIsInitial,
      addOptionsGetter,
    ]
  );

  const ScreenComponent = screen.getComponent
    ? screen.getComponent()
    : screen.component;

  if (process.env.NODE_ENV !== 'production') {
    // For development builds, we warn if the function reference changes between renders
    // We consider function name and content and only warn if they are the same, should work for most cases
    // The hook lint rules aren't applicable since the condition doesn't change at runtime

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const previousComponentRef = React.useRef(ScreenComponent);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
      previousComponentRef.current = ScreenComponent;
    });

    const PreviousScreenComponent = previousComponentRef.current;

    if (
      PreviousScreenComponent !== ScreenComponent &&
      PreviousScreenComponent?.name === ScreenComponent?.name &&
      PreviousScreenComponent?.toString() === ScreenComponent?.toString()
    ) {
      const message =
        `You passed a different component for the screen '${route.name}' in the 'component' prop than previous render. ` +
        `The component passed for a screen should be the same across renders, ` +
        `otherwise the screen will remount causing local state of the component to be lost and cause perf issues. ` +
        `If you didn't intentionally pass a different component, you're probably creating components during render. ` +
        `For example:\n\n` +
        `function App() {\n` +
        `  const Home = () => <Something />;\n\n` +
        `  return (\n` +
        `    <Stack.Navigator>\n` +
        `      <Stack.Screen name="Home" component={Home} />\n` +
        `    </Stack.Navigator>\n` +
        `  );\n` +
        `}\n\n` +
        `To fix this, move the component to the top-level of the file:\n\n` +
        `const Home = () => <Something />;\n\n` +
        `function App() {\n` +
        `  return (\n` +
        `    <Stack.Navigator>\n` +
        `      <Stack.Screen name="Home" component={Home} />\n` +
        `    </Stack.Navigator>\n` +
        `  );\n` +
        `}\n\n` +
        `If this was intentional, make sure that the name of the function passed in the 'component' prop changes as well to hide the warning.\n\n` +
        'See: https://reactnavigation.org/docs/troubleshooting/#screens-are-unmountingremounting-during-navigation';

      console.warn(message);
    }
  }

  return (
    <NavigationStateContext.Provider value={context}>
      <EnsureSingleNavigator>
        <StaticContainer
          name={screen.name}
          render={ScreenComponent || screen.children}
          navigation={navigation}
          route={route}
        >
          {ScreenComponent !== undefined ? (
            <ScreenComponent navigation={navigation} route={route} />
          ) : screen.children !== undefined ? (
            screen.children({ navigation, route })
          ) : null}
        </StaticContainer>
      </EnsureSingleNavigator>
    </NavigationStateContext.Provider>
  );
}
