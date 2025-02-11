import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  ImageBackground,
  FlatList,
  Share,
  TextInput,
  Animated,
  ToastAndroid,
} from 'react-native';
import LinearGradientR from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {axiosInstance} from '../api/axios';
import {useDispatch, useSelector} from 'react-redux';
import Loader from '../components/Loader';
import ProfilePicture from '../components/ProfilePicture';
import {
  commentOnPost,
  incrementShare,
  likePost,
  likePostUserScreen,
} from '../store/slices/postSlice';
import {removeFriendRequest} from '../store/slices/userSlice';
import Icons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import Octicons from 'react-native-vector-icons/Octicons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Icon from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import SimpleIcon from 'react-native-vector-icons/SimpleLineIcons';
import SineWaveArrow from '../components/SineWaveArrow';
import Svg, {Circle, Defs, LinearGradient, Stop} from 'react-native-svg';
import {acceptRequest, declineRequest} from '../store/slices/authSlice';
import Video from 'react-native-video';
import {populateProfile} from '../store/slices/profileSlice';

const UserProfile = ({route}) => {
  const {userId} = route.params;
  const currentUser = useSelector(state => state.auth?.user);
  const [user, setUser] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [openCommentPostId, setOpenCommentPostId] = useState(null);
  const [openActionPostId, setOpenActionPostId] = useState(null);
  const [currentComment, setCurrentComment] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('Connect');
  const navigation = useNavigation(); // Hook for navigation
  const dispatch = useDispatch();
  const [searchVisible, setSearchVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const [showBackButton, setShowBackButton] = useState(true);
  const [activeTab, setActiveTab] = useState('Info');
  const arrowPosition = useRef(new Animated.Value(0)).current;
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionPostModalVisible, setActionPostModalVisible] = useState(false);
  const [communityCount, setCommunityCount] = useState(0);
  const [score, setScore] = useState(0);
  const [socialScore, setSocialScore] = useState(0);

  // Hide the status bar when the screen is rendered
  useEffect(() => {
    StatusBar.setHidden(true);

    return () => {
      // Show the status bar when the screen is unmounted
      StatusBar.setHidden(false);
    };
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        ToastAndroid.show('User not found', ToastAndroid.SHORT);
        navigation.goBack();
        return;
      }
      try {
        setLoading(true);
        const res = await axiosInstance.get(
          `/api/user/fetchUser/${userId}/${currentUser?._id}`,
        );

        if (res.data.success) {
          console.log('Fetched user: ', res.data.user);
          setUser(res.data.user);

          setUserPosts(res.data.posts);
          setCommunityCount(res?.data?.communities?.total);
          setSocialScore(res?.data?.socialAvgScore);
          setScore(res?.data?.similarityScore);

          // Check if they are already connected
          if (res.data.isAlreadyConnected) {
            setConnectionStatus('Message');
          } else {
            const requestSent = res.data.user?.friendRequests?.some(
              request => request?.fromUser === currentUser?._id,
            );
            const requestReceived = currentUser.friendRequests?.some(
              request => request?.fromUser === userId,
            );

            if (requestSent) {
              setConnectionStatus('Pending');
            } else if (requestReceived) {
              setConnectionStatus('Accept/Decline');
            } else {
              setConnectionStatus('Connect');
            }
          }
        } else if (res.status === 400) {
          ToastAndroid.show('User not found', ToastAndroid.SHORT);
          navigation.goBack();
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  useEffect(() => {
    if (query) {
      // setSearchVisible(true);
      const delayDebounce = setTimeout(() => fetchSearchResults(query), 300);
      return () => clearTimeout(delayDebounce);
    } else {
      setSearchResults([]); // Clear results when query is empty
    }
  }, [query]);

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

  const toggleCommentSection = postId => {
    setOpenCommentPostId(prevPostId => (prevPostId === postId ? null : postId));
  };

  const toggleActionSection = postId => {
    setOpenActionPostId(prevPostId => (prevPostId === postId ? null : postId));
  };

  const handleAddComment = post => {
    if (currentComment.trim() !== '') {
      const postIndex = userPosts.findIndex(p => p._id === post._id);

      if (postIndex !== -1) {
        const updatedPosts = [...userPosts];
        const updatedPost = {...updatedPosts[postIndex]};

        // Prepare the new comment with user details (e.g., profile picture)
        const newComment = {
          content: currentComment,
          user: {
            // Wrap user details in a user object
            userId: currentUser?._id,
            name: currentUser?.name,
            profilePicture: currentUser?.profilePicture,
          },
          timestamp: new Date().toISOString(), // Optionally, add timestamp
        };

        updatedPost.comments = [...updatedPost.comments, newComment]; // Add the comment with profile picture

        updatedPosts[postIndex] = updatedPost;
        setUserPosts(updatedPosts); // Update local state instantly

        // Dispatch Redux action to update the global state
        dispatch(
          commentOnPost({
            postId: post._id,
            userId: currentUser?._id,
            content: currentComment,
          }),
        );
      }

      setCurrentComment(''); // Clear input after submission
    }
  };

  const buttonLayouts = useRef({}); // To store layout data for each button

  const radius = 80; // Radius of the circle
  const strokeWidth = 20; // Stroke width
  const circumference = Math.PI * radius; // Circumference of the semi-circle
  const progress = 50;

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

  const handleConnect = async () => {
    // setLoading(true)
    try {
      if (connectionStatus === 'Connect') {
        await axiosInstance.post('/api/user/send-connection-request', {
          senderId: currentUser?._id,
          receiverId: userId,
        });
        setConnectionStatus('Pending');
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
    }
  };

  const handleAccept = async () => {
    try {
      dispatch(acceptRequest({fromUserId: userId, toUserId: currentUser._id}));
      setConnectionStatus('Message');
    } catch (error) {
      console.log('Error accepting friend request:', error);
    }
  };

  const handleLike = post => {
    const postIndex = userPosts.findIndex(p => p._id === post._id);

    if (postIndex !== -1) {
      const updatedPosts = [...userPosts];
      const updatedPost = {...updatedPosts[postIndex]};

      // Toggle like logic
      if (updatedPost.likes.includes(currentUser?._id)) {
        updatedPost.likes = updatedPost.likes.filter(
          id => id !== currentUser?._id,
        );
      } else {
        updatedPost.likes.push(currentUser?._id);
      }

      updatedPosts[postIndex] = updatedPost;
      setUserPosts(updatedPosts); // Update local state

      // Dispatch Redux action to update global state
      dispatch(likePost({postId: post._id, userId: currentUser?._id}));
    }
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

  const handleDecline = async () => {
    try {
      dispatch(declineRequest({fromUserId: userId, toUserId: currentUser._id}));
      setConnectionStatus('Connect');
    } catch (error) {
      console.log('Error declining friend request:', error);
    }
  };

  // const handleMessage = () => {};

  const handleBackPress = () => {
    navigation.goBack(); // Navigate back to the previous screen
  };

  const formatDate = dateString => {
    const options = {year: 'numeric', month: 'short', day: 'numeric'};
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  console.log('Posts: ', userPosts);

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
              currentUser?._id === item.user._id
                ? navigation.navigate('Profile')
                : handleUserPress(item.user._id)
            }
            style={{fontWeight: 'bold', color: '#19295C'}}>
            {item.user.name}
          </Text>
        </View>
        {currentUser?._id === item.user._id && (
          <View style={{position: 'relative', zIndex: 100}}>
            <TouchableOpacity
              style={styles.iconButtons}
              onPress={() => {
                toggleActionSection(item._id);
                setActionPostModalVisible(!actionPostModalVisible);
              }}>
              <SimpleIcon name="options" size={20} color="#99A1BE" />
            </TouchableOpacity>
            {actionModalVisible && openActionPostId === item._id && (
              <View style={[styles.dropdownMenu, {zIndex: 1000}]}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setActionPostModalVisible(false);
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
        {/* <Text style={styles.actionText}>{item.likes.length} Likes .</Text> */}
        {item?.comments?.length > 0 && (
          <TouchableOpacity onPress={() => toggleCommentSection(item._id)}>
            <Text className="ml-2" style={[styles.actionText]}>
              {openCommentPostId === item?._id
                ? 'Hide Comments'
                : 'View Comments'}
            </Text>
          </TouchableOpacity>
        )}
        {/* <Text style={styles.actionText}>{item.shares} Shares</Text> */}
      </View>

      {/* Post Actions: Likes, Comments, Views, and Share */}
      <View style={styles.postActions}>
        <TouchableOpacity
          onPress={() => handleLike(item)}
          style={[
            styles.iconButtons,
            {
              backgroundColor: item?.likes?.includes(currentUser?._id)
                ? '#A274FF'
                : '#C3E4FF47',
            },
          ]}>
          <AntDesign
            name="like1"
            size={20}
            color={
              item?.likes?.includes(currentUser?._id) ? 'white' : '#A274FF'
            }
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
              style={styles.commentInput}
              placeholder="Add a comment..."
              value={currentComment}
              onChangeText={setCurrentComment}
              placeholderTextColor={'gray'}
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

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'white',
      }}>
      <StatusBar hidden />
      <Loader isLoading={loading} />
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
        source={{uri: user?.profilePicture || ''}}
        style={styles.userProfilePicture}
        imageStyle={styles.profilePictureImage}></ImageBackground>

      <ScrollView
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
            {user?.name?.toUpperCase() || ''}
          </Text>
          <Text style={{color: 'white', paddingStart: 10}}>@{user?.name}</Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 16,
              paddingHorizontal: 10,
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 16,
                gap: 10,
              }}>
              <View>
                {connectionStatus === 'Accept/Decline' && (
                  <View
                    style={{
                      // flexDirection: 'row',
                      // marginTop: 10,
                      gap: 15,
                      // paddingHorizontal: 30,
                    }}>
                    <TouchableOpacity
                      onPress={handleAccept}
                      style={{
                        backgroundColor: '#A274FF',
                        padding: 8,
                        paddingHorizontal: 16,
                        borderRadius: 30,
                        // flex: 1,
                      }}>
                      <Text className="text-white font-bold text-center">
                        Accept
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleDecline}
                      style={{
                        backgroundColor: 'white',
                        padding: 8,
                        paddingHorizontal: 16,
                        borderRadius: 30,
                        borderWidth: 1.4,
                        borderColor: '#585C60',
                        // flex: 1,
                      }}>
                      <Text
                        style={{
                          color: '#585C60',
                          textAlign: 'center',
                          fontWeight: '500',
                        }}>
                        Reject
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {connectionStatus === 'Connect' && (
                  <TouchableOpacity onPress={handleConnect} style={styles.btn}>
                    <Text className="text-white font-bold text-center">
                      {connectionStatus}
                    </Text>
                  </TouchableOpacity>
                )}
                {connectionStatus === 'Pending' && (
                  <View style={styles.btn}>
                    <Text
                      style={{
                        color: 'white',
                        textAlign: 'center',
                        fontWeight: '500',
                      }}>
                      Pending
                    </Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('Chat', {
                    name: user.name,
                    userId,
                    profilePicture: user.profilePicture,
                  })
                }
                style={{
                  backgroundColor: 'black',
                  padding: 10,
                  borderWidth: 1,
                  borderColor: '#888888',
                  borderRadius: 7,
                }}>
                <Feather name="mail" size={20} color="#888888" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('Connections', {userId})}>
                <Text
                  style={{
                    color: 'white',
                    fontSize: 22,
                    fontWeight: '500',
                  }}>
                  {user?.friends?.length}
                </Text>
                <Text style={{color: 'white', fontWeight: '500', fontSize: 12}}>
                  Connections
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('MyCommOrEvents', {
                    screen: 'Communities',
                    userId,
                  })
                }>
                <Text
                  style={{
                    color: 'white',
                    fontSize: 22,
                    fontWeight: '500',
                  }}>
                  {communityCount}
                </Text>
                <Text style={{color: 'white', fontWeight: '500', fontSize: 12}}>
                  Communities
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{position: 'relative', zIndex: 100}}>
              {/* <TouchableOpacity
                style={{
                  backgroundColor: '#313034',
                  borderRadius: 7,
                  padding: 10,
                }}
                onPress={() => {
                  setActionModalVisible(!actionModalVisible);
                }}>
                <SimpleLineIcons name="options" size={20} color="white" />
              </TouchableOpacity> */}
              {actionModalVisible && (
                <View style={[styles.dropdownMenu, {zIndex: 1000}]}>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setActionModalVisible(false);
                      const data = {
                        name: user?.name,
                        profilePicture: user?.profilePicture,
                        about: user?.bio,
                        location: user?.location,
                        socialLinks: user?.socialLinks,
                        experience: user?.experience,
                        education: user?.education,
                        skills: user?.skills,
                        interests: user?.interests,
                      };
                      dispatch(populateProfile(data));
                      navigation.navigate('CreateProfileStepOne');
                    }}>
                    <Text style={styles.dropdownItemText}>Edit Profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setActionModalVisible(false);
                      navigation.navigate('ShareScreen');
                    }}>
                    <Text style={styles.dropdownItemText}>Share Profile</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
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
                paddingBottom: 30,
              }}>
              <Text style={[styles.title, {marginTop: 10}]}>About:</Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  marginTop: 10,
                }}>
                <Icons name="briefcase" size={20} color="white" />
                <Text style={{color: 'white'}}>{user?.bio}</Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  marginTop: 10,
                }}>
                <FontAwesome name="group" size={20} color="white" />
                <Text style={{color: 'white'}}>{user?.skills?.join(', ')}</Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  marginTop: 10,
                  marginBottom: 20,
                }}>
                <Icons name="location" size={20} color="white" />
                <Text style={{color: 'white'}}>{user?.location}</Text>
              </View>
              {user?.socialLinks?.map((link, index) => (
                <View key={index} style={styles.linkContainer}>
                  <Entypo
                    name={`${link.logo}`}
                    size={20}
                    color={`${link.color}`}
                  />
                  <Text style={styles.platformName}>{link.platform}:</Text>
                  <Text style={styles.platformName}>{link?.url}</Text>
                </View>
              ))}
              {/* Experience Section */}
              <View style={{marginVertical: 20}}>
                <Text style={styles.sectionTitle}>Experience:</Text>
              </View>

              {user?.experience?.length ? (
                user.experience?.map((exp, index) => (
                  <View key={index} style={styles.card}>
                    <View key={index} style={styles.experienceItem}>
                      <View
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}>
                        <Text
                          style={[
                            styles.experienceCompany,
                            {color: '#2D3F7B'},
                          ]}>
                          {exp.company}
                        </Text>

                        <Text
                          style={[
                            styles.experienceDuration,
                            {color: '#2D3F7B'},
                          ]}>
                          {formatDate(exp.startDate)}-
                          {exp.isPresent ? 'Present' : formatDate(exp.endDate)}
                        </Text>
                      </View>

                      <Text
                        style={[styles.experienceTitle, {color: '#2D3F7B'}]}>
                        {exp.role}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={{color: 'gray'}}>Not added</Text>
              )}

              {/* Education Section */}
              <View style={{marginVertical: 20}}>
                <Text style={styles.sectionTitle}>Education:</Text>
              </View>

              <View style={styles.card}>
                {user?.education?.length ? (
                  user?.education?.map((edu, index) => (
                    <View key={index} style={styles.experienceItem}>
                      <View
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}>
                        <Text
                          style={[
                            styles.experienceCompany,
                            {color: '#2D3F7B'},
                          ]}>
                          {edu.school}
                        </Text>

                        <Text
                          style={[
                            styles.experienceDuration,
                            {color: '#2D3F7B'},
                          ]}>
                          {formatDate(edu.startDate)}-{formatDate(edu.endDate)}
                        </Text>
                      </View>

                      <Text
                        style={[styles.experienceTitle, {color: '#2D3F7B'}]}>
                        {edu.degree}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={{color: 'gray'}}>Not added</Text>
                )}
              </View>
              <View style={{marginVertical: 20}}>
                <Text style={styles.sectionTitle}>Interests:</Text>
              </View>
              <View
                style={{
                  flexWrap: 'wrap',
                  flexDirection: 'row',
                  gap: 8,
                  // justifyContent: 'center',
                }}>
                {user?.interests?.map((interest, index) => (
                  <View
                    style={[
                      styles.card,
                      {
                        height: 60,
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '45%',
                      },
                    ]}
                    key={index}>
                    <Text
                      style={{
                        color: 'black',
                        fontWeight: '500',
                        textAlign: 'center',
                      }}>
                      {interest}
                    </Text>
                  </View>
                ))}
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
              {userPosts?.length ? (
                userPosts?.map(item => renderPost(item))
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
                    queryType: 'profile',
                    id: userId,
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
                        Social Avg Score
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                }}>
                {/* <Text style={styles.title}>Something</Text> */}

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
            </View>
          )}
        </View>
      </ScrollView>
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
  btn: {
    backgroundColor: '#A274FF',
    padding: 7,
    width: 120,
    borderRadius: 7,
    marginTop: 10,
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
  profilePicture: {
    width: '100%',
    height: '100%',
  },
  userProfilePicture: {
    position: 'absolute',
    width: '100%',
    height: '90%',
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
  linkContainer: {
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 10,
    padding: 15,
    paddingStart: 20,
    marginBottom: 16,
    color: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  platformName: {
    color: 'white',
    fontSize: 16,
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
    top: 35, // Adjust position relative to the action icon
    right: 10,
    width: 120,
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
    padding: 15,
  },
  dropdownItemText: {
    fontSize: 14,
    color: 'black',
    fontWeight: '500',
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
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    overflow: 'hidden',
  },
});

export default UserProfile;
