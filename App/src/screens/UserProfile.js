import React, {useEffect, useState} from 'react';
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
} from 'react-native';
import * as Progress from 'react-native-progress';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
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
import AntDesignIcons from 'react-native-vector-icons/AntDesign';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Icon from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import SimpleIcon from 'react-native-vector-icons/SimpleLineIcons';

const UserProfile = ({route}) => {
  const {userId} = route.params;
  const currentUser = useSelector(state => state.auth?.user);
  const [user, setUser] = useState([]);
  const [loading, setLoading] = useState(false);
  const [webData, setWebData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [openCommentPostId, setOpenCommentPostId] = useState(null);
  const [currentComment, setCurrentComment] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('Connect');
  const navigation = useNavigation(); // Hook for navigation
  const dispatch = useDispatch();

  // console.log('Current User: ', currentUser);
  // console.log('userId: ', userId);

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
      try {
        setLoading(true);
        const res = await axiosInstance.get(
          `/api/user/fetchUser/${userId}/${currentUser?._id}`,
        );

        if (res.data.success) {
          setUser(res.data.user);
          setUserPosts(res.data.posts);

          // Check if they are already connected
          if (res.data.user.isAlreadyConnected) {
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
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const toggleCommentSection = postId => {
    setOpenCommentPostId(prevPostId => (prevPostId === postId ? null : postId));
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

  // Fetch user info from external APIs (LinkedIn, etc.)
  const fetchUserWebInfo = async () => {
    try {
      // Fetch GitHub user info using email
      const githubResponse = await axios.get(
        `https://api.github.com/search/users?q=${user?.email}`,
      ); // This will work if you have the username

      console.log(githubResponse);

      // For LinkedIn, you cannot fetch by email without OAuth, but you can assume a function exists
      // const linkedInProfile = await fetchLinkedInProfile(email); // Placeholder function

      const webData = {
        github: githubResponse.data,
        // linkedIn: linkedInProfile
      };

      setWebData(webData);
    } catch (error) {
      console.error('Error fetching web data:', error);
    }
  };

  useEffect(() => {
    // fetchUserWebInfo();
  }, []);

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
      const response = await axiosInstance.post(
        '/api/user/acceptFriendRequest',
        {
          fromUserId: userId, // The user who sent the request
          toUserId: currentUser._id, // The current user (receiver)
        },
      );

      if (response.data.success) {
        setConnectionStatus('Message'); // Update status to "Message"
        // Optionally update the friend lists or UI as needed here
        dispatch(
          removeFriendRequest({fromUserId: userId, toUserId: currentUser._id}),
        );
      } else {
        console.log('Failed to accept the request.');
      }
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

  const handleSharePost = post => {
    Share.share({
      message: `Check out this post: ${post.content}`,
    })
      .then(result => {
        if (result.action === Share.sharedAction) {
          // Dispatch Redux action to update share count globally
          dispatch(incrementShare({postId: post._id}));

          const postIndex = userPosts.findIndex(p => p._id === post._id);
          if (postIndex !== -1) {
            const updatedPosts = [...userPosts];
            updatedPosts[postIndex].shares += 1; // Increment share count locally
            setUserPosts(updatedPosts); // Update local state
          }
        }
      })
      .catch(error => {
        console.error('Error sharing post:', error);
      });
  };

  const handleDecline = async () => {
    try {
      const response = await axiosInstance.post(
        '/api/user/declineFriendRequest',
        {
          fromUserId: userId, // The user who sent the request
          toUserId: currentUser._id, // The current user (receiver)
        },
      );

      if (response.data.success) {
        setConnectionStatus('Connect'); // Update status to "Connect"
        // Optionally remove the friend request from UI or state here
      } else {
        console.log('Failed to decline the request.');
      }
    } catch (error) {
      console.log('Error declining friend request:', error);
    }
  };

  // const handleMessage = () => {};

  const handleBackPress = () => {
    navigation.goBack(); // Navigate back to the previous screen
  };

  const formatDate = dateString => {
    const options = {year: 'numeric', month: 'long', day: 'numeric'};
    return new Date(dateString).toLocaleDateString(undefined, options);
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
        {/* <Image
          // className="border border-red-500"
          source={{uri: item.user.profilePicture}}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            marginRight: 10,
          }}
        /> */}
        <ProfilePicture
          profilePictureUri={item.user.profilePicture}
          width={40}
          height={40}
          borderRadius={20}
          marginRight={10}
        />
        <Text style={{fontWeight: 'bold', color: '#141414'}}>
          {item.user.name}
        </Text>
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
          onPress={() => handleLike(item)}
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
          onPress={() => handleSharePost(item)}
          style={styles.actionButton}>
          <Icon name="arrow-redo-outline" size={24} color="#7B7B7B" />
          <Text style={styles.actionText}>{item.shares}</Text>
        </TouchableOpacity>
      </View>
      {/* Comment Section */}
      {openCommentPostId === item._id && (
        <View style={styles.commentSection}>
          <Text style={{fontWeight: 'bold', color: 'black', margin: 6}}>
            Comments
          </Text>
          {item.comments?.length > 0 ? (
            item.comments.map(comment => (
              <View key={comment._id} style={styles.commentContainer}>
                <Image
                  source={{uri: comment.user?.profilePicture}}
                  style={styles.profilePicture}
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loading && <Loader isLoading={loading} />}
      {/* Profile Section */}
      <View style={styles.profileCard}>
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 15,
            borderBottomWidth: 1,
            borderColor: '#E0DFDC',
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-around',
              // gap: 10,
            }}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <AntDesignIcons name="arrowleft" size={30} color="#585C60" />
            </TouchableOpacity>
            <TextInput
              style={{
                color: 'black',
                fontSize: 20,
                borderBottomWidth: 1,
                width: '80%',
              }}
            />
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Icons name="settings-sharp" size={30} color="black" />
          </TouchableOpacity>
        </View>
        <View
          style={{
            flexDirection: 'row',
            width: '100%',
            padding: 5,
            paddingTop: 14,
            justifyContent: 'space-between',
          }}>
          <View
            style={{
              flexDirection: 'row',
              gap: 20,
              // justifyContent: 'space-between',
            }}>
            <ProfilePicture
              profilePictureUri={user.profilePicture}
              width={120}
              height={120}
              borderRadius={60}
              borderColor="#242760"
            />
            <View style={{marginRight: 10}}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userLocation}>
                {user.location?.state || 'State'},{' '}
                {user.location?.country || 'Country'}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 7,
                  marginTop: 8,
                }}>
                <Icons name="logo-linkedin" size={25} color="#0A66C2" />
                <AntDesignIcons name="github" size={25} color="#24292F" />
                <FontAwesome name="reddit" size={25} color="#FF4500" />
                <FontAwesome name="whatsapp" size={25} color="#25D366" />
              </View>
            </View>
          </View>
        </View>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          marginTop: 20,
        }}>
        <View>
          <Text
            style={{color: '#A274FF', textAlign: 'center', fontWeight: '500'}}>
            125
          </Text>
          <Text style={{color: 'black', textAlign: 'center'}}>Connections</Text>
        </View>
        <View>
          <Text
            style={{color: '#A274FF', textAlign: 'center', fontWeight: '500'}}>
            125
          </Text>
          <Text style={{color: 'black', textAlign: 'center'}}>Communities</Text>
        </View>
        <View>
          <Text
            style={{color: '#A274FF', textAlign: 'center', fontWeight: '500'}}>
            125
          </Text>
          <Text style={{color: 'black', textAlign: 'center'}}>Events Done</Text>
        </View>
      </View>
      <View style={styles.earthIconWrapper}>
        <ImageBackground
          style={styles.imageBackground}
          imageStyle={styles.imageBackgroundImage}
          source={require('../assets/majlis-earth.png')}
        />
      </View>
      <Text style={styles.modalTitle}>MajlisAI</Text>
      <View style={{marginTop: 90}}>
        {connectionStatus === 'Accept/Decline' && (
          <View
            style={{
              flexDirection: 'row',
              marginTop: 10,
              gap: 15,
              paddingHorizontal: 30,
            }}>
            <TouchableOpacity
              onPress={handleAccept}
              style={{
                backgroundColor: '#A274FF',
                padding: 13,
                borderRadius: 30,
                flex: 1,
              }}>
              <Text className="text-white font-bold text-center">Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDecline}
              style={{
                backgroundColor: 'white',
                padding: 12,
                borderRadius: 30,
                borderWidth: 1.4,
                borderColor: '#585C60',
                flex: 1,
              }}>
              <Text
                style={{
                  color: '#585C60',
                  textAlign: 'center',
                  fontWeight: '500',
                }}>
                Decline
              </Text>
            </TouchableOpacity>
          </View>
        )}
        {connectionStatus === 'Message' && (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('Chat', {
                name: user.name,
                userId,
                profilePicture: user.profilePicture,
              })
            }
            style={{
              backgroundColor: '#A274FF',
              padding: 13,
              borderRadius: 30,
              flex: 1,
              width: 200,
              alignSelf: 'center',
            }}>
            <Text className="text-white font-bold text-center">Message</Text>
          </TouchableOpacity>
        )}
        {connectionStatus === 'Connect' && (
          <TouchableOpacity
            onPress={handleConnect}
            style={{
              backgroundColor: '#A274FF',
              padding: 13,
              borderRadius: 30,
              flex: 1,
              width: 200,
              alignSelf: 'center',
            }}>
            <Text className="text-white font-bold text-center">
              {connectionStatus}
            </Text>
          </TouchableOpacity>
        )}
        {connectionStatus === 'Pending' && (
          <View
            style={{
              backgroundColor: 'white',
              padding: 12,
              borderRadius: 30,
              borderWidth: 1.4,
              borderColor: '#585C60',
              flex: 1,
              width: 200,
              alignSelf: 'center',
            }}>
            <Text
              style={{
                color: '#585C60',
                textAlign: 'center',
                fontWeight: '500',
              }}>
              Pending
            </Text>
          </View>
        )}
      </View>
      <View style={styles.mainCard}>
        {/* About Section */}
        {/* <View style={styles.titleSection}>
          <Text style={styles.sectionTitle}>About</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionText}>{user.bio}</Text>
        </View> */}

        {/* Experience Section */}
        <View style={styles.titleSection}>
          <Text style={styles.sectionTitle}>Experience</Text>
          <View style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}>
            {/* <TouchableOpacity onPress={() => setExperienceModalVisible(true)}>
              <AntDesignIcons name="plus" size={21} color="#A274FF" />
            </TouchableOpacity> */}
            {/* <TouchableOpacity onPress={() => setExperienceModalVisible(true)}>
              <SimpleLineIcons name="pencil" size={18} color="#A274FF" />
            </TouchableOpacity> */}
          </View>
        </View>

        <View style={styles.card}>
          {user.experience?.map((exp, index) => (
            <View key={index} style={styles.experienceItem}>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Text style={styles.experienceCompany}>{exp.company}</Text>
                <Text style={styles.experienceDuration}>
                  {formatDate(exp.startDate)}-
                  {exp.isPresent ? 'Present' : formatDate(exp.endDate)}
                </Text>
              </View>
              <Text style={styles.experienceTitle}>{exp.role}</Text>
            </View>
          ))}
        </View>

        {/* Education Section */}
        <View style={styles.titleSection}>
          <Text style={styles.sectionTitle}>Education</Text>
          <View style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}>
            {/* <TouchableOpacity onPress={() => setExperienceModalVisible(true)}>
              <AntDesignIcons name="plus" size={21} color="#A274FF" />
            </TouchableOpacity> */}
            {/* <TouchableOpacity onPress={() => setExperienceModalVisible(true)}>
              <SimpleLineIcons name="pencil" size={18} color="#A274FF" />
            </TouchableOpacity> */}
          </View>
        </View>

        <View style={styles.card}>
          {user.experience?.map((exp, index) => (
            <View key={index} style={styles.experienceItem}>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Text style={styles.experienceCompany}>{exp.company}</Text>
                <Text style={styles.experienceDuration}>
                  {formatDate(exp.startDate)}-
                  {exp.isPresent ? 'Present' : formatDate(exp.endDate)}
                </Text>
              </View>
              <Text style={styles.experienceTitle}>{exp.role}</Text>
            </View>
          ))}
        </View>

        {/* Interest Section */}
        {/* <View style={styles.titleSection}>
          <Text style={styles.sectionTitle}>Interests</Text>
        </View>
        <View
          style={[
            styles.card,
            {flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20},
          ]}>
          {user?.interests?.map((interest, index) => (
            <View
              key={index}
              style={{
                margin: 5,
                paddingVertical: 7,
                paddingHorizontal: 18,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: '#4B164C33',
              }}>
              <Text style={styles.sectionText}>{interest}</Text>
            </View>
          ))}
        </View> */}

        {/* On the Web Section */}
        {/* <View style={styles.titleSection}>
          <Text style={styles.sectionTitle}>On the Web</Text>
        </View>
        <View style={styles.card}>
          {webData ? (
            <>
              <Text style={styles.sectionText}>
                LinkedIn: {webData.linkedin}
              </Text>
              <Text style={styles.sectionText}>GitHub: {webData.github}</Text>
              <Text style={styles.sectionText}>Website: {webData.website}</Text>
            </>
          ) : (
            <Text style={styles.sectionText}>Loading web data...</Text>
          )}
        </View>
        <View style={styles.titleSection}>
          <Text style={styles.sectionTitle}>Posts</Text>
        </View>
        <FlatList
          data={userPosts}
          keyExtractor={item => item._id}
          renderItem={renderPost}
          contentContainerStyle={{paddingBottom: 65}}
          ListEmptyComponent={<Text>No Posts yet</Text>}
        /> */}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: 'white',
  },
  mainCard: {
    backgroundColor: 'white',
    zIndex: 2,
  },
  profileCard: {
    position: 'relative',
    alignItems: 'center',
  },
  coverPicture: {
    width: '100%',
    height: 250,
    alignSelf: 'center',
    resizeMode: 'cover',
  },
  profilePicture: {
    width: '100%',
    height: 500,
    alignSelf: 'center',
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  closeIconContainer: {
    backgroundColor: 'white',
    padding: 8,
  },
  profileIconContainer: {
    width: '100%',
    paddingHorizontal: 30,
    position: 'absolute',
    top: 40,
    zIndex: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userName: {
    fontSize: 25,
    fontWeight: '500',
    textAlign: 'left',
    color: 'black',
    zIndex: 2,
  },
  userLocation: {
    fontSize: 17,
    textAlign: 'left',
    color: '#585C60',
    marginTop: 5,
    zIndex: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    // paddingVertical: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  titleSection: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    // marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    color: 'black',
  },
  sectionText: {
    fontSize: 14,
    color: 'black',
  },
  experienceItem: {
    // marginBottom: 10,
    borderBottomWidth: 1,
    padding: 20,
    borderColor: '#E0DFDC',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FDF7FD',
    padding: 20,
    borderBottomStartRadius: 10,
    borderBottomEndRadius: 10,
    width: '100%',
    height: '100%',
    alignSelf: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  experienceTitle: {
    color: 'black',
  },
  experienceCompany: {
    color: 'black',
    fontWeight: '500',
    fontSize: 16,
  },
  experienceDuration: {
    color: 'black',
  },
  input: {
    // borderWidth: 1,
    // borderColor: '#DDD',
    paddingHorizontal: 10,
    // height: 200,
    backgroundColor: 'white',
    marginBottom: 15,
    borderRadius: 5,
    color: 'black',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  button: {
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    marginBottom: 20,
    alignItems: 'center',
  },
  uploadButton: {
    padding: 10,
    backgroundColor: '#28A745',
    borderRadius: 5,
    alignItems: 'center',
  },
  imagePreview: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  earthIconWrapper: {
    height: 70,
    width: 70,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 10,
  },
  imageBackground: {
    height: '100%',
    width: '100%',
  },
  imageBackgroundImage: {
    resizeMode: 'contain', // Ensures the entire image is visible without cropping
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#A274FF',
  },
});

export default UserProfile;
