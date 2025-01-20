import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import Octicons from 'react-native-vector-icons/Octicons';
import AntDesign from 'react-native-vector-icons/AntDesign';

const settingArray = [
  {
    section: 'Account',
    options: [
      {
        logo: <Icon name="person-outline" size={20} color="#544C4C" />,
        name: 'Edit profile',
        toScreen: 'EditProfile',
      },
      {
        logo: <Octicons name="shield" size={20} color="#544C4C" />,
        name: 'Security',
        toScreen: 'EditProfile',
      },
      {
        logo: <Icon name="notifications-outline" size={20} color="#544C4C" />,
        name: 'Notifications',
        toScreen: 'Notifications',
      },
      {
        logo: <Octicons name="lock" size={20} color="#544C4C" />,
        name: 'Privacy',
        toScreen: 'Notifications',
      },
    ],
  },
  {
    section: 'Support & About',
    options: [
      {
        logo: <Octicons name="credit-card" size={20} color="#544C4C" />,
        name: 'My Subscriptions',
        toScreen: 'Subscriptions',
      },
      {
        logo: <Octicons name="question" size={20} color="#544C4C" />,
        name: 'Help & Support',
        toScreen: 'Help',
      },
      {
        logo: <Octicons name="info" size={20} color="#544C4C" />,
        name: 'Terms & Policies',
        toScreen: 'Help',
      },
    ],
  },
  {
    section: 'Cache & Cellular',
    options: [
      {
        logo: <AntDesign name="delete" size={20} color="#544C4C" />,
        name: 'Free up space',
        toScreen: 'Subscriptions',
      },
      {
        logo: <Octicons name="database" size={20} color="#544C4C" />,
        name: 'Data saver',
        toScreen: 'Help',
      },
    ],
  },
  {
    section: 'Actions',
    options: [
      {
        logo: <Icon name="flag-outline" size={20} color="#544C4C" />,
        name: 'Report a problem',
        toScreen: 'Subscriptions',
      },
      {
        logo: <Icon name="person-add-outline" size={20} color="#544C4C" />,
        name: 'Add account',
        toScreen: 'Subscriptions',
      },
      {
        logo: <Icon name="exit-outline" size={20} color="#544C4C" />,
        name: 'Logout',
      },
    ],
  },
];

export default function SettingScreen({navigation}) {
  return (
    <ScrollView>
      <View style={{padding: 16}}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 10,
          }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back-outline" size={30} color="black" />
          </TouchableOpacity>
          <View style={{flex: 1}}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: 'black',
                textAlign: 'center',
              }}>
              Settings
            </Text>
          </View>
        </View>
        <View style={{marginTop: 10}}>
          {settingArray?.map((setting, index) => (
            <View key={index}>
              <Text
                style={{marginBottom: 7, color: '#000000', fontWeight: 'bold'}}>
                {setting.section}
              </Text>
              <View
                style={{
                  backgroundColor: '#2427600D',
                  padding: 15,
                  paddingHorizontal: 20,
                  borderRadius: 10,
                  marginBottom: 15,
                  gap: 15,
                }}>
                {setting.options.map((option, i) => (
                  <TouchableOpacity
                    key={i}
                    style={{flexDirection: 'row', gap: 35}}>
                    <View style={{width: 30}}>{option.logo}</View>
                    <Text style={{color: '#000000', fontWeight: '500'}}>
                      {option.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F5F5F5', overflow: 'scroll'},
  icon: {
    width: 30,
    height: 30,
  },
});
