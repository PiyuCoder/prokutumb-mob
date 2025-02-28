import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  Alert,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  ImageBackground,
  Platform,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch} from 'react-redux';
import {loginSuccess} from '../store/slices/authSlice';
import {axiosInstance} from '../api/axios';
import GoogleSignInButton from '../components/GoogleSignInButton';
import Loader from '../components/Loader';
import Svg, {Circle} from 'react-native-svg';

import proku from '../assets/splash-logo.png';
import AppleSignInButton from '../components/AppleSignInButton';

const LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem('authToken');
      const user = await AsyncStorage.getItem('user');

      if (token && user) {
        const parsedUser = JSON.parse(user);
        console.log('isProfileComplete: ', parsedUser.isProfileComplete);
        // Dispatch loginSuccess with existing token and user
        dispatch(loginSuccess({token, user: JSON.parse(user)}));
        if (parsedUser?.isProfileComplete) navigation.replace('Dashboard');
        else navigation.replace('CreateProfile');
      }
      setIsLoading(false);
    };

    checkLoginStatus();
  }, [navigation]);

  const handleLogin = async () => {
    try {
      const response = await axiosInstance.post('/api/user/login', {
        email,
        password,
      });
      if (response.data.token) {
        dispatch(loginSuccess(response.data.token));
        Alert.alert('Login Successful!');
        navigation.navigate('Dashboard');
      }
    } catch (error) {
      Alert.alert('Login Failed', 'Invalid credentials');
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <StatusBar backgroundColor={'white'} barStyle={'dark-content'} />
      {/* Circular Image Layout */}
      <Loader isLoading={isLoading} />

      {/* Login Form */}
      {/* <Text style={styles.customFontText}>
        Welcome to the {'\n'} world of {'\n'} Networking
      </Text> */}

      <Image
        source={proku} // Replace with your logo URL
        style={styles.logo}
      />

      <GoogleSignInButton setIsLoading={setIsLoading} />
      {Platform.OS === 'ios' && <AppleSignInButton setIsLoading={setIsLoading}/>}
      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => navigation.navigate('EmailLogin')}>
        <Text style={styles.loginButtonText}>Login with Email</Text>
      </TouchableOpacity>

      {/* <Text className="mt-4" onPress={() => navigation.navigate('Signup')}>
        Don't have an account? Signup
      </Text> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5fcff',
  },
  customFontText: {
    fontFamily: 'AlfaSlabOne-Regular', // Use the font family name based on the file name
    fontSize: 24,
    color: '#22172A',
    textAlign: 'center',
  },
  loginButton: {
    marginTop: 20,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 58,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    backgroundColor: '#A274FF',
    width: 250,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
