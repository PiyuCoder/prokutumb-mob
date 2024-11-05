import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from './HomeScreen';
import MessageScreen from './MessageScreen';
import DiscoverScreen from './DiscoverScreen';
import MatchScreen from './MatchScreen';
import NetworkScreen from './NetworkScreen';
import {View, Image, TouchableOpacity, StyleSheet} from 'react-native';

import homeIcon from '../assets/icons/home.png';
import messageIcon from '../assets/icons/message.png';
import discoverIcon from '../assets/icons/discover.png';
import matchIcon from '../assets/icons/match.png';
import networkIcon from '../assets/icons/network.png';

// Create the Tab Navigator
const Tab = createBottomTabNavigator();

const DashboardScreen = ({navigation}) => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({color, size, focused}) => {
          let iconSource;
          let iconStyle = {width: 24, height: 24, tintColor: color};

          // Assign custom icons based on the route name
          if (route.name === 'Home') {
            iconSource = homeIcon;
          } else if (route.name === 'Message') {
            iconSource = messageIcon;
          } else if (route.name === 'Discover') {
            iconSource = discoverIcon;
          } else if (route.name === 'Match') {
            iconSource = matchIcon;
          } else if (route.name === 'Network') {
            iconSource = networkIcon;
            // Make the Network icon larger than others
            iconStyle = {width: 50, height: 50, tintColor: color}; // Larger size for Network icon
          }

          // Render the custom icon
          return (
            <View style={{alignItems: 'center'}}>
              {focused && (
                <View style={styles.circle}>
                  <Image source={iconSource} style={iconStyle} />
                </View>
              )}
              {!focused && <Image source={iconSource} style={iconStyle} />}
            </View>
          );
        },
        tabBarShowLabel: false, // Hide the tab labels (text)
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          position: 'absolute', // Make it float
          bottom: 10, // Height from the bottom of the screen
          left: 20, // Space from the left edge
          right: 20, // Space from the right edge
          elevation: 5, // Shadow for Android
          backgroundColor: '#ffffff', // Tab bar background color
          borderRadius: 40, // Rounded corners
          height: 60, // Height of the tab bar
          shadowColor: '#000', // iOS shadow
          shadowOpacity: 0.1, // Shadow transparency
          shadowOffset: {width: 0, height: 10}, // Shadow offset
          shadowRadius: 20, // Shadow blur radius
        },
      })}>
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
              onPress={() => {
                // Navigate to a new screen instead of just using the tab
                navigation.navigate('Network');
              }}
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
              onPress={() => {
                // Navigate to a new screen instead of just using the tab
                navigation.navigate('Message');
              }}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  circle: {
    backgroundColor: '#DD88CF', // Circle color
    borderRadius: 30, // Adjust to make a perfect circle
    padding: 8, // Space between the icon and the circle
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DashboardScreen;
