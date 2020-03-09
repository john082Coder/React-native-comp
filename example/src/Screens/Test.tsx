import * as React from 'react';
import { View, TextInput, Button } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { enableScreens } from 'react-native-screens';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
enableScreens();

function HomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <TextInput
        placeholder="try to copy/paste here on Android"
        style={{ fontSize: 20 }}
      />
      <Button
        title="nav"
        onPress={() => {
          navigation.navigate('Second', { screen: 'Cos' });
        }}
      />
    </View>
  );
}

function Settings({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <TextInput placeholder="try dfs" style={{ fontSize: 20 }} />
      <Button
        title="nav"
        onPress={() => {
          navigation.navigate('Cos');
        }}
      />
    </View>
  );
}

function Cos({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button
        title="nav"
        onPress={() => {
          navigation.navigate('Settings');
        }}
      />
    </View>
  );
}

function S() {
  return (
    <Stack.Navigator initialRouteName="Settings" mode="modal">
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="Cos" component={Cos} />
    </Stack.Navigator>
  );
}

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
function App() {
  return (
    <Tab.Navigator lazy={false}>
      <Tab.Screen name="Tabs" component={HomeScreen} />
      <Tab.Screen name="Second" component={S} />
    </Tab.Navigator>
  );
}

export default App;
