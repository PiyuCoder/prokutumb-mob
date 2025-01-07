import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
  StatusBar,
  Modal,
  TextInput,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import CommunityCard from '../components/CommunityCard';
import {useSelector} from 'react-redux';
import {axiosInstance, axiosInstanceForm} from '../api/axios';
import {launchImageLibrary} from 'react-native-image-picker';
import AntDesignIcons from 'react-native-vector-icons/AntDesign';
import IonIcons from 'react-native-vector-icons/Ionicons';
import {ScrollView} from 'react-native-gesture-handler';
import {isAction} from '@reduxjs/toolkit';
import EventCard from '../components/EventCard';
import SearchCommNEvent from '../components/SearchCommNEvent';

// const events = [
//   {
//     _id: '1',
//     name: 'Event One',
//     profilePicture:
//       'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdkxaQMX4NW8V5JvJ1hV1laDEmbgbPNvNEUA&s',
//     date: '12-Jan-2025',
//     time: '12:00 PM',
//     location: 'Queens, New York',
//     followers: 100,
//     createdBy: {name: 'John Doe'},
//   },
//   {
//     _id: '2',
//     name: 'Event Two',
//     profilePicture:
//       'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdkxaQMX4NW8V5JvJ1hV1laDEmbgbPNvNEUA&s',
//     date: '19-Jan-2025',
//     time: '02:00 PM',
//     location: 'Queens, New York',
//     followers: 100,
//     createdBy: {name: 'Alice Doe'},
//   },
// ];

