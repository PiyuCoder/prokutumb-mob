import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  StatusBar,
  Image,
} from 'react-native';
import {axiosInstance} from '../api/axios';

import proku from '../assets/splash-logo.png';
import Loader from '../components/Loader';

const SignupScreen = ({navigation}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [openReferralInput, setOpenReferralInput] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    try {
      if (!referralCode) {
        Alert.alert('Error', 'Please fill the referral code.');
        return;
      }

      setLoading(true);

      // Register user
      const res = await axiosInstance.post('/api/user/signup', {
        name,
        email,
        password,
        code: referralCode,
      });

      if (res.data.success) {
        Alert.alert('Success', 'User registered successfully', [
          {text: 'OK', onPress: () => navigation.navigate('EmailLogin')},
        ]);
        // Close modal
        setOpenReferralInput(false);
      } else {
        if (res?.data?.limitReached)
          Alert.alert(
            'Referral Code Expired',
            'Please enter a valid referral code',
          );
        else Alert.alert('Invalid', `${res.data?.message}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Try again later.');
    } finally {
      setLoading(false);
    }
  };

  const checkRegistration = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert('Error', 'Please enter a valid email');
      return;
    }
    setLoading(true);
    try {
      // Check if user is registered
      const res = await axiosInstance.post('/api/user/check-email-register', {
        email,
      });

      if (res.data.isRegistered) {
        // User is already registered
        Alert.alert('Error', 'User already registered. Please login.');
      } else {
        // User is not registered
        setOpenReferralInput(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#A274FF" />
      <Loader isLoading={loading} />
      <Image source={proku} style={styles.logo} />
      <Text style={styles.title}>Sign Up</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#ddd"
        value={name}
        onChangeText={setName}
      />

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

      <TouchableOpacity onPress={checkRegistration} style={styles.button}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>

      <Modal
        visible={openReferralInput}
        transparent={false} // Ensures full screen
        animationType="slide" // Optional: Adds smooth transition
      >
        <View style={styles.modalContainer}>
          <Text
            style={{
              color: 'black',
              fontWeight: '700',
              fontSize: 35,
              marginBottom: 25,
            }}>
            Enter Referral Code
          </Text>
          <TextInput
            value={referralCode}
            onChangeText={text => setReferralCode(text)}
            style={styles.referInput}
            placeholder="Referral Code"
            placeholderTextColor={'gray'}
          />

          <TouchableOpacity
            disabled={loading}
            onPress={handleRegister}
            style={styles.button}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setOpenReferralInput(false);
              navigation.navigate('GetReferral');
            }}>
            <Text
              style={{color: '#289BF6', textAlign: 'center', marginTop: 20}}>
              How to get the code?
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default SignupScreen;

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
  logo: {
    height: 300,
    width: 300,
    marginTop: -50,
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
  referInput: {
    width: '90%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 30,
    color: 'black',
  },
  button: {
    backgroundColor: '#7D55E0',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'white', // Change as needed
    paddingHorizontal: 20,
    padding: 10,
    paddingTop: 50,
  },
});
