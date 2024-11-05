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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch} from 'react-redux';
import {loginSuccess} from '../store/slices/authSlice';
import {axiosInstance} from '../api/axios';
import GoogleSignInButton from '../components/GoogleSignInButton';
import Loader from '../components/Loader';
import Svg, {Circle} from 'react-native-svg';

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
    <View className="flex-1 justify-center items-center bg-white">
      <StatusBar backgroundColor={'white'} barStyle={'dark-content'} />
      {/* Circular Image Layout */}
      <Loader isLoading={isLoading} />
      <View className="relative justify-center items-center mb-10">
        {/* Dashed Circle */}
        <View
          style={{
            width: 300,
            height: 300,
            borderRadius: 150,
            borderWidth: 2,
            borderColor: '#dd88cf42',
            borderStyle: 'dashed',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          }}>
          <View
            style={{
              width: 200,
              height: 200,
              borderRadius: 100,
              backgroundColor: '#dd88cf3a',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <View
              style={{
                width: 130,
                height: 130,
                borderRadius: 65,
                backgroundColor: 'white',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 20,
                overflow: 'hidden',
              }}>
              <View
                style={{
                  width: '80%',
                  height: '80%',
                  borderRadius: 65,
                  backgroundColor: 'white',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: 20,
                  overflow: 'hidden',
                }}>
                <Image
                  source={require('../assets/login7.png')}
                  resizeMode="cover"
                  className="rounded-full"
                  style={{
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    zIndex: 5,
                    transform: [{scale: 5}, {translateY: 2}],
                  }}
                />
              </View>
            </View>
          </View>

          {/* Circular Images positioned along the circle */}
          {[
            {top: 40, left: -10, uri: require('../assets/login1.jpg')},
            {
              top: 40,
              left: 120,
              uri: require('../assets/login2.jpg'),
              inner: true,
            },
            {top: 80, left: 260, uri: require('../assets/login3.png')},
            {top: 220, left: 230, uri: require('../assets/login4.png')},
            {
              top: 220,
              left: 160,
              uri: require('../assets/login5.jpg'),
              inner: true,
            },
            {top: 170, left: -15, uri: require('../assets/login6.jpg')},

            {top: 270, left: 100, uri: require('../assets/login8.jpg')},
          ].map((position, index) => (
            <View
              key={index}
              style={{
                width: !position.inner ? (index === 0 ? 60 : 45) : 30,
                height: !position.inner ? (index === 0 ? 60 : 45) : 30,
                borderRadius: !position.inner ? (index === 0 ? 30 : 22.5) : 15,
                position: 'absolute',
                top: position.top,
                left: position.left,
                elevation: 5,
                overflow: 'hidden',
              }}>
              <Image
                source={position.uri}
                style={{
                  width: '115%',
                  height: '115%',
                  objectFit: 'cover',

                  // transform: [
                  //   {scale: index === 0 ? 1.2 : 1.1},
                  //   {translateX: 0},
                  //   {translateY: index === 0 ? 5 : 0},
                  // ],
                }}
                resizeMode="center"
              />
            </View>
          ))}
          {[
            {top: 250, left: 40, uri: require('../assets/pink-chat.png')},

            {top: 20, left: 230, uri: require('../assets/marker.png')},
          ].map((position, index) => (
            <View
              key={index}
              style={{
                width: 25,
                height: 25,
                position: 'absolute',
                top: position.top,
                left: position.left,
              }}>
              <Image
                source={position.uri}
                style={{
                  width: '115%',
                  height: '115%',
                  objectFit: 'cover',

                  // transform: [
                  //   {scale: index === 0 ? 1.2 : 1.1},
                  //   {translateX: 0},
                  //   {translateY: index === 0 ? 5 : 0},
                  // ],
                }}
                resizeMode="center"
              />
            </View>
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
