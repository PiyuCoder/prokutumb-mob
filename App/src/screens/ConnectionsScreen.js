import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
} from 'react-native';
import {axiosInstance} from '../api/axios';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const backIcon = require('../assets/icons/black-back.png');

const ConnectionsScreen = ({route}) => {
  const {userId} = route.params;
  const [searchQuery, setSearchQuery] = useState('');
  const [connections, setConnections] = useState([]);
  const [filteredConnections, setFilteredConnections] = useState([]);
  const navigation = useNavigation();

  // Fetch connections
  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await axiosInstance.get(`/api/user/friends/${userId}`);
        setConnections(response.data);
        setFilteredConnections(response.data); // Display all connections initially
      } catch (error) {
        console.error('Error fetching connections:', error);
      }
    };
    if (userId) fetchConnections();
  }, [userId]);

  // Filter connections based on search query
  const handleSearch = query => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredConnections(connections);
    } else {
      setFilteredConnections(
        connections.filter(connection =>
          connection.name.toLowerCase().includes(query.toLowerCase()),
        ),
      );
    }
  };

  const handleBackPress = () => {
    navigation.goBack(); // Navigate back to the previous screen
  };

  // Render user card
  const renderUserCard = ({item}) => (
    <TouchableOpacity
      key={item._id}
      onPress={() =>
        navigation.navigate('UserProfile', {
          userId: item._id,
        })
      }
      style={styles.cardWrapper}>
      <View style={styles.userCard}>
        <ImageBackground
          source={{uri: item.profilePicture}}
          style={styles.profilePicture}
          imageStyle={styles.profilePictureImage}>
          <LinearGradient
            colors={['#4B164C00', '#4B164C99', '#4B164CF2']}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            style={styles.overlay}
          />
          <View style={styles.overlayContent}>
            <View style={styles.distanceContainer}>
              <Text style={styles.userDistance}>{item.distance || 0} m</Text>
            </View>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userLocation}>
              {item.location?.country || 'Unknown'}
            </Text>
          </View>
        </ImageBackground>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          margin: 10,
          marginBottom: 30,
          gap: 80,
        }}>
        <TouchableOpacity onPress={handleBackPress}>
          <Image source={backIcon} style={styles.icon} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Connections</Text>
      </View>

      {/* Search Input */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search connections..."
        placeholderTextColor="#888"
        value={searchQuery}
        onChangeText={handleSearch}
      />

      {/* Connections List */}
      <FlatList
        data={filteredConnections}
        keyExtractor={item => item._id}
        renderItem={renderUserCard}
        contentContainerStyle={styles.listContent}
        numColumns={2} // Two columns in each row
        ListEmptyComponent={() => (
          <Text style={styles.emptyMessage}>No connections found</Text>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 25,
    paddingTop: 20,
  },
  icon: {
    width: 30,
    height: 30,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  searchInput: {
    height: 45,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 22.5,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#fff',
    color: '#333',
  },
  listContent: {
    paddingBottom: 20,
  },
  cardWrapper: {
    flex: 1, // Ensures cards evenly divide the row
    marginHorizontal: 10,
    marginBottom: 15,
  },
  userCard: {
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    width: '100%',
    aspectRatio: 0.75, // Maintain consistent card dimensions
  },
  profilePicture: {
    width: '100%',
    height: '100%',
  },
  profilePictureImage: {
    borderRadius: 10,
  },
  overlay: {
    position: 'absolute',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    height: '100%',
    width: '100%',
  },
  overlayContent: {
    position: 'absolute',
    alignItems: 'center',
    paddingBottom: 10,
    bottom: 0,
    left: 0,
    right: 0,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  userLocation: {
    marginBottom: 10,
    fontSize: 14,
    color: '#FFFFFF',
  },
  distanceContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    padding: 2,
    borderRadius: 10,
  },
  userDistance: {
    color: 'white',
  },
  emptyMessage: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#999',
  },
});

export default ConnectionsScreen;
