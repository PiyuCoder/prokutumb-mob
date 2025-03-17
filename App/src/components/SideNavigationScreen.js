import React, {useRef, useEffect} from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  View,
  StatusBar,
} from 'react-native';
import ProfilePicture from './ProfilePicture';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import Icons from 'react-native-vector-icons/Ionicons';

const {width, height} = Dimensions.get('window');

const SideNavigationScreen = ({setIsSidebarVisible}) => {
  const sidebarAnimation = useRef(new Animated.Value(-width * 0.7)).current;
  const {user} = useSelector(state => state.auth);
  const navigation = useNavigation();

  // Animate Sidebar In
  useEffect(() => {
    Animated.timing(sidebarAnimation, {
      toValue: 0, // Slide in
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  // Close Sidebar
  const closeSidebar = option => {
    if (option === 'Communities') {
      navigation.navigate('Match', {screen: 'Communities'});
    } else if (option === 'Events') {
      navigation.navigate('Match', {screen: 'Events'});
    } else if (option === 'Share') {
      navigation.navigate('ShareScreen');
    }
    Animated.timing(sidebarAnimation, {
      toValue: -width * 0.7, // Slide out
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsSidebarVisible(false)); // Hide overlay after animation
  };

  return (
    <>
      <StatusBar backgroundColor={'white'} barStyle="dark-content" />
      <Modal transparent={true} animationType="none">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={closeSidebar}
        />
        <Animated.View
          style={[
            styles.sidebar,
            {transform: [{translateX: sidebarAnimation}]},
          ]}>
          <View style={styles.headerContainer}>
            <ProfilePicture
              profilePictureUri={user.profilePicture}
              height={100}
              width={100}
              borderRadius={50}
              borderWidth={1}
            />
            <Text
              style={{
                fontSize: 18,
                color: 'black',
                fontWeight: '500',
                marginBottom: 10,
              }}>
              {user?.name}
            </Text>
            <TouchableOpacity
              onPress={() => {
                closeSidebar('');
                navigation.navigate('Profile');
              }}>
              <Text style={{color: '#343434'}}>View Profile</Text>
            </TouchableOpacity>
          </View>
          <View style={{paddingHorizontal: 30}}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => closeSidebar('Communities')}>
              <Text style={styles.menuText}>Communities</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => closeSidebar('Events')}>
              <Text style={styles.menuText}>Events</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => closeSidebar('Share')}>
              <Text style={styles.menuText}>Share Profile</Text>
            </TouchableOpacity>
          </View>
          {/* <View style={{flex: 1, justifyContent: 'flex-end'}}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                padding: 20,
                borderTopWidth: 1,
                borderColor: '#34343466',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: 10,
              }}
              onPress={() => {
                closeSidebar('');
                navigation.navigate('Settings');
              }}>
              <Icons name="settings-sharp" size={30} color="black" />
              <Text style={{fontSize: 16, color: 'black', fontWeight: '500'}}>
                Settings
              </Text>
            </TouchableOpacity>
          </View> */}
        </Animated.View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0, // Ensure it covers the entire screen
    height: height, // Full height to include the status bar
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 50,
    left: 0,
    width: width * 0.7,
    backgroundColor: 'white',

    elevation: 5,
    borderBottomRightRadius: 20,
  },
  headerContainer: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderColor: '#34343466',
    padding: 20,
  },
  sidebarHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: 'black', // Ensure the text is visible
  },
  menuItem: {
    marginVertical: 10,
  },
  menuText: {
    fontSize: 16,
    color: 'black', // Adjusted for better visibility
    fontWeight: '500',
  },
});

export default SideNavigationScreen;
