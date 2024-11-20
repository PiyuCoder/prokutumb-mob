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

const backIcon = require('../assets/icons/back.png');
const likeIcon = require('../assets/icons/like.png');
const likedIcon = require('../assets/icons/liked.png');
const commentIcon = require('../assets/icons/comment.png');
const viewIcon = require('../assets/icons/view.png');
const shareIcon = require('../assets/icons/share.png');

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
          <Image
            source={
              item?.likes?.includes(currentUser?._id) ? likedIcon : likeIcon
            }
            style={styles.actionIcon}
          />
          <Text style={styles.actionText}>{item.likes.length} </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => toggleCommentSection(item._id)}
          style={styles.actionButton}>
          <Image source={commentIcon} style={styles.actionIcon} />
          <Text style={styles.actionText}>{item.comments.length}</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.actionButton}>
          <Image source={viewIcon} style={styles.actionIcon} />
          <Text style={styles.actionText}>{item.views} </Text>
        </TouchableOpacity> */}
        <TouchableOpacity
          onPress={() => handleSharePost(item)}
          style={styles.actionButton}>
          <Image source={shareIcon} style={styles.actionIcon} />
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
        <View style={styles.profileIconContainer}>
          <TouchableOpacity
            onPress={handleBackPress}
            className="border h-8 w-8 border-white  rounded-full p-2 flex items-center justify-center">
            <Image style={{height: 15, width: 15}} source={backIcon} />
          </TouchableOpacity>
          {connectionStatus === 'Connect' && (
            <TouchableOpacity
              onPress={handleConnect}
              className="bg-[#242760] rounded-full p-2 px-4 flex items-center justify-center">
              <Text className="text-white font-bold">{connectionStatus}</Text>
            </TouchableOpacity>
          )}
          {currentUser.friendRequests?.some(
            request => request.fromUser === userId,
          ) && (
            <View className="bg-[#4B164C] rounded-full p-2 px-4 flex flex-row items-center justify-center">
              <Progress.Circle
                size={30}
                progress={0.7}
                showsText
                thickness={3}
                textStyle={{color: 'white', fontSize: 8}}
                color="#242760"
                unfilledColor="#dd88cf62"
                borderColor="#4B164C"
              />
              <Text className="text-white font-bold ml-2 ">Match</Text>
            </View>
          )}

          {connectionStatus === 'Pending' && (
            <View className="bg-pink-300 rounded-full p-2 px-4 flex items-center justify-center">
              <Text className="text-white font-bold">Pending</Text>
            </View>
          )}
        </View>
        <View style={{width: '100%', position: 'relative'}}>
          <ImageBackground
            style={styles.coverPicture}
            source={{
              uri:
                user?.coverPicture ||
                'https://img.freepik.com/free-vector/gradient-network-connection-background_23-2148880712.jpg',
            }}
          />

          <View
            style={{
              position: 'absolute',
              alignSelf: 'center',
              bottom: -90,
              width: 150,
              height: 150,
              borderRadius: 75,
              backgroundColor: '#FDF7FD',
              padding: 5,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <View
              style={{
                width: 100,
                height: 100,
                position: 'absolute',
                bottom: 60,
                left: -85,
                zIndex: -2,
                transform: [{rotateZ: '43deg'}],
                alignSelf: 'center',
                borderColor: '#FDF7FD',
                borderEndEndRadius: 80,
                borderRightWidth: 20,
                borderBottomWidth: 0,
              }}
            />

            <View
              style={{
                width: 50,
                height: 50,
                position: 'absolute',
                bottom: 72,
                left: -45,
                zIndex: -2,
                transform: [{rotateZ: '-18deg'}],
                alignSelf: 'center',
                borderColor: '#FDF7FD',
                borderEndEndRadius: 40,
                borderRightWidth: 0,
                borderBottomWidth: 20,
              }}
            />

            <View
              style={{
                width: 100,
                height: 100,
                position: 'absolute',
                bottom: 60,
                right: -85,
                zIndex: -2,
                transform: [{rotateZ: '-43deg'}],
                alignSelf: 'center',
                borderColor: '#FDF7FD',
                borderBottomStartRadius: 80,
                borderLeftWidth: 20,
                borderBottomWidth: 0,
              }}
            />
            <View
              style={{
                width: 50,
                height: 50,
                position: 'absolute',
                bottom: 70,
                right: -50,
                zIndex: -2,
                transform: [{rotateZ: '22deg'}],
                alignSelf: 'center',
                borderColor: '#FDF7FD',
                borderBottomStartRadius: 20,
                borderLeftWidth: 0,
                borderBottomWidth: 20,
              }}
            />
            <View style={{zIndex: 4}}>
              <ProfilePicture
                profilePictureUri={user.profilePicture}
                width={120}
                height={120}
                borderRadius={60}
                borderColor="#242760"
              />
            </View>
          </View>
          {/* <Image
            source={{uri: user.profilePicture}}
            style={styles.profilePicture}
          /> */}
        </View>
      </View>
      <View style={{marginTop: 90}}>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userLocation}>
          {user.location?.state || 'State'},{' '}
          {user.location?.country || 'Country'}
        </Text>
        {connectionStatus === 'Accept/Decline' && (
          <View className="w-80 flex items-center mx-auto flex-row justify-around z-10 mt-5">
            <TouchableOpacity
              onPress={handleAccept}
              className="bg-[#DD88CF] rounded-full p-3 px-5 flex items-center justify-center">
              <Text className="text-white font-bold">Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDecline}
              className="bg-[#855BFD] rounded-full p-3 px-5 flex items-center justify-center">
              <Text className="text-white font-bold">Decline</Text>
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
            className="bg-[#242760] z-10 w-48 rounded-full p-2 px-4 mx-auto flex items-center justify-center mt-4">
            <Text className="text-white font-bold">Message</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.mainCard}>
        {/* About Section */}
        <View style={styles.titleSection}>
          <Text style={styles.sectionTitle}>About</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionText}>{user.bio}</Text>
        </View>

        {/* Experience Section */}
        <View style={styles.titleSection}>
          <Text style={styles.sectionTitle}>Experience</Text>
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
        <View style={styles.titleSection}>
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
        </View>

        {/* On the Web Section */}
        <View style={styles.titleSection}>
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
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#FDF7FD',
  },
  mainCard: {
    backgroundColor: '#FDF7FD',
    padding: 20,

    // marginTop: -50,
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
  // profilePicture: {
  //   width: '100%',
  //   height: 500,
  //   alignSelf: 'center',
  // },
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
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#242760',
    zIndex: 2,
  },
  userLocation: {
    fontSize: 12,
    textAlign: 'center',
    color: '#544C4C',
    marginTop: 5,
    zIndex: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  titleSection: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingEnd: 5,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#242760',
  },
  sectionText: {
    fontSize: 14,
    color: 'black',
  },
  experienceItem: {
    marginBottom: 10,
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
    fontWeight: 'bold',
  },
  experienceDuration: {
    color: 'black',
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
    backgroundColor: '#007BFF',
    padding: 10,
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
});

export default UserProfile;
