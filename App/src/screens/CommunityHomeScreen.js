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
  ImageBackground,
  Animated,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import * as Progress from 'react-native-progress';
import {launchImageLibrary} from 'react-native-image-picker'; // Use react-native-image-picker
import Loader from '../components/Loader';
import ProfilePicture from '../components/ProfilePicture';
import {axiosInstance, axiosInstanceForm} from '../api/axios';
import {
  setPosts,
  likePost,
  deletePost,
  editPost,
  addNewPost,
  incrementShare,
  commentOnPost,
  requestToJoinCommunity,
} from '../store/slices/commPostSlice';
import {useNavigation} from '@react-navigation/native';
import ChatBotButton from '../components/ChatBotButton';
import LinearGradientR from 'react-native-linear-gradient';
import Octicons from 'react-native-vector-icons/Octicons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import EventCard from '../components/EventCard';
import RenderUserCard from '../components/RenderUserCard';
import Icon from 'react-native-vector-icons/Ionicons';
import SimpleIcon from 'react-native-vector-icons/SimpleLineIcons';
import {ScrollView} from 'react-native-gesture-handler';
import SineWaveArrow from '../components/SineWaveArrow';
import Svg, {Circle, Defs, Stop, LinearGradient} from 'react-native-svg';
import SelectModal from '../components/SelectModal';

const tagList = ['Networking', 'Business', 'Technology', 'Marketing'];

