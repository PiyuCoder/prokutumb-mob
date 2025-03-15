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
  ScrollView,
  RefreshControl,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import CommunityCard from '../components/CommunityCard';
import {useSelector} from 'react-redux';
import {axiosInstance, axiosInstanceForm} from '../api/axios';
import {launchImageLibrary} from 'react-native-image-picker';
import AntDesignIcons from 'react-native-vector-icons/AntDesign';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import FAIcon from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {isAction} from '@reduxjs/toolkit';
import EventCard from '../components/EventCard';
import SearchCommNEvent from '../components/SearchCommNEvent';
import Loader from '../components/Loader';
import {useFocusEffect} from '@react-navigation/native';

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
  const [trendingCommunities, setTrendingCommunities] = useState([]);
  const [communitiesYouMayLike, setCommunitiesYouMayLike] = useState([]);
  const [communitiesForYou, setCommunitiesForYou] = useState([]);
  const [events, setEvents] = useState([]);
  const [eventsYouMayLike, setEventsYouMayLike] = useState([]);
  const [eventsForYou, setEventsForYou] = useState([]);
  const [trendingEvents, setTrendingEvents] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isEvent, setIsEvent] = useState(
    route.params?.screen === 'Communities' ? false : true,
  );
  const [modalType, setModalType] = useState(null);
  const [isActionModalVisible, setActionModalVisible] = useState(false);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const {user} = useSelector(state => state.auth);

  const fetchData = () => {
    const fetchCommunities = async () => {
      setLoading(true);
      try {
        if (user?._id) {
          const res = await axiosInstance.get(`/api/communities/${user?._id}`);
          if (res.status === 200) {
            setCommunities(res?.data?.allCommunities || []);
            setCommunitiesYouMayLike(res?.data?.communitiesYouMayLike || []);
            setCommunitiesForYou(res?.data?.communitiesForYou || []);
            setTrendingCommunities(res?.data?.trendingCommunities || []);
          }
        }
      } catch (error) {
        console.error('Error fetching communities:', error.message);
      }
    };

    const fetchEvents = async () => {
      try {
        const res = await axiosInstance.get(
          `/api/communities/events/fetchAllEvents/${user?._id}`,
        );
        if (res.status === 200) {
          setEvents(res?.data?.allEvents || []);
          setEventsForYou(res?.data?.forYou || []);
          setEventsYouMayLike(res?.data?.youMayLike || []);
          setTrendingEvents(res?.data?.trending || []);
        }
      } catch (error) {
        console.error('Error fetching events:', error.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };
    fetchCommunities();
    fetchEvents();
  };

  useFocusEffect(
    useCallback(() => {
      fetchData(); // Refresh data when screen is focused
    }, [user?._id]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const renderItem = useCallback(
    ({item, title}) =>
      isEvent ? (
        <EventCard
          isTrending={title.includes('Trending')}
          event={item}
          height={title.includes('Trending') ? 250 : 280}
          width={title.includes('Trending') ? 390 : 220}
          picHeight={title.includes('Trending') ? '100%' : 130}
          full
          onPress={() => navigation.navigate('EventHome', {eventId: item._id})}
        />
      ) : (
        <CommunityCard
          isTrending={title.includes('Trending')}
          community={item}
          onPress={() =>
            navigation.navigate('CommunityHome', {communityId: item._id})
          }
          height={title.includes('Trending') ? 250 : 280}
          width={title.includes('Trending') ? 390 : 220}
          picHeight={title.includes('Trending') ? '100%' : 130}
        />
      ),
    [isEvent, navigation], // Do NOT include `title` (as it's dynamic)
  );

  const renderHorizontalList = (data, title) => (
    <View style={[styles.sectionWrapper]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        data={data}
        horizontal
        keyExtractor={item => item._id}
        renderItem={({item}) => renderItem({item, title})} // Pass `title` correctly
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

  // Filtered data
  const filteredCommunities = category
    ? communities.filter(comm => comm?.category === category)
    : communities;

  const filteredCommunitiesForYou = category
    ? communitiesForYou.filter(comm => comm?.category === category)
    : communitiesForYou;

  const filteredCommunitiesYouMayLike = category
    ? communitiesYouMayLike.filter(comm => comm?.category === category)
    : communitiesYouMayLike;

  const filteredTrendingCommunities = category
    ? trendingCommunities.filter(comm => comm?.category === category)
    : trendingCommunities;

  const filteredEvents = category
    ? events.filter(ev => ev?.category === category)
    : events;

  const filteredEventsForYou = category
    ? eventsForYou.filter(ev => ev?.category === category)
    : eventsForYou;

  const filteredEventsYouMayLike = category
    ? eventsYouMayLike.filter(ev => ev?.category === category)
    : eventsYouMayLike;

  const filteredTrendingEvents = category
    ? trendingEvents.filter(ev => ev?.category === category)
    : trendingEvents;

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
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={{paddingBottom: 100}}
      style={styles.container}>
      <StatusBar backgroundColor="white" barStyle={'dark-content'} />
      {loading && <Loader isLoading={loading} />}
      <View style={styles.headerActions}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'white',
            borderRadius: 10,
            paddingHorizontal: 10,
            padding: 5,
            marginRight: 30,
          }}>
          <SearchCommNEvent isEvent={isEvent} iconColor={'black'} />
          <TouchableOpacity
            style={{borderWidth: 2, borderRadius: 20, borderColor: '#F0534F'}}
            onPress={() => setActionModalVisible(!isActionModalVisible)}>
            <AntDesignIcons name="plus" size={21} color="#F0534F" />
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
            <TouchableOpacity
              onPress={() => {
                setActionModalVisible(false);
                navigation.navigate('HelpScreen');
              }}
              style={styles.dropdownItem}>
              <Text style={[styles.dropdownItemText, {color: 'red'}]}>
                Report
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={{paddingHorizontal: 10, marginBottom: 20}}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 1}}>
          {[
            {name: 'Networking', color: '#EDE9FF'},
            {name: 'Business', color: '#FFF5D7'},
            {name: 'Technology', color: '#FFECEC'},
            {name: 'Marketing', color: '#E4FFEA'},
          ].map(cat => (
            <TouchableOpacity
              key={cat.name}
              style={[
                styles.filterButton,
                {
                  backgroundColor:
                    category === cat.name ? '#A274FF' : cat.color,
                  flexGrow: 1,
                },
              ]}
              onPress={() =>
                setCategory(prev => (prev === cat.name ? '' : cat.name))
              }>
              <Text
                style={[
                  styles.filterButtonText,
                  category === cat.name && styles.activeFilterButtonText,
                ]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={{flexDirection: 'row', marginBottom: 20}}>
        <TouchableOpacity
          onPress={() => {
            setIsEvent(true);
            setModalType(null);
          }}
          style={[
            styles.header,
            {borderColor: isEvent ? '#761CBC' : '#F1F4F5'},
          ]}>
          <Text
            style={[styles.headerText, {color: isEvent ? '#761CBC' : 'black'}]}>
            Events
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setIsEvent(false);
            setModalType(null);
          }}
          style={[
            styles.header,
            {borderColor: !isEvent ? '#761CBC' : '#F1F4F5'},
          ]}>
          <Text
            style={[
              styles.headerText,
              {color: !isEvent ? '#761CBC' : 'black'},
            ]}>
            Communities
          </Text>
        </TouchableOpacity>
      </View>
      {/* <Text style={{color: '#7C7C7C', fontSize: 12, marginLeft: 10}}>
        Find {isEvent ? 'events' : 'communities'} in
      </Text>
      <View style={styles.locationNameContainer}>
        <EvilIcons name="location" size={15} color="#333538" />
        <Text style={styles.locationNameText}>{'Barcelona'}</Text>
        <MaterialIcons name="keyboard-arrow-down" size={15} color="#333538" />
      </View> */}

      {category !== '' ? (
        isEvent ? (
          <>{renderHorizontalList(filteredEvents, 'Result (Events)')}</>
        ) : (
          <>
            {renderHorizontalList(filteredCommunities, 'Result (Communities)')}
          </>
        )
      ) : null}

      {isEvent ? (
        modalType === 'myEvents' ? (
          <>
            {renderHorizontalList(myEvents, 'My Events')}
            {renderHorizontalList(joinedEvents, 'Registered Events')}
          </>
        ) : (
          <>
            {renderHorizontalList(filteredTrendingEvents, 'Trending Events')}
            {renderHorizontalList(filteredEventsForYou, 'Events for you')}
            {renderHorizontalList(
              filteredEventsYouMayLike,
              'Events you May Like',
            )}
          </>
        )
      ) : modalType === 'myCommunities' ? (
        <>
          {renderHorizontalList(myCommunities, 'My Communities')}
          {renderHorizontalList(joinedCommunities, 'Joined Communities')}
        </>
      ) : (
        <>
          {renderHorizontalList(
            filteredTrendingCommunities?.length > 0
              ? filteredTrendingCommunities
              : filteredCommunities,
            'Trending Communities',
          )}
          {renderHorizontalList(
            filteredCommunitiesForYou,
            'Communities for you',
          )}
          {renderHorizontalList(
            filteredCommunitiesYouMayLike,
            'Communities you May Like',
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F4F5',
    paddingHorizontal: 5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    margin: 10,
    gap: 15,
    paddingEnd: 4,
    marginTop: 20,
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
  filterButton: {
    padding: 5,
    paddingHorizontal: 12,
    backgroundColor: '#EDEDED',
    borderRadius: 10,
    marginHorizontal: 3,
  },

  filterButtonText: {
    color: '#000',
    fontSize: 14,
  },
  activeFilterButtonText: {
    color: 'white',
  },
  locationNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  locationNameText: {
    marginHorizontal: 4,
    fontSize: 16,
    color: '#262627',
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
    borderBottomWidth: 2,
    padding: 8,
    paddingLeft: 0,
    marginLeft: 8,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22172A',
  },
  Btn: {
    backgroundColor: '#A274FF',
    padding: 6,
    borderRadius: 10,
    paddingHorizontal: 20,
    marginTop: 10,
    alignItems: 'center',
    flex: 1,
  },
  BtnText: {
    color: 'black',
    fontWeight: '500',
    fontSize: 13,
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

    // 👇 Fix stacking issue on iOS
    zIndex: 999, // Ensure dropdown is above everything
    elevation: 20, // Works for Android

    // Shadow for iOS
    shadowColor: 'black',
    shadowOpacity: 0.3,
    shadowOffset: {width: 3, height: 3},
    shadowRadius: 1,
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
    fontSize: 18,
    fontWeight: '700',
    color: 'black',
    marginBottom: 10,
    marginTop: 30,
    fontFamily: 'Jost-Bold',
  },
});
