import React from 'react';
import {View, Alert, Text, TouchableOpacity} from 'react-native';
import appleAuth from '@invertase/react-native-apple-authentication';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {axiosInstance} from '../api/axios';

const AppleSignInButton = () => {
  const onAppleButtonPress = async () => {
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });

      const {identityToken, user} = appleAuthRequestResponse;

      if (identityToken) {
        // Send the token to your backend for verification
        const response = await axiosInstance.post('/api/user/apple-signin', {
          token: identityToken,
          userId: user,
        });

        const data = await response.json();

        if (response.ok) {
          // Handle successful authentication (e.g., store your app's token, navigate, etc.)
          console.log('User authenticated:', data);
        } else {
          // Handle backend errors
          console.error('Backend verification failed:', data);
        }
      } else {
        Alert.alert('Apple Sign-In Failed', 'No identity token returned');
      }
    } catch (error) {
      Alert.alert('Apple Sign-In Error', error.message);
    }
  };

  return (
    <View style={{padding: 20, marginBottom: 80}}>
      <TouchableOpacity
        style={{
          backgroundColor: 'black', // Google's blue color
          borderRadius: 50,
          padding: 15,
          minWidth: 250, // Increase the width for larger screens
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'flex-start',
        }}
        onPress={onAppleButtonPress}>
        <Ionicons name="logo-apple" size={25} color="white" />
        <Text
          style={{
            color: 'white',
            textAlign: 'center',
            marginLeft: 25,
            fontWeight: '500',
            fontSize: 16,
          }}>
          Sign in with Apple
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AppleSignInButton;
