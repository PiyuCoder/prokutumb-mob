// CommunityCard.js
import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  ImageBackground,
  StyleSheet,
} from 'react-native';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import {useSelector} from 'react-redux';

const CommunityCard = ({community, onPress, style}) => {
  const [isActionModalVisible, setActionModalVisible] = useState(false);
  const {user} = useSelector(state => state.auth);
  const navigation = useNavigation();
  return (
    <View style={[styles.cardWrapper, style]}>
      <View style={styles.userCard}>
        <ImageBackground
          source={{uri: community.profilePicture}}
          style={styles.profilePicture}
          imageStyle={styles.profilePictureImage}
        />
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginVertical: 10,
            overflow: 'hidden',
          }}>
          <Text
            numberOfLines={1} // Limits the text to one line
            ellipsizeMode="tail"
            style={styles.userName}>
            {community.name}
          </Text>
          <TouchableOpacity
            onPress={() => setActionModalVisible(!isActionModalVisible)}>
            <SimpleLineIcons name="options-vertical" size={20} color="black" />
          </TouchableOpacity>
        </View>
        {isActionModalVisible && (
          <View style={[styles.dropdownMenu, {zIndex: 1000}]}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setActionModalVisible(false);
                setModalVisible(true);
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
        {community?.createdBy?._id !== user?._id &&
          !community?.members?.includes(user?._id) && (
            <TouchableOpacity style={styles.Btn}>
              <Text style={styles.BtnText}>Join</Text>
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
          <Text style={{color: 'black', fontWeight: '500', fontSize: 13}}>
            {community.createdBy.name}
          </Text>
          <Text style={{color: 'black', fontWeight: '400', fontSize: 12}}>
            {community.members.length + 1} Members
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginRight: 28,
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 20,
    marginBottom: 10,
    height: 280,
    width: 220,
    overflow: 'hidden',
  },
  userCard: {
    // borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    padding: 10,
  },
  profilePicture: {
    width: '100%',
    height: 130,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    backgroundColor: '#a274ff6e',
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
    width: 100,
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
