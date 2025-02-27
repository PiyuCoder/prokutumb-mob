import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  Image,
} from 'react-native';
import {axiosInstance} from '../api/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {loginSuccess} from '../store/slices/authSlice';
import {useDispatch} from 'react-redux';

import proku from '../assets/splash-logo.png';
import Loader from '../components/Loader';

const EmailLoginScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert('Error', 'Please enter a valid email');
      return;
    }
    setLoading(true);
    try {
      // Login user
      const res = await axiosInstance.post('/api/user/login', {
        email,
        password,
      });

      if (res?.data?.success) {
        const {token, user} = res?.data; // Assuming payload contains token and user

        // Store token and user in AsyncStorage
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));

        // Dispatch the loginSuccess action to update Redux state
        dispatch(loginSuccess({token, user}));

        if (user?.isProfileComplete) {
          // Navigate to DashboardScreen
          navigation.replace('Dashboard');
        } else {
          // Navigate to CreateProfileScreen
          navigation.replace('CreateProfile');
        }
      } else {
        Alert.alert('Error', `${res?.data?.message}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Please try again later');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#A274FF" />
      <Loader isLoading={loading} />
      <Image source={proku} style={styles.logo} />
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#ddd"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#ddd"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity onPress={handleLogin} style={styles.button}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.link}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EmailLoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#A274FF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 50,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: 'black',
  },
  button: {
    backgroundColor: '#7D55E0',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  logo: {
    height: 300,
    width: 300,
    marginTop: -50,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  link: {
    color: 'white',
    marginTop: 15,
    textDecorationLine: 'underline',
  },
});
