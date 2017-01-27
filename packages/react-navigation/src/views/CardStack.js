/* @flow */

import React, { PropTypes } from 'react';
import {
  StyleSheet,
  NativeModules,
  Platform,
  View,
} from 'react-native';

import Transitioner from './Transitioner';
import Card from './Card';
import CardStackStyleInterpolator from './CardStackStyleInterpolator';
import CardStackPanResponder from './CardStackPanResponder';
import Header from './Header';
import NavigationPropTypes from '../PropTypes';
import addNavigationHelpers from '../addNavigationHelpers';
import SceneView from './SceneView';

import type {
  NavigationAction,
  NavigationScreenProp,
  NavigationState,
  NavigationRoute,
  NavigationSceneRenderer,
  NavigationSceneRendererProps,
  NavigationTransitionProps,
  NavigationRouter,
} from '../TypeDefinition';

import type {
  HeaderMode,
  HeaderProps,
} from './Header';

import type { TransitionConfig } from './TransitionConfigs';

import TransitionConfigs from './TransitionConfigs';

const NativeAnimatedModule = NativeModules && NativeModules.NativeAnimatedModule;

type Props = {
  screenProps?: {};
  headerMode: HeaderMode,
  headerComponent?: ReactClass<HeaderProps>,
  mode: 'card' | 'modal',
  navigation: NavigationScreenProp<NavigationState, NavigationAction>,
  router: NavigationRouter,
  cardStyle?: any,
  style: any,
  gestureResponseDistance?: ?number,
  /**
   * If true, enable navigating back by swiping (see CardStackPanResponder).
   * TODO move this to TransitionConfig.
   */
  gesturesEnabled: ?boolean,
  /**
   * Optional custom animation when transitioning between screens.
   */
  transitionConfig?: TransitionConfig,
};

type DefaultProps = {
  mode: 'card' | 'modal',
  gesturesEnabled: boolean,
  headerComponent: ReactClass<HeaderProps>,
};

class CardStack extends React.Component<DefaultProps, Props, void> {
  _render: NavigationSceneRenderer;
  _renderScene: NavigationSceneRenderer;
  _childNavigationProps: { [key: string]: NavigationScreenProp<NavigationRoute, NavigationAction> } = {};

  static Card = Card;
  static Header = Header;

  static propTypes = {
    /**
     * Custom style applied to the card.
     */
    cardStyle: PropTypes.any,

    /**
     * Style of the stack header. `float` means the header persists and is shared
     * for all screens. When set to `screen`, each header is rendered within the
     * card, and will animate in together.
     *
     * The default for `modal` mode is `screen`, and the default for `card` mode
     * is `screen` on Android and `float` on iOS.
     */
    headerMode: PropTypes.oneOf(['float', 'screen', 'none']),

    /**
     * Custom React component to be used as a header
     */
    headerComponent: PropTypes.func,

    /**
     * Style of the cards movement. Value could be `card` or `modal`.
     * Default value is `card`.
     */
    mode: PropTypes.oneOf(['card', 'modal']),

    /**
     * The distance from the edge of the card which gesture response can start
     * for. Default value is `30`.
     */
    gestureResponseDistance: PropTypes.number,

    /**
     * Optional custom animation when transitioning between screens.
     */
    transitionConfig: PropTypes.func,

    /**
     * Enable gestures. Default value is true on iOS, false on Android.
     */
    gesturesEnabled: PropTypes.bool,

    /**
     * The navigation prop, including the state and the dispatcher for the back
     * action. The dispatcher must handle the back action ({type: 'Back'}), and
     * the navigation state has this shape:
     *
     * ```js
     * const navigationState = {
     *   index: 0, // the index of the selected route.
     *   routes: [ // A list of routes.
     *     {key: 'page 1'}, // The 1st route.
     *     {key: 'page 2'}, // The second route.
     *   ],
     * };
     * ```
     */
    navigation: PropTypes.shape({
      state: NavigationPropTypes.navigationState.isRequired,
      dispatch: PropTypes.func.isRequired,
    }).isRequired,

    /**
     * Custom style applied to the cards stack.
     */
    style: View.propTypes.style,
  };

  static defaultProps: DefaultProps = {
    mode: 'card',
    gesturesEnabled: Platform.OS === 'ios',
    headerComponent: Header,
  };

  componentWillMount() {
    this._render = this._render.bind(this);
    this._renderScene = this._renderScene.bind(this);
  }

  render() {
    return (
      <Transitioner
        configureTransition={this._configureTransition}
        navigationState={this.props.navigation.state}
        render={this._render}
        style={this.props.style}
      />
    );
  }

  _configureTransition = (
    // props for the new screen
    transitionProps: NavigationTransitionProps,
    // props for the old screen
    prevTransitionProps: NavigationTransitionProps
  ) => {
    const isModal = this.props.mode === 'modal';
    // Copy the object so we can assign useNativeDriver below
    // (avoid Flow error, transitionSpec is of type NavigationTransitionSpec).
    const transitionSpec = {
      ...this._getTransitionConfig(
        transitionProps,
        prevTransitionProps
      ).transitionSpec,
    };
    if (
       !!NativeAnimatedModule
       // Native animation support also depends on the transforms used:
       && CardStackStyleInterpolator.canUseNativeDriver(isModal)
    ) {
      // Internal undocumented prop
      transitionSpec.useNativeDriver = true;
    }
    return transitionSpec;
  }

