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
import Entypo from 'react-native-vector-icons/Entypo';
import Communities from './Communities';

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
        return Entypo;
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
            ? 'grid'
            : route.name === 'Discover'
            ? 'compass-outline'
            : route.name === 'Match'
            ? 'user-group'
            : 'globe-outline';

        return {
          tabBarIcon: ({color, size, focused}) => {
            const iconSize =
              route.name === 'Network' ? 60 : route.name === 'Match' ? 23 : 30; // Larger size for Network icon
            return (
              <View style={{alignItems: 'center'}}>
                <IconComponent name={iconName} size={iconSize} color={color} />
                {/* <View style={focused ? styles.circle : null}>
                  
                </View> */}
              </View>
            );
          },
          tabBarShowLabel: false,
          tabBarActiveTintColor: '#A274FF',
          tabBarInactiveTintColor: 'black',
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
        component={Communities}
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
    backgroundColor: '#A274FF', // Highlight background for focused icons
    borderRadius: 40, // Half of width/height for a perfect circle
    height: 50, // Circle size, must match width
    width: 50,
    justifyContent: 'center', // Center the icon within the circle
    alignItems: 'center',
  },
  tabBarStyle: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
    elevation: 5,
    backgroundColor: '#ffffff',
    borderRadius: 40,
    height: 80,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 10},
    shadowRadius: 20,
    opacity: 0.9,
  },
});

export default DashboardScreen;
