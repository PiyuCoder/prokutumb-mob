import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const lensIcon = require('../assets/icons/lens.png');
const filterIcon = require('../assets/icons/filter.png');
const backIcon = require('../assets/icons/black-back.png');

const users = [
  {
    _id: '1',
    name: 'John Doe',
    profilePicture: 'https://via.placeholder.com/150',
    distance: 120,
    location: 'New York',
  },
  {
    _id: '2',
    name: 'Tony Stark',
    profilePicture: 'https://via.placeholder.com/150',
    distance: 120,
    location: 'California',
  },
  {
    _id: '3',
    name: 'Spiderman',
    profilePicture: 'https://via.placeholder.com/150',
    distance: 120,
    location: 'New York',
  },
  {
    _id: '4',
    name: 'Captain America',
    profilePicture: 'https://via.placeholder.com/150',
    distance: 120,
    location: 'Geogia',
  },
  {
    _id: '5',
    name: 'Thor',
    profilePicture: 'https://via.placeholder.com/150',
    distance: 120,
    location: 'New Jersey',
  },
];

const MatchScreen = () => {
  const navigation = useNavigation();
  const renderUserCard = user => (
    <View key={user._id} style={styles.userCard}>
      <ImageBackground
        source={{uri: user.profilePicture}}
        style={styles.profilePicture}
        imageStyle={styles.profilePictureImage}>
        <LinearGradient
          colors={['#4B164C00', '#4B164C99', '#4B164CF2']}
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}
          style={styles.overlay}
        />
        <View style={styles.overlayContent}>
          <View style={styles.distanceContainer}>
            <Text style={styles.userDistance}>{user.distance} m</Text>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userLocation}>{user.location}</Text>
        </View>
      </ImageBackground>
    </View>
  );

  const handleBackPress = () => {
    navigation.goBack(); // Navigate back to the previous screen
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{paddingVertical: 10, paddingBottom: 65}}>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          margin: 10,
        }}>
        <TouchableOpacity onPress={handleBackPress} style={styles.iconButtons}>
          <Image source={backIcon} />
        </TouchableOpacity>
        <Text style={styles.title}>Connect</Text>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingEnd: 4,
          }}>
          <TouchableOpacity style={styles.iconButtons}>
            <Image source={lensIcon} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButtons}>
            <Image source={filterIcon} />
          </TouchableOpacity>
        </View>
      </View>
      {/* Section 1: Top Networkers of the Week */}
      <Text style={styles.sectionTitle}>Top Networkers of the Week</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalScroll}>
        {users.map(user => renderUserCard(user))}
      </ScrollView>

      {/* Section 2: People You May Know */}
      <Text style={styles.sectionTitle}>People You May Know</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalScroll}>
        {users.map(user => renderUserCard(user))}
      </ScrollView>

      {/* Section 3: People You Are Searching For */}
      <Text style={styles.sectionTitle}>People You Are Searching For</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalScroll}>
        {users.map(user => renderUserCard(user))}
      </ScrollView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#22172A',
    textAlign: 'left',
  },
  iconButtons: {
    padding: 2,
    height: 40,
    width: 40,
    borderRadius: 20,
    borderColor: '#4b164c5a',
    borderWidth: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4B164C',
    paddingLeft: 15,
    marginVertical: 10,
  },
  horizontalScroll: {
    paddingHorizontal: 10,
  },
  userCard: {
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    marginVertical: 10,
    width: 140,
    height: 200,
    marginHorizontal: 5,
  },
  profilePicture: {
    width: '100%',
    height: '100%',
  },
  profilePictureImage: {
    borderRadius: 10,
  },
  overlay: {
    position: 'absolute',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    height: '100%',
    width: '100%',
  },
  overlayContent: {
    position: 'absolute',
    alignItems: 'center',
    paddingBottom: 10,
    bottom: 0,
    left: 0,
    right: 0,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  userLocation: {
    marginBottom: 10,
    color: '#FFFFFF',
  },
  distanceContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    padding: 2,
    borderRadius: 10,
  },
  userDistance: {
    color: 'white',
  },
});

export default MatchScreen;
