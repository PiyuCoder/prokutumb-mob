import React, {useCallback, useEffect, useRef, useState} from 'react';
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
  RefreshControl,
  StatusBar,
  Share,
  TouchableWithoutFeedback,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {fetchFriendRequests, logout} from '../store/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {launchImageLibrary} from 'react-native-image-picker'; // Use react-native-image-picker
import {
  addNewPost,
  commentOnPost,
  deletePost,
  editPost,
  fetchPosts,
  incrementShare,
  likePost,
} from '../store/slices/postSlice';
import QRCode from 'react-native-qrcode-svg';
import LinearGradient from 'react-native-linear-gradient';
import Loader from '../components/Loader';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {connectSocket, disconnectSocket} from '../socket';
import socket from '../socket';
import ConnectionRequests from '../components/ConnectionRequests';
import ProfilePicture from '../components/ProfilePicture';
import Icon from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import SimpleIcon from 'react-native-vector-icons/SimpleLineIcons';
import {axiosInstance} from '../api/axios';
import SideNavigationScreen from '../components/SideNavigationScreen';
import SearchPeople from '../components/SearchPeople';

const {width, height} = Dimensions.get('window');

const HomeScreen = ({navigation}) => {
  const [isFeedView, setIsFeedView] = useState(true); // Toggle between Feed and Profile
  const {user} = useSelector(state => state.auth);
  const posts = useSelector(state => state.posts.posts);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [newPostContent, setNewPostContent] = useState(''); // Content of new post
  const [selectedMedia, setSelectedMedia] = useState(null); // Selected media for the post
  const [page, setPage] = useState(1); // Current page for pagination
  const [isFetching, setIsFetching] = useState(false); // Loading indicator
  const [isEditMode, setIsEditMode] = useState(false); // Loading indicator
  const [userPosts, setUserPosts] = useState([]);
  const [isCommentSectionOpen, setIsCommentSectionOpen] = useState(false);
  const [openCommentPostId, setOpenCommentPostId] = useState(null);
  const [openActionPostId, setOpenActionPostId] = useState(null);
  const [currentComment, setCurrentComment] = useState('');
  const totalPages = useSelector(state => state.posts.totalPages);
  const [stories, setStories] = useState([]);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const sidebarAnimation = useRef(new Animated.Value(-width * 0.7)).current;

  const flatListRef = useRef(null);

  const fetchStories = async () => {
    try {
      const response = await axiosInstance.get(`/api/recentPosts`, {
        params: {userId: user?._id},
      });
      setStories(response.data);
    } catch (error) {
      console.error('Error fetching stories:', error);
    }
  };
  useEffect(() => {
    fetchStories();
  }, [user]);

  // console.log(user);
  // const stories = [
  //   {id: '1', name: 'My Post', image: user?.profilePicture, isUser: true},
  //   // Add other stories here as needed
  // ];

  // Fetch initial posts on component mount
  useEffect(() => {
    loadMorePosts(); // Fetch the first page
  }, []);

  // console.log(posts);

  const loadMorePosts = async () => {
    console.log('onEndReached triggered, page:', page);
    setIsLoading(true);
    if (!isFetching && (page <= totalPages || totalPages === 0)) {
      setIsFetching(true);
      await dispatch(fetchPosts({page, userId: user?._id}));
      setPage(prevPage => prevPage + 1);
      setIsFetching(false);
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    connectSocket();
    // Filter posts to get only the user's posts
    if (user && posts) {
      setIsFetching(true);
      const filteredPosts = posts.filter(post => post.user?._id === user?._id);
      setUserPosts(filteredPosts);
      setIsFetching(false);
    }
  }, [posts, user]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // setIsLoading(true);
    dispatch(fetchFriendRequests(user?._id));
    fetchStories();
    loadMorePosts();
  }, []);

  const toggleCommentSection = postId => {
    setOpenCommentPostId(prevPostId => (prevPostId === postId ? null : postId));
  };
  const toggleActionSection = postId => {
    setOpenActionPostId(prevPostId => (prevPostId === postId ? null : postId));
  };

  const handleAddComment = post => {
    if (currentComment.trim() !== '') {
      // console.log(post);
      dispatch(
        commentOnPost({
          postId: post._id,
          userId: user?._id,
          content: currentComment,
        }),
      );
      setCurrentComment(''); // Clear input
    }
  };

  // console.log(stories);
  const renderStory = ({item}) => (
    <TouchableOpacity
      onPress={() => {
        viewStory(item);
      }}>
      <View
        style={{
          alignItems: 'center',
          marginHorizontal: 10,
          position: 'relative',
        }}>
        <ProfilePicture
          profilePictureUri={item.image}
          width={50}
          height={50}
          borderRadius={25}
          marginRight={10}
          borderColor={'#A274FF'}
          isUser={false}
          story
        />
        {/* <Image
          source={{uri: item.image}}
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            borderWidth: item.isUser ? 2 : 0,
            borderColor: item.isUser ? '' : '#A274FF',
          }}
        /> */}
        <Text style={{fontSize: 12, marginTop: 5}}>{item.name}</Text>
        {/* <View
          style={{
            position: 'absolute',
            bottom: 18,
            right: 7,
            backgroundColor: 'white',
            height: 20,
            width: 20,
            borderRadius: 10,
            padding: 1,
          }}>
          <Image
            style={{height: '100%', width: '100%'}}
            source={require('../assets/icons/add.png')}
          />
        </View> */}
      </View>
    </TouchableOpacity>
  );

  const viewStory = story => {
    console.log('Viewing story of', story.name);
    // setSelectedStory(story);
    console.log(story);
    // Scroll to the post that matches the story's postId
    const index = posts.findIndex(post => post._id === story.id);
    if (index !== -1) {
      flatListRef.current.scrollToIndex({index, animated: true});
    }
  };

  const handleLogout = async () => {
    await GoogleSignin.signOut();
    dispatch(logout());
    AsyncStorage.removeItem('authToken');
    AsyncStorage.removeItem('user');
    disconnectSocket();
    navigation.navigate('Login');
  };

  const handleUserPress = userId => {
    navigation.navigate('UserProfile', {userId});
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

  const sharePost = async post => {
    try {
      const postUrl = `https://prokutumb-mob.onrender.com/posts/${post._id}`;
      const result = await Share.share({
        message: `Check out this post: ${postUrl}`,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Post shared with activity:', result.activityType);
        } else {
          console.log('Post shared!');
          // Increment the share count
          await dispatch(incrementShare(post._id));
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  console.log('EditMode: ', isEditMode);
  console.log('EditMode: ', isEditMode);
  const handleAddPost = async () => {
    if (newPostContent.trim()) {
      const formData = new FormData();

      // Add post content (text) to form data
      formData.append('user', user?._id); // User ID
      formData.append('content', newPostContent); // Post content

      // Add media if selected
      if (selectedMedia && selectedMedia?.type) {
        formData.append('media', {
          uri: selectedMedia?.uri || selectedMedia?.mediaUrl, // URI of the media file
          type: selectedMedia?.type || selectedMedia?.mediaType, // MIME type of the media (image/video)
          name: `media.${selectedMedia?.type?.split('/')[1]}` || 'unknown', // Name of the file with appropriate extension
        });
      }

      if (isEditMode) {
        await dispatch(editPost({formData, postId: openActionPostId}));
        setIsEditMode(false);
      } else {
        // Dispatch the action to add new post with FormData
        await dispatch(addNewPost(formData)); // Assuming addNewPost handles FormData
      }

      // Reset modal and post input
      setModalVisible(false);
      setNewPostContent('');
      setSelectedMedia(null);
      setOpenActionPostId(null);
    } else {
      alert('Please enter post content.');
    }
  };

  const handleEditPost = post => {
    setIsEditMode(true);
    setModalVisible(true);
    setNewPostContent(post?.content);
    if (post?.mediaUrl && post?.mediaType)
      setSelectedMedia({mediaUrl: post?.mediaUrl, mediaType: post?.mediaType});
  };

  const handleDeletePost = postId => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Dispatch Redux action or call an API to delete the post
            dispatch(deletePost(postId));
            setOpenActionPostId(null);
          },
        },
      ],
      {cancelable: true},
    );
  };

  console.log(selectedMedia);
  const renderPost = ({item}) => (
    <View
      className="border border-[#A274FF]"
      style={{
        marginBottom: 15,
        padding: 12,
        paddingHorizontal: 15,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
      }}>
      {/* User info (Profile Picture and Name) */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <ProfilePicture
            profilePictureUri={item.user.profilePicture}
            width={40}
            height={40}
            borderRadius={20}
            marginRight={10}
          />
          <Text
            onPress={() =>
              user?._id === item.user._id
                ? navigation.navigate('Profile')
                : handleUserPress(item.user._id)
            }
            style={{
              fontWeight: 'bold',
              color: '#141414',
              fontFamily: 'Inter_24pt-Bold',
            }}>
            {item.user.name}
          </Text>
        </View>
        {user?._id === item.user._id && (
          <View style={{position: 'relative', zIndex: 100, marginRight: 8}}>
            <TouchableOpacity
              onPress={() => {
                toggleActionSection(item._id);
                setActionModalVisible(!actionModalVisible);
              }}>
              {/* <Image
                style={{height: 20, width: 20}}
                source={require('../assets/icons/action.png')}
              /> */}
              <SimpleIcon name="options" size={20} color="#585C60" />
            </TouchableOpacity>
            {actionModalVisible && openActionPostId === item._id && (
              <View style={[styles.dropdownMenu, {zIndex: 1000}]}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setActionModalVisible(false);
                    handleEditPost(item);
                  }}>
                  <Text style={styles.dropdownItemText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setActionModalVisible(false);
                    handleDeletePost(item._id);
                    // setOpenActionPostId(null);
                  }}>
                  <Text style={styles.dropdownItemText}>Delete</Text>
                </TouchableOpacity>
                {/* <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => setActionModalVisible(false)}>
            <Text style={styles.dropdownItemText}>Cancel</Text>
          </TouchableOpacity> */}
              </View>
            )}
          </View>
        )}
      </View>

      {/* Post Content */}
      <Text
        style={{
          marginTop: 10,
          color: '#676767',
          fontSize: 16,
          fontFamily: 'Inter_18pt-Regular',
        }}>
        {item.content}
      </Text>

      {/* Display media if it exists */}
      {item.mediaUrl && item.mediaType === 'image' && (
        <Image
          source={{uri: item.mediaUrl}}
          style={{
            width: '100%',
            height: 400,
            objectFit: 'cover',
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
        <TouchableOpacity
          onPress={() =>
            dispatch(likePost({userId: user?._id, postId: item._id}))
          }
          style={styles.actionButton}>
          {/* <Image
            source={item?.likes?.includes(user?._id) ? likedIcon : likeIcon}
            style={styles.actionIcon}
          /> */}
          {item?.likes?.includes(user?._id) ? (
            <Icon name="heart" size={24} color="red" />
          ) : (
            <Icon name="heart-outline" size={24} color="#7B7B7B" />
          )}
          <Text style={styles.actionText}>{item.likes.length} </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => toggleCommentSection(item._id)}
          style={styles.actionButton}>
          {/* <Image source={commentIcon} style={styles.actionIcon} /> */}
          <Icon name="chatbubble-outline" size={24} color="#7B7B7B" />
          <Text style={styles.actionText}>{item.comments.length}</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.actionButton}>
          <Image source={viewIcon} style={styles.actionIcon} />
          <Text style={styles.actionText}>{item.views} </Text>
        </TouchableOpacity> */}
        <TouchableOpacity
          onPress={() => sharePost(item)}
          style={styles.actionButton}>
          {/* <Image source={shareIcon} style={styles.actionIcon} /> */}
          <Icon name="arrow-redo-outline" size={24} color="#7B7B7B" />
          <Text style={styles.actionText}>{item.shares}</Text>
        </TouchableOpacity>
      </View>
      {/* Comment Section */}
      {openCommentPostId === item._id && (
        <View style={styles.commentSection}>
          <Text
            style={{
              fontWeight: 'bold',
              color: 'black',
              margin: 6,
              marginVertical: 20,
            }}>
            Comments
          </Text>
          {item.comments?.length > 0 ? (
            item.comments.map(comment => (
              <View key={comment._id} style={styles.commentContainer}>
                {/* <Image
                  source={{uri: comment.user?.profilePicture}}
                  style={styles.profilePicture}
                /> */}
                <ProfilePicture
                  profilePictureUri={comment.user?.profilePicture}
                  width={30}
                  height={30}
                  borderRadius={15}
                  marginRight={10}
                />
                <View>
                  <Text style={styles.commentUserName}>
                    {comment.user?.name}
                  </Text>
                  <Text style={styles.commentContent}>{comment.content}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noCommentsText}>No comments yet</Text>
          )}

          {/* Add Comment Input */}
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              value={currentComment}
              onChangeText={setCurrentComment}
            />
            <TouchableOpacity
              style={styles.addCommentButton}
              onPress={() => handleAddComment(item)}>
              <Text style={styles.addCommentText}>Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  const handleOutsidePress = () => {
    if (actionModalVisible) {
      setActionModalVisible(false);
      setOpenActionPostId(null);
    }
  };

  // Open Sidebar
  const openSidebar = () => {
    setIsSidebarVisible(true); // Show overlay
    Animated.timing(sidebarAnimation, {
      toValue: 0, // Slide in
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 7,
        paddingTop: 10,
        // paddingBottom: 80,
        backgroundColor: 'white',
      }}>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      {/* <Loader isLoading={isLoading} /> */}
      <FlatList
        ref={flatListRef}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        data={isFeedView ? posts : userPosts}
        keyExtractor={item => item._id}
        renderItem={renderPost}
        contentContainerStyle={{paddingBottom: 65}}
        ListEmptyComponent={<Text>No Posts yet</Text>}
        // onEndReached={loadMorePosts}
        onEndReachedThreshold={0.2}
        ListFooterComponent={
          isFetching ? <ActivityIndicator size="large" /> : null
        }
        ListHeaderComponent={
          <View>
            {/* Stories Section */}
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 5,
                gap: 10,
                marginBottom: 10,
              }}>
              {/* <Image
                style={{height: 35, width: 75}}
                source={require('../assets/proku-home-logo.png')}
              /> */}
              {/* <Text style={[styles.proku, {color: '#4B164C', fontSize: 24}]}>
                ProKu
              </Text> */}
              <TouchableOpacity onPress={openSidebar}>
                <ProfilePicture
                  profilePictureUri={user?.profilePicture}
                  width={60}
                  height={60}
                  borderRadius={30}
                  isUser={true}
                />
              </TouchableOpacity>

              <SearchPeople home />
              {/* <View
                style={{
                  backgroundColor: '#ECF2F6',
                  flex: 1,
                  borderRadius: 40,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  paddingHorizontal: 10,
                }}>
                <Icon name="search" size={20} color="#585C60" />
                <TextInput style={{flex: 1, paddingStart: 8}} />
              </View> */}
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(true); // Open modal
                }}>
                <Feather name="edit" size={30} color="#A274FF" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('Notifications')}
                style={styles.iconButtons}>
                <View style={{borderWidth: 1}}>
                  <Icon
                    name="notifications-outline"
                    size={24}
                    color="#4B164C"
                  />
                </View>
                <View
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    width: 9,
                    height: 9,
                    borderRadius: 4,
                    padding: 1,
                    backgroundColor: 'white',
                  }}>
                  <View
                    style={{
                      backgroundColor: '#A274FF',
                      width: 7,
                      height: 7,
                      borderRadius: 3.5,
                    }}
                  />
                </View>
              </TouchableOpacity>
            </View>
            {/* <View
              style={{height: 100, paddingVertical: 10, flexDirection: 'row'}}>
              <TouchableOpacity
                onPress={() => {
                  console.log('Opening modal for user story'); // Debugging log
                  setModalVisible(true); // Open modal
                }}>
                <View
                  style={{
                    alignItems: 'center',
                    marginHorizontal: 10,
                    position: 'relative',
                  }}>
                  <ProfilePicture
                    profilePictureUri={user?.profilePicture}
                    width={50}
                    height={50}
                    borderRadius={25}
                    marginRight={10}
                    isUser={true}
                    story
                  />

                  <Text style={{fontSize: 12, marginTop: 5}}>My Post</Text>
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 18,
                      right: 7,
                      backgroundColor: 'white',
                      height: 20,
                      width: 20,
                      borderRadius: 10,
                      padding: 1,
                    }}>
                    <Image
                      style={{height: '100%', width: '100%'}}
                      source={require('../assets/icons/add.png')}
                    />
                  </View>
                </View>
              </TouchableOpacity>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={stories}
                keyExtractor={item => item.id}
                renderItem={renderStory}
              />
            </View> */}

            {/* <View>
              <TouchableOpacity
                style={{
                  backgroundColor: '#A274FF',
                  padding: 10,
                  borderRadius: 10,
                  alignItems: 'center',
                }}
                onPress={handleLogout}>
                <Text style={{color: '#fff', fontWeight: 'bold'}}>Logout</Text>
              </TouchableOpacity>
            </View> */}

            {/* Toggle between Feed and Profile */}
            {/* <View
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
            </View> */}

            {!isFeedView && (
              <View>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Profile')}
                  style={{
                    backgroundColor: '#A274FF',
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
            <ConnectionRequests isFeedView={isFeedView} userId={user?._id} />
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
      {/* Sidebar */}
      {isSidebarVisible && (
        <SideNavigationScreen setIsSidebarVisible={setIsSidebarVisible} />
      )}
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
            <Text
              style={{
                fontSize: 22,
                fontWeight: 'bold',
                marginBottom: 15,
                color: 'black',
              }}>
              {isEditMode ? 'Edit Post' : 'Create New Post'}
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
                color: 'black',
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
                  backgroundColor: '#A274FF',
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 20,
                }}>
                <Text style={{color: '#fff'}}>Add Image</Text>
              </TouchableOpacity>
              {/* <TouchableOpacity
                onPress={() => pickMedia('video')}
                style={{
                  backgroundColor: '#A274FF',
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 20,
                }}>
                <Text style={{color: '#fff'}}>Add Video</Text>
              </TouchableOpacity> */}
            </View>
            {selectedMedia && (
              <View style={{marginTop: 15}}>
                {(selectedMedia?.uri || selectedMedia?.mediaUrl) &&
                (selectedMedia?.type?.startsWith('image') ||
                  selectedMedia?.mediaType === 'image') ? (
                  <Image
                    source={{
                      uri: selectedMedia?.uri || selectedMedia?.mediaUrl, // Ensure uri is a string
                    }}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 10,
                      marginTop: 10,
                    }}
                  />
                ) : (
                  <Text style={{marginTop: 10}}>
                    Video selected:{' '}
                    {selectedMedia?.uri || selectedMedia?.mediaUrl}
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
                  backgroundColor: '#A274FF',
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 20,
                }}>
                <Text style={{color: '#fff'}}>Post</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (isEditMode) setIsEditMode(false);
                  setModalVisible(false);
                  setNewPostContent('');
                  setSelectedMedia(null);
                  setOpenActionPostId(null);
                }}
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
    marginTop: 25,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 5,
  },
  actionIcon: {
    width: 22,
    height: 22,
    objectFit: 'cover',
  },
  actionText: {
    color: '#7B7B7B',
  },
  iconButtons: {
    position: 'relative',
    padding: 5,
    height: 50,
    width: 50,
    borderRadius: 25,
    borderColor: '#EEEEEE',
    borderWidth: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0', // Light grey divider
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  commentInput: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  addCommentButton: {
    marginLeft: 10,
    backgroundColor: '#A274FF',
    padding: 15,
    borderRadius: 8,
  },
  addCommentText: {
    color: '#fff',
  },
  commentUserName: {
    fontWeight: 'bold',
    color: '#333', // Darker text color for better readability
    fontSize: 14,
    marginBottom: 2, // Spacing between username and content
  },
  commentContent: {
    color: '#555', // Slightly lighter text for the content
    fontSize: 13,
    lineHeight: 18, // Better readability with line spacing
  },
  noCommentsText: {
    textAlign: 'center',
    color: '#999', // Grey text for "no comments" message
    fontSize: 14,
    paddingVertical: 10,
  },
  profilePicture: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10, // Space between image and text
  },
  dropdownMenu: {
    position: 'absolute',
    top: 25, // Adjust position relative to the action icon
    right: 0,
    width: 100,
    backgroundColor: '#FFF',
    borderRadius: 8,
    elevation: 5, // Adds shadow for Android
    shadowColor: '#000', // Adds shadow for iOS
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 5,
    zIndex: 2, // Ensures the dropdown is on top of other elements
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  modalActionOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Semi-transparent overlay for full-screen modals
  },
  modalActionContent: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
  },
});

export default HomeScreen;
