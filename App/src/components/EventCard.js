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

const EventCard = ({
  event,
  onPress,
  height,
  width,
  picHeight,
  full,
  isTrending,
}) => {
  const [isActionModalVisible, setActionModalVisible] = useState(false);
  const navigation = useNavigation();
  console.log(event);
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.cardWrapper, {height, width}]}>
      <View style={!isTrending ? styles.userCard : styles.trendingUserCard}>
        <ImageBackground
          source={{
            uri:
              // 'https://cdn.pixabay.com/photo/2016/11/23/15/48/audience-1853662_640.jpg' ||
              event.profilePicture,
          }}
          style={[styles.profilePicture, {height: picHeight}]}
          imageStyle={styles.profilePictureImage}
        />
        <View
          // className=" blur-3xl backdrop-blur-3xl bg-[#2d264bc4]"
          style={isTrending ? styles.trendingOverlay : {padding: 6}}>
          <View>
            <Text
              numberOfLines={1} // Limits the text to one line
              ellipsizeMode="tail"
              style={[
                styles.userName,
                {color: isTrending ? 'white' : 'black'},
              ]}>
              {event?.name || 'Unknown'}
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
                {event?.address || 'Unknown'}
              </Text>
              {/* {full && (
              <TouchableOpacity
                onPress={() => setActionModalVisible(!isActionModalVisible)}>
                <SimpleLineIcons
                  name="options-vertical"
                  size={20}
                  color="black"
                />
              </TouchableOpacity>
            )} */}
            </View>
            {full && isActionModalVisible && (
              <View style={[styles.dropdownMenu, {zIndex: 1000}]}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setActionModalVisible(false);
                    navigation.navigate('Network');
                  }}>
                  <Text style={styles.dropdownItemText}>Ask AI</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setActionModalVisible(false);
                    navigation.navigate('EventHome', {
                      eventId: event._id,
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
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
                width: full ? '100%' : 'auto',
                marginBottom: full ? 22 : 0,
                gap: 2,
              }}>
              <Feather
                name="calendar"
                size={20}
                color={!isTrending ? '#2D264B4D' : 'white'}
              />
              <Text
                numberOfLines={1} // Limits the text to one line
                ellipsizeMode="tail"
                style={{
                  color: isTrending ? 'white' : 'black',
                  fontSize: 13,
                  textAlign: 'left',
                  width: '90%',
                }}>
                {`${event?.startDate}${
                  event?.endDate === '' ? ',' : event?.endDate
                } ${event?.startTime} - ${event?.endTime}` || 'Time'}
              </Text>
            </View>
          </View>
          {full && (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              {isTrending ? (
                <Text
                  style={{
                    color: isTrending ? 'white' : 'black',
                    fontWeight: '500',
                    fontSize: 18,
                    textAlign: 'left',
                  }}>
                  Free
                </Text>
              ) : (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5,
                  }}>
                  <SimpleLineIcons name="tag" color="#EC441E" size={20} />
                  <Text style={{fontSize: 16, color: '#EC441E'}}>Free</Text>
                </View>
              )}
            </View>
          )}
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
    overflow: 'hidden',
    backgroundColor: 'white',
    elevation: 5,
    marginLeft: 5,
  },
  userCard: {
    // borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
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
    // height: 80,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
  },
  profilePictureImage: {
    borderRadius: 20,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    fontFamily: 'Jost-Bold',
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

export default EventCard;
