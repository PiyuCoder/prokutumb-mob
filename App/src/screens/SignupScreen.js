import React, {useState} from 'react';
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
import passwordValidator from '../constants/auth';

const SignupScreen = ({navigation}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [otp, setOtp] = useState('');

  const [loading, setLoading] = useState(false);
  const [showEmailConfirmModal, setShowEmailConfirmModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [openReferralInput, setOpenReferralInput] = useState(false);

  const checkRegistration = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert('Error', 'Please enter a valid email');
      return;
    }

    if (!passwordValidator(password, Alert)) return;

    setLoading(true);
    try {
      const res = await axiosInstance.post('/api/user/check-email-register', {
        email,
      });

      if (res.data.isRegistered) {
        Alert.alert('Error', 'User already registered. Please login.');
      } else {
        setShowEmailConfirmModal(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Try again later.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.post('/api/user/verify-otp', {
        email,
        otp,
      });

      if (res.data.success) {
        Alert.alert('Success', 'OTP verified!');
        setShowOTPModal(false);
        setOpenReferralInput(true);
      } else {
        Alert.alert('Error', res.data.message || 'Invalid OTP');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
      console.error('OTP verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      if (!referralCode) {
        Alert.alert('Error', 'Please fill the referral code.');
        return;
      }

      setLoading(true);

      const res = await axiosInstance.post('/api/user/signup', {
        name,
        email,
        password,
        code: referralCode,
      });

      if (res.data.success) {
        setOpenReferralInput(false);
        Alert.alert('Success', 'User registered successfully!');
        navigation.navigate('EmailLogin');
      } else {
        if (res?.data?.limitReached) {
          Alert.alert(
            'Referral Code Expired',
            'Please enter a valid referral code',
          );
        } else {
          Alert.alert('Invalid', `${res.data?.message}`);
        }
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
      <Text
        style={{
          color: 'white',
          marginBottom: 10,
          marginHorizontal: 30,
          fontSize: 10,
        }}>
        Password must be at least 6 characters long and contain at least one
        uppercase letter, one lowercase letter, and one number.
      </Text>
      <TouchableOpacity onPress={checkRegistration} style={styles.button}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>

      {/* Email Consent Modal */}
      <Modal visible={showEmailConfirmModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalHeader}>Email Verification Consent</Text>
          <Text style={styles.modalText}>
            By proceeding, you consent to receiving an email for account
            verification. This will include a One-Time Password (OTP) to confirm
            your email address. You can opt-out of receiving future emails at
            any time through the app's settings.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setShowEmailConfirmModal(false);
              setShowOTPModal(true);
            }}>
            <Text style={styles.buttonText}>Yes, Send OTP</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowEmailConfirmModal(false)}
            style={{marginTop: 20}}>
            <Text style={{color: '#289BF6'}}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* OTP Modal */}
      <Modal visible={showOTPModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalHeader}>Enter OTP</Text>
          <Text style={styles.modalText}>
            Please check your email for the OTP. Enter it below to verify your
            account.
          </Text>
          <TextInput
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="6-digit OTP"
            placeholderTextColor="gray"
            style={styles.referInput}
          />
          <TouchableOpacity style={styles.button} onPress={verifyOtp}>
            <Text style={styles.buttonText}>Verify OTP</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowOTPModal(false)}
            style={{marginTop: 20}}>
            <Text style={{color: '#289BF6'}}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Referral Code Modal */}
      <Modal
        visible={openReferralInput}
        transparent={false}
        animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalHeader}>Enter Referral Code</Text>
          <TextInput
            value={referralCode}
            onChangeText={setReferralCode}
            style={styles.referInput}
            placeholder="Referral Code"
            placeholderTextColor="gray"
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
    backgroundColor: 'white',
    paddingHorizontal: 20,
    padding: 10,
    paddingTop: 50,
  },
  modalHeader: {
    color: 'black',
    fontWeight: '700',
    fontSize: 24,
    marginBottom: 25,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 30,
    textAlign: 'center',
  },
});
