import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  RefreshControl,
  StyleSheet,
  ImageBackground,
  Image,
  StatusBar,
  FlatList,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {axiosInstance} from '../api/axios';
import {useDispatch, useSelector} from 'react-redux';
import MapView, {Marker, Circle} from 'react-native-maps';
import LinearGradient from 'react-native-linear-gradient';
import Geocoder from 'react-native-geocoding';
import Config from 'react-native-config';
import Loader from '../components/Loader';
import SearchPeople from '../components/SearchPeople';
import RenderUserCard from '../components/RenderUserCard';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ConnectionRequests from '../components/ConnectionRequests';
import {fetchFriendRequests} from '../store/slices/authSlice';

const people = [
  {
    _id: '1',
    name: 'John Doe',
    profilePicture: 'https://via.placeholder.com/150',
    distance: 120,
    designation: 'UI Developer',
  },
  {
    _id: '2',
    name: 'Tony Stark',
    profilePicture: 'https://via.placeholder.com/150',
    distance: 120,
    designation: 'MERN Developer',
  },
  {
    _id: '3',
    name: 'Spiderman',
    profilePicture: 'https://via.placeholder.com/150',
    distance: 120,
    designation: 'React Developer',
  },
  {
    _id: '4',
    name: 'Captain America',
    profilePicture: 'https://via.placeholder.com/150',
    distance: 120,
    designation: 'Product Manager',
  },
  {
    _id: '5',
    name: 'Thor',
    profilePicture: 'https://via.placeholder.com/150',
    distance: 120,
    designation: 'Business Analyst',
  },
];

