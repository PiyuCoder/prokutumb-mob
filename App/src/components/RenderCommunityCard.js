import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Image,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import ProfilePicture from './ProfilePicture';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';

const RenderCommunityCard = ({item, results}) => {
  const navigation = useNavigation();
  const {user} = useSelector(state => state.auth);

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('CommunityHome', {
          communityId: item?._id,
        })
      }
      style={styles.cardWrapper}>
      {/* User Card */}
      <View style={styles.userCard}>
        {/* Profile Picture */}
        <ProfilePicture
          profilePictureUri={item?.communityDetails?.profilePicture}
          height={60}
          width={60}
          borderRadius={30}
          padding={0}
        />

        {/* User Info */}
        <View>
          <Text
            numberOfLines={1} // Limits the text to one line
            ellipsizeMode="tail"
            style={styles.userName}>
            {results ? item?.communityDetails?.name : 'Community'}
          </Text>
          <Text style={styles.mutual}>
            {results ? item?.communityDetails?.communityType : 'Unknown'}
          </Text>
          <Text
            numberOfLines={1} // Limits the text to one line
            ellipsizeMode="tail"
            style={styles.mutual}>
            {results ? item?.communityDetails?.location : 'Unknown'}
          </Text>
        </View>

        {/* Earth Icon */}
        {/* <View style={styles.earthIconWrapper}>
          <ImageBackground
            style={styles.imageBackground}
            imageStyle={styles.imageBackgroundImage}
            source={require('../assets/majlis-earth.png')}
          />
        </View> */}

        {/* Connect Button */}
        {/* <TouchableOpacity style={styles.connectBtn}>
          <Text style={styles.connectBtnText}>Connect</Text>
        </TouchableOpacity> */}
        {/* <ConnectButtonWithModal /> */}
        {/* <TouchableOpacity
          style={styles.connectBtn}
          onPress={() =>
            navigation.navigate('CommunityHome', {
              communityId: item?._id,
            })
          }>
          <Text style={styles.connectBtnText}>Join</Text>
        </TouchableOpacity> */}
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
    flexBasis: '45%',
    marginHorizontal: '2%',
    marginBottom: 15,
    borderRadius: 30,
    backgroundColor: '#fff',
    paddingBottom: 20,
  },
  userCard: {
    alignItems: 'center',
    padding: 10,
    paddingTop: 20,
  },
  userName: {
    color: '#19295C',
    fontSize: 17,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
    fontFamily: 'Roboto-Bold',
  },
  mutual: {
    color: '#585C60',
    fontSize: 12,
    marginTop: 5,
    fontWeight: '300',
    textAlign: 'center',
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
  connectBtn: {
    backgroundColor: '#A274FF',
    width: '85%',
    paddingVertical: 5,
    borderRadius: 25,
    marginTop: 15,
    alignItems: 'center',
    alignSelf: 'center',
  },
  connectBtnText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 15,
    textAlign: 'center',
  },
  imageBackgroundImage: {
    resizeMode: 'contain', // Ensures the entire image is visible without cropping
  },
});

export default RenderCommunityCard;
