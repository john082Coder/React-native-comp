## Screen tracking and analytics

This example shows how to do screen tracking and send to Google Analytics. The approach can be adapted to any other mobile analytics SDK. 

### Screen tracking

When using built-in navigation container, we can use `onNavigationStateChange` to track the screen.

```js
import { GoogleAnalyticsTracker } from 'react-native-google-analytics-bridge';

const tracker = new GoogleAnalyticsTracker(GA_TRACKING_ID);

// gets the current screen from navigation state
function getCurrentScreen(navigationState) {
  if (!navigationState) {
    return null;
  }
  return navigationState.routes[navigationState.index].routeName;
}

const AppNavigator = StackNavigator(AppRouteConfigs);

export default () => (
  <AppNavigator
    onNavigationStateChange={(prevState, currentState) => {
      const currentScreen = getCurrentScreen(currentState);
      const prevScreen = getCurrentScreen(prevState);

      if (prevScreen !== currentScreen) {
        // the line below uses the Google Analytics tracker
        // change the tracker here to use other Mobile analytics SDK.
        tracker.trackScreenView(currentScreen);
      }
    }}
  />
);
```

### Screen tracking with Redux

When using Redux, we can write a Redux middleware to track the screen. For this purpose,
we will reuse `getCurrentScreen` from the previous section.

```js
import { NavigationActions } from 'react-navigation';
import { GoogleAnalyticsTracker } from 'react-native-google-analytics-bridge';

const tracker = new GoogleAnalyticsTracker(GA_TRACKING_ID);

const screenTracking = ({ getState }) => next => (action) => {
  if (
    action.type !== NavigationActions.NAVIGATE
    && action.type !== NavigationActions.BACK
  ) {
    return next(action);
  }

  const currentScreen = getCurrentScreen(getState().navigation);
  const result = next(action);
  const nextScreen = getCurrentScreen(getState().navigation);
  if (nextScreen !== currentScreen) {
    // the line below uses the Google Analytics tracker
    // change the tracker here to use other Mobile analytics SDK.
    tracker.trackScreenView(nextScreen);
  }
  return result;
};

export default screenTracking;
```

### Create Redux store and apply the above middleware

The `screenTracking` middleware can be applied to the store during its creation. See [Redux Integration](Redux-Integration.md) for details.

```js
const store = createStore(
  combineReducers({
    navigation: navigationReducer,
    ...
  }),
  applyMiddleware(
    screenTracking,
    ...
    ),
);
```
