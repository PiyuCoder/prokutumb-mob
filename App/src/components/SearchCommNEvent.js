import React, {useState, useEffect} from 'react';
import {
  View,
  TextInput,
  Image,
  TouchableOpacity,
  FlatList,
  Text,
  StyleSheet,
  Modal,
} from 'react-native';
import {axiosInstance} from '../api/axios';
import {useNavigation} from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/Ionicons';
import ProfilePicture from './ProfilePicture';
import {useSelector} from 'react-redux';

const SearchCommNEvent = ({iconColor, isEvent}) => {
  const [searchVisible, setSearchVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const {user} = useSelector(state => state.auth);
  const navigation = useNavigation();

  const fetchSearchResults = async searchQuery => {
    try {
      const type = isEvent ? 'event' : 'community';
      const response = await axiosInstance.get(
        `/api/search-${type}?q=${searchQuery}`,
      );
      setSearchResults(response?.data);
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  useEffect(() => {
    if (query) {
      const delayDebounce = setTimeout(() => fetchSearchResults(query), 300);
      return () => clearTimeout(delayDebounce);
    } else {
      setSearchResults([]); // Clear results when query is empty
    }
  }, [query]);

  return (
    <>
      {/* Lens Icon */}

      <TouchableOpacity
        style={styles.iconButtons}
        onPress={() => setSearchVisible(true)}>
        {/* <Image source={lensIcon} style={styles.icon} /> */}
        <Feather
          name="search"
          size={25}
          color={iconColor ? iconColor : '#A274FF'}
        />
      </TouchableOpacity>

      {/* Filter Icon */}
      {/* <TouchableOpacity style={styles.iconButtons}>
        <Image source={filterIcon} />
      </TouchableOpacity> */}

      {/* Modal for Search Input and Results */}
      <Modal visible={searchVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              value={query}
              onChangeText={setQuery}
              autoFocus
              placeholderTextColor={'gray'}
            />

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setSearchVisible(false);
                setQuery('');
              }}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {/* Search Results */}
          <FlatList
            data={searchResults?.filter(res => res._id !== user?._id)}
            keyExtractor={item => item._id}
            renderItem={({item}) => (
              <TouchableOpacity
                onPress={() => {
                  setSearchVisible(false);
                  const typeId = isEvent
                    ? {eventId: item._id}
                    : {communityId: item?._id};
                  navigation.navigate(
                    isEvent ? 'EventHome' : 'CommunityHome',
                    typeId,
                  );
                }}>
                <View style={styles.resultItem}>
                  <ProfilePicture
                    profilePictureUri={item.profilePicture}
                    width={40}
                    height={40}
                    borderRadius={20}
                    marginRight={10}
                  />
                  {/* <Image
                    source={{uri: item.profilePicture}}
                    style={styles.profilePicture}
                  /> */}
                  <View>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.userLocation}>
                      {item.location?.state}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
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
  icon: {
    width: 25,
    height: 25,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: 'black',
  },
  cancelButton: {
    marginLeft: 10,
  },
  cancelText: {
    color: '#4B164C',
    fontWeight: 'bold',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22172A',
  },
  userLocation: {
    fontSize: 14,
    color: '#666',
  },
});

export default SearchCommNEvent;