const CommunityHomeScreen = ({route}) => {
  const {communityId} = route.params;
  const whyConnect = route.params?.whyConnect || null;
  const [isFeedView, setIsFeedView] = useState(true);
  const [community, setCommunity] = useState({});
  const [events, setEvents] = useState([]);
  const {user} = useSelector(state => state.auth);
  const {posts} = useSelector(state => state.commposts);
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
  const [members, setMembers] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [isCommentSectionOpen, setIsCommentSectionOpen] = useState(false);
  const [isChatBotVisible, setIsChatBotVisible] = useState(false);
  const [openCommentPostId, setOpenCommentPostId] = useState(null);
  const [openActionPostId, setOpenActionPostId] = useState(null);
  const [currentComment, setCurrentComment] = useState('');
  const totalPages = useSelector(state => state.posts.totalPages);
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('Info');
  const arrowPosition = useRef(new Animated.Value(0)).current;
  const [isTagsModalVisible, setIsTagsModalVisible] = useState(false);
  const [tags, setTags] = useState([]);
  const [imageSource, setImageSource] = useState(
    community?.profilePicture
      ? {uri: community.profilePicture}
      : require('../assets/default-cp.png'),
  );

  const [showBackButton, setShowBackButton] = useState(true);

  const buttonLayouts = useRef({}); // To store layout data for each button

  const radius = 80; // Radius of the circle
  const strokeWidth = 20; // Stroke width
  const circumference = Math.PI * radius; // Circumference of the semi-circle
  const progress = 50;

  const [score, setScore] = useState(0);
  const [socialScore, setSocialScore] = useState(0);

  useEffect(() => {
    if (community?.profilePicture) {
      setImageSource({uri: community.profilePicture});
    } else {
      setImageSource(require('../assets/default-cp.png'));
    }
  }, [community?.profilePicture]);

  const moveArrow = xPosition => {
    Animated.spring(arrowPosition, {
      toValue: xPosition,
      useNativeDriver: false,
    }).start();
  };

  const handleTabPress = tab => {
    const layout = buttonLayouts.current[tab];
    if (layout) {
      moveArrow(layout.x + layout.width / 2 - 50); // Move arrow to the center of the button
      setActiveTab(tab);
    }
  };

  const saveLayout = (tab, event) => {
    const layout = event.nativeEvent.layout;
    buttonLayouts.current[tab] = layout;
    // Set arrow position for the initial active tab
    if (tab === activeTab) {
      moveArrow(layout.x + layout.width / 2 - 50);
    }
  };

  const handleScroll = event => {
    const offsetY = event.nativeEvent.contentOffset.y;
    // Hide the back button when scrolling up (offset > 0)
    setShowBackButton(offsetY <= 200);
  };

  const flatListRef = useRef(null);

  // Fetch initial posts on component mount
  useEffect(() => {
    loadMorePosts(); // Fetch the first page
  }, [communityId]);

  // console.log(posts);

  const loadMorePosts = async () => {
    try {
      if (communityId) {
        const res = await axiosInstance.get(
          `/api/communities/${communityId}/${user?._id}`,
        );
        if (res.status === 200) {
          console.log(res.data.data);
          setCommunity(res?.data?.data || []); // Adjust based on backend response
          dispatch(setPosts(res?.data?.posts || []));
          setMembers(res?.data?.data?.members);
          setEvents(res?.data?.events || []);
          setSocialScore(res?.data?.socialAvgScore);
          setScore(res?.data?.similarityScore);
        }
      }
    } catch (error) {
      console.error('Error fetching communities:', error.message);
    } finally {
      setIsFetching(false);
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Filter posts to get only the user's posts
    if (community && posts) {
      setIsFetching(true);
      const filteredPosts = posts.filter(post => post.user?._id === user?._id);
      setUserPosts(filteredPosts);
      setIsFetching(false);
    }
  }, [posts, user]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setIsLoading(true);
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
      const postUrl = `https://prokutumb.com/posts/${post._id}`;
      const result = await Share.share({
        subject: 'Check out this post!',
        message: `Check out this post on Majlis: ${postUrl}`,
        url: postUrl,
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

  // const sharePost = async post => {
  //   try {
  //     const result = await Share.share({
  //       message: `Check out this post: ${post.content}`,
  //     });

  //     if (result.action === Share.sharedAction) {
  //       if (result.activityType) {
  //         console.log('Post shared with activity:', result.activityType);
  //       } else {
  //         console.log('Post shared!');
  //         // Increment the share count
  //         await dispatch(incrementShare(post._id));
  //       }
  //     } else if (result.action === Share.dismissedAction) {
  //       console.log('Share dismissed');
  //     }
  //   } catch (error) {
  //     console.error('Error sharing post:', error);
  //   }
  // };

  const handleAddPost = async () => {
    try {
      // Validate post content
      if (!newPostContent.trim() && !selectedMedia) {
        alert('Please enter post content or upload media.');
        return;
      }
      setIsFetching(true);
      const formData = new FormData();

      // Add post content (text) and related IDs to form data
      formData.append('userId', user?._id); // User ID
      formData.append('communityId', communityId); // Community ID
      formData.append('content', newPostContent.trim()); // Post content
      formData.append('tags', tags); // Post content

      // Add media if selected
      if (selectedMedia && selectedMedia.uri) {
        formData.append('media', {
          uri: selectedMedia.uri, // URI of the media file
          type: selectedMedia.type, // MIME type (e.g., image/jpeg, video/mp4)
          name: `media.${selectedMedia.type.split('/')[1]}`, // File name with extension
        });
      }

      if (isEditMode) {
        await dispatch(editPost({formData, postId: openActionPostId}));
        setIsEditMode(false);
      } else {
        // Dispatch the action to add new post with FormData
        await dispatch(addNewPost(formData)); // Assuming addNewPost handles FormData
      }
    } catch (error) {
      console.error('Error creating post:', error.message);
      alert('An error occurred while creating the post. Please try again.');
    } finally {
      setIsLoading(false);
      // Reset modal and inputs
      setModalVisible(false);
      setNewPostContent('');
      setSelectedMedia(null);
      setOpenActionPostId(null);
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

  const renderPost = item => (
    <View
      key={item._id}
      className="border border-gray-200"
      style={{
        margin: 10,
        padding: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 25,
      }}>
      {/* User info (Profile Picture and Name) */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
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
            style={{fontWeight: 'bold', color: '#19295C'}}>
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
              </View>
            )}
          </View>
        )}
      </View>

      {/* Post Content */}
      <Text style={{marginTop: 10, color: '#2D3F7B'}}>{item.content}</Text>

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

      {/* Like, comment and share counts */}
      <View style={{flexDirection: 'row', marginTop: 20, gap: 5}}>
        <Text style={styles.actionText}>{item.likes.length} Likes .</Text>
        <Text style={styles.actionText}>{item.comments.length} Comments .</Text>
        <Text style={styles.actionText}>{item.shares} Shares</Text>
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
          <View
            style={{
              margin: 6,
              marginVertical: 20,
              borderTopWidth: 1,
              borderColor: '#F1F4F5',
            }}
          />

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
              placeholderTextColor={'gray'}
              style={styles.commentInput}
              placeholder="Add a comment..."
              value={currentComment}
              onChangeText={setCurrentComment}
            />
            <TouchableOpacity
              style={styles.addCommentButton}
              onPress={() => handleAddComment(item)}>
              <Icon name="send" size={20} color="white" />
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

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'white',
        position: 'relative',
      }}>
      <StatusBar hidden />
      <Loader isLoading={isLoading} />

      {isChatBotVisible && (
        <ChatBotButton setIsChatBotVisible={setIsChatBotVisible} />
      )}
      {showBackButton && (
        <View
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 10,
            position: 'absolute',
            zIndex: 1,
          }}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.goBack()}>
            <Octicons name="chevron-left" size={25} color="white" />
          </TouchableOpacity>
        </View>
      )}
      <ImageBackground
        source={imageSource}
        defaultSource={require('../assets/default-cp.png')}
        style={styles.communityProfilePicture}
        imageStyle={styles.profilePictureImage}
        onError={() =>
          setImageSource(require('../assets/default-cp.png'))
        }></ImageBackground>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={{paddingBottom: 200}}>
        <View style={styles.overlayContent}>
          <LinearGradientR
            // className="bg-[#c4c4c421]"
            colors={['#c4c4c400', '#c4c4c400', 'black']}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            style={styles.overlay}
          />
          <Text style={styles.communityName}>
            {community?.name?.toUpperCase() || ''}
          </Text>
          <Text style={{color: 'white', paddingStart: 10}}>
            @{community?.createdBy?.name}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 16,
              paddingStart: 10,
            }}>
            {!community.members?.includes(user?._id) &&
              community.createdBy?._id !== user?._id && (
                <TouchableOpacity
                  disabled={community?.joinRequests?.some(
                    req => req._id == user?._id,
                  )}
                  onPress={() => {
                    dispatch(
                      requestToJoinCommunity({
                        userId: user?._id,
                        communityId,
                      }),
                    ).then(action => {
                      console.log('Request sent', action.payload);
                      if (requestToJoinCommunity.fulfilled.match(action)) {
                        console.log('Request sent', action.payload);
                        setCommunity(action.payload?.data);
                      }
                    });
                  }}
                  style={{
                    backgroundColor: '#A274FF',
                    padding: 7,
                    width: 120,
                    borderRadius: 7,
                    marginTop: 10,
                    // flex: 1,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      fontWeight: '500',
                      textAlign: 'center',
                    }}>
                    {community?.joinRequests?.some(req => req._id == user?._id)
                      ? 'Requested'
                      : '+Join'}
                  </Text>
                </TouchableOpacity>
              )}
            {community.members?.includes(user?._id) ||
              (community.createdBy?._id === user?._id && (
                <TouchableOpacity
                  disabled={community?.joinRequests?.some(
                    req => req._id == user?._id,
                  )}
                  onPress={() => setModalVisible(true)}
                  style={{
                    backgroundColor: '#A274FF',
                    padding: 7,
                    width: 120,
                    borderRadius: 7,
                    marginTop: 10,
                    // flex: 1,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      fontWeight: '500',
                      textAlign: 'center',
                    }}>
                    Add Post
                  </Text>
                </TouchableOpacity>
              ))}
            <View style={{width: 40}}></View>

            <View>
              <Text style={{color: 'white'}}>
                {community?.members?.length + 1}
              </Text>
              <Text style={{color: 'white'}}>Members</Text>
            </View>
            <View>
              <Text style={{color: 'white'}}>{events?.length || 0}</Text>
              <Text style={{color: 'white'}}> Events</Text>
            </View>
            <View style={{width: 40}}></View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              gap: 20,
              alignItems: 'center',
              justifyContent: 'space-evenly',
              marginTop: 20,
              padding: 10,
            }}>
            <TouchableOpacity
              onPress={() => handleTabPress('Info')}
              onLayout={event => saveLayout('Info', event)}
              style={{
                backgroundColor: activeTab === 'Info' ? '#A274FF' : '#A274FF66',
                paddingVertical: 7,
                paddingHorizontal: 20,
                borderRadius: 7,
                flex: 1,
              }}>
              <Text
                style={{
                  fontSize: 13,
                  color: 'white',
                  textAlign: 'center',
                }}>
                Info
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleTabPress('Feed')}
              onLayout={event => saveLayout('Feed', event)}
              style={{
                backgroundColor: activeTab === 'Feed' ? '#A274FF' : '#A274FF66',
                paddingVertical: 7,
                paddingHorizontal: 20,
                borderRadius: 7,
                flex: 1,
              }}>
              <Text
                style={{
                  fontSize: 13,
                  color: 'white',
                  textAlign: 'center',
                }}>
                Feed
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleTabPress('MajlisAI')}
              onLayout={event => saveLayout('MajlisAI', event)}
              style={{
                backgroundColor:
                  activeTab === 'MajlisAI' ? '#A274FF' : '#A274FF66',
                paddingVertical: 7,
                paddingHorizontal: 20,
                borderRadius: 7,
                flex: 1,
              }}>
              <Text
                style={{
                  color: 'white',
                  fontSize: 13,
                  textAlign: 'center',
                }}>
                MajlisAI
              </Text>
            </TouchableOpacity>
            {/* Animated Arrow */}
            {/* <Animated.View
              style={[styles.arrow, {transform: [{translateX: arrowPosition}]}]}
            /> */}
            <SineWaveArrow arrowPosition={arrowPosition} />
          </View>
        </View>

        <View style={{backgroundColor: 'black', paddingTop: 30, zIndex: 10}}>
          {activeTab === 'Info' && (
            <View
              style={{
                backgroundColor: '#A274FF',
                borderTopRightRadius: 25,
                borderTopLeftRadius: 25,
                minHeight: 500,
                paddingHorizontal: 20,
              }}>
              <Text style={[styles.title, {marginTop: 10}]}>About:</Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  marginTop: 10,
                }}>
                <Icon name="briefcase" size={20} color="white" />
                <Text style={{color: 'white'}}>{community?.description}</Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  marginTop: 10,
                }}>
                <FontAwesome name="group" size={20} color="white" />
                <Text style={{color: 'white'}}>{community?.communityType}</Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  marginTop: 10,
                }}>
                <Icon name="location" size={20} color="white" />
                <Text style={{color: 'white'}}>{community?.location}</Text>
              </View>
            </View>
          )}
          {activeTab === 'Feed' && (
            <View
              style={{
                backgroundColor: '#A274FF',
                borderTopRightRadius: 25,
                borderTopLeftRadius: 25,
                minHeight: 500,
              }}>
              {posts?.length ? (
                posts?.map(item => renderPost(item))
              ) : (
                <Text
                  style={{color: 'white', marginTop: 50, textAlign: 'center'}}>
                  No Posts yet
                </Text>
              )}
            </View>
          )}
          {/* Events and members section */}
          {activeTab === 'MajlisAI' && (
            <View
              style={{
                backgroundColor: '#A274FF',
                borderTopRightRadius: 25,
                borderTopLeftRadius: 25,
                minHeight: 500,
                padding: 15,
              }}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('Network', {
                    queryType: 'community',
                    id: communityId,
                  })
                }>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    marginTop: 50,
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'white',
                      height: 80,
                      flex: 1,
                      borderRadius: 20,
                      shadowColor: 'white',
                      shadowOffset: {width: 1, height: 1},
                      shadowOpacity: 0.9,
                      shadowRadius: 10,
                      elevation: 10,
                    }}>
                    <Svg height="40" width="70" viewBox="0 0 200 5">
                      <Defs>
                        <LinearGradient
                          id="grad"
                          x1="100%"
                          y1="0%"
                          x2="0%"
                          y2="0%">
                          <Stop offset="0%" stopColor="red" />
                          <Stop offset="50%" stopColor="yellow" />
                          <Stop offset="100%" stopColor="green" />
                        </LinearGradient>
                      </Defs>
                      <Circle
                        cx="100"
                        cy="160"
                        r={radius}
                        fill="none"
                        stroke="lightgray"
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={0} // Fully visible
                        strokeLinecap="round"
                        transform="rotate(-180, 100, 100)" // Start at top-center
                      />

                      {/* Progress Circle */}
                      <Circle
                        cx="100"
                        cy="160"
                        r={radius}
                        fill="none"
                        stroke="url(#grad)"
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={
                          (1 - Math.max(0, Math.min(score, 100)) / 100) *
                          circumference
                        }
                        strokeLinecap="round"
                        transform="rotate(-180, 100, 100)"
                      />
                    </Svg>
                    <View style={{marginLeft: 10}}>
                      <Text style={styles.percentageText}>{`${score}%`}</Text>
                      <Text
                        style={{
                          fontSize: 18,
                          color: 'gray',
                        }}>
                        Relevancy
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'white',
                      height: 80,
                      flex: 1,
                      borderRadius: 20,
                      shadowColor: 'white',
                      shadowOffset: {width: 0, height: 0},
                      shadowOpacity: 0.9,
                      shadowRadius: 10,
                      elevation: 10,
                    }}>
                    <Feather name="check" size={30} color="#7FDD53" />
                    <View style={{marginLeft: 10}}>
                      <Text
                        style={styles.percentageText}>{`${socialScore}%`}</Text>
                      <Text
                        style={{
                          fontSize: 18,
                          color: 'gray',
                        }}>
                        Score
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
              {whyConnect && whyConnect !== 'nan' && (
                <View style={[styles.card, {width: '100%', marginTop: 30}]}>
                  <Text
                    style={[
                      styles.title,
                      {textAlign: 'center', color: '#A274FF', marginTop: 5},
                    ]}>
                    Why to connect?
                  </Text>

                  <View>
                    <Text
                      style={{
                        color: 'gray',
                        fontSize: 18,
                        textAlign: 'center',
                      }}>
                      {whyConnect}
                    </Text>
                  </View>
                </View>
              )}
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                }}>
                <Text style={styles.title}>Events by Community</Text>

                {/* {community.createdBy?._id === user?._id && (
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('CreateEvent', {
                        myCommunities: [community],
                        communityId,
                      })
                    }
                    style={{marginRight: 40}}>
                    <AntDesignIcons name="plus" size={25} color="#A274FF" />
                  </TouchableOpacity>
                )} */}
              </View>

              <FlatList
                data={events}
                horizontal
                keyExtractor={item => item._id}
                renderItem={item => (
                  <EventCard
                    event={item.item}
                    height={180}
                    width={130}
                    picHeight={80}
                    onPress={() =>
                      navigation.navigate('EventHome', {eventId: item.item._id})
                    }
                  />
                )}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={() => (
                  <View style={styles.noTrendingContainer}>
                    <Text style={{color: 'white', textAlign: 'left'}}>
                      No Events found
                    </Text>
                  </View>
                )}
              />
            </View>
          )}
        </View>
      </ScrollView>

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
                {isEditMode ? 'Save' : 'Create'} Post
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
            }}></View>
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
      <SelectModal
        visible={isTagsModalVisible}
        items={tagList}
        selectedItems={tags}
        onClose={() => setIsTagsModalVisible(false)}
        onSelect={item => setTags(item)}
      />
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'left',
    marginTop: 60,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    overflow: 'hidden',
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
    width: 40,
  },
  actionIcon: {
    width: 22,
    height: 22,
    objectFit: 'cover',
  },
  actionText: {
    color: '#7B7B7B',
  },
  listContent: {
    minHeight: '100%',
    paddingBottom: 20,
    backgroundColor: '#A274FF',
    marginTop: 10,
  },
  userCard: {
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    aspectRatio: 0.75,
  },
  cardWrapper: {
    flex: 1,
    margin: 8,
    maxWidth: '45%', // Ensure three columns fit evenly
    // backgroundColor: 'red',
  },
  profilePicture: {
    width: '100%',
    height: '100%',
  },
  communityProfilePicture: {
    position: 'absolute',
    width: '100%',
    height: '90%',
    // overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  profilePictureImage: {
    objectFit: 'cover',
  },
  overlay: {
    position: 'absolute',
    height: '100%',
    width: '100%',
  },
  overlayContent: {
    paddingBottom: 10,
    height: 550,
    flex: 1,
    // padding: 10,
    justifyContent: 'flex-end',
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
  headerBtn: {
    padding: 5,
    // backgroundColor: '#ffffff3e',
    height: 40,
    width: 40,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  communityHeader: {
    // alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  communityName: {
    textAlign: 'left',
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    paddingStart: 10,
  },
  communityDescription: {
    color: 'black',
    marginLeft: 20,
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
  arrow: {
    position: 'absolute',
    top: 50, // Adjust based on your layout
    width: 50,
    height: 25, // Reduce height to create a "wave" effect
    backgroundColor: '#A274FF',
    zIndex: 150,
    borderRadius: 25, // Fully round the top
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    transform: [{translateY: -15}], // Slight upward adjustment
  },

  commentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 10,
    // borderBottomWidth: 1,
    // borderBottomColor: '#F1F4F5', // Light grey divider
  },
  percentageText: {
    fontWeight: 'bold',

    color: 'black',
    fontSize: 20,
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
    borderRadius: 15,
    paddingStart: 20,
    color: 'black',
  },
  addCommentButton: {
    marginLeft: 10,
    backgroundColor: '#A274FF',
    padding: 15,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCommentText: {
    color: '#fff',
  },
  commentUserName: {
    fontWeight: 'bold',
    color: '#19295C', // Darker text color for better readability
    fontSize: 14,
    marginBottom: 2, // Spacing between username and content
  },
  commentContent: {
    color: '#99A1BE', // Slightly lighter text for the content
    fontSize: 13,
    lineHeight: 18, // Better readability with line spacing
  },
  noCommentsText: {
    textAlign: 'center',
    color: '#999', // Grey text for "no comments" message
    fontSize: 14,
    paddingVertical: 10,
  },
  // profilePicture: {
  //   width: 30,
  //   height: 30,
  //   borderRadius: 15,
  //   marginRight: 10, // Space between image and text
  // },
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
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 7,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    padding: 5,
    marginHorizontal: 5,
    backgroundColor: 'white',
  },
  friendImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  friendName: {
    fontSize: 14,
    fontWeight: '500',
    color: 'black',
  },
});

export default CommunityHomeScreen;
