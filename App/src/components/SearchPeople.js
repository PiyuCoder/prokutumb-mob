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

const lensIcon = require('../assets/icons/lens.png');
const filterIcon = require('../assets/icons/filter.png');

const SearchPeople = () => {
  const [searchVisible, setSearchVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const navigation = useNavigation();

  const fetchSearchResults = async searchQuery => {
    try {
      const response = await axiosInstance.get(
        `/api/search-people?q=${searchQuery}`,
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
        <Image source={lensIcon} />
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
              placeholder="Search people..."
              value={query}
              onChangeText={setQuery}
              autoFocus
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
            data={searchResults}
            keyExtractor={item => item._id}
            renderItem={({item}) => (
              <TouchableOpacity
                onPress={() => {
                  setSearchVisible(false);
                  navigation.navigate('UserProfile', {userId: item._id});
                }}>
                <View style={styles.resultItem}>
                  <Image
                    source={{uri: item.profilePicture}}
                    style={styles.profilePicture}
                  />
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
    height: 40,
    width: 40,
    borderRadius: 20,
    borderColor: '#4b164c5a',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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

export default SearchPeople;
