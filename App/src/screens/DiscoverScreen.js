import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  RefreshControl,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {axiosInstance} from '../api/axios';
import {useSelector} from 'react-redux';

const DiscoverScreen = () => {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [loading, setLoading] = useState(true); // Initial loading state
  const [refreshing, setRefreshing] = useState(false); // Pull-to-refresh loading state
  const [error, setError] = useState('');
  const [selectedInterest, setSelectedInterest] = useState('');
  const [permissionGranted, setPermissionGranted] = useState(false);
  const {user} = useSelector(state => state.auth);

  const interests = ['Finance', 'Science', 'Management', 'Startup'];

  const fetchLocationPermission = async () => {
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
    console.log('Fetching location');
    Geolocation.getCurrentPosition(
      position => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLoading(false);
        setRefreshing(false); // Stop refreshing when location is set
      },
      error => {
        setError(error.message);
        setLoading(false);
        setRefreshing(false);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  const fetchNearbyPeople = async () => {
    try {
      // console.log(latitude);
      const response = await axiosInstance.get('/api/nearby', {
        params: {
          latitude,
          longitude,
          interests: selectedInterest,
          userId: user?._id,
        },
      });
      console.log(response.data);
      setNearbyUsers(response.data);
      setError(''); // Clear error on successful fetch
    } catch (error) {
      setError('Error fetching nearby users');
    } finally {
      setLoading(false);
      setRefreshing(false); // Ensure refreshing stops in all cases
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // console.log('Refreshing');
    // setLoading(false); // Make sure main loading spinner is off during pull-to-refresh
    fetchLocationPermission();
  }, []);

  useEffect(() => {
    fetchLocationPermission();
  }, []);

  useEffect(() => {
    if (latitude && longitude) {
      fetchNearbyPeople();
    }
  }, [latitude, longitude, selectedInterest, refreshing]);

  return (
    <View className="flex-1 justify-center items-center">
      <Text style={{color: 'black'}}>Discover Nearby People</Text>

      {loading && !refreshing && (
        <ActivityIndicator size="large" color="#0000ff" />
      )}
      {error && <Text>{error}</Text>}

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {interests.map(interest => (
          <TouchableOpacity
            key={interest}
            onPress={() => setSelectedInterest(interest)}
            style={{
              margin: 5,
              paddingVertical: 8,
              paddingHorizontal: 20,
              backgroundColor: selectedInterest === interest ? 'blue' : 'gray',
              borderRadius: 25,
              alignItems: 'center',
              justifyContent: 'center',
              height: 40,
            }}>
            <Text style={{color: 'white', fontWeight: 'bold'}}>{interest}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {nearbyUsers.length
          ? nearbyUsers.map(user => (
              <View key={user._id} style={{marginVertical: 10}}>
                <Text style={{color: 'black'}}>{user.name}</Text>
                <Text style={{color: 'black'}}>{user.skills.join(', ')}</Text>
                <Text>
                  {user.location.state}, {user.location.country}
                </Text>
              </View>
            ))
          : !loading && <Text style={{color: 'black'}}>No users found</Text>}
      </ScrollView>
    </View>
  );
};

export default DiscoverScreen;
