import React, {useState, useEffect} from 'react';
import {View, Text, Image, TouchableOpacity, FlatList} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {fetchFriendRequests} from '../store/slices/authSlice';
import {useNavigation} from '@react-navigation/native';
import ProfilePicture from './ProfilePicture';

const ConnectionRequests = ({userId}) => {
  const {friendRequests} = useSelector(state => state.auth);
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

  // Determine the requests to display (only 3 initially if not expanded)
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
        <TouchableOpacity
          key={item._id}
          onPress={() =>
            navigation.navigate('UserProfile', {userId: item._id})
          }>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 10,
            }}>
            <Image
              source={{uri: item.profilePicture}}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                marginRight: 10,
              }}
            />
            <ProfilePicture
              profilePictureUri={item.profilePicture}
              width={40}
              height={40}
              borderRadius={20}
              marginRight={10}
            />
            <View>
              <Text style={{fontWeight: 'bold', color: '#141414'}}>
                {item.name}
              </Text>
              {item.designation && (
                <Text style={{color: '#555'}}>{item.designation}</Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default ConnectionRequests;