const DiscoverScreen = ({navigation}) => {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocations, setUserLocations] = useState({});
  const [error, setError] = useState('');
  const [selectedInterest, setSelectedInterest] = useState('');
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [communities, setCommunities] = useState([]);
  const {user} = useSelector(state => state.auth);
  const [sliceIndex, setSliceIndex] = useState(6);
  const dispatch = useDispatch();

  // useEffect(() => {
  //   Geocoder.init('AIzaSyDeS8-47CWqq5QKl0NHnba5cU_Ft2_k8ww');
  //   fetchLocationPermission();
  // }, []);

  // const fetchLocationName = async (lat, long) => {
  //   try {
  //     const response = await Geocoder.from(lat, long);
  //     const addressComponents = response.results[0].address_components;
  //     const locality = addressComponents.find(component =>
  //       component.types.includes('locality'),
  //     );
  //     const locationName = locality ? locality.long_name : 'Unknown location';
  //     setLocationName(locationName);
  //   } catch (error) {
  //     console.warn(error);
  //     setLocationName('Location unavailable');
  //   }
  // };
  // // const fetchLocationForUser = async (lat, long, userId) => {
  // //   try {
  // //     const response = await Geocoder.from(lat, long);
  // //     const locality = response.results[0].address_components.find(component =>
  // //       component.types.includes('locality'),
  // //     );
  // //     const location = locality ? locality.long_name : 'Unknown location';
  // //     setUserLocations(prev => ({...prev, [userId]: location}));
  // //   } catch (error) {
  // //     console.warn(`Error fetching location for user ${userId}:`, error);
  // //   }
  // // };
  // const fetchLocationPermission = async () => {
  //   setLoading(true);
  //   const result = await request(
  //     Platform.OS === 'ios'
  //       ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
  //       : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  //   );

  //   if (result === RESULTS.GRANTED) {
  //     setPermissionGranted(true);
  //     fetchLocation();
  //   } else {
  //     setError('Location permission was not granted');
  //     setLoading(false);
  //     setRefreshing(false);
  //   }
  // };

  // const fetchLocation = () => {
  //   Geolocation.getCurrentPosition(
  //     position => {
  //       // setLatitude(position.coords.latitude);
  //       // setLongitude(position.coords.longitude);
  //       fetchLocationName(position.coords.latitude, position.coords.longitude);
  //       setLoading(false);
  //       setRefreshing(false);
  //     },
  //     error => {
  //       setError(error.message);
  //       setLoading(false);
  //       setRefreshing(false);
  //     },
  //     {enableHighAccuracy: false, timeout: 485000, maximumAge: 10000},
  //   );
  // };

  // const fetchNearbyPeople = async () => {
  //   try {
  //     const response = await axiosInstance.get('/api/nearby', {
  //       params: {
  //         latitude,
  //         longitude,
  //         interests: selectedInterest,
  //         userId: user?._id,
  //       },
  //     });
  //     setNearbyUsers(response.data);
  //     setError('');
  //   } catch (error) {
  //     setError('Error fetching nearby users');
  //   } finally {
  //     setLoading(false);
  //     setRefreshing(false);
  //   }
  // };

  const onRefresh = useCallback(() => {
    // setRefreshing(true);
    // setLoading(true);
    dispatch(fetchFriendRequests(user?._id));
    // fetchLocationPermission();
    // fetchCommunities();
  }, []);

  // useEffect(() => {
  //   if (latitude && longitude) {
  //     fetchNearbyPeople();
  //   }
  // }, [latitude, longitude, selectedInterest, refreshing]);

  // useEffect(() => {
  //   // Fetch location names for each user
  //   nearbyUsers.forEach(user => {
  //     if (user.liveLocation?.coordinates) {
  //       const [long, lat] = user.liveLocation.coordinates;
  //       fetchLocationForUser(lat, long, user._id);
  //     }
  //   });
  // }, [nearbyUsers]);

  // const fetchCommunities = async () => {
  //   try {
  //     if (user?._id) {
  //       const res = await axiosInstance.get('/api/communities');
  //       if (res.status === 200) {
  //         setCommunities(res?.data?.data || []); // Adjust based on backend response
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error fetching communities:', error.message);
  //   }
  // };
  // useEffect(() => {
  //   fetchCommunities();
  // }, [user?._id]);

  const handleUserPress = userId => {
    navigation.navigate('UserProfile', {userId});
  };

  //   <TouchableOpacity
  //     onPress={() =>
  //       navigation.navigate('CommunityHome', {communityId: community._id})
  //     }
  //     style={{marginHorizontal: 5}}
  //     key={community._id}>
  //     <View style={styles.userCard}>
  //       <ImageBackground
  //         source={{uri: community.profilePicture}}
  //         style={styles.profilePicture}
  //         imageStyle={styles.profilePictureImage}>
  //         <LinearGradient
  //           colors={['#4B164C00', '#4B164C99', '#4B164CF2']}
  //           start={{x: 0, y: 0}}
  //           end={{x: 0, y: 1}}
  //           style={styles.overlay}
  //         />
  //         <View style={styles.overlayContent}>
  //           {/* <View style={styles.distanceContainer}>
  //             <Text style={styles.userDistance}>{community.distance} m</Text>
  //           </View> */}
  //           <Text style={styles.userName}>{community.name}</Text>
  //           <Text style={styles.userLocation}>{community.location}</Text>
  //         </View>
  //       </ImageBackground>
  //     </View>
  //   </TouchableOpacity>
  // );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <StatusBar backgroundColor={'white'} barStyle={'dark-content'} />

      {/* Header */}
      <View style={styles.headerContainer}>
        <View>
          <Text style={[styles.title, {color: '#A274FF'}]}>
            Connection Requests
          </Text>
        </View>
        <View style={styles.headerActions}>
          <SearchPeople />
          {/* <TouchableOpacity style={styles.iconButtons}>
            <Ionicons name="options-outline" size={20} color="#A274FF" />
          </TouchableOpacity> */}
        </View>
      </View>

      {/* Loader and Error */}
      <Loader isLoading={loading} />
      {error && <Text style={styles.error}>{error}</Text>}

      <ConnectionRequests userId={user?._id} />

      <View
        style={{
          marginVertical: 15,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Text
          style={{
            color: '#19295C',
            fontSize: 17,
            fontWeight: '700',
            fontFamily: 'Roboto-Regular',
          }}>
          People You May Know
        </Text>
        {
          <TouchableOpacity>
            <Text style={{color: '#1877F2', fontWeight: 'bold', marginTop: 10}}>
              View All
            </Text>
          </TouchableOpacity>
        }
      </View>

      <View style={styles.cardsContainer}>
        {people?.map(item => (
          <RenderUserCard key={item._id} item={item} />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F4F5',
  },
  contentContainer: {
    paddingBottom: 80,
  },
  locationNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  locationNameText: {
    marginLeft: 8,
    fontSize: 16,
    color: 'black',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 25,
    backgroundColor: 'white',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButtons: {
    padding: 2,
    height: 50,
    width: 50,
    borderRadius: 25,
    borderColor: '#4b164c5a',
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 10,
    color: 'black',
    fontFamily: 'Inter_24pt-Bold',
  },
  error: {
    color: 'red',
    marginHorizontal: 10,
    marginBottom: 10,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
  },
});

export default DiscoverScreen;
