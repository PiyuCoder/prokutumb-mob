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
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {axiosInstance} from '../api/axios';
import {useSelector} from 'react-redux';
import MapView, {Marker, Circle} from 'react-native-maps';

const DiscoverScreen = () => {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
    Geolocation.getCurrentPosition(
      position => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLoading(false);
        setRefreshing(false);
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
    <View style={styles.container}>
      <Text style={styles.title}>Discover Nearby People</Text>

      {loading && !refreshing && (
        <ActivityIndicator size="large" color="#0000ff" />
      )}
      {error && <Text style={styles.error}>{error}</Text>}

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {nearbyUsers.length
          ? nearbyUsers
              .filter(item => item?._id !== user?._id)
              .map(user => (
                <View key={user._id} style={styles.userCard}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userSkills}>
                    {user.skills?.join(', ')}
                  </Text>
                  <Text style={styles.userDistance}>
                    Distance: {user.distance} meters
                  </Text>
                </View>
              ))
          : !loading && <Text style={styles.noUsersText}>No users found</Text>}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {interests.map(interest => (
          <TouchableOpacity
            key={interest}
            onPress={() => setSelectedInterest(interest)}
            style={[
              styles.interestButton,
              selectedInterest === interest && styles.selectedInterestButton,
            ]}>
            <Text style={styles.interestText}>{interest}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
              description={`Distance: ${user.distance} meters`}
            />
          ))}
        </MapView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    margin: 16,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
  interestButton: {
    margin: 5,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: 'gray',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedInterestButton: {
    backgroundColor: 'blue',
  },
  interestText: {
    color: 'white',
    fontWeight: 'bold',
  },
  map: {
    height: 300, // Adjust the map height as needed
    width: '100%',
    marginBottom: 10,
  },
  userCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginVertical: 10,
    marginHorizontal: 16,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userSkills: {
    color: 'gray',
  },
  userDistance: {
    color: 'black',
    marginTop: 4,
  },
  noUsersText: {
    textAlign: 'center',
    color: 'black',
    marginTop: 20,
  },
});

export default DiscoverScreen;
