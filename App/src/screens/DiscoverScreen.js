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
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {axiosInstance} from '../api/axios';
import {useSelector} from 'react-redux';
import MapView, {Marker, Circle} from 'react-native-maps';
import LinearGradient from 'react-native-linear-gradient';
import Geocoder from 'react-native-geocoding';
import Config from 'react-native-config';
import Loader from '../components/Loader';
import SearchPeople from '../components/SearchPeople';

const lensIcon = require('../assets/icons/lens.png');
const filterIcon = require('../assets/icons/filter.png');

// const communities = [
//   {
//     _id: '1',
//     name: 'John Doe',
//     profilePicture: 'https://via.placeholder.com/150',
//     distance: 120,
//     location: 'New York',
//   },
//   {
//     _id: '2',
//     name: 'Tony Stark',
//     profilePicture: 'https://via.placeholder.com/150',
//     distance: 120,
//     location: 'California',
//   },
//   {
//     _id: '3',
//     name: 'Spiderman',
//     profilePicture: 'https://via.placeholder.com/150',
//     distance: 120,
//     location: 'New York',
//   },
//   {
//     _id: '4',
//     name: 'Captain America',
//     profilePicture: 'https://via.placeholder.com/150',
//     distance: 120,
//     location: 'Geogia',
//   },
//   {
//     _id: '5',
//     name: 'Thor',
//     profilePicture: 'https://via.placeholder.com/150',
//     distance: 120,
//     location: 'New Jersey',
//   },
// ];

