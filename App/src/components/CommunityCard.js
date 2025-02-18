// CommunityCard.js
import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Image,
} from 'react-native';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import {useSelector} from 'react-redux';

const CommunityCard = ({
  community,
  onPress,
  height,
  width,
  picHeight,
  isTrending,
}) => {
  const [isActionModalVisible, setActionModalVisible] = useState(false);
  const [imageSource, setImageSource] = useState(
    community?.profilePicture
      ? {uri: community.profilePicture}
      : require('../assets/default-cp.png'),
  );
  const {user} = useSelector(state => state.auth);
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.cardWrapper, {height, width}]}>
      <View style={!isTrending ? styles.userCard : styles.trendingUserCard}>
        <Image
          source={imageSource}
          defaultSource={require('../assets/default-cp.png')}
          style={[styles.profilePicture, {height: picHeight}]}
          imageStyle={styles.profilePictureImage}
          onError={() => setImageSource(require('../assets/default-cp.png'))}
        />
        <View style={isTrending ? styles.trendingOverlay : {padding: 6}}>
          <View>
            <Text
              numberOfLines={1} // Limits the text to one line
              ellipsizeMode="tail"
              style={[
                styles.userName,
                {color: isTrending ? 'white' : 'black'},
              ]}>
              {community.name}
            </Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
                marginVertical: 10,
                overflow: 'hidden',
              }}>
              <Ionicons
                name="location-outline"
                size={20}
                color={!isTrending ? '#2D264B4D' : 'white'}
              />
              <Text
                numberOfLines={1} // Limits the text to one line
                ellipsizeMode="tail"
                style={[
                  {
                    color: isTrending ? 'white' : 'black',
                    width: isTrending ? '50%' : '90%',
                  },
                ]}>
                {community?.location || 'Worldwide'}
              </Text>
            </View>
            {isActionModalVisible && (
              <View style={[styles.dropdownMenu, {zIndex: 1000}]}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    navigation.navigate('Network');
                    setActionModalVisible(true);
                  }}>
                  <Text style={styles.dropdownItemText}>Ask AI</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setActionModalVisible(false);
                    navigation.navigate('CommunityHome', {
                      communityId: community._id,
                    });
                  }}>
                  <Text style={styles.dropdownItemText}>View</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.dropdownItem}>
                  <Text style={[styles.dropdownItemText, {color: 'red'}]}>
                    Report
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            <Text
              style={{
                color: isTrending ? 'white' : 'black',
                fontWeight: '400',
                fontSize: 12,
              }}>
              {community.members.length + 1} Members
            </Text>
          </View>
          {community?.createdBy?._id !== user?._id &&
            !community?.members?.includes(user?._id) && (
              <TouchableOpacity
                onPress={onPress}
                style={[
                  styles.Btn,
                  {
                    padding: isTrending ? 9 : 4,
                    alignSelf: isTrending ? 'auto' : 'center',
                  },
                ]}>
                <Text style={[styles.BtnText]}>
                  {community?.joinRequests?.some(req => req._id == user?._id)
                    ? 'Requested'
                    : 'Join'}
                </Text>
              </TouchableOpacity>
            )}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              marginTop:
                community?.createdBy?._id !== user?._id &&
                !community?.members?.includes(user?._id)
                  ? 60
                  : 30,
            }}>
            {/* <Text style={{color: 'black', fontWeight: '500', fontSize: 13}}>
              {community.createdBy.name}
            </Text> */}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginRight: 28,
    marginTop: 8,
    borderRadius: 20,
    marginBottom: 10,
    height: 280,
    width: 220,
    overflow: 'hidden',
    backgroundColor: 'white',
    elevation: 5,
    marginLeft: 5,
  },
  userCard: {
    // borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    padding: 10,
  },
  trendingUserCard: {
    // borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    // padding: 10,
  },
  trendingOverlay: {
    backgroundColor: '#2d264bc4',
    position: 'absolute',
    bottom: 0,
    borderRadius: 15,
    margin: 10,
    padding: 15,
    width: '95%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingRight: 70,
  },
  profilePicture: {
    width: '100%',
    height: 130,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    // backgroundColor: '#a274ff6e',
  },
  profilePictureImage: {
    borderRadius: 20,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  userLocation: {
    marginBottom: 10,
    color: '#FFFFFF',
  },
  Btn: {
    backgroundColor: '#A274FF',
    padding: 5,
    width: 110,
    borderRadius: 25,
    paddingHorizontal: 15,
    marginTop: 10,
    alignItems: 'center',
  },
  BtnText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 15,
    textAlign: 'center',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 50, // Adjust position relative to the action icon
    right: 30,
    width: 160,
    backgroundColor: '#FFF',
    borderRadius: 8,
    elevation: 20, // Adds shadow for Android
    shadowColor: 'black', // Adds shadow for iOS
    shadowOpacity: 0.3,
    shadowOffset: {width: 3, height: 3},
    shadowRadius: 1,
    zIndex: 2, // Ensures the dropdown is on top of other elements
  },
  dropdownItem: {
    padding: 15,
    // borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  dropdownItemText: {
    fontSize: 13,
    color: 'black',
  },
});

export default CommunityCard;
