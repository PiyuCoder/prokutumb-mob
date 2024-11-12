import React, {useState, useEffect} from 'react';
import {View, Text, Image, TouchableOpacity, FlatList} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {fetchFriendRequests} from '../store/slices/authSlice';
import {useNavigation} from '@react-navigation/native';

const ConnectionRequests = ({isFeedView, userId}) => {
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
    !isFeedView && (
      <View>
        <Text
          style={{
            color: '#141414',
            fontSize: 15,
            fontWeight: 'bold',
            marginVertical: 15,
          }}>
          Connection Requests
        </Text>

        {/* Display list of connection requests */}
        <FlatList
          data={displayedRequests}
          keyExtractor={item => item._id} // assuming each request has a unique _id
          renderItem={({item}) => (
            <TouchableOpacity
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
          )}
        />

        {/* Show "View All" button if there are more than 3 requests */}
        {friendRequests?.length > 3 && (
          <TouchableOpacity onPress={handleToggleShowAll}>
            <Text style={{color: '#1A73E8', fontWeight: 'bold', marginTop: 10}}>
              {showAll ? 'Show Less' : 'View All'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    )
  );
};

export default ConnectionRequests;
