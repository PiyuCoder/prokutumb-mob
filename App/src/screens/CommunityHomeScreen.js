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
import LinearGradient from 'react-native-linear-gradient';
import Octicons from 'react-native-vector-icons/Octicons';
import Feather from 'react-native-vector-icons/Feather';
import AntDesignIcons from 'react-native-vector-icons/AntDesign';
import EventCard from '../components/EventCard';
import RenderUserCard from '../components/RenderUserCard';
import Icon from 'react-native-vector-icons/Ionicons';
import SimpleIcon from 'react-native-vector-icons/SimpleLineIcons';

const CommunityHomeScreen = ({route}) => {
  const {communityId} = route.params;
  const [isFeedView, setIsFeedView] = useState(true);
  const [community, setCommunity] = useState({
    name: 'Loading...',
    profilePicture: 'https://via.placeholder.com/150',
    description: 'Community for the cool developers',
  });
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

  const flatListRef = useRef(null);

  // Fetch initial posts on component mount
  useEffect(() => {
    loadMorePosts(); // Fetch the first page
  }, [communityId]);

  // console.log(posts);

  const loadMorePosts = async () => {
    try {
      if (communityId) {
        const res = await axiosInstance.get(`/api/communities/${communityId}`);
        if (res.status === 200) {
          console.log(res.data.data);
          setCommunity(res?.data?.data || []); // Adjust based on backend response
          dispatch(setPosts(res?.data?.posts || []));
          setMembers(res?.data?.data?.members);
          setEvents(res?.data?.events || []);
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
      const result = await Share.share({
        message: `Check out this post: ${post.content}`,
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
    try {
      // Validate post content
      if (!newPostContent.trim() && !selectedMedia) {
        alert('Please enter post content or upload media.');
        return;
      }

      const formData = new FormData();

      // Add post content (text) and related IDs to form data
      formData.append('userId', user?._id); // User ID
      formData.append('communityId', communityId); // Community ID
      formData.append('content', newPostContent.trim()); // Post content

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

      // Reset modal and inputs
      setModalVisible(false);
      setNewPostContent('');
      setSelectedMedia(null);
      setIsEditMode(false); // Reset edit mode
    } catch (error) {
      console.error('Error creating post:', error.message);
      alert('An error occurred while creating the post. Please try again.');
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

  const renderEventCard = ({item: event}) => (
    <TouchableOpacity
      // onPress={() =>
      //   navigation.navigate('CommunityHome', {communityId: community._id})
      // }
      key={event._id}
      style={styles.cardWrapper}>
      <View style={styles.userCard}>
        <ImageBackground
          source={{uri: event.profilePicture}}
          style={styles.profilePicture}
          imageStyle={styles.profilePictureImage}>
          <LinearGradient
            colors={['#4B164C00', '#4B164C99', '#4B164CF2']}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            style={styles.overlay}
          />
          <View style={styles.overlayContent}>
            <Text style={styles.userName}>{event.name}</Text>
            <Text style={styles.userLocation}>{event.location}</Text>
          </View>
        </ImageBackground>
      </View>
    </TouchableOpacity>
  );

  // console.log(selectedMedia);
  const renderPost = ({item}) => (
    <View
      className="border border-gray-200"
      style={{
        margin: 10,
        padding: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
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
            style={{fontWeight: 'bold', color: '#141414'}}>
            {item.user.name}
          </Text>
        </View>
        {user?._id === item.user._id && (
          <View style={{position: 'relative', zIndex: 100}}>
            <TouchableOpacity
              onPress={() => {
                toggleActionSection(item._id);
                setActionModalVisible(!actionModalVisible);
              }}>
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
              </View>
            )}
          </View>
        )}
      </View>

      {/* Post Content */}
      <Text style={{marginTop: 10, color: '#141414'}}>{item.content}</Text>

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
        <TouchableOpacity
          onPress={() =>
            dispatch(likePost({userId: user?._id, postId: item._id}))
          }
          style={styles.actionButton}>
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

  return (
    <View
      style={{
        flex: 1,
        // paddingHorizontal: 7,
        // paddingBottom: 80,
        backgroundColor: 'white',
      }}>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      <Loader isLoading={isLoading} />
      {isChatBotVisible && (
        <ChatBotButton setIsChatBotVisible={setIsChatBotVisible} />
      )}
      <FlatList
        ref={flatListRef}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        data={isFeedView ? posts : userPosts}
        keyExtractor={item => item._id}
        renderItem={
          isFeedView &&
          (community?.members?.includes(user?._id) ||
            community?.createdBy?._id === user?._id) &&
          renderPost
        }
        contentContainerStyle={{paddingBottom: 65}}
        ListEmptyComponent={
          <Text style={{margin: 20, textAlign: 'center'}}>No Posts yet</Text>
        }
        // onEndReached={loadMorePosts}
        onEndReachedThreshold={0.2}
        ListFooterComponent={
          isFetching ? <ActivityIndicator size="large" /> : null
        }
        ListHeaderComponent={
          <View>
            <View
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 10,
                position: 'absolute',
                zIndex: 10,
              }}>
              <TouchableOpacity
                style={styles.headerBtn}
                onPress={() => navigation.goBack()}>
                <Octicons name="arrow-left" size={25} color="black" />
              </TouchableOpacity>
              <View style={{flexDirection: 'row', gap: 10}}>
                <TouchableOpacity style={styles.headerBtn}>
                  <Icon name="share-outline" size={25} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerBtn}>
                  <Icon name="heart-outline" size={25} color="black" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.communityHeader}>
              <ImageBackground
                source={{uri: community?.profilePicture || ''}}
                style={styles.communityProfilePicture}
                imageStyle={styles.profilePictureImage}
              />
              <Text style={styles.communityName}>{community?.name || ''}</Text>
              <Text style={styles.communityDescription}>
                {community?.description || ''}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginHorizontal: 20,
                }}>
                <Text
                  style={{
                    color: '#A274FF',
                    fontSize: 13,
                    fontWeight: '500',

                    marginTop: 5,
                  }}>
                  {events?.length || 0} events{' '}
                  <Octicons name="dot-fill" size={8} color="#A274FF" />{' '}
                  {community?.members?.length || 1} members
                </Text>
                {(community.members?.includes(user?._id) ||
                  community.createdBy?._id == user?._id) && (
                  <TouchableOpacity
                    onPress={() => {
                      setModalVisible(true); // Open modal
                    }}>
                    <Feather name="edit" size={20} color="#A274FF" />
                  </TouchableOpacity>
                )}
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  gap: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 15,
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
                          console.log(action.payload);
                          if (requestToJoinCommunity.fulfilled.match(action)) {
                            setCommunity(action.payload?.data);
                          }
                        });
                      }}
                      style={{
                        backgroundColor: '#A274FF',
                        padding: 10,
                        width: 90,
                        borderRadius: 30,
                        marginTop: 10,
                        flex: 1,
                      }}>
                      <Text
                        style={{
                          color: 'white',
                          fontWeight: '500',
                          textAlign: 'center',
                        }}>
                        {community?.joinRequests?.some(
                          req => req._id == user?._id,
                        )
                          ? 'Requested'
                          : 'Join'}
                      </Text>
                    </TouchableOpacity>
                  )}
                {(community.members?.includes(user?._id) ||
                  community.createdBy?._id == user?._id) && (
                  <TouchableOpacity
                    // onPress={() => setIsChatBotVisible(true)}
                    style={{
                      backgroundColor: '#A274FF',
                      padding: 10,
                      flex: 1,
                      borderRadius: 10,
                      marginTop: 10,
                      marginHorizontal: 40,
                    }}>
                    <Text
                      style={{
                        color: 'white',
                        fontWeight: '500',
                        textAlign: 'center',
                        fontSize: 15,
                      }}>
                      Dashboard
                    </Text>
                  </TouchableOpacity>
                )}
                {!community.members?.includes(user?._id) &&
                  community.createdBy?._id !== user?._id && (
                    <TouchableOpacity
                      onPress={() => setIsChatBotVisible(true)}
                      style={{
                        backgroundColor: 'white',
                        borderWidth: 1,
                        borderColor: '#A274FF',
                        padding: 8,
                        flex: 1,
                        borderRadius: 30,
                        marginTop: 10,
                      }}>
                      <Text
                        style={{
                          color: '#A274FF',
                          fontWeight: '500',
                          textAlign: 'center',
                        }}>
                        Ask AI
                      </Text>
                    </TouchableOpacity>
                  )}
              </View>
            </View>

            <View style={{flex: 1, justifyContent: 'flex-start'}}>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginHorizontal: 20,
                }}>
                <Text style={styles.title}>
                  {community.createdBy?._id !== user?._id
                    ? 'Upcoming Events'
                    : 'Events'}
                </Text>
                {community.createdBy?._id === user?._id && (
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
                )}
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
                  />
                )}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={() => (
                  <View style={styles.noTrendingContainer}>
                    <Text style={styles.noUsersText}>No Events found</Text>
                  </View>
                )}
              />
            </View>

            {/* Toggle between Feed and Profile */}
            {(community.members?.includes(user?._id) ||
              community.createdBy?._id === user?._id) && (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                  backgroundColor: '#EEEEEE',
                  borderRadius: 30,
                  padding: 5,
                  marginHorizontal: 10,
                }}>
                <TouchableOpacity
                  onPress={() => setIsFeedView(true)}
                  style={{
                    backgroundColor: isFeedView ? '#A274FF' : '#EEEEEE',
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 25,
                    flex: 1,
                  }}>
                  <Text
                    style={[
                      styles.proku,
                      {
                        fontSize: 13,
                        color: isFeedView ? 'white' : '#000',
                        textAlign: 'center',
                      },
                    ]}>
                    Feed
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIsFeedView(false)}
                  style={{
                    backgroundColor: !isFeedView ? '#A274FF' : '#EEEEEE',
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 25,
                    flex: 1,
                  }}>
                  <Text
                    style={[
                      styles.proku,
                      {
                        fontSize: 13,
                        color: !isFeedView ? 'white' : '#000',
                        textAlign: 'center',
                      },
                    ]}>
                    Members
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Feed or Members */}
            {!isFeedView && (
              <FlatList
                data={
                  community.createdBy?._id === user?._id
                    ? members
                    : [user, ...members]
                }
                contentContainerStyle={{
                  flexDirection: 'row',
                  // flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  paddingHorizontal: 10,
                  marginTop: 10,
                }}
                numColumns={2}
                keyExtractor={item => item._id} // Assuming each friend has a unique `id`
                renderItem={({item}) => (
                  <RenderUserCard item={item} />
                  // <TouchableOpacity onPress={() => {}}>
                  //   <View style={styles.friendItem}>
                  //     <View
                  //       style={{
                  //         flexDirection: 'row',
                  //         alignItems: 'center',
                  //         marginBottom: 7,
                  //         padding: 5,
                  //       }}>
                  //       <ProfilePicture
                  //         profilePictureUri={item.profilePicture}
                  //         width={40}
                  //         height={40}
                  //         borderRadius={20}
                  //         marginRight={10}
                  //       />

                  //       <Text style={styles.friendName}>{item.name}</Text>
                  //     </View>
                  //     <View className="bg-[#4B164C] rounded-full p-2 px-4 flex flex-row items-center justify-center">
                  //       <Progress.Circle
                  //         size={30}
                  //         progress={0.7}
                  //         showsText
                  //         thickness={3}
                  //         textStyle={{color: 'white', fontSize: 8}}
                  //         color="#242760"
                  //         unfilledColor="#A274FF62"
                  //         borderColor="#4B164C"
                  //       />
                  //       <Text className="text-white font-bold ml-2 ">
                  //         Match
                  //       </Text>
                  //     </View>
                  //   </View>
                  // </TouchableOpacity>
                )}
                ListEmptyComponent={() => (
                  <Text style={styles.emptyMessage}></Text>
                )}
              />
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
            backgroundColor: 'rgba(0, 0, 0, 0)',
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#22172A',
    textAlign: 'left',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
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
    paddingStart: 30,
    paddingHorizontal: 10,
    paddingBottom: 20,
    backgroundColor: 'white',
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
    width: '100%',
    height: 250,
    overflow: 'hidden',
    backgroundColor: '#a274ff6e',
  },
  profilePictureImage: {
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
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
  headerBtn: {
    padding: 5,
    backgroundColor: 'white',
    height: 40,
    width: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  communityHeader: {
    // alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
    borderRadius: 10,
  },
  communityName: {
    textAlign: 'left',
    fontSize: 18,
    fontWeight: 'bold',
    margin: 20,
    color: '#141414',
  },
  communityDescription: {
    color: 'black',
    marginLeft: 20,
  },
  iconButtons: {
    position: 'relative',
    padding: 2,
    height: 45,
    width: 45,
    borderRadius: 22.5,
    borderColor: '#4b164c5a',
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
