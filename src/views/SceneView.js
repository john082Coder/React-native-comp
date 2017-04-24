/* @flow */

import React, { PureComponent } from 'react';
import propTypes from 'prop-types';

import type {
  NavigationScreenProp,
  NavigationRoute,
  NavigationAction,
  NavigationNavigatorProps,
} from '../TypeDefinition';

type Props = {
  screenProps?: {},
  navigation: NavigationScreenProp<NavigationRoute, NavigationAction>,
  navigationOptions: *,
  component: ReactClass<NavigationNavigatorProps<NavigationRoute>>,
};

export default class SceneView extends PureComponent<void, Props, void> {
  static childContextTypes = {
    navigation: propTypes.object.isRequired,
  };

  props: Props;

  getChildContext() {
    return {
      navigation: this.props.navigation,
    };
  }

  render() {
    const {
      screenProps,
      navigation,
      navigationOptions,
      component: Component,
    } = this.props;

    return (
      <Component
        screenProps={screenProps}
        navigation={navigation}
        navigationOptions={navigationOptions}
      />
    );
  }
}