const DiscoverScreen = ({navigation}) => {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocations, setUserLocations] = useState({});
  const [error, setError] = useState('');
  const [selectedInterest, setSelectedInterest] = useState('');
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [communities, setCommunities] = useState([]);
  const {user} = useSelector(state => state.auth);
  const [sliceIndex, setSliceIndex] = useState(6);

  const interests = [
    'Finance',
    'Science',
    'Management',
    'Content',
    'Startup',
    'Funding',
    'AI',
    'Crypto',
    'Blockchain',
    'Technology',
    'Banking',
    'Pharma',
    'Marketing',
    'EdTech',
    'Research',
    'Design',
    'Sustainablity',
    'Growth',
    'Leads',
    'Strategy',
  ];
  Geocoder.init('AIzaSyDeS8-47CWqq5QKl0NHnba5cU_Ft2_k8ww');

  const fetchLocationName = async (lat, long) => {
    try {
      const response = await Geocoder.from(lat, long);
      const addressComponents = response.results[0].address_components;
      const locality = addressComponents.find(component =>
        component.types.includes('locality'),
      );
      const locationName = locality ? locality.long_name : 'Unknown location';
      setLocationName(locationName);
    } catch (error) {
      console.warn(error);
      setLocationName('Location unavailable');
    }
  };
  const fetchLocationForUser = async (lat, long, userId) => {
    try {
      const response = await Geocoder.from(lat, long);
      const locality = response.results[0].address_components.find(component =>
        component.types.includes('locality'),
      );
      const location = locality ? locality.long_name : 'Unknown location';
      setUserLocations(prev => ({...prev, [userId]: location}));
    } catch (error) {
      console.warn(`Error fetching location for user ${userId}:`, error);
    }
  };
  const fetchLocationPermission = async () => {
    setLoading(true);
    const result = await request(
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    );

    if (result === RESULTS.GRANTED) {
      setPermissionGranted(true);
      fetchLocation();
    } else {
      setError('Location permission was not granted');
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        fetchLocationName(position.coords.latitude, position.coords.longitude);
        // setLoading(false);
        setRefreshing(false);
      },
      error => {
        setError(error.message);
        setLoading(false);
        setRefreshing(false);
      },
      {enableHighAccuracy: true, timeout: 485000, maximumAge: 10000},
    );
  };

  const fetchNearbyPeople = async () => {
    try {
      const response = await axiosInstance.get('/api/nearby', {
        params: {
          latitude,
          longitude,
          interests: selectedInterest,
          userId: user?._id,
        },
      });
      setNearbyUsers(response.data);
      setError('');
    } catch (error) {
      setError('Error fetching nearby users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setLoading(true);
    fetchLocationPermission();
    fetchCommunities();
  }, []);

  useEffect(() => {
    fetchLocationPermission();
  }, []);

  useEffect(() => {
    if (latitude && longitude) {
      fetchNearbyPeople();
    }
  }, [latitude, longitude, selectedInterest, refreshing]);

  useEffect(() => {
    // Fetch location names for each user
    nearbyUsers.forEach(user => {
      if (user.liveLocation?.coordinates) {
        const [long, lat] = user.liveLocation.coordinates;
        fetchLocationForUser(lat, long, user._id);
      }
    });
  }, [nearbyUsers]);

  const fetchCommunities = async () => {
    try {
      if (user?._id) {
        const res = await axiosInstance.get('/api/communities');
        if (res.status === 200) {
          setCommunities(res?.data?.data || []); // Adjust based on backend response
        }
      }
    } catch (error) {
      console.error('Error fetching communities:', error.message);
    }
  };
  useEffect(() => {
    fetchCommunities();
  }, [user?._id]);

  const handleUserPress = userId => {
    navigation.navigate('UserProfile', {userId});
  };

  const renderCommunityCard = community => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('CommunityHome', {communityId: community._id})
      }
      style={{marginHorizontal: 5}}
      key={community._id}>
      <View style={styles.userCard}>
        <ImageBackground
          source={{uri: community.profilePicture}}
          style={styles.profilePicture}
          imageStyle={styles.profilePictureImage}>
          <LinearGradient
            colors={['#4B164C00', '#4B164C99', '#4B164CF2']}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            style={styles.overlay}
          />
          <View style={styles.overlayContent}>
            {/* <View style={styles.distanceContainer}>
              <Text style={styles.userDistance}>{community.distance} m</Text>
            </View> */}
            <Text style={styles.userName}>{community.name}</Text>
            <Text style={styles.userLocation}>{community.location}</Text>
          </View>
        </ImageBackground>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      {/* <StatusBar backgroundColor="white" barStyle="dark-content" /> */}
      <View style={styles.locationNameContainer}>
        <Image
          style={{height: 15, width: 15}}
          source={require('../assets/icons/pin.png')}
        />
        <Text style={styles.locationNameText}>{locationName}</Text>
      </View>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          margin: 10,
        }}>
        <Text style={styles.title}>Discover</Text>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingEnd: 4,
          }}>
          <SearchPeople />
          {/* <TouchableOpacity style={styles.iconButtons}>
            <Image source={lensIcon} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButtons}>
            <Image source={filterIcon} />
          </TouchableOpacity> */}
        </View>
      </View>
      {loading && <Loader isLoading={loading} />}
      {error && <Text style={styles.error}>{error}</Text>}
      <ScrollView
        style={{height: 'auto', minHeight: 200}}
        horizontal
        showsHorizontalScrollIndicator={false}>
        {nearbyUsers.length
          ? nearbyUsers
              .filter(item => item?._id !== user?._id)
              .map(user => (
                <TouchableOpacity
                  key={user._id}
                  onPress={() => handleUserPress(user?._id)}>
                  <View style={styles.userCard}>
                    <ImageBackground
                      source={{uri: user.profilePicture}} // Display user's profile picture
                      style={styles.profilePicture}
                      imageStyle={styles.profilePictureImage} // Style the image
                    >
                      <LinearGradient
                        colors={['#4B164C00', '#4B164C99', '#4B164CF2']}
                        start={{x: 0, y: 0}}
                        end={{x: 0, y: 1}}
                        style={styles.overlay}
                      />
                      <View style={styles.overlayContent}>
                        <View style={styles.distanceContainer}>
                          <Text style={styles.userDistance}>
                            {user.distance} m
                          </Text>
                        </View>
                        <Text style={styles.userName}>{user.name}</Text>
                        <Text style={styles.userLocation}>
                          {userLocations[user._id] || 'Loading...'}
                        </Text>
                      </View>
                    </ImageBackground>
                    {/* <Text style={styles.userSkills}>
                    {user.skills?.join(', ')}
                  </Text> */}
                  </View>
                </TouchableOpacity>
              ))
          : !loading && (
              <View
                style={{
                  paddingHorizontal: 10,
                  alignSelf: 'center',
                }}>
                <Image source={require('../assets/not-found.png')} />
                <Text style={styles.noUsersText}>No users found</Text>
              </View>
            )}
      </ScrollView>
      <View
        style={{
          flexDirection: 'row',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          margin: 10,
        }}>
        <Text style={styles.title}>Interest</Text>
        <TouchableOpacity onPress={() => setSliceIndex(interests.length)}>
          <Text style={{color: '#DD88CF'}}>View all</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        style={{height: 70, width: 400}}
        horizontal
        showsHorizontalScrollIndicator={false}>
        {selectedInterest && (
          <TouchableOpacity
            onPress={() => setSelectedInterest('')}
            style={[styles.interestButton, {borderColor: 'red'}]}>
            <Text style={[styles.interestText]}>X</Text>
          </TouchableOpacity>
        )}
        {interests.slice(0, sliceIndex).map(interest => (
          <TouchableOpacity
            key={interest}
            onPress={() =>
              setSelectedInterest(interest === 'None' ? '' : interest)
            }
            style={[
              styles.interestButton,
              selectedInterest === interest && styles.selectedInterestButton,
            ]}>
            <Text
              style={[
                styles.interestText,
                selectedInterest === interest &&
                  styles.selectedInterestButtonText,
              ]}>
              {interest}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View
        style={{
          flexDirection: 'row',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          margin: 10,
        }}>
        <Text style={styles.title}>Community</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Communities')}>
          <Text style={{color: '#DD88CF'}}>View all</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalScroll}>
        {communities?.length ? (
          communities.map(community => renderCommunityCard(community))
        ) : (
          <View
            style={{
              paddingHorizontal: 10,
              alignSelf: 'center',
            }}>
            <Image source={require('../assets/not-found.png')} />
            <Text style={styles.noUsersText}>No communities found</Text>
          </View>
        )}
      </ScrollView>
      <View
        style={{
          margin: 10,
        }}>
        <Text style={styles.title}>Around me</Text>
        {selectedInterest && (
          <Text>
            People with
            <Text style={{color: '#DD88CF'}}> "{selectedInterest}" </Text>
            interest around me
          </Text>
        )}
      </View>
      {latitude && longitude && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude,
            longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation>
          {nearbyUsers.map(user => (
            <Marker
              key={user._id}
              coordinate={{
                latitude: user.liveLocation.coordinates[1],
                longitude: user.liveLocation.coordinates[0],
              }}
              title={user.name}
              description={`Distance: ${user.distance} meters`}>
              <View style={styles.customMarker}>
                <Image
                  source={{uri: user.profilePicture}}
                  style={styles.markerImage}
                />
              </View>
            </Marker>
          ))}
        </MapView>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    height: 'auto',
  },
  locationNameContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  locationNameText: {
    color: '#22172A',
    fontSize: 13,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#22172A',
    textAlign: 'left',
  },
  iconButtons: {
    padding: 2,
    height: 40,
    width: 40,
    borderRadius: 20,
    borderColor: '#4b164c5a',
    borderWidth: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
  interestButton: {
    margin: 5,
    height: 45,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#4b164c5a',
    borderWidth: 1,
    color: '#4B164C',
  },
  selectedInterestButton: {
    backgroundColor: '#DD88CF',
  },
  selectedInterestButtonText: {
    color: 'white',
  },
  interestText: {
    color: '#22172A',
    fontWeight: 'bold',
  },
  map: {
    height: 300, // Adjust the map height as needed
    width: '100%',
    marginVertical: 10,
    marginBottom: 70,
  },
  userCard: {
    position: 'relative', // Important for overlay positioning
    borderRadius: 10,
    overflow: 'hidden', // Ensure child elements are contained within the border radius
    elevation: 3,
    marginVertical: 10,
    width: 140, // Width of the card
    height: 200, // Height of the card
    marginStart: 3,
    marginHorizontal: 3,
  },
  profilePicture: {
    width: '100%',
    height: '100%', // Full height for the card
  },
  profilePictureImage: {
    borderRadius: 10,
  },
  overlay: {
    position: 'absolute',
    alignItems: 'flex-end',
    justifyContent: 'flex-end', // Align content at the bottom
    height: '100%',
    width: '100%',
  },
  overlayContent: {
    position: 'absolute',
    alignItems: 'center', // Center text horizontally
    paddingBottom: 10, // Space from the bottom of the overlay
    bottom: 0,
    left: 0,
    right: 0,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  userLocation: {
    marginBottom: 10,
    color: '#FFFFFF',
  },
  distanceContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    padding: 2,
    borderRadius: 10,
  },
  userDistance: {
    color: 'white',
  },
  userSkills: {
    color: 'gray',
  },
  noUsersText: {
    color: 'gray',
    textAlign: 'center',
  },
  customMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerImage: {
    width: 40, // Adjust width as needed
    height: 40, // Adjust height as needed
    borderRadius: 20, // Make it a circle
    borderWidth: 2,
    borderColor: 'white', // Optional border for better visibility
  },
});

export default DiscoverScreen;
