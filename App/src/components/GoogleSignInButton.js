import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  Alert,
} from 'react-native';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {checkRegistration, registration} from '../store/slices/userSlice';
import googleIcon from '../assets/google.png';
import {loginSuccess} from '../store/slices/authSlice';
import {axiosInstance} from '../api/axios';
import {TextInput} from 'react-native-gesture-handler';

GoogleSignin.configure({
  webClientId:
    '615830902048-716rcqk7k49g1umt7ecvt99n4dm1p3jl.apps.googleusercontent.com',
  iosClientId:
    '615830902048-km7n9t8afc4hq5um2mm4a2dt2b1mp6ud.apps.googleusercontent.com',
  offlineAccess: true,
  scopes: [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
  ],
});

const GoogleSignInButton = ({setIsLoading}) => {
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [openReferralInput, setOpenReferralInput] = useState(false);
  const [referralCode, setReferralCode] = useState('');

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});

      const userInfo = await GoogleSignin.signIn();
      console.log('Google User Info:', userInfo);

      // Get tokens from GoogleSignin
      const tokens = await GoogleSignin.getTokens();
      const accessToken = tokens.accessToken; // Access token for backend
      console.log('Google Access Token:', accessToken);

      // Dispatch Redux action to check registration
      dispatch(checkRegistration({token: accessToken})).then(async action => {
        if (checkRegistration.fulfilled.match(action)) {
          if (!action.payload?.success) {
            setOpenReferralInput(true);
            return;
          }
          const {token, user} = action.payload; // Assuming payload contains token and user

          // Store token and user in AsyncStorage
          await AsyncStorage.setItem('authToken', token);
          await AsyncStorage.setItem('user', JSON.stringify(user));

          // Dispatch the loginSuccess action to update Redux state
          dispatch(loginSuccess({token, user}));
          setIsLoading(false);

          if (user?.isProfileComplete) {
            // Navigate to DashboardScreen
            navigation.replace('Dashboard');
          } else {
            // Navigate to CreateProfileScreen
            navigation.replace('CreateProfile');
          }
        } else {
          setError(action.payload.message || 'Login failed');
          setIsLoading(false);
        }
      });
    } catch (err) {
      console.log('Error signing in with Google:', err);
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        setError('Sign in cancelled');
      } else if (err.code === statusCodes.IN_PROGRESS) {
        setError('Sign in in progress');
      } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setError('Play Services not available');
      } else {
        setError('Google sign-in failed');
        setIsLoading(false);
      }
    }
  };

  const handleRegister = async () => {
    try {
      setIsLoading(true);
      // Get tokens from GoogleSignin
      const tokens = await GoogleSignin.getTokens();
      const accessToken = tokens.accessToken; // Access token for backend
      console.log('Google Access Token:', accessToken);

      // Dispatch Redux action to check registration
      dispatch(registration({token: accessToken, code: referralCode})).then(
        async action => {
          if (registration.fulfilled.match(action)) {
            if (action.payload?.limitReached) {
              Alert.alert(
                'Referral Code Expired',
                'Please enter a valid referral code',
              );
              setIsLoading(false);
              return;
            }
            const {token, user} = action.payload; // Assuming payload contains token and user

            // Store token and user in AsyncStorage
            await AsyncStorage.setItem('authToken', token);
            await AsyncStorage.setItem('user', JSON.stringify(user));

            // Dispatch the loginSuccess action to update Redux state
            dispatch(loginSuccess({token, user}));
            setIsLoading(false);
            setOpenReferralInput(false);

            if (user?.isProfileComplete) {
              // Navigate to DashboardScreen
              navigation.replace('Dashboard');
            } else {
              // Navigate to CreateProfileScreen
              navigation.replace('CreateProfile');
            }
          } else {
            setError(action.payload.message || 'Login failed');
            setIsLoading(false);
          }
        },
      );
    } catch (err) {
      console.log('Error signing in with Google:', err);
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        setError('Sign in cancelled');
      } else if (err.code === statusCodes.IN_PROGRESS) {
        setError('Sign in in progress');
      } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setError('Play Services not available');
      } else {
        setError('Google sign-in failed');
        setIsLoading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <TouchableOpacity onPress={handleGoogleLogin} style={styles.customButton}>
        <View
          style={{
            backgroundColor: 'white',
            height: 30,
            width: 30,
            borderRadius: 15,
            padding: 3,
          }}>
          <Image style={styles.googleIcon} source={googleIcon} />
        </View>
        <Text style={styles.customButtonText}>Login with Google</Text>
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
            style={styles.input}
            placeholder="Referral Code"
            placeholderTextColor={'gray'}
          />

          <TouchableOpacity onPress={handleRegister} style={styles.button}>
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

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  googleIcon: {
    height: 24,
    width: 24,
  },
  customButton: {
    backgroundColor: '#A274FF45', // Google's blue color
    borderRadius: 50,
    padding: 12,
    minWidth: 250, // Increase the width for larger screens
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    // shadowColor: '#000',
    // shadowOffset: {width: 0, height: 2},
    // shadowOpacity: 0.8,
    // shadowRadius: 2,
    // elevation: 5, // Shadow effect for elevation
    paddingRight: 50,
  },
  customButtonText: {
    color: '#4B164C',
    fontSize: 16, // Increased font size for better readability
    fontWeight: 'bold',
    marginLeft: 15,
  },
  errorText: {
    marginBottom: 10,
    color: 'red',
    textAlign: 'center',
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
  input: {
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
    backgroundColor: '#A274FF',
    paddingVertical: 15,
    width: '90%',
    alignItems: 'center',
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
export default GoogleSignInButton;
