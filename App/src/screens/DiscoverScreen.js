import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation'; // Use the installed package
import axios from 'axios';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {axiosInstance} from '../api/axios';
import {useSelector} from 'react-redux';

const DiscoverScreen = () => {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInterest, setSelectedInterest] = useState(''); // Selected interest for filtering
  const [permissionGranted, setPermissionGranted] = useState(false); // For permission handling
  const {user} = useSelector(state => state.auth);

  // Interests for filtering
  const interests = ['Finance', 'Science', 'Management', 'Startup'];

  // Function to request location permission
  const fetchLocationPermission = async () => {
    const result = await request(
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    );

    if (result === RESULTS.GRANTED) {
      setPermissionGranted(true);
      fetchLocation(); // Fetch location if permission granted
    } else {
      setError('Location permission was not granted');
      setLoading(false);
    }
  };

  // Function to get live location
  const fetchLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLoading(false);
      },
      error => {
        setError(error.message);
        setLoading(false);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  // Fetch nearby people from the backend using location and interest
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
    } catch (error) {
      setError('Error fetching nearby users');
    }
  };

  // Fetch permission and live location on mount
  useEffect(() => {
    fetchLocationPermission();
  }, []);

  // Fetch nearby users when location changes or interest is selected
  useEffect(() => {
    if (latitude && longitude) {
      fetchNearbyPeople();
    }
  }, [latitude, longitude, selectedInterest]);

  return (
    <View className="flex-1 justify-center items-center">
      <Text style={{color: 'black'}}>Discover Nearby People</Text>

      {/* Display loading or error */}
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {error && <Text>{error}</Text>}

      {/* Interest Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {interests.map(interest => (
          <TouchableOpacity
            key={interest}
            onPress={() => setSelectedInterest(interest)}
            style={{
              margin: 5,
              paddingVertical: 8, // Reduced vertical padding
              paddingHorizontal: 20, // Horizontal padding for width
              backgroundColor: selectedInterest === interest ? 'blue' : 'gray',
              borderRadius: 25, // Rounded corners
              alignItems: 'center', // Center text
              justifyContent: 'center', // Center content
              height: 40, // Set a fixed height for uniformity
            }}>
            <Text style={{color: 'white', fontWeight: 'bold'}}>{interest}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Nearby People List */}
      <ScrollView>
        {nearbyUsers.length ? (
          nearbyUsers.map(user => (
            <View key={user._id} style={{marginVertical: 10}}>
              <Text style={{color: 'black'}}>{user.name}</Text>
              <Text style={{color: 'black'}}>{user.skills.join(', ')}</Text>
              <Text>
                {user.location.state}, {user.location.country}
              </Text>
            </View>
          ))
        ) : (
          <Text style={{color: 'black'}}>No users found</Text>
        )}
      </ScrollView>
    </View>
  );
};

export default DiscoverScreen;
