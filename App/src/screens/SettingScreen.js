import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import React from 'react';

const backIcon = require('../assets/icons/black-back.png');

const settingArray = [
  {
    section: 'Account',
    options: [
      {
        logo: require('../assets/icons/setting.png'),
        name: 'Edit profile',
        toScreen: 'EditProfile',
      },
      {
        logo: require('../assets/icons/setting.png'),
        name: 'Security',
        toScreen: 'EditProfile',
      },
      {
        logo: require('../assets/icons/setting.png'),
        name: 'Notifications',
        toScreen: 'Notifications',
      },
      {
        logo: require('../assets/icons/setting.png'),
        name: 'Privacy',
        toScreen: 'Notifications',
      },
    ],
  },
  {
    section: 'Support & About',
    options: [
      {
        logo: require('../assets/icons/setting.png'),
        name: 'My Subscriptions',
        toScreen: 'Subscriptions',
      },
      {
        logo: require('../assets/icons/setting.png'),
        name: 'Help & Support',
        toScreen: 'Help',
      },
      {
        logo: require('../assets/icons/setting.png'),
        name: 'Terms & Policies',
        toScreen: 'Help',
      },
    ],
  },
  {
    section: 'Cache & Cellular',
    options: [
      {
        logo: require('../assets/icons/setting.png'),
        name: 'Free up space',
        toScreen: 'Subscriptions',
      },
      {
        logo: require('../assets/icons/setting.png'),
        name: 'Data saver',
        toScreen: 'Help',
      },
    ],
  },
  {
    section: 'Actions',
    options: [
      {
        logo: require('../assets/icons/setting.png'),
        name: 'Report a problem',
        toScreen: 'Subscriptions',
      },
      {
        logo: require('../assets/icons/setting.png'),
        name: 'Add account',
        toScreen: 'Subscriptions',
      },
      {logo: require('../assets/icons/setting.png'), name: 'Logout'},
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
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Image source={backIcon} style={styles.icon} />
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
                    <Image
                      style={{width: 20, height: 20}}
                      source={option.logo}
                    />
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
