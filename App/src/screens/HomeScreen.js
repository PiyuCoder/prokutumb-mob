import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Button,
  Modal,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {logout} from '../store/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {launchImageLibrary} from 'react-native-image-picker'; // Use react-native-image-picker
import {addNewPost, fetchPosts} from '../store/slices/postSlice';
import QRCode from 'react-native-qrcode-svg';
import LinearGradient from 'react-native-linear-gradient';

const likeIcon = require('../assets/icons/like.png');
const commentIcon = require('../assets/icons/comment.png');
const viewIcon = require('../assets/icons/view.png');
const shareIcon = require('../assets/icons/share.png');

const HomeScreen = ({navigation}) => {
  const [isFeedView, setIsFeedView] = useState(true); // Toggle between Feed and Profile
  const {user} = useSelector(state => state.auth);
  const posts = useSelector(state => state.posts.posts);
  const dispatch = useDispatch();
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility
  const [newPostContent, setNewPostContent] = useState(''); // Content of new post
  const [selectedMedia, setSelectedMedia] = useState(null); // Selected media for the post
  const [page, setPage] = useState(1); // Current page for pagination
  const [isFetching, setIsFetching] = useState(false); // Loading indicator
  const [userPosts, setUserPosts] = useState([]);
  const totalPages = useSelector(state => state.posts.totalPages);

  // console.log(user);
  const stories = [
    {id: '1', name: 'My Post', image: user?.profilePicture, isUser: true},
    // Add other stories here as needed
  ];

  // Fetch initial posts on component mount
  useEffect(() => {
    loadMorePosts(); // Fetch the first page
  }, []);

  const loadMorePosts = async () => {
    console.log('onEndReached triggered, page:', page);
    if (!isFetching && (page <= totalPages || totalPages === 0)) {
      setIsFetching(true);
      await dispatch(fetchPosts({page}));
      setPage(prevPage => prevPage + 1);
      setIsFetching(false);
    }
  };

  useEffect(() => {
    // Filter posts to get only the user's posts
    if (user && posts) {
      const filteredPosts = posts.filter(post => post.user?._id === user?._id);
      setUserPosts(filteredPosts);
    }
  }, [posts, user]);

  // console.log(posts);

  const renderStory = ({item}) => (
    <TouchableOpacity
      onPress={() => {
        // Open the modal when the user story is pressed
        if (item.isUser) {
          console.log('Opening modal for user story'); // Debugging log
          setModalVisible(true); // Open modal
        } else {
          viewStory(item);
        }
      }}>
      <View style={{alignItems: 'center', marginHorizontal: 10}}>
        <Image
          source={{uri: item.image}}
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            borderWidth: item.isUser ? 2 : 0,
            borderColor: item.isUser ? 'green' : 'transparent',
          }}
        />
        <Text style={{fontSize: 12, marginTop: 5}}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  const viewStory = story => {
    console.log('Viewing story of', story.name);
    // Logic to show story details can be added here
  };

  const handleLogout = () => {
    dispatch(logout());
    AsyncStorage.removeItem('authToken');
    AsyncStorage.removeItem('user');
    navigation.navigate('Login');
  };

  // Function to pick media (image or video)
  const pickMedia = async mediaType => {
    const options = {
      mediaType: mediaType === 'image' ? 'photo' : 'video',
      includeBase64: false,
      quality: 1,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        setSelectedMedia(response.assets[0]); // Set the selected media
      }
    });
  };

  const handleAddPost = async () => {
    if (newPostContent.trim()) {
      const formData = new FormData();

      // Add post content (text) to form data
      formData.append('user', user?._id); // User ID
      formData.append('content', newPostContent); // Post content

      // Add media if selected
      if (selectedMedia) {
        formData.append('media', {
          uri: selectedMedia.uri, // URI of the media file
          type: selectedMedia.type, // MIME type of the media (image/video)
          name: `media.${selectedMedia.type.split('/')[1]}`, // Name of the file with appropriate extension
        });
      }

      // Dispatch the action to add new post with FormData
      await dispatch(addNewPost(formData)); // Assuming addNewPost handles FormData

      // Reset modal and post input
      setModalVisible(false);
      setNewPostContent('');
      setSelectedMedia(null);
    } else {
      alert('Please enter post content.');
    }
  };

  const renderPost = ({item}) => (
    <View
      className="border border-gray-200"
      style={{
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
      }}>
      {/* User info (Profile Picture and Name) */}
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Image
          // className="border border-red-500"
          source={{uri: item.user.profilePicture}}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            marginRight: 10,
          }}
        />
        <Text style={{fontWeight: 'bold', color: '#141414'}}>
          {item.user.name}
        </Text>
      </View>

      {/* Post Content */}
      <Text style={{marginTop: 10}}>{item.content}</Text>

      {/* Display media if it exists */}
      {item.mediaUrl && item.mediaType === 'image' && (
        <Image
          source={{uri: item.mediaUrl}}
          style={{
            width: '100%',
            height: 200,
            borderRadius: 8,
            marginTop: 10,
          }}
          resizeMode="cover"
        />
      )}

      {item.mediaUrl && item.mediaType === 'video' && (
        <Video
          source={{uri: item.mediaUrl}}
          style={{
            width: '100%',
            height: 200,
            borderRadius: 8,
            marginTop: 10,
          }}
          controls={true} // Show video controls (optional)
          resizeMode="cover"
        />
      )}

      {/* Post Actions: Likes, Comments, Views, and Share */}
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Image source={commentIcon} style={styles.actionIcon} />
          <Text style={styles.actionText}>{item.comments.length}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Image source={likeIcon} style={styles.actionIcon} />
          <Text style={styles.actionText}>{item.likes.length} </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Image source={viewIcon} style={styles.actionIcon} />
          <Text style={styles.actionText}>{item.views} </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Image source={shareIcon} style={styles.actionIcon} />
          <Text style={styles.actionText}>{item.shares}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View
      style={{
        flex: 1,
        padding: 10,
        // paddingBottom: 80,
        backgroundColor: '#FDF7FD',
      }}>
      <FlatList
        data={isFeedView ? posts : userPosts}
        keyExtractor={item => item._id}
        renderItem={renderPost}
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.2}
        ListFooterComponent={
          isFetching ? <ActivityIndicator size="large" /> : null
        }
        ListHeaderComponent={
          <View>
            {/* Stories Section */}
            <Text style={[styles.proku, {color: '#4B164C', fontSize: 24}]}>
              ProKu
            </Text>
            <View style={{height: 100, paddingVertical: 10}}>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={stories}
                keyExtractor={item => item.id}
                renderItem={renderStory}
              />
            </View>

            {/* <View>
              <TouchableOpacity
                style={{
                  backgroundColor: '#DD88CF',
                  padding: 10,
                  borderRadius: 10,
                  alignItems: 'center',
                }}
                onPress={handleLogout}>
                <Text style={{color: '#fff', fontWeight: 'bold'}}>Logout</Text>
              </TouchableOpacity>
            </View> */}

            {/* Toggle between Feed and Profile */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginVertical: 10,
                backgroundColor: '#F8E7F6',
                borderRadius: 30,
                padding: 5,
              }}>
              <TouchableOpacity
                onPress={() => setIsFeedView(true)}
                style={{
                  backgroundColor: isFeedView ? '#FFFFFF' : '#F8E7F6',
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 25,
                  flex: 1,
                }}>
                <Text
                  style={[
                    styles.proku,
                    {
                      fontSize: 12,
                      color: isFeedView ? '#4B164C' : '#000',
                      textAlign: 'center',
                    },
                  ]}>
                  Connection Feed
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsFeedView(false)}
                style={{
                  backgroundColor: !isFeedView ? '#FFFFFF' : '#F8E7F6',
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 25,
                  flex: 1,
                }}>
                <Text
                  style={[
                    styles.proku,
                    {
                      fontSize: 12,
                      color: !isFeedView ? '#4B164C' : '#000',
                      textAlign: 'center',
                    },
                  ]}>
                  My Profile
                </Text>
              </TouchableOpacity>
            </View>
            {/* QR Code for sharing profile */}
            {!isFeedView && (
              <LinearGradient
                colors={['#DE2BAE', '#FEBE58', '#24EDFF']}
                style={styles.qrContainer}>
                {/* <Text style={styles.qrText}>Scan to connect:</Text> */}
                <QRCode
                  value={user?._id} // Change this to the data you want to share
                  size={120}
                  color="black"
                  backgroundColor="transparent" // Make QR code background transparent
                />
              </LinearGradient>
            )}
            {!isFeedView && (
              <View>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Profile')}
                  style={{
                    backgroundColor: '#DD88CF',
                    padding: 12,
                    borderRadius: 10,
                    alignItems: 'center',
                    marginTop: 10,
                  }}>
                  <Text style={{color: '#141414', fontWeight: 'bold'}}>
                    View Profile
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            {!isFeedView && (
              <View>
                <Text
                  style={{
                    color: '#141414',
                    fontSize: 15,
                    fontWeight: 'bold',
                    marginVertical: 15,
                  }}>
                  My Posts
                </Text>
              </View>
            )}
          </View>
        }
      />

      {/* Modal for adding post */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}>
          <View
            style={{
              width: '85%',
              backgroundColor: 'white',
              padding: 20,
              borderRadius: 15,
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 4},
              shadowOpacity: 0.3,
              shadowRadius: 5,
              elevation: 5,
              alignItems: 'center',
            }}>
            <Text style={{fontSize: 22, fontWeight: 'bold', marginBottom: 15}}>
              Create New Post
            </Text>
            <TextInput
              placeholder="What's on your mind?"
              multiline
              value={newPostContent}
              onChangeText={text => setNewPostContent(text)}
              style={{
                height: 100,
                borderColor: '#ccc',
                borderWidth: 1,
                padding: 10,
                borderRadius: 10,
                marginBottom: 15,
                width: '100%',
                textAlignVertical: 'top',
              }}
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                width: '100%',
              }}>
              <TouchableOpacity
                onPress={() => pickMedia('image')}
                style={{
                  backgroundColor: '#DD88CF',
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 20,
                }}>
                <Text style={{color: '#fff'}}>Add Image</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => pickMedia('video')}
                style={{
                  backgroundColor: '#DD88CF',
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 20,
                }}>
                <Text style={{color: '#fff'}}>Add Video</Text>
              </TouchableOpacity>
            </View>
            {selectedMedia && (
              <View style={{marginTop: 15}}>
                {selectedMedia.type.startsWith('image') ? (
                  <Image
                    source={{uri: selectedMedia.uri}}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 10,
                      marginTop: 10,
                    }}
                  />
                ) : (
                  <Text style={{marginTop: 10}}>
                    Video selected: {selectedMedia.uri}
                  </Text>
                )}
              </View>
            )}
            <View
              style={{
                marginTop: 20,
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '100%',
              }}>
              <TouchableOpacity
                onPress={handleAddPost}
                style={{
                  backgroundColor: '#DD88CF',
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 20,
                }}>
                <Text style={{color: '#fff'}}>Post</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{
                  backgroundColor: '#ccc',
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 20,
                }}>
                <Text style={{color: '#fff'}}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  proku: {
    fontFamily: 'BalooTamma2-Bold',
  },
  qrContainer: {
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: '#FFE4E1', // Light pink for a softer look
    width: 180,
    margin: 'auto',
    borderRadius: 12, // Slightly rounded corners
    padding: 20, // Increased padding for better spacing
    shadowColor: '#000', // Adding shadow for card effect
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2, // Subtle shadow
    shadowRadius: 6, // Softer shadow radius
    // elevation: 5, // For Android elevation
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  actionText: {
    color: '#7B7B7B',
  },
});

export default HomeScreen;
