import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import CommunityCard from '../components/CommunityCard';
import {useSelector} from 'react-redux';
import {axiosInstance} from '../api/axios';
import AntDesignIcons from 'react-native-vector-icons/AntDesign';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import FAIcon from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import EventCard from '../components/EventCard';
import SearchCommNEvent from '../components/SearchCommNEvent';
import Loader from '../components/Loader';

const MyCommOrEvents = ({navigation, route}) => {
  const [communities, setCommunities] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState(false);
  const [isActionModalVisible, setActionModalVisible] = useState(false);
  const [isEvent, setIsEvent] = useState(
    route.params?.screen === 'Communities' ? false : true,
  );
  const userId = route.params?.userId;

  const filteredCommunities = category
    ? communities?.filter(comm => comm?.category === category)
    : communities;

  const filteredEvents = category
    ? events?.filter(ev => ev?.category === category)
    : events;

  useEffect(() => {
    const fetchCommunitiesAndEvents = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          `/api/user/${userId}/communities-events`,
        );
        setCommunities(response.data.communities);
        setEvents(response.data.events);
        console.log(response.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchCommunitiesAndEvents();
    }
  }, [userId]);

  const renderList = (data, title) => (
    <View
      style={[
        styles.sectionWrapper,
        {marginBottom: title.includes('you May') ? 100 : 10},
      ]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {!data?.length && (
        <Text style={{color: 'gray'}}>
          No {isEvent ? 'event' : 'Community'} found. Create one.
        </Text>
      )}

      {data?.map(item =>
        !isEvent ? (
          <CommunityCard
            key={item?._id}
            isTrending={title.includes('Trending')}
            community={item}
            onPress={() =>
              navigation.navigate('CommunityHome', {communityId: item._id})
            }
            height={title.includes('Trending') ? 250 : 280}
            width={title.includes('Trending') ? 390 : 220}
            picHeight={title.includes('Trending') ? '100%' : 130}
          />
        ) : (
          <EventCard
            key={item._id}
            isTrending={title.includes('Trending')}
            event={item}
            height={title.includes('Trending') ? 250 : 280}
            width={title.includes('Trending') ? 390 : 220}
            picHeight={title.includes('Trending') ? '100%' : 130}
            full
            onPress={() =>
              navigation.navigate('EventHome', {eventId: item._id})
            }
          />
        ),
      )}
    </View>
  );
  return (
    <ScrollView style={styles.container}>
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
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={{paddingHorizontal: 10, marginBottom: 20}}
        horizontal>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 3}}>
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
      </ScrollView>

      {isEvent
        ? renderList(filteredEvents, 'My Events')
        : renderList(filteredCommunities, 'My Communities')}
    </ScrollView>
  );
};

export default MyCommOrEvents;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F4F5',
    paddingHorizontal: 5,
  },
  sectionWrapper: {
    paddingStart: 15,
    marginBottom: 10,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'black',
    marginBottom: 10,
    marginTop: 30,
    fontFamily: 'Jost-Bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    margin: 10,
    gap: 15,
    paddingEnd: 4,
  },
  filterButton: {
    padding: 5,
    paddingHorizontal: 9,
    backgroundColor: '#EDEDED',
    borderRadius: 10,
    marginHorizontal: 5,
    flex: 1,
  },

  filterButtonText: {
    color: '#000',
    fontSize: 13,
  },
  activeFilterButtonText: {
    color: 'white',
  },
});