  _renderHeader(props: NavigationTransitionProps, headerMode: HeaderMode): ?React.Element<*> {
    const navigation = this._getChildNavigation(props.scene);
    const header = this.props.router.getScreenConfig(navigation, 'header') || {};

    return (
      <this.props.headerComponent
        {...props}
        style={header.style}
        mode={headerMode}
        onNavigateBack={() => this.props.navigation.goBack(null)}
        renderLeftComponent={(props) => {
          const navigation = this._getChildNavigation(props.scene);
          const header = this.props.router.getScreenConfig(navigation, 'header');
          if (header && header.left) {
            return header.left;
          }
          const { renderLeftComponent } = this.props.headerComponent.defaultProps || {};
          if (typeof renderLeftComponent === 'function') {
            return renderLeftComponent(props);
          }
          return null;
        }}
        renderRightComponent={({ scene }) => {
          const navigation = this._getChildNavigation(scene);
          const header = this.props.router.getScreenConfig(navigation, 'header');
          if (header && header.right) {
            return header.right;
          }
          return null;
        }}
        renderTitleComponent={({ scene }) => {
          const navigation = this._getChildNavigation(scene);
          const header = this.props.router.getScreenConfig(navigation, 'header');
          let title = null;
          if (header && header.title) {
            title = header.title;
          } else {
            title = this.props.router.getScreenConfig(navigation, 'title');
          }
          if (typeof title === 'string') {
            return <Header.Title>{title}</Header.Title>;
          }
          return title;
        }}
      />
    );
  }

  _render(props: NavigationTransitionProps): React.Element<*> {
    let floatingHeader = null;
    const headerMode = this._getHeaderMode();
    if (headerMode === 'float') {
      floatingHeader = this._renderHeader(props, headerMode);
    }
    return (
      <View style={styles.container}>
        <View
          style={styles.scenes}
        >
          {props.scenes.map(
            scene => this._renderScene({
              ...props,
              scene,
            })
          )}
        </View>
        {floatingHeader}
      </View>
    );
  }

  _getHeaderMode(): HeaderMode {
    if (this.props.headerMode) {
      return this.props.headerMode;
    }
    if (Platform.OS === 'android' || this.props.mode === 'modal') {
      return 'screen';
    }
    return 'float';
  }

  _getTransitionConfig(
    // props for the new screen
    transitionProps: NavigationTransitionProps,
    // props for the old screen
    prevTransitionProps: NavigationTransitionProps
  ): TransitionConfig {
    const defaultConfig = TransitionConfigs.defaultTransitionConfig(
      transitionProps,
      prevTransitionProps,
      this.props.mode === 'modal'
    );
    if (this.props.transitionConfig) {
      return {
        ...this.props.transitionConfig,
        ...defaultConfig,
      };
    } else {
      return defaultConfig;
    }
  }

  _renderInnerCard(
    Component: ReactClass<*>,
    props: NavigationSceneRendererProps,
  ): React.Element<*> {
    const navigation = this._getChildNavigation(props.scene);
    const header = this.props.router.getScreenConfig(navigation, 'header');
    const headerMode = this._getHeaderMode();
    if (headerMode === 'screen') {
      const isHeaderHidden = header && header.visible === false;
      const maybeHeader =
        isHeaderHidden ? null : this._renderHeader(props, headerMode);
      return (
        <View style={{ flex: 1 }}>
          {maybeHeader}
          <SceneView
            screenProps={this.props.screenProps}
            navigation={navigation}
            component={Component}
          />
        </View>
      );
    }
    return (
      <SceneView
        screenProps={this.props.screenProps}
        navigation={navigation}
        component={Component}
      />
    );
  }

  _getChildNavigation = (scene: NavigationScene): NavigationScreenProp<NavigationRoute, NavigationAction> => {
    let navigation = this._childNavigationProps[scene.key];
    if (!navigation || navigation.state !== scene.route) {
      navigation = this._childNavigationProps[scene.key] = addNavigationHelpers({
        ...this.props.navigation,
        state: scene.route,
      });
    }
    return navigation;
  }

  _renderScene(props: NavigationSceneRendererProps): React.Element<*> {
    const isModal = this.props.mode === 'modal';

    const { screenInterpolator } = this._getTransitionConfig();
    const style = screenInterpolator && screenInterpolator(props);

    let panHandlers = null;

    if (this.props.gesturesEnabled) {
      let onNavigateBack = null;
      if (this.props.navigation.state.index !== 0) {
        onNavigateBack = () => this.props.navigation.dispatch({ type: 'Back', key: props.scene.route.key });
      }
      const panHandlersProps = {
        ...props,
        onNavigateBack,
        gestureResponseDistance: this.props.gestureResponseDistance,
      };
      panHandlers = isModal ?
        CardStackPanResponder.forVertical(panHandlersProps) :
        CardStackPanResponder.forHorizontal(panHandlersProps);
    }

    const Component = this.props.router.getComponentForRouteName(props.scene.route.routeName);

    return (
      <Card
        {...props}
        key={`card_${props.scene.key}`}
        panHandlers={panHandlers}
        renderScene={props => this._renderInnerCard(Component, props)}
        style={[style, this.props.cardStyle]}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Header is physically rendered after scenes so that Header won't be
    // covered by the shadows of the scenes.
    // That said, we'd have use `flexDirection: 'column-reverse'` to move
    // Header above the scenes.
    flexDirection: 'column-reverse',
  },
  scenes: {
    flex: 1,
  },
});

export default CardStack;
