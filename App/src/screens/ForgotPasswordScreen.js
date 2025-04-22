import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import {axiosInstance} from '../api/axios';
import Loader from '../components/Loader';
import passwordValidator from '../constants/auth';

const ForgotPasswordScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1 = request OTP, 2 = reset password
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async () => {
    try {
      if (!email) {
        Alert.alert('Error', 'Please enter your email');
        return;
      }
      if (!email.includes('@') || !email.includes('.')) {
        Alert.alert('Error', 'Please enter a valid email');
        return;
      }

      setLoading(true);
      const res = await axiosInstance.post('/api/user/request-reset', {email});
      if (res.data.success) {
        Alert.alert('Success', 'OTP sent to your email');
        setStep(2);
      }
    } catch {
      Alert.alert('Error', 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      if (!otp || !newPassword || !email) {
        // Check if all fields are filled
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }

      if (!passwordValidator(newPassword, Alert)) return;

      setLoading(true);
      const res = await axiosInstance.post('/api/user/reset-password', {
        email,
        otp,
        newPassword,
      });

      if (res.data.success) {
        Alert.alert('Success', 'Password reset. You can now log in.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', res.data.message || 'Invalid OTP');
      }
    } catch {
      Alert.alert('Error', 'Invalid OTP or Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <Loader isLoading={loading} />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholderTextColor={'#ddd'}
      />

      {step === 2 && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            placeholderTextColor={'#ddd'}
          />
          <TextInput
            style={styles.input}
            placeholder="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            placeholderTextColor={'#ddd'}
          />
          <Text style={{color: 'gray', marginBottom: 10, fontSize: 10}}>
            Password must be at least 6 characters long and contain at least one
            uppercase letter, one lowercase letter, and one number.
          </Text>
        </>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={step === 1 ? handleRequestOtp : handleResetPassword}>
        <Text style={styles.buttonText}>
          {step === 1 ? 'Send OTP' : 'Reset Password'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20, justifyContent: 'center'},
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#7D55E0',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
    color: 'black',
  },
  button: {
    backgroundColor: '#7D55E0',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonText: {color: 'white', fontWeight: 'bold', fontSize: 16},
});
