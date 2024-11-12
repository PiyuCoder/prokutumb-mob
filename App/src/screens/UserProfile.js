import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import * as Progress from 'react-native-progress';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {axiosInstance} from '../api/axios';
import {useSelector} from 'react-redux';
import Loader from '../components/Loader';

const backIcon = require('../assets/icons/back.png');

const UserProfile = ({route}) => {
  const {userId} = route.params;
  const currentUser = useSelector(state => state.auth?.user);
  const [user, setUser] = useState([]);
  const [loading, setLoading] = useState(false);
  const [webData, setWebData] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Connect');
  const navigation = useNavigation(); // Hook for navigation

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

          // Check if they are already connected
          if (res.data.user.isAlreadyConnected) {
            setConnectionStatus('Message');
          } else {
            const requestSent = res.data.user.friendRequests?.some(
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

  console.log(connectionStatus);

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
      } else {
        console.log('Failed to accept the request.');
      }
    } catch (error) {
      console.log('Error accepting friend request:', error);
    }
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
              className="bg-[#DD88CF] rounded-full p-2 px-4 flex items-center justify-center">
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
                color="#DD88CF"
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
        <Image
          source={
            user.profilePicture
              ? {uri: user.profilePicture}
              : require('../assets/default-pp.png')
          }
          style={styles.profilePicture}
        />

        {/* Overlay with Linear Gradient */}
        <LinearGradient
          colors={['#4B164C00', '#4B164C99', '#4B164CF2']}
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}
          style={styles.overlay}
        />
        <View style={styles.detailsContainer}>
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
              className="bg-[#DD88CF] z-10 rounded-full p-2 px-4 flex items-center justify-center mt-4">
              <Text className="text-white font-bold">Message</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.mainCard}>
        {/* Why You May Connect Section */}
        <View style={styles.titleSection}>
          <Text style={styles.sectionTitle}>Why You May Connect</Text>
        </View>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 10,
          }}>
          {user?.whyConnect?.map((item, index) => (
            <View key={index} style={styles.whyConnectCard}>
              <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>
                {item}
              </Text>
            </View>
          ))}
        </View>
        {/* About Section */}
        <View style={styles.titleSection}>
          <Text style={styles.sectionTitle}>About</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionText}>{user.about}</Text>
        </View>

        {/* Experience Section */}
        <View style={styles.titleSection}>
          <Text style={styles.sectionTitle}>Experience</Text>
        </View>

        <View style={styles.card}>
          {user?.experience?.map((exp, index) => (
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

        {/* On the Web Section */}
        <View style={styles.titleSection}>
          <Text style={styles.sectionTitle}>On the Web</Text>
          {/* <Image style={{height: 15, width: 15}} source={penIcon} /> */}
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
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F9F9F9',
  },
  mainCard: {
    backgroundColor: '#DD88CF',
    padding: 20,
    borderTopStartRadius: 30,
    borderTopEndRadius: 30,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    marginTop: -50,
    zIndex: 2,
  },
  profileCard: {
    position: 'relative',
    alignItems: 'center',
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
  detailsContainer: {
    position: 'absolute',
    bottom: 100,
  },
  userName: {
    // position: 'absolute',
    // bottom: 120,
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FFFFFF',
    zIndex: 2,
  },
  userLocation: {
    // position: 'absolute',
    // bottom: 100,
    fontSize: 16,
    textAlign: 'center',
    color: 'white',
    marginTop: 5,
    zIndex: 2,
  },
  card: {
    backgroundColor: '#855BFD',
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
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white',
  },
  sectionText: {
    fontSize: 16,
    color: 'white',
  },
  whyConnectCard: {
    backgroundColor: '#cb066f',
    flex: 1,
    padding: 8,
    height: 100,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  experienceItem: {
    marginBottom: 10,
  },
  experienceTitle: {
    color: 'white',
  },
  experienceCompany: {
    color: 'white',
    fontWeight: 'bold',
  },
  experienceDuration: {
    color: 'white',
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
});

export default UserProfile;
