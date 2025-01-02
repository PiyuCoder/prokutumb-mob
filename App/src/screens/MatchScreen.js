import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {axiosInstance} from '../api/axios';
import {useSelector} from 'react-redux';
import SearchPeople from '../components/SearchPeople';
import RenderUserCard from '../components/RenderUserCard';
import AntDesignIcons from 'react-native-vector-icons/AntDesign';

const people = [
  {
    _id: '1',
    name: 'John Doe',
    profilePicture: 'https://via.placeholder.com/150',
    distance: 120,
    designation: 'UI Developer',
  },
  {
    _id: '2',
    name: 'Tony Stark',
    profilePicture: 'https://via.placeholder.com/150',
    distance: 120,
    designation: 'MERN Developer',
  },
  {
    _id: '3',
    name: 'Spiderman',
    profilePicture: 'https://via.placeholder.com/150',
    distance: 120,
    designation: 'React Developer',
  },
  {
    _id: '4',
    name: 'Captain America',
    profilePicture: 'https://via.placeholder.com/150',
    distance: 120,
    designation: 'Product Manager',
  },
  {
    _id: '5',
    name: 'Thor',
    profilePicture: 'https://via.placeholder.com/150',
    distance: 120,
    designation: 'Business Analyst',
  },
];

const MatchScreen = ({route}) => {
  const navigation = useNavigation();
  const [topNetworkers, setTopNetworkers] = useState([]);
  const [peopleYouMayKnow, setPeopleYouMayKnow] = useState([]);
  const {user} = useSelector(state => state.auth);
  const [accessToken, setAccessToken] = useState('');

  useEffect(() => {
    const fetchTopNetworkers = async () => {
      const response = await axiosInstance.get('/api/user/top-networkers');
      setTopNetworkers(response?.data);
    };

    const fetchPeopleYouMayKnow = async () => {
      const response = await axiosInstance.get(
        `/api/user/people-you-may-know/${user?._id}`,
      );
      setPeopleYouMayKnow(response?.data);
    };

    // const fetchSearchResults = async () => {
    //   const response = await fetch(`https://your-backend-url.com/api/search-people?q=${searchQuery}`);
    //   const data = await response.json();
    //   setSearchResults(data);
    // };

    fetchTopNetworkers();
    fetchPeopleYouMayKnow();
  }, []);

  const renderUserCard = user => (
    <TouchableOpacity key={user._id}>
      <View style={styles.userCard}>
        <ImageBackground
          source={{uri: user.profilePicture}}
          style={styles.profilePicture}
          imageStyle={styles.profilePictureImage}>
          <LinearGradient
            colors={['#4B164C00', '#4B164C99', '#4B164CF2']}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            style={styles.overlay}
          />
          <View style={styles.overlayContent}>
            <View style={styles.distanceContainer}>
              <Text style={styles.userDistance}>{user.distance} m</Text>
            </View>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userLocation}>{user.location}</Text>
          </View>
        </ImageBackground>
      </View>
    </TouchableOpacity>
  );

  const handleBackPress = () => {
    navigation.goBack(); // Navigate back to the previous screen
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{paddingVertical: 10, paddingBottom: 65}}>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          margin: 10,
        }}>
        <TouchableOpacity onPress={handleBackPress} style={styles.iconButtons}>
          <AntDesignIcons name="arrowleft" size={30} color="#585C60" />
        </TouchableOpacity>
        <Text style={styles.title}>Connect</Text>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingEnd: 4,
          }}>
          <SearchPeople />
          {/* <TouchableOpacity style={styles.iconButtons}>
            <Image source={lensIcon} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButtons}>
            <Image source={filterIcon} />
          </TouchableOpacity> */}
        </View>
      </View>
      <View style={styles.cardsContainer}>
        {people?.map(item => (
          <RenderUserCard key={item._id} item={item} />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  icon: {
    width: 30,
    height: 30,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#22172A',
    textAlign: 'left',
  },
  iconButtons: {
    padding: 2,
    height: 40,
    width: 40,
    borderRadius: 20,
    borderColor: '#4b164c5a',
    borderWidth: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4B164C',
    paddingLeft: 15,
    marginVertical: 10,
  },
  horizontalScroll: {
    paddingHorizontal: 10,
    minHeight: 150,
  },
  noUsersText: {
    color: 'gray',
    textAlign: 'center',
  },
  userCard: {
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    marginVertical: 10,
    width: 140,
    height: 200,
    marginHorizontal: 5,
  },
  profilePicture: {
    width: '100%',
    height: '100%',
  },
  profilePictureImage: {
    borderRadius: 10,
  },
  overlay: {
    position: 'absolute',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  userLocation: {
    marginBottom: 10,
    color: '#FFFFFF',
  },
  distanceContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    padding: 2,
    borderRadius: 10,
  },
  userDistance: {
    color: 'white',
  },
});

export default MatchScreen;
