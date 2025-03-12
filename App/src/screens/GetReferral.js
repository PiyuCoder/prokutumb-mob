import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';

import proku from '../assets/splash-logo.png';
import {axiosInstance} from '../api/axios';
import Loader from '../components/Loader';

const GetReferral = ({navigation}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoinWaitingList = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.post('/api/waiting-list', {
        name,
        email,
        phone,
      });

      if (res?.data?.success) {
        setLoading(false);
        ToastAndroid.show(
          'Successfully added to waiting list',
          ToastAndroid.SHORT,
        );
        navigation.goBack();
      } else {
        setLoading(false);
        alert(res?.data?.message);
      }
    } catch (error) {
      setLoading(false);
      alert('Server error');
    } finally {
      setLoading(false);
      setName('');
      setEmail('');
      setPhone('');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <Loader isLoading={loading} />
      <Image source={proku} style={styles.logo} />
      <View style={styles.innerContainer}>
        <Text style={styles.text}>
          {`Get a Referral from a user \n or \n by attending one of our community events`}
        </Text>
        <Image
          source={require('../assets/refer-img.png')}
          style={styles.image}
        />
        <Text style={styles.text}>Join the Waiting list!</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholder="Name"
          placeholderTextColor={'gray'}
        />
        <TextInput
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={'gray'}
        />
        <TextInput
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
          placeholder="Phone"
          placeholderTextColor={'gray'}
        />
        <TouchableOpacity onPress={handleJoinWaitingList} style={styles.button}>
          <Text
            style={{
              color: 'white',
              textAlign: 'center',
              fontSize: 18,
              fontWeight: '500',
            }}>
            Join Waiting List
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default GetReferral;

const styles = StyleSheet.create({
  contentContainer: {
    paddingVertical: 20, // Allow scrolling
    alignItems: 'center',
    backgroundColor: 'white',
  },
  innerContainer: {
    alignItems: 'center',
    width: '100%',
    marginTop: -50,
  },
  logo: {
    height: 300,
    width: 300,
    marginTop: -50,
  },
  text: {
    textAlign: 'center',
    fontSize: 20,
    padding: 20,
    color: 'black',
    fontWeight: '500',
  },
  image: {
    height: 180,
    width: 180,
    borderRadius: 10,
  },
  button: {
    backgroundColor: '#FC036A',
    padding: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 20,
    width: '70%',
    marginBottom: 30,
  },
  input: {
    height: 50,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    padding: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
    color: 'black',
    width: '90%',
  },
});
