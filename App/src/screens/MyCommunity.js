import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  StatusBar,
  ProgressBarAndroidComponent,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Octicons from 'react-native-vector-icons/Octicons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import {axiosInstance} from '../api/axios';
import ProfilePicture from '../components/ProfilePicture';
import {useDispatch, useSelector} from 'react-redux';
import {follow, updateAsyncStorage} from '../store/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';

const MyCommunity = ({navigation, route}) => {
  const {communityId} = route.params;
  const {user} = useSelector(state => state.auth);
  const dispatch = useDispatch();
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

  const [isFollowing, setIsFollowing] = useState(
    user?.following?.includes(event?.createdBy?._id) || false,
  );

  console.log(user);

  // console.log(user);

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

  // console.log(event);

  const bookSeat = async () => {
    const res = await axiosInstance.put(
      `/api/communities/events/bookseat/${eventId}`,
      {userId: user?._id},
    );

    if (res?.status === 200) {
      navigation.replace('SuccessCreation', {
        isEvent: false,
        isRegistered: true,
      });
    }
  };

  const followHandler = async () => {
    try {
      dispatch(
        follow({userId: event.createdBy?._id, followerId: user?._id}),
      ).then(action => {
        if (follow.fulfilled.match(action)) {
          setIsFollowing(true);
        }
      });
    } catch (error) {
      console.error('Error while following the user:', error);
    }
  };

  return (
    <ScrollView style={{flex: 1, backgroundColor: 'white'}}>
      <StatusBar hidden />
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
          <Octicons name="chevron-left" size={25} color="white" />
        </TouchableOpacity>
      </View>

      <ImageBackground
        source={{
          uri: event?.profilePicture,
        }}
        style={styles.eventProfilePicture}
        imageStyle={styles.profilePictureImage}
      />
      <View
        style={{
          padding: 25,
          marginHorizontal: 25,
          borderRadius: 20,
          elevation: 5,
          backgroundColor: 'white',
          marginTop: -80,
        }}>
        <Text style={styles.eventName}>{event?.name || ''}</Text>

        <View
          // className="bg-[#ffffff3e]"
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            marginTop: 5,
            // width: '100%',
            paddingRight: 10,
          }}>
          <Ionicons name="location-outline" size={20} color="#2D264B40" />
          <View style={{marginLeft: 10}}>
            <Text style={{color: 'black'}}>{event?.address || ''}</Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            marginTop: 5,
          }}>
          <Feather name="calendar" size={20} color="#2D264B40" />
          <View style={{marginLeft: 10}}>
            <Text style={{color: 'black'}}>{`${event?.startDate}${
              event?.endDate === '' ? '' : event?.endDate
            }`}</Text>
            <Text style={{color: 'black'}}>
              {`${event?.startTime} - ${event?.endTime}` || ''}
            </Text>
          </View>
        </View>
        <View
          style={{
            // backgroundColor: '#36454F',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 16,
          }}>
          {event?.members?.slice(0, 2)?.map(member => (
            <ProfilePicture
              key={member?._id}
              profilePictureUri={member?.profilePicture}
              height={30}
              width={30}
              borderRadius={15}
            />
          ))}
          <Text style={{color: 'black'}}>
            {event?.members?.length} Participants
          </Text>
        </View>
      </View>
      <TouchableOpacity style={{padding: 20, paddingHorizontal: 60}}>
        <Text
          style={{
            fontSize: 21,
            marginBottom: 8,
            color: 'black',
            fontWeight: '500',
          }}>
          Relevancy: {87}%
        </Text>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={['red', 'yellow', 'green']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={[
              styles.progressGradient,
              {width: `${Math.max(0, Math.min(100, 87))}%`},
            ]}
          />
        </View>
        <Text
          style={{
            marginTop: 10,
            textAlign: 'center',
            color: 'black',
            fontSize: 16,
          }}>
          Click to know more
        </Text>
      </TouchableOpacity>
      <View style={{marginTop: 20, paddingHorizontal: 20}}>
        <Text
          style={{
            color: 'black',
            fontSize: 17,
            marginBottom: 10,
          }}>
          Description
        </Text>
        <Text
          style={{
            color: '#706D6D',
            lineHeight: 21,
          }}>
          {event?.description || ''}
        </Text>
      </View>

      <Text
        style={{
          marginLeft: 20,
          color: 'black',
          fontSize: 17,
          marginTop: 30,
          marginBottom: 10,
        }}>
        Venue & Location
      </Text>
      <View
        style={{
          height: 180,
          width: '90%',
          backgroundColor: '#F5F5F5',
          alignSelf: 'center',
          borderRadius: 15,
        }}></View>

      <View
        style={{
          backgroundColor: 'white',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          elevation: 5,
          padding: 20,
          marginBottom: 20,
        }}>
        <View>
          <Text style={{color: 'black'}}>Start from</Text>
          <Text style={{color: 'black', fontWeight: '500', fontSize: 15}}>
            Free $0.00
          </Text>
        </View>
        {!event?.members?.find(mem => mem._id === user?._id) ? (
          <TouchableOpacity
            disabled={event?.createdBy?._id === user?._id}
            onPress={bookSeat}
            style={{
              backgroundColor: '#761CBC',
              padding: 10,
              borderRadius: 40,
              paddingHorizontal: 25,
              alignItems: 'center',
            }}>
            <Text style={[styles.BtnText, {letterSpacing: 1}]}>Buy Ticket</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            disabled={event?.createdBy?._id === user?._id}
            onPress={() => navigation.navigate('TicketScreen')}
            style={{
              backgroundColor: '#761CBC',
              padding: 10,
              borderRadius: 40,
              paddingHorizontal: 25,
              alignItems: 'center',
            }}>
            <Text style={[styles.BtnText, {letterSpacing: 1}]}>
              View Ticket
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

export default MyCommunity;

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
    fontWeight: '700',
    color: '#141414',
    fontFamily: 'Jost-Bold',
  },
  profilePicture: {
    width: '100%',
    height: '100%',
  },
  headerBtn: {
    padding: 5,
    backgroundColor: '#ffffff3e',
    height: 40,
    width: 40,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  eventProfilePicture: {
    width: '100%',
    height: 300,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  profilePictureImage: {
    // borderBottomLeftRadius: 15,
    // borderBottomRightRadius: 15,
  },
  progressBar: {
    height: 30,
    width: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: 30,
    overflow: 'hidden',
  },
  progressGradient: {
    height: '100%',
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
