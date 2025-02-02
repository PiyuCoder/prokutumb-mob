import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  StatusBar,
  ImageBackground,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {axiosInstance} from '../api/axios';
import {useSelector} from 'react-redux';
import Loader from '../components/Loader';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import Barcode from '@kichiyaki/react-native-barcode-generator';

const Tickets = ({navigation}) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const {user} = useSelector(state => state.auth);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/communities/tickets/${user?._id}`,
        );

        console.log(response?.data?.data);
        setTickets(response?.data?.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?._id]);

  if (loading) {
    return <Loader isLoading={loading} />;
  }

  const renderItem = ({item}) => {
    const qrValue = JSON.stringify({
      id: item?.buyer?._id,
      name: item?.buyer?.name,
    });

    return (
      <View style={styles.ticketContainer}>
        {/* Event Image */}
        <ImageBackground
          source={{uri: item?.event?.profilePicture}}
          style={styles.imageBackground}
          imageStyle={{borderRadius: 18}}
          resizeMode="cover">
          <View style={styles.overlay} />
        </ImageBackground>

        <View style={{marginTop: 10, paddingHorizontal: 10}}>
          <Text style={styles.ticketTitle}>{item?.event?.name}</Text>
          <Text style={styles.ticketDescription}>
            {item?.event?.description}
          </Text>
        </View>

        {/* User Info & Event Type */}
        <View style={styles.infoContainer}>
          <View>
            <Text style={styles.eventInfo}>Name</Text>
            <Text style={styles.detail}>{item?.buyer?.name || 'N/A'}</Text>
          </View>
          <View>
            <Text style={styles.eventInfo}>Type</Text>
            <Text style={styles.detail}>{item?.event?.eventType} Event</Text>
          </View>
        </View>

        {/* Event Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.eventInfo}>
            📅 {item?.event?.startDate} - {item?.event?.endDate}
          </Text>
          <Text style={styles.eventInfo}>
            ⏰ {item?.event?.startTime} - {item?.event?.endTime} (
            {item?.event?.timezone})
          </Text>
          <Text style={styles.eventInfo}>📍 {item?.event?.address}</Text>

          {/* QR Code Section */}
          <View style={styles.qrContainer}>
            <Barcode value={qrValue || '123456789'} height={60} />
            <Text style={styles.qrText}>
              Scan your barcode at the entry gate
            </Text>
          </View>
        </View>
      </View>
    );
  };
  return (
    <LinearGradient colors={['#91B5FD', '#F0DDFF']} style={styles.container}>
      <StatusBar hidden />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tickets</Text>
      </View>

      <FlatList
        data={tickets}
        keyExtractor={item => item?._id}
        renderItem={renderItem}
        horizontal
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tickets found.</Text>
        }
      />
    </LinearGradient>
  );
};

export default Tickets;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginBottom: 16,
    padding: 10,
  },
  backButton: {
    padding: 10,
    backgroundColor: '#FFFFFF33',
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
  },
  ticketContainer: {
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 10,
    borderRadius: 18,
    width: 370,
    alignSelf: 'center',
  },
  ticketTitle: {
    fontSize: 18,
    color: 'black',
  },
  detail: {
    fontSize: 16,
    color: 'black',
  },
  emptyText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 16,
  },
  imageBackground: {
    width: '100%',
    height: 200,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)', // Dark overlay for better text visibility
    borderRadius: 18,
  },
  detailsContainer: {
    padding: 15,
  },
  ticketTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  ticketDescription: {
    fontSize: 14,
    color: '#666',
    marginVertical: 5,
  },
  eventInfo: {
    fontSize: 13,
    color: '#555',
    marginBottom: 3,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#007bff',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  qrContainer: {
    padding: 20,
    overflow: 'hidden',
  },
  qrText: {
    color: 'black',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 10,
  },
});
