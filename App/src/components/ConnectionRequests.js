import React, {useState, useEffect} from 'react';
import {View, Text, Image, TouchableOpacity, FlatList} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {
  acceptRequest,
  declineRequest,
  fetchFriendRequests,
} from '../store/slices/authSlice';
import {useNavigation} from '@react-navigation/native';
import ProfilePicture from './ProfilePicture';
import {removeFriendRequest} from '../store/slices/userSlice';
import {axiosInstance} from '../api/axios';

const ConnectionRequests = ({userId, friendRequests}) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        dispatch(fetchFriendRequests(userId));
      } catch (error) {
        console.error('Error fetching connection requests:', error);
      }
    };

    fetchRequests();
  }, [userId]);

  // Toggle showing all requests
  const handleToggleShowAll = () => {
    setShowAll(!showAll);
  };

  const handleAccept = async senderId => {
    try {
      dispatch(
        acceptRequest({
          fromUserId: senderId, // The user who sent the request
          toUserId: userId,
        }),
      );
    } catch (error) {
      console.log('Error accepting friend request:', error);
    }
  };

  const handleDecline = async senderId => {
    try {
      dispatch(
        declineRequest({
          fromUserId: senderId, // The user who sent the request
          toUserId: userId,
        }),
      );
    } catch (error) {
      console.log('Error declining friend request:', error);
    }
  };

  const displayedRequests = showAll
    ? friendRequests
    : friendRequests?.slice(0, 3);

  return (
    <View>
      <View
        style={{
          marginVertical: 15,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Text
          style={{
            color: '#19295C',
            fontSize: 17,
            fontWeight: '700',
            fontFamily: 'Roboto-Regular',
          }}>
          Requests
          <Text style={{color: '#D70606'}}> ({friendRequests?.length})</Text>
        </Text>
        {/* Show "View All" button if there are more than 3 requests */}
        {
          <TouchableOpacity onPress={handleToggleShowAll}>
            <Text style={{color: '#1877F2', fontWeight: 'bold', marginTop: 10}}>
              {showAll ? 'Show Less' : 'View All'}
            </Text>
          </TouchableOpacity>
        }
      </View>

      {/* Display list of connection requests */}

      {displayedRequests?.map(item => (
        <View
          key={item._id}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
            backgroundColor: 'white',
            marginHorizontal: 25,
            padding: 20,
          }}>
          <View
            style={{
              flexDirection: 'row',
              // alignItems: 'flex-start',
              flex: 1,
            }}>
            <ProfilePicture
              profilePictureUri={item.profilePicture}
              width={50}
              height={50}
              borderRadius={25}
              marginRight={10}
            />
            <View>
              <Text
                onPress={() =>
                  navigation.navigate('UserProfile', {userId: item._id})
                }
                style={{fontWeight: 'bold', color: '#19295C', fontSize: 16}}>
                {item.name}
              </Text>
              <View>
                {friendRequests?.mutualFriends?.length ? (
                  friendRequests?.mutualFriends?.map(friend => (
                    <View>
                      <ProfilePicture
                        profilePictureUri={friend.profilePicture}
                        width={30}
                        height={30}
                        borderRadius={15}
                        marginRight={10}
                      />
                    </View>
                  ))
                ) : (
                  <Text style={{color: '#19295C'}}>No mutual friends</Text>
                )}
                {friendRequests?.mutualFriends?.length && (
                  <Text>
                    {friendRequests?.mutualFriends?.length} mutual friends
                  </Text>
                )}
              </View>
            </View>
          </View>
          <View>
            <TouchableOpacity
              onPress={() => handleAccept(item._id)}
              style={{
                backgroundColor: '#A274FF',
                padding: 7,
                paddingHorizontal: 20,
                borderRadius: 20,
                marginBottom: 10,
              }}>
              <Text
                style={{
                  color: 'white',
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}>
                Accept
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDecline(item._id)}
              style={{
                backgroundColor: '#F1F4F5',
                padding: 7,
                paddingHorizontal: 20,
                borderRadius: 20,
              }}>
              <Text
                style={{
                  color: '#1877F2',
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}>
                Reject
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
};

export default ConnectionRequests;
