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

const EventCard = ({event, onPress, height, width, picHeight, full}) => {
  const [isActionModalVisible, setActionModalVisible] = useState(false);
  const navigation = useNavigation();
  return (
    <TouchableOpacity style={[styles.cardWrapper, {height, width}]}>
      <View style={styles.userCard}>
        <ImageBackground
          source={{uri: event.profilePicture}}
          style={[styles.profilePicture, {height: picHeight}]}
          imageStyle={styles.profilePictureImage}
        />
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            justifyContent: full ? 'space-between' : 'center',
            alignItems: 'center',
            marginVertical: 10,
            overflow: 'hidden',
          }}>
          <Text
            numberOfLines={1} // Limits the text to one line
            ellipsizeMode="tail"
            style={styles.userName}>
            {event?.name || 'Unknown'}
          </Text>
          {full && (
            <TouchableOpacity
              onPress={() => setActionModalVisible(!isActionModalVisible)}>
              <SimpleLineIcons
                name="options-vertical"
                size={20}
                color="black"
              />
            </TouchableOpacity>
          )}
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
            justifyContent: 'flex-start',
            width: full ? '100%' : 'auto',
            marginBottom: full ? 22 : 0,
          }}>
          <Text
            style={{
              color: 'black',
              fontWeight: '500',
              fontSize: 13,
              textAlign: 'left',
            }}>
            {event?.date || 'Date'}
          </Text>
          <Text
            style={{
              color: 'black',
              fontWeight: '500',
              fontSize: 13,
              textAlign: 'left',
            }}>
            {`${event?.startTime} - ${event?.endTime}` || 'Time'}
          </Text>
        </View>
        {/* <Text style={{color: 'black', fontWeight: '400', fontSize: 12}}>
          {event?.followers || 1} Members
        </Text> */}
        {full && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}>
            <Text style={{color: 'black', fontWeight: '500', fontSize: 13}}>
              {event?.createdBy?.name || 'Admin'}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginRight: 28,
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 20,
    marginBottom: 10,
    overflow: 'hidden',
    // height: 180,
    // width: 130,
  },
  userCard: {
    // borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
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
