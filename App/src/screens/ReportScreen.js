import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
} from 'react-native';
import Mailer from 'react-native-mail';

const ReportScreen = ({navigation}) => {
  const [reportText, setReportText] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = () => {
    if (!reportText.trim()) {
      Alert.alert('Error', 'Please enter a report before submitting.');
      return;
    }

    Mailer.mail(
      {
        subject: 'User Report',
        recipients: ['yatharthkherwork@gmail.com'],
        body: reportText,
        isHTML: false,
      },
      (error, event) => {
        if (error) {
          Alert.alert('Error', 'Could not send the report.');
        } else {
          setSuccessMessage('Report submitted successfully!');
          setReportText('');
        }
      },
    );
  };

  return (
    <View style={{flex: 1, padding: 20, backgroundColor: '#f3e5f5'}}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{fontSize: 18, color: '#6a1b9a'}}>← Back</Text>
        </TouchableOpacity>
        <Text style={{fontSize: 24, fontWeight: 'bold', color: '#6a1b9a'}}>
          Report Here
        </Text>
        <View style={{width: 50}} />
      </View>
      {successMessage ? (
        <Text style={{color: 'green', textAlign: 'center', marginBottom: 10}}>
          {successMessage}
        </Text>
      ) : null}
      <TextInput
        style={{
          height: 100,
          borderColor: '#6a1b9a',
          borderWidth: 1,
          marginBottom: 20,
          padding: 10,
          borderRadius: 5,
          backgroundColor: '#ffffff',
          color: 'black',
        }}
        placeholderTextColor={'Gray'}
        placeholder="Enter your report here"
        multiline
        value={reportText}
        onChangeText={setReportText}
      />
      <Button title="Submit Report" color="#6a1b9a" onPress={handleSubmit} />
    </View>
  );
};

export default ReportScreen;
