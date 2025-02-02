import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const CreateProfile = ({navigation}) => {
  return (
    <View>
      <StatusBar hidden />
      <View
        style={{
          flexDirection: 'row',
          gap: 20,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
          backgroundColor: 'white',
          padding: 25,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          paddingTop: 40,
        }}>
        <Text style={styles.title}>Create Profile</Text>
      </View>
      <View style={{padding: 20}}>
        <TouchableOpacity
          onPress={() => {}}
          style={{
            backgroundColor: '#E7CBFE',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 40,
            borderRadius: 20,
            gap: 10,
          }}>
          <MaterialIcons
            name="supervised-user-circle"
            color="black"
            size={30}
          />
          <Text style={[styles.title, {color: 'black'}]}>Import Profile</Text>
          <Text
            style={{
              color: '#273C54',
              width: '70%',
              textAlign: 'center',
              fontSize: 16,
            }}>
            Add Resume or Linkedin
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('CreateProfileStepOne')}
          style={{
            backgroundColor: '#D4E7DB',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 40,
            borderRadius: 20,
            gap: 10,
            marginTop: 15,
          }}>
          <Ionicons name="desktop" color="#028707" size={30} />
          <Text style={[styles.title, {color: 'black'}]}>Build Profile</Text>
          <Text
            style={{
              color: '#273C54',
              width: '70%',
              textAlign: 'center',
              fontSize: 16,
            }}>
            Build your profile with Majlis
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CreateProfile;

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#A274FF',
    textAlign: 'center',
  },
});
