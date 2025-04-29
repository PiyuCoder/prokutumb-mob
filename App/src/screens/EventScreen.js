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
import Loader from '../components/Loader';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import MapView, {Marker} from 'react-native-maps';
import axios from 'axios';
import OnlineEventPulse from '../components/OnlineEventPulse';
import {GOOGLE_API_KEY} from '@env';

dayjs.extend(customParseFormat);

const getCoordinatesFromAddress = async address => {
  const apiKey = GOOGLE_API_KEY;
  const encodedAddress = encodeURIComponent(address);
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

  const res = await axios.get(url);
  const location = res.data.results[0]?.geometry?.location;
  return location ? {latitude: location.lat, longitude: location.lng} : null;
};

const EventScreen = ({navigation, route}) => {
  const {eventId} = route.params;
  const whyConnect = route.params?.whyConnect || null;
  const {user} = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState({});
  const [mapCoords, setMapCoords] = useState({
    latitude: 25.2048,
    longitude: 55.2708,
  });

  const [isFollowing, setIsFollowing] = useState(
    user?.following?.includes(event?.createdBy?._id) || false,
  );

  const [score, setScore] = useState(0);
  const [imageSource, setImageSource] = useState(
    event?.profilePicture
      ? {uri: event?.profilePicture}
      : require('../assets/default-ep.png'),
  );

  useEffect(() => {
    if (event?.profilePicture) {
      setImageSource({uri: event?.profilePicture});
    } else {
      setImageSource(require('../assets/default-ep.png'));
    }
  }, [event?.profilePicture]);

  useEffect(() => {
    const fetchCoordinates = async () => {
      if (event?.address) {
        const coords = await getCoordinatesFromAddress(event.address);
        console.log('Coordinates:', coords);
        if (coords) {
          setMapCoords(coords);
        }
      }
    };

    fetchCoordinates();
  }, [event?.address]);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(
          `/api/communities/events/fetchAnEvent/${eventId}/${user?._id}`,
        );
        if (res.status === 200) {
          setEvent(res?.data?.data || []);
          setScore(res?.data?.similarityScore || 0);
        }
      } catch (error) {
        console.error('Error fetching event:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  const eventDateTime = dayjs(
    `${event.startDate} ${event.startTime}`,
    'MM/D/YYYY hh:mm A', // your format: 03/2/2025 9:45 AM
  );

  const isEventExpired = eventDateTime.isBefore(dayjs());

  const bookSeat = async () => {
    if (event?.createdBy?._id === user?._id) return;
    const res = await axiosInstance.put(
      `/api/communities/events/bookseat/${eventId}`,
      {userId: user?._id},
    );

    if (res?.status === 200) {
      navigation.replace('SuccessCreation', {
        isEvent: false,
        isRegistered: true,
        event,
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

  if (loading) {
    return <Loader isLoading={loading} />;
  }

  return (
    <ScrollView style={{flex: 1, backgroundColor: 'white'}}>
      <StatusBar hidden />
      <Loader isLoading={loading} />
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
        source={imageSource}
        defaultSource={require('../assets/default-ep.png')}
        style={styles.eventProfilePicture}
        imageStyle={styles.profilePictureImage}
        onError={() => setImageSource(require('../assets/default-ep.png'))}
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
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            {event?.members?.slice(0, 2)?.map(member => (
              <ProfilePicture
                key={member?._id}
                profilePictureUri={member?.profilePicture}
                height={30}
                width={30}
                borderRadius={15}
              />
            ))}
          </View>
          <Text style={{color: 'black'}}>
            {event?.members?.length} Participants
          </Text>
        </View>
      </View>
      <TouchableOpacity
        // onPress={() =>
        //   navigation.navigate('Network', {queryType: 'event', id: eventId})
        // }
        style={{padding: 20, paddingHorizontal: 60}}>
        <Text
          style={{
            fontSize: 21,
            marginBottom: 8,
            color: 'black',
            fontWeight: '500',
          }}>
          Relevancy: {score}%
        </Text>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={['red', 'yellow', 'green']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={[
              styles.progressGradient,
              {width: `${Math.max(0, Math.min(100, score))}%`},
            ]}
          />
        </View>
        {/* <Text
          style={{
            marginTop: 10,
            textAlign: 'center',
            color: 'black',
            fontSize: 16,
          }}>
          Click to know more
        </Text> */}
      </TouchableOpacity>
      {whyConnect && (
        <View style={[styles.card, {width: '100%', marginTop: 30}]}>
          <Text
            style={[
              styles.title,
              {textAlign: 'center', color: '#A274FF', marginTop: 5},
            ]}>
            Why to connect?
          </Text>

          <View>
            <Text
              style={{
                color: 'gray',
                fontSize: 18,
                textAlign: 'center',
              }}>
              {whyConnect}
            </Text>
          </View>
        </View>
      )}
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
      {event?.eventType === 'Physical' ? (
        <MapView
          style={{
            height: 180,
            width: '90%',
            alignSelf: 'center',
            borderRadius: 15,
          }}
          region={{
            latitude: mapCoords?.latitude || 25.2048, // safer with optional chaining
            longitude: mapCoords?.longitude || 55.2708,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={false}
          scrollEnabled={false}
          zoomEnabled={false}>
          <Marker
            coordinate={{
              latitude: mapCoords?.latitude || 25.2048,
              longitude: mapCoords?.longitude || 55.2708,
            }}
            title="Event Venue"
            description={event?.address || 'Venue Address'}
          />
        </MapView>
      ) : (
        <View
          style={{
            height: 180,
            width: '90%',
            alignSelf: 'center',
            borderRadius: 15,
            backgroundColor: '#F5F5F5',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <OnlineEventPulse />
        </View>
      )}

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
          <Text style={{color: 'black'}}>Starts from</Text>
          <Text style={{color: 'black', fontWeight: '500', fontSize: 15}}>
            Free $0.00
          </Text>
        </View>
        {isEventExpired ? (
          <View
            style={{
              backgroundColor: 'gray',
              padding: 10,
              borderRadius: 40,
              paddingHorizontal: 25,
              alignItems: 'center',
            }}>
            <Text style={[styles.BtnText, {letterSpacing: 1, color: 'white'}]}>
              Ended
            </Text>
          </View>
        ) : !event?.members?.find(mem => mem._id === user?._id) ? (
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
            <Text style={[styles.BtnText, {letterSpacing: 1}]}>
              {event?.createdBy?._id === user?._id ? 'Preview' : 'Buy Ticket'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            disabled={event?.createdBy?._id === user?._id}
            onPress={() => navigation.navigate('TicketScreen', {item: event})}
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
    fontWeight: '700',
    color: '#141414',
    fontFamily: 'Jost-Bold',
  },
  profilePicture: {
    width: '100%',
    height: '100%',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    overflow: 'hidden',
  },
  headerBtn: {
    padding: 5,
    backgroundColor: 'black',
    height: 40,
    width: 40,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    opacity: 0.7,
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
