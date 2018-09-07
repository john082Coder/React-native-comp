import * as React from 'react';
import Expo from 'expo';
import { FlatList } from 'react-native';
import { createStackNavigator } from 'react-navigation';
import { List, Divider } from 'react-native-paper';
import SimpleTabs from './src/SimpleTabs';
import ShiftingTabs from './src/ShiftingTabs';
import IconTabs from './src/IconTabs';

const data = [
  { component: ShiftingTabs, title: 'Shifting', routeName: 'ShiftingTabs' },
  { component: SimpleTabs, title: 'Simple', routeName: 'SimpleTabs' },
  { component: IconTabs, title: 'Icons only', routeName: 'IconTabs' },
];

class Home extends React.Component {
  static navigationOptions = {
    title: 'Examples',
  };

  _renderItem = ({ item }) => (
    <List.Item
      title={item.title}
      onPress={() => this.props.navigation.navigate(item.routeName)}
    />
  );

  _keyExtractor = item => item.routeName;

  render() {
    return (
      <FlatList
        ItemSeparatorComponent={Divider}
        renderItem={this._renderItem}
        keyExtractor={this._keyExtractor}
        data={data}
      />
    );
  }
}

const App = createStackNavigator({
  Home,
  ...data.reduce((acc, it) => {
    acc[it.routeName] = {
      screen: it.component,
      navigationOptions: {
        title: it.title,
      },
    };

    return acc;
  }, {}),
});

Expo.registerRootComponent(App);
