import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from './HomeScreen';
import MessageScreen from './MessageScreen';
import DiscoverScreen from './DiscoverScreen';
import MatchScreen from './MatchScreen';
import NetworkScreen from './NetworkScreen';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Foundation';
import IonIcon from 'react-native-vector-icons/Ionicons';
import FA6Icon from 'react-native-vector-icons/FontAwesome6';

// Create the Tab Navigator
const Tab = createBottomTabNavigator();

const DashboardScreen = ({navigation}) => {
  const getIconComponent = route => {
    switch (route.name) {
      case 'Discover':
        return IonIcon;
      case 'Match':
        return FA6Icon;
      case 'Network':
        return IonIcon;
      case 'Message':
        return IonIcon;
      default:
        return Icon;
    }
  };

  return (
    <Tab.Navigator
      screenOptions={({route}) => {
        const IconComponent = getIconComponent(route);
        const iconName =
          route.name === 'Home'
            ? 'home'
            : route.name === 'Message'
            ? 'chatbubble-outline'
            : route.name === 'Discover'
            ? 'compass'
            : route.name === 'Match'
            ? 'user-group'
            : 'globe-outline';

        return {
          tabBarIcon: ({color, size, focused}) => {
            const iconSize =
              route.name === 'Network' ? 60 : route.name === 'Match' ? 24 : 30; // Larger size for Network icon
            return (
              <View style={{alignItems: 'center'}}>
                <View style={focused ? styles.circle : null}>
                  <IconComponent
                    name={iconName}
                    size={iconSize}
                    color={route.name === 'Network' ? 'black' : color}
                  />
                </View>
              </View>
            );
          },
          tabBarShowLabel: false,
          tabBarActiveTintColor: 'white',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: styles.tabBarStyle,
        };
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{headerShown: false}}
      />
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{headerShown: false}}
      />
      <Tab.Screen
        name="Network"
        component={NetworkScreen}
        options={{
          tabBarButton: props => (
            <TouchableOpacity
              {...props}
              onPress={() => navigation.navigate('Network')}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Match"
        component={MatchScreen}
        options={{headerShown: false}}
      />
      <Tab.Screen
        name="Message"
        component={MessageScreen}
        options={{
          tabBarButton: props => (
            <TouchableOpacity
              {...props}
              onPress={() => navigation.navigate('Message')}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  circle: {
    backgroundColor: '#A274FF',
    borderRadius: 50,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
  },
  tabBarStyle: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
    elevation: 5,
    backgroundColor: '#ffffff',
    borderRadius: 40,
    height: 60,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 10},
    shadowRadius: 20,
  },
});

export default DashboardScreen;
