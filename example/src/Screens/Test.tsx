import React from 'react';
import { Button, Text, View } from 'react-native';
import {
  createStackNavigator,
  TransitionPresets,
} from '@react-navigation/stack';

function CardScreen1(props) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Card Screen 1</Text>
      <Button
        title="To next screen"
        onPress={() => props.navigation.navigate('Card2')}
      />
    </View>
  );
}

function CardScreen2(props) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Card Screen 2</Text>
      <Button
        title="Open modal"
        onPress={() => props.navigation.navigate('Modal')}
      />
    </View>
  );
}

const CardStack = createStackNavigator();

function CardsNavigator() {
  return (
    <CardStack.Navigator>
      <CardStack.Screen name="Card1" component={CardScreen1} />
      <CardStack.Screen name="Card2" component={CardScreen2} />
    </CardStack.Navigator>
  );
}

const ModalStack = createStackNavigator();

function ModalScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Modal Screen</Text>
    </View>
  );
}

function App() {
  return (
    <ModalStack.Navigator
      mode="modal"
      screenOptions={{
        ...TransitionPresets.ModalPresentationIOS,
        cardOverlayEnabled: true,
      }}
    >
      <ModalStack.Screen name="Cards" component={CardsNavigator} />
      <ModalStack.Screen name="Modal" component={ModalScreen} />
    </ModalStack.Navigator>
  );
}

export default App;
