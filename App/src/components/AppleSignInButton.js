import React from 'react';
import {View, Alert, StyleSheet} from 'react-native';
import appleAuth, {
  AppleButton,
} from '@invertase/react-native-apple-authentication';
import {axiosInstance} from '../api/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {loginSuccess} from '../store/slices/authSlice';
import {useDispatch} from 'react-redux';
import {useNavigation} from '@react-navigation/native';

const AppleSignInButton = ({setIsLoading}) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const onAppleButtonPress = async () => {
    try {
      // Requesting Apple Sign-In
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });

      console.log('Apple Auth Response:', appleAuthRequestResponse);

      const {identityToken, user, fullName, email} = appleAuthRequestResponse;

      // Validate the returned identity token
      if (!identityToken) {
        Alert.alert('Apple Sign-In Failed', 'No identity token returned');
        return;
      }

      // Send the token and user details to the backend for verification
      const response = await axiosInstance.post('/api/user/apple-signin', {
        token: identityToken,
        userId: user,
        fullName: fullName.givenName
          ? `${fullName.givenName} ${fullName.familyName}`
          : 'Apple User',
        email: email || null,
      });

      const data = response.data;
      console.log('Backend Response:', data);

      if (data.success) {
        const {token, user} = data;

        // Store token and user data in AsyncStorage
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));

        // Update Redux state
        dispatch(loginSuccess({token, user}));
        setIsLoading(false);

        // Navigate based on profile completion
        if (user?.isProfileComplete) {
          navigation.replace('Dashboard');
        } else {
          navigation.replace('CreateProfile', {name: user?.name || ''});
        }
      } else {
        console.error('Backend verification failed:', data.message);
        Alert.alert(
          'Sign-In Failed',
          data.message || 'An unknown error occurred.',
        );
      }
    } catch (error) {
      console.error('Apple Sign-In Error:', error.message);
      Alert.alert('Apple Sign-In Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <AppleButton
        buttonStyle={AppleButton.Style.BLACK}
        buttonType={AppleButton.Type.SIGN_IN}
        style={styles.appleButton}
        onPress={onAppleButtonPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginBottom: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appleButton: {
    width: 250,
    height: 45,
  },
});

export default AppleSignInButton;
