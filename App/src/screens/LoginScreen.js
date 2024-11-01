import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch} from 'react-redux';
import {loginSuccess} from '../store/slices/authSlice';
import {axiosInstance} from '../api/axios';
import GoogleSignInButton from '../components/GoogleSignInButton';
import Loader from '../components/Loader';

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
        // Dispatch loginSuccess with existing token and user
        dispatch(loginSuccess({token, user: JSON.parse(user)}));
        navigation.replace('Dashboard');
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
    <View className="flex-1 justify-center items-center bg-gray-200">
      {/* Circular Image Layout */}
      <Loader isLoading={isLoading} />
      <View className="relative justify-center items-center mb-10">
        {/* Dashed Circle */}
        <View
          style={{
            width: 200,
            height: 200,
            borderRadius: 100, // To make it a perfect circle
            borderWidth: 2,
            borderColor: '#DD88CF',
            borderStyle: 'dashed',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          }}>
          {/* Center Image */}
          <Image
            source={{
              uri: 'https://s3-alpha-sig.figma.com/img/d108/70a5/59c77372b31a5a3088663903f8b0e538?Expires=1729468800&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=qbNwabDaXcl44iOOxoWiqZNS6GBDHgMi-k62mPUFDpPxFxzDvGSB8fBcm6a78jqtJG-zXZl7FR2Y6b6RsC4iDiOunK7ppzAQWZVdX08zOwLFqKndBo7IOWyad1vllLs3ylSDOGDn5s-jOp41oAU8Okby4NunGpAigjCNVz6woVXVrCr~hqbtd71B0kaer9WWJKYwfPVfdAVnLr94y6RcfoJlcN7pxpYipoFT3nKV1hF4TgBH6VpKDoN0UPmnegLGVqNAzMQvTVv6VCxA0XT4jZXXDNtNWuneX4tbc70Cg4lEolLn5bKVIy7tUWfr-XXcdbXUucFN2orbxlhM~hftfw__',
            }}
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              position: 'absolute',
              zIndex: 10,
            }}
          />

          {/* Circular Images positioned along the circle */}
          {[
            {top: -20, left: 75},
            {top: 20, left: 0},
            {top: 20, left: 160},
            {top: 100, left: -20},
            {top: 120, left: 160},
            {top: 160, left: 30},
            {top: 170, left: 100},
          ].map((position, index) => (
            <Image
              key={index}
              source={{
                uri: `https://s3-alpha-sig.figma.com/img/d108/70a5/59c77372b31a5a3088663903f8b0e538?Expires=1729468800&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=qbNwabDaXcl44iOOxoWiqZNS6GBDHgMi-k62mPUFDpPxFxzDvGSB8fBcm6a78jqtJG-zXZl7FR2Y6b6RsC4iDiOunK7ppzAQWZVdX08zOwLFqKndBo7IOWyad1vllLs3ylSDOGDn5s-jOp41oAU8Okby4NunGpAigjCNVz6woVXVrCr~hqbtd71B0kaer9WWJKYwfPVfdAVnLr94y6RcfoJlcN7pxpYipoFT3nKV1hF4TgBH6VpKDoN0UPmnegLGVqNAzMQvTVv6VCxA0XT4jZXXDNtNWuneX4tbc70Cg4lEolLn5bKVIy7tUWfr-XXcdbXUucFN2orbxlhM~hftfw__`,
              }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                position: 'absolute',
                top: position.top,
                left: position.left,
              }}
            />
          ))}
        </View>
      </View>

      {/* Login Form */}
      <Text style={styles.customFontText}>
        Welcome to the {'\n'} world of {'\n'} Networking
      </Text>

      <GoogleSignInButton setIsLoading={setIsLoading} />

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
});

export default LoginScreen;
