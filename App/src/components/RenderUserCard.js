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
import ConnectButtonWithModal from './ConnectButtonWithModal';
import {useSelector} from 'react-redux';

const RenderUserCard = ({item, results}) => {
  const navigation = useNavigation();
  const {user} = useSelector(state => state.auth);
  const [resultItem, setResultItem] = useState({});

  useEffect(() => {
    if (results) {
      const itemArr = item?.split(' ');
      const resultItem = {
        _id: itemArr[0],
        type: itemArr[1],
        name: `${itemArr[2]} ${itemArr[3]}`,
        match: itemArr[4],
      };
      setResultItem(resultItem);
    }
  }, [item, results]);
  return (
    <TouchableOpacity
      disabled={results}
      onPress={() =>
        navigation.navigate('UserProfile', {
          userId: results ? resultItem?._id : item._id,
        })
      }
      style={styles.cardWrapper}>
      {/* Match Text */}
      <View style={styles.matchTextWrapper}>
        <Text style={styles.matchText}>
          {results ? resultItem?.match : '100'}% Match
        </Text>
      </View>

      {/* User Card */}
      <View style={styles.userCard}>
        {/* Profile Picture */}
        <ProfilePicture
          profilePictureUri={item.profilePicture}
          height={60}
          width={60}
          borderRadius={30}
          padding={0}
        />

        {/* User Info */}
        <View>
          <Text style={styles.userName}>
            {results ? resultItem?.name : item?.name}
          </Text>
          <Text style={styles.mutual}>
            {results ? 'Unknown' : item?.location}
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
        <TouchableOpacity
          disabled={results}
          style={styles.connectBtn}
          onPress={() =>
            navigation.navigate('UserProfile', {
              userId: item._id,
            })
          }>
          <Text style={styles.connectBtnText}>
            {!item?.friendRequests?.some(
              request => request?.fromUser === user?._id,
            ) && !user?.friends?.some(friend => friend?._id === item._id)
              ? 'Add Friend'
              : 'Pending'}
          </Text>
        </TouchableOpacity>
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

export default RenderUserCard;
