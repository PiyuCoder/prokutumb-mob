import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Octicons from 'react-native-vector-icons/Octicons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import {axiosInstance} from '../api/axios';
import ProfilePicture from '../components/ProfilePicture';

const EventScreen = ({navigation, route}) => {
  const {eventId} = route.params;
  const [event, setEvent] = useState({
    _id: '1',
    name: 'Event One',
    profilePicture:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdkxaQMX4NW8V5JvJ1hV1laDEmbgbPNvNEUA&s',
    date: '12-Jan-2025',
    time: '12:00 PM',
    location: 'Queens, New York',
    address: '756, Queens, New York',
    followers: 100,
    createdBy: {name: 'John Doe'},
    tags: 'Dance, Music',
    description:
      'Lorem ipsum dolor sit amet consectetur. Adipiscing metus tristique nec tortor dignissim nunc iaculis urna rhoncus. Ut.',
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axiosInstance.get(
          `/api/communities/events/fetchAnEvent/${eventId}`,
        );
        if (res.status === 200) {
          setEvent(res?.data?.data || []);
        }
      } catch (error) {
        console.error('Error fetching event:', error.message);
      }
    };
    fetchEvent();
  }, [eventId]);

  console.log(event);
  return (
    <ScrollView style={{flex: 1, backgroundColor: 'white'}}>
      <View
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 10,
          position: 'absolute',
          zIndex: 10,
        }}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.goBack()}>
          <Octicons name="arrow-left" size={25} color="black" />
        </TouchableOpacity>
        <View style={{flexDirection: 'row', gap: 10}}>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="share-outline" size={25} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="heart-outline" size={25} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.eventHeader}>
        <ImageBackground
          source={{uri: event?.profilePicture || ''}}
          style={styles.eventProfilePicture}
          imageStyle={styles.profilePictureImage}
        />
        <Text style={styles.eventName}>{event?.name || ''}</Text>
        {/* <Text style={styles.eventDescription}>{event?.description || ''}</Text> */}
        <View
          style={{
            backgroundColor: '#36454F',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginHorizontal: 20,
            padding: 20,
            borderRadius: 10,
          }}>
          {event?.members?.slice(0, 2)?.map(member => (
            <ImageBackground
              style={{height: 40, width: 40}}
              imageStyle={{borderRadius: 20}}
              source={{
                uri: member?.profilePicture,
              }}
            />
          ))}
          <Text style={{color: 'white'}}>
            {event?.members?.length} people you know are going
          </Text>
          <TouchableOpacity>
            <Text style={{color: 'white'}}>View All</Text>
          </TouchableOpacity>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            marginHorizontal: 20,
            padding: 20,
            marginTop: 10,
          }}>
          <Feather name="calendar" size={40} color="black" />
          <View style={{marginLeft: 20}}>
            <Text style={{color: 'black', fontWeight: 'bold'}}>
              {event?.date || ''}
            </Text>
            <Text style={{color: 'black', fontWeight: 'bold'}}>
              {`${event?.startTime} - ${event?.endTime}` || ''}
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            marginHorizontal: 20,
            padding: 20,
          }}>
          <Ionicons name="location-sharp" size={40} color="black" />
          <View style={{marginLeft: 20}}>
            <Text style={{color: 'black', fontWeight: 'bold'}}>
              {event?.location || ''}
            </Text>
            <Text style={{color: '', fontWeight: '500'}}>
              {event?.address || ''}
            </Text>
          </View>
        </View>
        <View
          style={{
            height: 180,
            width: 260,
            backgroundColor: '#F5F5F5',
            alignSelf: 'center',
            borderRadius: 30,
          }}></View>
        <View style={{marginTop: 20, paddingHorizontal: 20}}>
          <Text
            style={{
              color: 'black',
              fontWeight: 'bold',
              fontSize: 17,
              marginHorizontal: 20,
              paddingHorizontal: 20,
            }}>
            About Event
          </Text>
          <Text
            style={{
              color: 'black',
              marginHorizontal: 20,
              padding: 20,
              fontWeight: '500',
              lineHeight: 21,
            }}>
            {event?.description || ''}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: '#36454F',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginHorizontal: 40,
            paddingHorizontal: 20,
            paddingVertical: 15,
            borderRadius: 10,
          }}>
          <ProfilePicture
            profilePictureUri={event?.createdBy?.profilePicture}
            height={40}
            width={40}
            borderRadius={20}
          />
          <Text style={{color: 'white', fontSize: 16, fontWeight: '500'}}>
            {event?.createdBy?.name}
          </Text>
          <TouchableOpacity style={styles.Btn}>
            <Text style={styles.BtnText}>Follow</Text>
          </TouchableOpacity>
        </View>
        {/* Show tags here */}
        <Text
          style={{
            color: 'black',
            fontWeight: 'bold',
            fontSize: 17,
            marginHorizontal: 20,
            paddingHorizontal: 20,
            marginTop: 20,
          }}>
          Tags
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            marginHorizontal: 15,
            padding: 20,
            marginTop: 10,
            flexWrap: 'wrap',
          }}>
          {event?.tags?.split(',')?.map((tag, index) => (
            <Text
              key={index}
              style={{
                color: '#36454F',
                padding: 5,
                borderRadius: 15,
                borderWidth: 1,
                borderColor: '#36454F',
                paddingHorizontal: 20,
              }}>
              {tag}
            </Text>
          ))}
        </View>
        <TouchableOpacity
          style={{
            backgroundColor: '#A274FF',
            padding: 20,
            width: 220,
            borderRadius: 10,
            paddingHorizontal: 15,
            alignItems: 'center',
            alignSelf: 'center',
            marginTop: 40,
          }}>
          <Text style={[styles.BtnText, {letterSpacing: 1}]}>
            Book your seat Now
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default EventScreen;

const styles = StyleSheet.create({
  eventHeader: {
    // alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
    borderRadius: 10,
  },
  eventName: {
    textAlign: 'left',
    fontSize: 18,
    fontWeight: 'bold',
    margin: 20,
    color: '#141414',
  },
  profilePicture: {
    width: '100%',
    height: '100%',
  },
  headerBtn: {
    padding: 5,
    backgroundColor: 'white',
    height: 40,
    width: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventProfilePicture: {
    width: '100%',
    height: 250,
    overflow: 'hidden',
  },
  profilePictureImage: {
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  Btn: {
    backgroundColor: '#A274FF',
    padding: 5,
    width: 100,
    borderRadius: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  BtnText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 15,
    textAlign: 'center',
  },
});
