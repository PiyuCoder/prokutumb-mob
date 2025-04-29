import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  StyleSheet,
} from 'react-native';
import {axiosInstance} from '../api/axios';
import {useNavigation} from '@react-navigation/native';
import ProfilePicture from './ProfilePicture';
import Feather from 'react-native-vector-icons/Feather';

const FriendsModal = ({userId}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState([]);
  const [filteredFriends, setFilteredFriends] = useState([]);
  const navigation = useNavigation();

  // Fetch friends on component mount
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await axiosInstance.get(`/api/user/friends/${userId}`);
        setFriends(response.data);
        setFilteredFriends(response.data); // Initially display all friends
      } catch (error) {
        console.error('Error fetching friends:', error);
      }
    };
    if (userId) fetchFriends();
  }, [userId]);

  // Function to handle search input
  const handleSearch = query => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredFriends(friends);
    } else {
      setFilteredFriends(
        friends?.filter(friend =>
          friend?.name.toLowerCase()?.includes(query.toLowerCase()),
        ),
      );
    }
  };

  return (
    <View>
      {/* Icon to Open Modal */}
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Feather name="menu" size={30} color="black" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header with Search Bar */}
            <TextInput
              style={styles.searchInput}
              placeholder="Search Friends..."
              value={searchQuery}
              onChangeText={handleSearch}
              placeholderTextColor={'#ccc'}
            />
            <Text style={{fontWeight: 'bold', color: 'black', marginBottom: 6}}>
              My Connections ({friends?.length})
            </Text>

            {/* Friend List */}
            <FlatList
              data={filteredFriends}
              keyExtractor={item => item._id} // Assuming each friend has a unique `id`
              renderItem={({item}) => (
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(false);
                    navigation.navigate('Chat', {
                      name: item.name,
                      userId: item._id,
                      profilePicture: item.profilePicture,
                    });
                  }}>
                  <View style={styles.friendItem}>
                    <ProfilePicture
                      profilePictureUri={item.profilePicture}
                      width={40}
                      height={40}
                      borderRadius={20}
                      marginRight={10}
                    />
                    {/* <Image
                      source={{uri: item.profilePicture}}
                      style={styles.friendImage}
                    /> */}
                    <Text style={styles.friendName}>{item.name}</Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <Text style={styles.emptyMessage}>No friends found</Text>
              )}
            />

            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  icon: {
    width: 30,
    height: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 40,
    paddingHorizontal: 10,
    marginBottom: 20,
    color: 'black',
    paddingHorizontal: 15,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#ccc',
    padding: 5,
    elevation: 3,
    backgroundColor: 'white',
  },
  friendImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '500',
    color: 'black',
  },
  emptyMessage: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    color: '#999',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#A274FF',
    paddingVertical: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default FriendsModal;
