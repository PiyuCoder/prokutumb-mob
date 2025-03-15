import {
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Barcode from '@kichiyaki/react-native-barcode-generator';
import Feather from 'react-native-vector-icons/Feather';
import {useSelector} from 'react-redux';

const Ticket = ({navigation, route}) => {
  const {item} = route?.params;
  const {user} = useSelector(state => state.auth);
  const qrValue = JSON.stringify({
    id: user?._id,
    name: user?.name,
  });

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
      <View style={styles.ticketContainer}>
        {/* Event Image */}
        <ImageBackground
          source={{uri: item?.profilePicture}}
          style={styles.imageBackground}
          imageStyle={{borderRadius: 18}}
          resizeMode="cover">
          <View style={styles.overlay} />
        </ImageBackground>

        <View style={{marginTop: 10, paddingHorizontal: 10}}>
          <Text style={styles.ticketTitle}>{item?.name}</Text>
          <Text
            numberOfLines={2} // Limits the text to one line
            ellipsizeMode="tail"
            style={styles.ticketDescription}>
            {item?.description}
          </Text>
        </View>

        {/* User Info & Event Type */}
        <View style={styles.infoContainer}>
          <View>
            <Text style={styles.eventInfo}>Name</Text>
            <Text style={styles.detail}>{user?.name || 'N/A'}</Text>
          </View>
          <View>
            <Text style={styles.eventInfo}>Type</Text>
            <Text style={styles.detail}>{item?.eventType} Event</Text>
          </View>
        </View>

        {/* Event Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.eventInfo}>
            📅 {item?.startDate} {item?.endDate ? `- ${item?.endDate}` : ''}
          </Text>
          <Text style={styles.eventInfo}>
            ⏰ {item?.startTime} - {item?.endTime} ({item?.timezone})
          </Text>
          <Text style={styles.eventInfo}>📍 {item?.address}</Text>

          {/* QR Code Section */}
          <View style={styles.qrContainer}>
            <Barcode value={qrValue || '123456789'} height={60} />
            <Text style={styles.qrText}>
              Scan your barcode at the entry gate
            </Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

export default Ticket;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginBottom: 16,
    paddingVertical: 10,
  },
  backButton: {
    padding: 10,
    backgroundColor: '#FFFFFF33',
    borderRadius: 8,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 10,
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
    width: 380,
    alignSelf: 'center',
    marginHorizontal: 15,
    maxHeight: '90%',
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
