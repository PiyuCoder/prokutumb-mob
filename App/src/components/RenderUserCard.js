import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Image,
} from 'react-native';
import React from 'react';
import ProfilePicture from './ProfilePicture';
import {useNavigation} from '@react-navigation/native';
import ConnectButtonWithModal from './ConnectButtonWithModal';

const RenderUserCard = ({item}) => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('UserProfile', {
          userId: item._id,
        })
      }
      style={styles.cardWrapper}>
      {/* Match Text */}
      <View style={styles.matchTextWrapper}>
        <Text style={styles.matchText}>100% Match</Text>
      </View>

      {/* User Card */}
      <View style={styles.userCard}>
        {/* Profile Picture */}
        <ProfilePicture
          profilePictureUri={item.profilePicture}
          height={100}
          width={100}
          borderRadius={50}
          padding={0}
        />

        {/* User Info */}
        <View style={styles.overlayContent}>
          <Text style={styles.userName}>{item?.name}</Text>
          <Text style={styles.userLocation}>
            {item?.designation || 'Unknown'}
          </Text>
        </View>

        {/* Earth Icon */}
        <View style={styles.earthIconWrapper}>
          <ImageBackground
            style={styles.imageBackground}
            imageStyle={styles.imageBackgroundImage}
            source={require('../assets/majlis-earth.png')}
          />
        </View>

        {/* Connect Button */}
        {/* <TouchableOpacity style={styles.connectBtn}>
          <Text style={styles.connectBtnText}>Connect</Text>
        </TouchableOpacity> */}
        <ConnectButtonWithModal />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  matchTextWrapper: {
    backgroundColor: '#A274FF',
    alignSelf: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 5,
    paddingHorizontal: 18,
    alignItems: 'center',
    marginBottom: 7,
  },
  matchText: {
    color: 'white',
    fontWeight: '400',
    fontSize: 12,
    textAlign: 'center',
  },
  cardWrapper: {
    flexBasis: '48%',
    marginHorizontal: '1%',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#A274FF',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  userCard: {
    alignItems: 'center',
    padding: 10,
  },
  userName: {
    color: 'black',
    fontSize: 19,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
    fontFamily: 'Roboto-Bold',
  },
  userLocation: {
    color: '#585C60',
    fontSize: 17,
    marginTop: 5,
    fontWeight: '300',
  },
  earthIconWrapper: {
    marginTop: 15,
    height: 70,
    width: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageBackground: {
    height: '100%',
    width: '100%',
  },
  imageBackgroundImage: {
    resizeMode: 'contain', // Ensures the entire image is visible without cropping
  },
});

export default RenderUserCard;
