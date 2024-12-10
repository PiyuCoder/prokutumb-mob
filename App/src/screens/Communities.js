import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
  StatusBar,
  Modal,
  TextInput,
  Button,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import SearchPeople from '../components/SearchPeople';
import {useSelector} from 'react-redux';
import {axiosInstance, axiosInstanceForm} from '../api/axios';
import {launchImageLibrary} from 'react-native-image-picker';

const backIcon = require('../assets/icons/black-back.png');
const plusIcon = require('../assets/icons/plus.png');

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
//     location: 'Georgia',
//   },
//   {
//     _id: '5',
//     name: 'Thor',
//     profilePicture: 'https://via.placeholder.com/150',
//     distance: 120,
//     location: 'New Jersey',
//   },
// ];

export default function Communities({navigation}) {
  const [communities, setCommunities] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [communityName, setCommunityName] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [description, setDescription] = useState('');
  const {user} = useSelector(state => state.auth);

  useEffect(() => {
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

    fetchCommunities();
  }, [user?._id]);

  const handleImageSelection = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        maxWidth: 300,
        maxHeight: 300,
        quality: 0.7,
      });

      if (!result.didCancel && result.assets?.length > 0) {
        setProfilePic(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting image:', error.message);
    }
  };

  const handleCreateCommunity = async () => {
    if (communityName && profilePic && description) {
      try {
        const formData = new FormData();
        formData.append('name', communityName);
        formData.append('description', description);
        formData.append('profilePicture', {
          uri: profilePic,
          type: 'image/jpeg', // Adjust if selecting different formats
          name: 'profile.jpg',
        });
        formData.append('createdBy', user?._id);

        const res = await axiosInstanceForm.post('/api/communities', formData);

        if (res.status === 201) {
          setCommunities([...communities, res.data.data]); // Assuming response includes new community data
          setCommunityName('');
          setProfilePic(null);
          setDescription('');
          setModalVisible(false);
        }
      } catch (error) {
        console.error('Error creating community:', error.message);
      }
    } else {
      alert('Please fill all fields');
    }
  };

  // console.log(communities);

  const renderCommunityCard = ({item: community}) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('CommunityHome', {communityId: community._id})
      }
      key={community._id}
      style={styles.cardWrapper}>
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
            <Text style={styles.userName}>{community.name}</Text>
            <Text style={styles.userLocation}>{community.location}</Text>
          </View>
        </ImageBackground>
      </View>
    </TouchableOpacity>
  );
  const renderTrendingCommunityCard = ({item: community}) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('CommunityHome', {communityId: community._id})
      }
      key={community._id}
      style={styles.trendingCardWrapper}>
      <View style={styles.trendingUserCard}>
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
            <Text style={styles.userName}>{community.name}</Text>
            <Text style={styles.userLocation}>{community.location}</Text>
          </View>
        </ImageBackground>
      </View>
    </TouchableOpacity>
  );

  const renderTrending = () => (
    <FlatList
      data={communities}
      horizontal
      keyExtractor={item => item._id}
      renderItem={renderTrendingCommunityCard}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.horizontalScroll}
      ListEmptyComponent={() => (
        <View style={styles.noTrendingContainer}>
          <Image source={require('../assets/not-found.png')} />
          <Text style={styles.noUsersText}>No trending communities found</Text>
        </View>
      )}
    />
  );

  const renderHeader = () => (
    <View style={styles.container}>
      <StatusBar backgroundColor="white" />
      <View style={styles.headerActions}>
        <SearchPeople />
        <TouchableOpacity
          style={styles.iconButtons}
          onPress={() => setModalVisible(true)}>
          <Image style={{height: 20, width: 20}} source={plusIcon} />
        </TouchableOpacity>
      </View>
      <View style={styles.header}>
        <Text style={styles.headerText}>Community</Text>
      </View>
    </View>
  );

  const renderFooter = () => (
    <View>
      <View style={styles.header}>
        <Text style={styles.headerText}>Trending</Text>
      </View>
      {renderTrending()}
    </View>
  );

  return (
    <View>
      <FlatList
        data={communities}
        keyExtractor={item => item._id}
        renderItem={renderCommunityCard}
        contentContainerStyle={styles.listContent}
        numColumns={3} // Three columns
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={() => (
          <View style={styles.noTrendingContainer}>
            <Image source={require('../assets/not-found.png')} />
            <Text style={styles.noUsersText}>No communities found</Text>
          </View>
        )}
      />
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Community</Text>

            <TextInput
              placeholder="Community Name"
              value={communityName}
              onChangeText={setCommunityName}
              style={styles.input}
            />

            <TextInput
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
              style={styles.input}
            />

            <TouchableOpacity
              style={styles.imagePickerButton}
              onPress={handleImageSelection}>
              <Text style={styles.imagePickerText}>
                {profilePic ? 'Change Image' : 'Select Profile Picture'}
              </Text>
            </TouchableOpacity>

            {profilePic && (
              <Image source={{uri: profilePic}} style={styles.selectedImage} />
            )}

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleCreateCommunity}>
              <Text style={styles.submitButtonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    margin: 10,
    gap: 15,
    paddingEnd: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  imagePickerButton: {
    backgroundColor: '#4B164C',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  imagePickerText: {
    color: 'white',
    fontSize: 16,
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 10,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
    marginBottom: 30,
    gap: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#22172A',
    marginTop: 5,
  },
  listContent: {
    minHeight: '100%',
    paddingHorizontal: 10,
    paddingBottom: 20,
    backgroundColor: 'white',
  },
  cardWrapper: {
    flex: 1,
    margin: 8,
    maxWidth: '28%', // Ensure three columns fit evenly
  },
  trendingCardWrapper: {
    marginHorizontal: 8,
  },
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
  userCard: {
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    aspectRatio: 0.65,
  },
  trendingUserCard: {
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    height: 170,
    width: 110,
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
    color: '#FFFFFF',
  },
  horizontalScroll: {
    // paddingHorizontal: 10,
  },
  noTrendingContainer: {
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  noUsersText: {
    textAlign: 'center',
    color: 'gray',
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: '#4B164C',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
