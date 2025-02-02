import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Share,
} from 'react-native';
import SearchPeople from '../components/SearchPeople';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import ProfilePicture from '../components/ProfilePicture';
import {useDispatch, useSelector} from 'react-redux';
import {populateProfile} from '../store/slices/profileSlice';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {axiosInstance} from '../api/axios';
import Loader from '../components/Loader';
import {useEffect, useState} from 'react';
import {logout} from '../store/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {disconnectSocket} from '../socket';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

const features = [
  {
    id: '1',
    name: 'Share Profile',
    icon: <Entypo name="slideshare" size={25} color="#FF0000" />,
    path: 'ShareScreen',
  },
  {
    id: '2',
    name: 'Messages',
    icon: <Ionicons name="chatbubbles" size={25} color="#07A6FF" />,
    path: 'Message',
  },
  {
    id: '3',
    name: 'Saved Posts',
    icon: <Ionicons name="bookmark" size={25} color="#01DDEB" />,
    path: 'Message',
  },
  {
    id: '4',
    name: 'Rewards',
    icon: (
      <MaterialCommunityIcons name="treasure-chest" size={25} color="#F6DF0B" />
    ),
    path: 'Message',
  },
];

const MenuScreen = ({navigation}) => {
  const {user} = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const [communities, setCommunities] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCommunitiesAndEvents = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/user/${user?._id}/communities-events`,
        );
        setCommunities(response.data.communities);
        setEvents(response.data.events);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchCommunitiesAndEvents();
    }
  }, [user?._id]);

  const handleLogout = async () => {
    await GoogleSignin.signOut();
    dispatch(logout());
    AsyncStorage.removeItem('authToken');
    AsyncStorage.removeItem('user');
    disconnectSocket();
    navigation.replace('Login');
  };

  if (loading) return <Loader isLoading={loading} />;
  // if (error) return <Text style={styles.errorText}>Error: {error}</Text>;

  const renderCard = ({item}, type) => (
    <View>
      <TouchableOpacity
        onPress={() =>
          type === 'community'
            ? navigation.navigate('CommunityHome', {communityId: item._id})
            : navigation.navigate('EventHome', {eventId: item._id})
        }
        style={styles.card}>
        <Image source={{uri: item.profilePicture}} style={styles.cardImage} />
      </TouchableOpacity>
      <Text style={styles.cardText}>{item.name}</Text>
    </View>
  );

  const renderFeature = ({item}) => (
    <TouchableOpacity
      onPress={() => navigation.navigate(`${item.path}`)}
      style={styles.gridcard}>
      {item?.icon}
      <Text style={styles.gridcardText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const shareReferralCode = async () => {
    try {
      const message = `Use my referral code ${user?.referralCode} to sign up! 🚀`;

      await Share.share({
        title: 'Refer & Earn!',
        message, // This will be shared
      });
    } catch (error) {
      console.error('Error sharing referral code:', error);
    }
  };

  return (
    <FlatList
      ListHeaderComponent={
        <View style={styles.header}>
          <View
            style={{
              flexDirection: 'row',
              gap: 20,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              backgroundColor: 'white',
              padding: 25,
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20,
              paddingTop: 40,
            }}>
            <Text style={styles.headerText}>Menu</Text>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 7,
              }}>
              {/* <TouchableOpacity style={styles.iconButtons}>
                <Ionicons name="settings-sharp" size={25} color="#2D3F7B" />
              </TouchableOpacity> */}
              <SearchPeople />
            </View>
          </View>
          <View style={styles.profileCard}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <ProfilePicture
                profilePictureUri={user?.profilePicture}
                width={70}
                height={70}
                borderRadius={35}
                marginRight={10}
              />
              <View>
                <Text
                  style={{
                    fontSize: 20,
                    color: '#19295C',
                    fontWeight: '500',
                  }}>
                  {user?.name}
                </Text>
                <Text style={{color: '#99A1BE'}}>
                  @{user?.name?.toLowerCase()?.split(' ')?.join('_')}
                </Text>
              </View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 7}}>
              <TouchableOpacity
                onPress={() => {
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
                }}
                style={[
                  styles.iconButtons,
                  {height: 35, width: 35, borderRadius: 13},
                ]}>
                <Ionicons name="pencil" size={20} color="#2D3F7B" />
              </TouchableOpacity>
              {/* <TouchableOpacity
                style={[
                  styles.iconButtons,
                  {height: 35, width: 35, borderRadius: 13},
                ]}>
                <Feather name="chevron-down" size={20} color="#2D3F7B" />
              </TouchableOpacity> */}
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 25,
              marginVertical: 20,
            }}>
            <Text style={styles.sectionTitle}>Your Communities</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('MyCommOrEvents', {
                  screen: 'Communities',
                  userId: user?._id,
                })
              }>
              <Text style={{color: '#1877F2'}}>See all</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={communities}
            renderItem={item => renderCard(item, 'community')}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            ListEmptyComponent={<Text>No Communities</Text>}
          />

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 25,
              marginVertical: 20,
            }}>
            <Text style={styles.sectionTitle}>Your Events</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('MyCommOrEvents', {
                  screen: 'Events',
                  userId: user?._id,
                })
              }>
              <Text style={{color: '#1877F2'}}>See all</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={events}
            renderItem={item => renderCard(item, 'event')}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            ListEmptyComponent={<Text>No Events</Text>}
          />
          <View style={{paddingHorizontal: 16, marginBottom: 20}}>
            <Text
              style={[
                styles.sectionTitle,
                {marginVertical: 20, textAlign: 'center'},
              ]}>
              Features
            </Text>
            <FlatList
              data={features}
              renderItem={renderFeature}
              keyExtractor={item => item.id}
              numColumns={2}
              columnWrapperStyle={styles.row}
              contentContainerStyle={styles.grid}
              showsVerticalScrollIndicator={false}
            />
            <TouchableOpacity
              onPress={() => navigation.navigate('Tickets')}
              style={styles.gridcard}>
              <Entypo name="ticket" size={25} color="#FF0000" />
              <Text
                style={{
                  color: '#19295C',
                  textAlign: 'center',
                  fontWeight: '500',
                }}>
                My Tickets{' '}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={shareReferralCode}
              style={[styles.gridcard, {marginTop: 10}]}>
              {/* <Entypo name="ticket" size={25} color="#FF0000" /> */}
              <Text
                style={{
                  color: '#19295C',
                  textAlign: 'center',
                  fontWeight: '500',
                }}>
                Refer: {user?.referralCode}
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              paddingHorizontal: 25,
              marginVertical: 20,
            }}>
            <Text style={[styles.sectionTitle, {marginBottom: 20}]}>
              Help & Support
            </Text>
            <TouchableOpacity
              style={[
                styles.gridcard,
                {marginBottom: 10, justifyContent: 'flex-start'},
              ]}>
              <Ionicons name="chatbubble-ellipses" size={25} color="#99A1BE" />
              <Text style={{color: '#99A1BE'}}>Help Center</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.gridcard,
                {marginBottom: 20, justifyContent: 'flex-start'},
              ]}>
              <Ionicons name="chatbubble-ellipses" size={25} color="#99A1BE" />
              <Text style={{color: '#99A1BE'}}>Terms & Policies</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            style={[styles.gridcard, {marginHorizontal: 25}]}>
            <MaterialCommunityIcons name="logout" size={25} color="#F72B2B" />
            <Text style={{color: '#F72B2B', fontWeight: '500'}}>Logout</Text>
          </TouchableOpacity>
        </View>
      }
      data={[]}
      renderItem={null}
      keyExtractor={() => Math.random()}
    />
  );
};

export default MenuScreen;

const styles = StyleSheet.create({
  header: {paddingBottom: 100},
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#A274FF',
    textAlign: 'center',
  },
  profileCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: 'white',
    marginHorizontal: 25,
    marginTop: 15,
    padding: 20,
    borderRadius: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#19295C',
  },
  horizontalList: {
    paddingBottom: 16,
    paddingHorizontal: 25,
  },
  card: {
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 2,
    width: 120,
  },
  cardImage: {
    width: '100%',
    height: 110,
  },
  cardText: {
    padding: 8,
    fontSize: 14,
    textAlign: 'center',
    color: '#99A1BE',
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
  grid: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gridcard: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    padding: 16,
    paddingVertical: 20,
    elevation: 3,
    gap: 7,
  },
  icon: {
    width: 40,
    height: 40,
    // marginBottom: 8,
  },
  gridcardText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    color: '#19295C',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});
