import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Share,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useRoute} from '@react-navigation/native';
import ProfilePicture from '../components/ProfilePicture';
import SimpleIcon from 'react-native-vector-icons/SimpleLineIcons';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  commentOnPost,
  incrementShare,
  likePost,
} from '../store/slices/postSlice';
import {axiosInstance} from '../api/axios';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import {ScrollView} from 'react-native-gesture-handler';

const Post = ({navigation}) => {
  const route = useRoute();
  const {postId} = route.params;
  //   const postId = '670f54739e058d4c9784608c';
  const [item, setItem] = useState({});
  const [openCommentPostId, setOpenCommentPostId] = useState(null);
  const [openActionPostId, setOpenActionPostId] = useState(null);
  const [currentComment, setCurrentComment] = useState('');
  const {user} = useSelector(state => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      const res = await axiosInstance.get(`/api/posts/fetch/${postId}`);
      setItem(res?.data);
    };
    fetchData();
  }, [postId, dispatch]);

  const toggleCommentSection = postId => {
    setOpenCommentPostId(prevPostId => (prevPostId === postId ? null : postId));
  };
  const toggleActionSection = postId => {
    setOpenActionPostId(prevPostId => (prevPostId === postId ? null : postId));
  };
  const handleAddComment = () => {
    if (currentComment.trim() !== '') {
      // console.log(post);
      dispatch(
        commentOnPost({
          postId: postId,
          userId: user?._id,
          content: currentComment,
        }),
      );
      setItem({
        ...item,
        comments: [
          ...item.comments,
          {user: user, content: currentComment, _id: Date.now()},
        ],
      });
      setCurrentComment(''); // Clear input
    }
  };

  const sharePost = async () => {
    try {
      const postUrl = `http://10.0.2.2:3001/posts/${postId}`;
      const result = await Share.share({
        message: `Check out this post: ${postUrl}`,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Post shared with activity:', result.activityType);
        } else {
          console.log('Post shared!');
          // Increment the share count
          await dispatch(incrementShare(postId));
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  console.log(item);
  return (
    <ScrollView style={{flex: 1, backgroundColor: 'white'}}>
      <View style={{padding: 10, flex: 1}}>
        <View
          style={{
            marginBottom: 15,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.iconButtons}>
            <EntypoIcon name="chevron-left" size={20} color="#A274FF" />
          </TouchableOpacity>
          <Text
            style={{
              color: 'black',
              fontSize: 22,
              fontWeight: '500',
              marginLeft: 30,
            }}>
            Post
          </Text>
        </View>
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
                profilePictureUri={item.user?.profilePicture}
                width={40}
                height={40}
                borderRadius={20}
                marginRight={10}
              />
              <Text
                onPress={() =>
                  user?._id === item?.user?._id
                    ? navigation.navigate('Profile')
                    : handleUserPress(item.user?._id)
                }
                style={{
                  fontWeight: 'bold',
                  color: '#141414',
                  fontFamily: 'Inter_24pt-Bold',
                }}>
                {item.user?.name}
              </Text>
            </View>
            {user?._id === item.user?._id && (
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
                {actionModalVisible && openActionPostId === item?._id && (
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
                        // setActionModalVisible(false);
                        // handleDeletePost(item._id);
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
          {item?.mediaUrl && item?.mediaType === 'image' && (
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
              onPress={() => {
                dispatch(likePost({userId: user?._id, postId}));
              }}
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
              <Text style={styles.actionText}>{item.likes?.length} </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => toggleCommentSection(item._id)}
              style={styles.actionButton}>
              {/* <Image source={commentIcon} style={styles.actionIcon} /> */}
              <Icon name="chatbubble-outline" size={24} color="#7B7B7B" />
              <Text style={styles.actionText}>{item.comments?.length}</Text>
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
              <Text style={styles.actionText}>{item?.shares}</Text>
            </TouchableOpacity>
          </View>
          {/* Comment Section */}
          {openCommentPostId === item?._id && (
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
                item.comments?.map(comment => (
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
                      <Text style={styles.commentContent}>
                        {comment.content}
                      </Text>
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
      </View>
    </ScrollView>
  );
};

export default Post;

const styles = StyleSheet.create({
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
    borderColor: '#A274FF',
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
