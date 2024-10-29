// src/screens/SignupScreen.js
import React, {useState} from 'react';
import {View, TextInput, Button, Text, Alert} from 'react-native';
import axios from 'axios';

const SignupScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async () => {
    try {
      await axios.post('https://your-api/signup', {email, password});
      Alert.alert('Signup Successful!');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Signup Failed', 'Error creating account');
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-gray-200">
      <Text className="text-2xl font-bold mb-5">Signup</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        className="w-3/4 p-2 mb-4 border rounded"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        className="w-3/4 p-2 mb-4 border rounded"
      />
      <Button title="Signup" onPress={handleSignup} />
      <Text className="mt-4" onPress={() => navigation.navigate('Login')}>
        Already have an account? Login
      </Text>
    </View>
  );
};

export default SignupScreen;