export default function Communities({navigation, route}) {
  const [communities, setCommunities] = useState([]);
  const [events, setEvents] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isEvent, setIsEvent] = useState(
    route.params?.screen === 'Events' ? true : false,
  );
  const [modalType, setModalType] = useState(null);
  const [isActionModalVisible, setActionModalVisible] = useState(false);

  const {user} = useSelector(state => state.auth);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        if (user?._id) {
          const res = await axiosInstance.get('/api/communities');
          if (res.status === 200) {
            setCommunities(res?.data?.data || []);
          }
        }
      } catch (error) {
        console.error('Error fetching communities:', error.message);
      }
    };

    const fetchEvents = async () => {
      try {
        const res = await axiosInstance.get(
          '/api/communities/events/fetchAllEvents',
        );
        if (res.status === 200) {
          setEvents(res?.data?.data || []);
        }
      } catch (error) {
        console.error('Error fetching events:', error.message);
      }
    };

    fetchCommunities();
    fetchEvents();
  }, [user?._id, isEvent]);

  const renderHorizontalList = (data, title) => (
    <View
      style={[
        styles.sectionWrapper,
        {marginBottom: title === 'Most Popular' ? 100 : 10},
      ]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        data={data}
        horizontal
        keyExtractor={item => item._id}
        renderItem={({item}) =>
          !isEvent ? (
            <CommunityCard
              community={item}
              onPress={() =>
                navigation.navigate('CommunityHome', {communityId: item._id})
              }
            />
          ) : (
            <EventCard
              event={item}
              height={280}
              width={220}
              picHeight={130}
              full
              onPress={() =>
                navigation.navigate('EventHome', {eventId: item._id})
              }
            />
          )
        }
        ListEmptyComponent={
          <Text style={styles.noUsersText}>
            No {isEvent ? 'Events' : 'Communities'} found
          </Text>
        }
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScroll}
      />
    </View>
  );

  const myCommunities = communities?.filter(
    community => community.createdBy?._id === user?._id,
  );
  const joinedCommunities = communities?.filter(
    community =>
      community.members.some(member => member._id === user?._id) &&
      community.createdBy?._id !== user?._id,
  );

  const myEvents = events?.filter(event => event.createdBy?._id === user?._id);
  const joinedEvents = events?.filter(
    event =>
      event.members?.some(member => member._id === user?._id) &&
      event.createdBy?._id !== user?._id,
  );

  return (
    <ScrollView style={styles.container}>
      <StatusBar backgroundColor="white" barStyle={'dark-content'} />
      <View style={styles.headerActions}>
        <View>
          <TouchableOpacity
            onPress={() => {
              setIsEvent(!isEvent);
              setModalType(null);
            }}
            style={styles.header}>
            <Text style={styles.headerText}>
              {isEvent ? 'Event' : 'Community'}
            </Text>
            <AntDesignIcons name="caretdown" size={15} color="#585C60" />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              width: 100,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderWidth: 1,
              borderColor: '#4b164c5a',
              borderRadius: 25,
              paddingHorizontal: 5,
              padding: 3,
            }}>
            <IonIcons name="earth" size={15} color="#585C60" />
            <Text style={{color: 'gray'}}>Global</Text>
            <AntDesignIcons name="caretdown" size={15} color="#585C60" />
          </TouchableOpacity>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 7}}>
            <TouchableOpacity style={styles.Btn}>
              <Text style={styles.BtnText}>Filters</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.Btn}>
              <Text style={styles.BtnText}>Category</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
          <SearchCommNEvent isEvent={isEvent} iconColor={'black'} />
          <TouchableOpacity
            style={styles.iconButtons}
            onPress={() => setActionModalVisible(!isActionModalVisible)}>
            <AntDesignIcons name="plus" size={21} color="black" />
          </TouchableOpacity>
        </View>
        {isActionModalVisible && (
          <View style={[styles.dropdownMenu, {zIndex: 1000}]}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setActionModalVisible(false);
                isEvent
                  ? navigation.navigate('CreateEvent', {myCommunities})
                  : navigation.navigate('CreateCommunity');
              }}>
              <Text style={styles.dropdownItemText}>
                Create {isEvent ? 'Event' : 'Community'}
              </Text>
            </TouchableOpacity>
            {modalType === 'myCommunities' || modalType === 'myEvents' ? (
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setActionModalVisible(false);
                  setModalType(null);
                }}>
                <Text style={styles.dropdownItemText}>
                  Other {isEvent ? 'Events' : 'Communities'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setActionModalVisible(false);
                  setModalType(isEvent ? 'myEvents' : 'myCommunities');
                }}>
                <Text style={styles.dropdownItemText}>
                  My {isEvent ? 'Events' : 'Communities'}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.dropdownItem}>
              <Text style={[styles.dropdownItemText, {color: 'red'}]}>
                Report
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {isEvent ? (
        modalType === 'myEvents' ? (
          <>
            {renderHorizontalList(myEvents, 'My Events')}
            {renderHorizontalList(joinedEvents, 'Registered Events')}
          </>
        ) : (
          <>
            {renderHorizontalList(events, 'Trending For You')}
            {renderHorizontalList(events, 'Most Popular')}
          </>
        )
      ) : modalType === 'myCommunities' ? (
        <>
          {renderHorizontalList(myCommunities, 'My Communities')}
          {renderHorizontalList(joinedCommunities, 'Joined Communities')}
        </>
      ) : (
        <>
          {renderHorizontalList(communities, 'Trending For You')}
          {renderHorizontalList(communities, 'Most Popular')}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    // paddingBottom: 500,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    margin: 10,
    gap: 15,
    paddingEnd: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  imagePickerButton: {
    backgroundColor: '#4B164C',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  imagePickerText: {
    color: 'white',
    fontSize: 16,
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    width: 200,
  },
  headerText: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#22172A',
  },
  Btn: {
    backgroundColor: '#A274FF',
    padding: 3,
    width: 100,
    borderRadius: 25,
    paddingHorizontal: 15,
    marginTop: 10,
    alignItems: 'center',
  },
  BtnText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 15,
    textAlign: 'center',
  },
  listContent: {
    minHeight: '100%',
    paddingHorizontal: 10,
    paddingBottom: 20,
    backgroundColor: 'white',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 50, // Adjust position relative to the action icon
    right: 30,
    width: 160,
    backgroundColor: '#FFF',
    borderRadius: 8,
    elevation: 20, // Adds shadow for Android
    shadowColor: 'black', // Adds shadow for iOS
    shadowOpacity: 0.3,
    shadowOffset: {width: 3, height: 3},
    shadowRadius: 1,
    zIndex: 2, // Ensures the dropdown is on top of other elements
  },
  dropdownItem: {
    padding: 15,
    // borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  dropdownItemText: {
    fontSize: 13,
    color: 'black',
  },
  cardWrapper: {
    flex: 1,
    margin: 8,
    maxWidth: '60%', // Ensure three columns fit evenly
    borderWidth: 1,
    borderRadius: 10,
  },
  trendingCardWrapper: {
    marginHorizontal: 8,
  },
  iconButtons: {
    padding: 2,
    height: 50,
    width: 50,
    borderRadius: 25,
    borderColor: '#4b164c5a',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userCard: {
    borderRadius: 10,
    overflow: 'hidden',
    aspectRatio: 0.75,
    padding: 10,
  },
  trendingUserCard: {
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    height: 170,
    width: 110,
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
  horizontalScroll: {
    // paddingHorizontal: 10,
  },
  noTrendingContainer: {
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  noUsersText: {
    textAlign: 'center',
    color: 'gray',
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: '#4B164C',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionWrapper: {
    paddingStart: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#191970',
    marginBottom: 30,
    fontFamily: 'Jost-Bold',
  },
});
