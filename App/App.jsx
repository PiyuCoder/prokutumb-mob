import React, {useEffect, useState} from 'react';
import {Provider} from 'react-redux';
import store, {persistor} from './src/store/store';
import {createStackNavigator} from '@react-navigation/stack';
// import {createDrawerNavigator} from '@react-navigation/drawer';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import {PersistGate} from 'redux-persist/integration/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ActivityIndicator,
  Button,
  Modal,
  Text,
  View,
  StyleSheet,
  Linking,
} from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import SplashScreen from './src/screens/SplashScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import NetworkScreen from './src/screens/NetworkScreen';
import UserProfile from './src/screens/UserProfile';
import ChatScreen from './src/screens/ChatScreen';
import MessageScreen from './src/screens/MessageScreen';
import CallScreen from './src/screens/CallScreen';
import socket, {connectSocket, disconnectSocket} from './src/socket';
import SettingScreen from './src/screens/SettingScreen';
import EditProfile from './src/screens/EditProfile';
import ConnectionsScreen from './src/screens/ConnectionsScreen';
import Notifications from './src/screens/Notifications';
import Communities from './src/screens/Communities';
import CommunityHomeScreen from './src/screens/CommunityHomeScreen';
import EventScreen from './src/screens/EventScreen';
import ShareScreen from './src/screens/ShareScreen';
import CreateCommunity from './src/screens/CreateCommunity';
import CreateEvent from './src/screens/CreateEvent';
import SuccessCreation from './src/components/SuccessCreation';
import Ticket from './src/screens/Ticket';
import Post from './src/screens/Post';

const Stack = createStackNavigator();
// const Drawer = createDrawerNavigator();
const navigationRef = React.createRef();
const linking = {
  prefixes: ['prokutumb://'],
  config: {
    screens: {
      UserProfile: 'profile/:userId', // Define the path and params
      MatchScreen: 'auth/callback',
      Post: 'post/:postId',
    },
  },
};

function IncomingCallModal({incomingCall, onAccept, onDecline}) {
  if (!incomingCall) return null;

  return (
    <Modal transparent={true} visible={!!incomingCall} animationType="slide">
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Incoming {incomingCall.isVideo ? 'Video' : 'Audio'} Call</Text>
        <Text>From: {incomingCall.callerName}</Text>
        <Button title="Accept" onPress={onAccept} />
        <Button title="Decline" onPress={onDecline} color="red" />
      </View>
    </Modal>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [isReady, setIsReady] = useState(false); // Track if NavigationContainer is ready

  // Fetch user and token from AsyncStorage
  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        setUser(parsedUser);
      } catch (error) {
        console.error('Error fetching data from AsyncStorage:', error);
      }
    };

    fetchData();
  }, []);

  // Socket connection and handling incoming call event
  useEffect(() => {
    if (!socket || !user?._id) return;

    if (user?._id) {
      connectSocket();
      socket.on('connect', () => {
        console.log('Connected to socket:', socket.id);
      });
      socket.emit('registerUser', user._id);

      socket.on('incomingCall', data => {
        if (data.recipientId === user?._id) {
          console.log('incoming data:', data);
          setIncomingCall(data); // Trigger the modal
        }
      });

      socket.on('callAccepted', data => {
        console.log('Call accepted by the receiver', data);
        // Ensure navigationRef is ready before trying to navigate
        if (isReady && navigationRef.current) {
          if (data.callerId === user._id || data.recipientId === user._id) {
            navigationRef.current.navigate('CallScreen', {
              callData: data, // Directly use the data from the accepted call event
              isVideo: data.isVideo,
            });
          }
        } else {
          console.log('Navigation reference is not ready yet.');
        }
      });

      return () => {
        if (!user?._id) {
          disconnectSocket();
          socket.off('incomingCall');
          socket.off('callAccepted');
        }
      };
    }
  }, [user?._id, isReady]);

  // useEffect(() => {
  //   const handleDeepLink = event => {
  //     const url = event.url;
  //     const userId = url.split('/').pop(); // Get the user ID from the URL
  //     if (userId) {
  //       navigationRef.current.navigate('UserProfile', {userId}); // Navigate to the ProfileScreen with the userId
  //     }
  //   };

  //   // Listen for deep links when the app is running
  //   Linking.addEventListener('url', handleDeepLink);

  //   // Check if the app was opened from a deep link while it was closed
  //   Linking.getInitialURL().then(url => {
  //     if (url) handleDeepLink({url});
  //   });

  //   return () => {
  //     Linking.removeEventListener('url', handleDeepLink);
  //   };
  // }, []);

  // Accept and decline call handlers
  const acceptCall = () => {
    if (navigationRef.current) {
      setIncomingCall(null);
      socket.emit('callAccepted', {
        callerId: incomingCall.callerId,
        recipientId: incomingCall.recipientId,
        callerName: incomingCall.recipientName,
      });
      // Navigate the receiver to the CallScreen
      navigationRef.current.navigate('CallScreen', {
        callData: incomingCall,
        isVideo: incomingCall.isVideo,
      });
    } else {
      console.log('Navigation not ready, retrying shortly...');
    }
  };

  const declineCall = () => {
    setIncomingCall(null);
    socket.emit('declineCall', {callerId: incomingCall?.callerId});
  };

  return (
    <Provider store={store}>
      <PersistGate
        loading={<ActivityIndicator size="large" />}
        persistor={persistor}>
        <NavigationContainer
          linking={linking}
          ref={navigationRef}
          onReady={() => setIsReady(true)} // Set isReady to true once NavigationContainer is ready
        >
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
              name="Post"
              component={Post}
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
            <Stack.Screen
              name="CallScreen"
              component={CallScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Settings"
              component={SettingScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfile}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Connections"
              component={ConnectionsScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Notifications"
              component={Notifications}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Communities"
              component={Communities}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="CommunityHome"
              component={CommunityHomeScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="EventHome"
              component={EventScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="ShareScreen"
              component={ShareScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="TicketScreen"
              component={Ticket}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="CreateCommunity"
              component={CreateCommunity}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="CreateEvent"
              component={CreateEvent}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="SuccessCreation"
              component={SuccessCreation}
              options={{headerShown: false}}
            />
          </Stack.Navigator>
          <IncomingCallModal
            incomingCall={incomingCall}
            onAccept={acceptCall}
            onDecline={declineCall}
          />
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalText: {
    color: 'white',
    fontSize: 18,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
});
