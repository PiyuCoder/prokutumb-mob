import React from 'react';
import {Provider} from 'react-redux';
import store, {persistor} from './src/store/store';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import SplashScreen from './src/screens/SplashScreen';
import {PersistGate} from 'redux-persist/integration/react'; // Import PersistGate
import {ActivityIndicator, View} from 'react-native'; // Loading indicator
import ProfileScreen from './src/screens/ProfileScreen';
import NetworkScreen from './src/screens/NetworkScreen';
import UserProfile from './src/screens/UserProfile';
import ChatScreen from './src/screens/ChatScreen';
import MessageScreen from './src/screens/MessageScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      {/* PersistGate ensures the store is rehydrated before rendering */}
      <PersistGate
        loading={
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator size="large" />
          </View>
        }
        persistor={persistor}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Splash">
            <Stack.Screen
              name="Splash"
              component={SplashScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="UserProfile"
              component={UserProfile}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Network"
              component={NetworkScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Message"
              component={MessageScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{headerShown: false}}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
}
