import React from 'react';
import { Animated, StyleSheet, Platform } from 'react-native';
import { Screen } from 'react-native-screens';
import createPointerEventsContainer from './createPointerEventsContainer';

const EPS = 1e-5;

function getAccessibilityProps(isActive) {
  if (Platform.OS === 'ios') {
    return {
      accessibilityElementsHidden: !isActive,
    };
  } else if (Platform.OS === 'android') {
    return {
      importantForAccessibility: isActive ? 'yes' : 'no-hide-descendants',
    };
  } else {
    return null;
  }
}

/**
 * Component that renders the scene as card for the <StackView />.
 */
class Card extends React.Component {
  render() {
    const {
      animatedStyle,
      children,
      pointerEvents,
      style,
      position,
      transparent,
      scene: { index, isActive },
    } = this.props;

    const active =
      transparent || isActive
        ? 1
        : position.interpolate({
            inputRange: [index, index + 1 - EPS, index + 1],
            outputRange: [1, 1, 0],
            extrapolate: 'clamp',
          });

    const {
      shadowOpacity,
      overlayOpacity,
      ...containerAnimatedStyle
    } = animatedStyle;

    return (
      <Screen
        pointerEvents={pointerEvents}
        onComponentRef={this.props.onComponentRef}
        style={[StyleSheet.absoluteFill, containerAnimatedStyle, style]}
        active={active}
      >
        {shadowOpacity ? (
          <Animated.View
            style={[styles.shadow, { shadowOpacity }]}
            pointerEvents="none"
          />
        ) : null}
        <Animated.View
          {...getAccessibilityProps(isActive)}
          style={[transparent ? styles.transparent : styles.card]}
        >
          {children}
        </Animated.View>
        {overlayOpacity ? (
          <Animated.View
            pointerEvents="none"
            style={[styles.overlay, { opacity: overlayOpacity }]}
          />
        ) : null}
      </Screen>
    );
  }
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#fff',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  shadow: {
    top: 0,
    left: 0,
    bottom: 0,
    width: 3,
    position: 'absolute',
    backgroundColor: '#fff',
    shadowOffset: { width: -1, height: 1 },
    shadowRadius: 5,
    shadowColor: '#000',
  },
  transparent: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
});

export default createPointerEventsContainer(Card);
