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
  BackHandler,
  Platform,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {
  fetchFriendRequests,
  fetchUserData,
  logout,
} from '../store/slices/authSlice';
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
import Loader from '../components/Loader';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {connectSocket, disconnectSocket} from '../socket';
import socket from '../socket';
import ConnectionRequests from '../components/ConnectionRequests';
import ProfilePicture from '../components/ProfilePicture';
import Icon from 'react-native-vector-icons/Ionicons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import AntDesign from 'react-native-vector-icons/AntDesign';
import SimpleIcon from 'react-native-vector-icons/SimpleLineIcons';
import {axiosInstance} from '../api/axios';
import SideNavigationScreen from '../components/SideNavigationScreen';
import SearchPeople from '../components/SearchPeople';
import Video from 'react-native-video';
import SelectModal from '../components/SelectModal';

const {width, height} = Dimensions.get('window');
const tagList = ['Networking', 'Business', 'Technology', 'Marketing'];

const HomeScreen = ({navigation}) => {
  const [isFeedView, setIsFeedView] = useState(true); // Toggle between Feed and Profile
  const {user} = useSelector(state => state.auth);
  const {posts, loading} = useSelector(state => state.posts);
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
  const [isTagsModalVisible, setIsTagsModalVisible] = useState(false);
  const [tags, setTags] = useState([]);

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
    dispatch(fetchUserData(user?._id));
  }, [user?._id]);

  useEffect(() => {
    const backAction = () => {
      if (navigation.isFocused() && !navigation.canGoBack()) {
        // If this is the first screen, show exit alert
        Alert.alert('Exit App', 'Are you sure you want to exit?', [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Exit', onPress: () => BackHandler.exitApp()},
        ]);
        return true; // Prevents default back action
      }
      return false; // Allows normal back navigation
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove(); // Cleanup on unmount
  }, [navigation]);

  // Fetch initial posts on component mount
  useEffect(() => {
    loadMorePosts(); // Fetch the first page
  }, []);

  // console.log(posts);

  const loadMorePosts = async () => {
    console.log('onEndReached triggered, page:', page);
    try {
      setIsLoading(true);
      console.log('called');
      if (!isFetching) {
        setIsFetching(true);
        await dispatch(fetchPosts({page, userId: user?._id})).then(action => {
          if (fetchPosts.fulfilled.match(action)) {
            setPage(prevPage => prevPage + 1);
            setIsFetching(false);
            setIsLoading(false);
            setRefreshing(false);
          }
        });
      }
    } catch (error) {
      console.log(error);
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

    // fetchStories();
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

  const handleAddPost = async () => {
    if (newPostContent.trim()) {
      const formData = new FormData();

      // Add post content (text) to form data
      formData.append('user', user?._id); // User ID
      formData.append('content', newPostContent); // Post content
      formData.append('tags', tags); // Post content

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
      style={{
        marginBottom: 15,
        marginHorizontal: 7,
        padding: 15,
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
              color: '#19295C',
              fontFamily: 'Inter_24pt-Bold',
              fontSize: 15,
            }}>
            {item.user.name}
          </Text>
        </View>
        {user?._id === item.user._id && (
          <View style={{position: 'relative', zIndex: 100}}>
            <TouchableOpacity
              style={styles.iconButtons}
              onPress={() => {
                toggleActionSection(item._id);
                setActionModalVisible(!actionModalVisible);
              }}>
              <SimpleIcon name="options" size={20} color="#99A1BE" />
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
          color: '#2D3F7B',
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
      {/* Like, comment and share counts */}
      <View style={{flexDirection: 'row', marginTop: 20, gap: 5}}>
        {item?.comments?.length > 0 && (
          <TouchableOpacity onPress={() => toggleCommentSection(item._id)}>
            <Text className="ml-2" style={[styles.actionText]}>
              {openCommentPostId === item?._id
                ? 'Hide Comments'
                : 'View Comments'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Post Actions: Likes, Comments, Views, and Share */}
      <View style={styles.postActions}>
        <TouchableOpacity
          onPress={() =>
            dispatch(likePost({userId: user?._id, postId: item._id}))
          }
          style={[
            styles.iconButtons,
            {
              backgroundColor: item?.likes?.includes(user?._id)
                ? '#A274FF'
                : '#C3E4FF47',
            },
          ]}>
          <AntDesign
            name="like1"
            size={20}
            color={item?.likes?.includes(user?._id) ? 'white' : '#A274FF'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => toggleCommentSection(item._id)}
          style={[styles.iconButtons, {backgroundColor: '#C3E4FF47'}]}>
          <Icon name="chatbubble-ellipses" size={20} color="#A274FF" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => sharePost(item)}
          style={[styles.iconButtons, {backgroundColor: '#C3E4FF47'}]}>
          <Fontisto name="share-a" size={20} color="#A274FF" />
        </TouchableOpacity>
      </View>
      {/* Comment Section */}
      {openCommentPostId === item._id && (
        <View style={styles.commentSection}>
          {/* <Text
            style={{
              fontWeight: 'bold',
              color: 'black',
              margin: 6,
              marginVertical: 20,
            }}>
            Comments
          </Text> */}
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
              placeholderTextColor={'gray'}
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

  if (loading) return <Loader isLoading={loading} />;

  return (
    <View
      style={{
        flex: 1,

        // paddingBottom: 80,
        backgroundColor: '#F1F4F5',
      }}>
      <StatusBar backgroundColor="white" barStyle="dark-content" />

      <FlatList
        ref={flatListRef}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        data={isFeedView ? posts : userPosts}
        keyExtractor={item => item._id}
        renderItem={renderPost}
        contentContainerStyle={{paddingBottom: 80}}
        ListEmptyComponent={
          <Text style={{color: 'gray', marginTop: 30, textAlign: 'center'}}>
            No Posts yet
          </Text>
        }
        // onEndReached={loadMorePosts}
        onEndReachedThreshold={0.2}
        ListFooterComponent={
          isFetching ? <ActivityIndicator size="large" /> : null
        }
        ListHeaderComponent={
          <View
            style={{
              backgroundColor: 'white',
              paddingHorizontal: 7,
              borderBottomLeftRadius: 30,
              borderBottomRightRadius: 30,
              marginBottom: 10,
              paddingTop: Platform.OS === 'ios' ? 15 : 15,
            }}>
            {/* Top Section */}
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
              <TouchableOpacity onPress={openSidebar}>
                <ProfilePicture
                  profilePictureUri={user?.profilePicture}
                  width={60}
                  height={60}
                  borderRadius={30}
                  isUser={true}
                />
              </TouchableOpacity>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}>
                <SearchPeople />
                <TouchableOpacity
                  onPress={() => navigation.navigate('Notifications')}
                  style={styles.iconButtons}>
                  <Image
                    style={{height: 23, width: 23, aspectRatio: 1}}
                    source={require('../assets/icons/bell-solid.png')}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                {/* <View
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
                  </View> */}
              </View>
            </View>

            {/* Create Post Section */}

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setModalVisible(true)}
              style={{
                paddingVertical: 20,
                alignItems: 'center',
                borderTopWidth: 1,
                borderColor: '#F1F4F5',
                marginHorizontal: 10,
              }}>
              <TextInput
                onPress={() => setModalVisible(true)}
                placeholder={`What's on your mind, ${
                  user?.name?.split(' ')[0]
                }?`}
                multiline
                editable={false}
                placeholderTextColor={'gray'}
                style={{
                  // height: 0,
                  paddingVertical: 10,
                  borderRadius: 10,
                  marginBottom: 15,
                  width: '100%',
                  textAlignVertical: 'top',
                  color: 'black',
                  fontSize: 18,
                }}
              />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  width: '100%',
                  gap: 10,
                }}>
                <TouchableOpacity
                  onPress={() => setModalVisible(true)}
                  style={{
                    backgroundColor: '#F1F4F5',
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 15,
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                  }}>
                  <Image
                    style={{height: 15, width: 15}}
                    source={require('../assets/icons/camera.png')}
                    resizeMode="contain"
                  />
                  <Text style={{color: '#535767', fontSize: 13}}>Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setModalVisible(true)}
                  style={{
                    backgroundColor: '#F1F4F5',
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 15,
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                  }}>
                  {/* <Image
                    style={{height: 15, width: 15}}
                    source={require('../assets/icons/camcorder.png')}
                    resizeMode="contain"
                  /> */}
                  {/* <Icon name="attach" size={20} color="#F31954" /> */}
                  <Image
                    style={{height: 15, width: 15}}
                    source={require('../assets/icons/camcorder.png')}
                    resizeMode="contain"
                  />
                  <Text style={{color: '#535767', fontSize: 13}}>Video</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setModalVisible(true)}
                  style={{
                    backgroundColor: '#F1F4F5',
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 15,
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                  }}>
                  <Image
                    style={{height: 15, width: 15}}
                    source={require('../assets/icons/eye.png')}
                    resizeMode="contain"
                  />
                  <Text style={{color: '#535767', fontSize: 13}}>Tags</Text>
                </TouchableOpacity>
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
                    <Video
                      source={{
                        uri: selectedMedia?.uri || selectedMedia?.mediaUrl,
                      }}
                      style={{
                        width: 100,
                        height: 100,
                        borderRadius: 10,
                        marginTop: 10,
                      }}
                      controls={true} // Enables play, pause, seek controls
                      resizeMode="contain"
                      paused
                    />
                  )}
                </View>
              )}
              <SelectModal
                visible={isTagsModalVisible}
                items={tagList}
                selectedItems={tags}
                onClose={() => setIsTagsModalVisible(false)}
                onSelect={item => setTags(item)}
              />
            </TouchableOpacity>

            {!isFeedView && (
              <View style={{paddingHorizontal: 10}}>
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
            {/* <ConnectionRequests isFeedView={isFeedView} userId={user?._id} /> */}
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
            paddingHorizontal: 10,
            alignItems: 'center',
            borderColor: '#F1F4F5',
            backgroundColor: 'white',
            flex: 1,
            paddingVertical: Platform.OS === 'ios' ? 50 : 0,
          }}>
          <View
            style={{
              marginTop: 20,
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: '100%',
            }}>
            <TouchableOpacity
              onPress={() => {
                if (isEditMode) setIsEditMode(false);
                setModalVisible(false);
                setNewPostContent('');
                setSelectedMedia(null);
                setOpenActionPostId(null);
              }}>
              <AntDesign name="close" size={30} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleAddPost}>
              <Text style={{color: '#19295C', fontSize: 18, fontWeight: '500'}}>
                Create Post
              </Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'flex-start',
              gap: 10,
              paddingTop: 10,
              marginTop: 10,
              borderTopWidth: 1,
              borderColor: '#F1F4F5',
            }}>
            {/* <TouchableOpacity
              style={{
                backgroundColor: '#D0E8FF',
                padding: 10,
                paddingHorizontal: 14,
                borderRadius: 30,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 2,
              }}>
              <Icon name="earth-sharp" size={7} color="#1F1F1F" />
              <Text style={{color: '#1F1F1F', fontSize: 12}}>Anyone</Text>
              <Icon name="caret-down-outline" size={10} color="#1F1F1F" />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: '#D0E8FF',
                padding: 10,
                paddingHorizontal: 14,
                borderRadius: 30,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 2,
              }}>
              <Text style={{color: '#1F1F1F', fontSize: 12}}>Schedule</Text>
            </TouchableOpacity> */}
          </View>
          <TextInput
            placeholder={``}
            maxLength={500}
            multiline
            value={newPostContent}
            placeholderTextColor={'gray'}
            onChangeText={text => setNewPostContent(text)}
            style={{
              height: 200,
              paddingVertical: 10,
              borderRadius: 10,
              marginBottom: 15,
              width: '100%',
              textAlignVertical: 'top',
              color: 'black',
              fontSize: 18,
            }}
          />
          <View
            style={{
              position: 'absolute',
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: '100%',
              gap: 10,
              bottom: 20,
            }}>
            <TouchableOpacity
              onPress={() => pickMedia('image')}
              style={{
                backgroundColor: '#F1F4F5',
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 15,
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}>
              <Image
                style={{height: 15, width: 15}}
                source={require('../assets/icons/camera.png')}
                resizeMode="contain"
              />
              <Text style={{color: '#535767', fontSize: 13}}>Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => pickMedia('video')}
              style={{
                backgroundColor: '#F1F4F5',
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 15,
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}>
              <Image
                style={{height: 15, width: 15}}
                source={require('../assets/icons/camcorder.png')}
                resizeMode="contain"
              />
              <Text style={{color: '#535767', fontSize: 13}}>Video</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsTagsModalVisible(true)}
              style={{
                backgroundColor: '#F1F4F5',
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 15,
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}>
              <Image
                style={{height: 15, width: 15}}
                source={require('../assets/icons/eye.png')}
                resizeMode="contain"
              />
              <Text style={{color: '#535767', fontSize: 13}}>Tags</Text>
            </TouchableOpacity>
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
                <Video
                  source={{
                    uri: selectedMedia?.uri || selectedMedia?.mediaUrl,
                  }}
                  style={{
                    width: 200,
                    height: 200,
                    borderRadius: 10,
                    marginTop: 10,
                  }}
                  controls={true} // Enables play, pause, seek controls
                  resizeMode="contain"
                  paused // Auto-play video
                />
              )}
            </View>
          )}
          <Text style={{color: 'gray'}}>
            {tags?.length ? `#${tags?.join(' #')}` : ''}
          </Text>
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
    justifyContent: 'center',
    marginTop: 25,
    gap: 25,
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
    padding: 2,
    height: 50,
    width: 50,
    borderRadius: 25,
    backgroundColor: '#F1F4F5',
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
    color: 'black',
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
