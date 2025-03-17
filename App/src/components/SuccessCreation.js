import {
  ImageBackground,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';

const SuccessCreation = ({navigation, route}) => {
  const {isEvent, isRegistered} = route?.params;
  const {user} = useSelector(state => state.auth);
  const event = route?.params?.event || {};
  const [timer, setTimer] = React.useState(3);

  const sharePost = async () => {
    try {
      const result = await Share.share({
        message: `Check out this event`,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Event shared with activity:', result.activityType);
        } else {
          console.log('Post shared!');
          // Increment the share count
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  useEffect(() => {
    if (isRegistered) {
      setTimeout(() => {
        navigation.replace('TicketScreen', {item: event});
      }, 3000);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <ImageBackground
        source={require('../assets/success-img.png')}
        style={styles.image}
      />
      <Text style={styles.congrats}>
        Congratulations!!! {user?.name?.split(' ')[0]}
      </Text>
      <Text
        style={{
          textAlign: 'center',
          fontSize: 16,
          color: 'black',
          marginTop: 7,
        }}>
        {!isRegistered
          ? isEvent
            ? 'Your Event is Live!!!'
            : 'Your Community is Live!!!'
          : 'You are Registered'}
      </Text>
      {/* <TouchableOpacity
        onPress={sharePost}
        style={{
          backgroundColor: '#A274FF',
          padding: 18,
          alignSelf: 'center',
          borderRadius: 10,
          width: 200,
          marginTop: 30,
        }}>
        <Text
          style={{
            color: 'white',
            fontWeight: '500',
            fontSize: 16,
            textAlign: 'center',
          }}>
          Share
        </Text>
      </TouchableOpacity> */}
      {!isRegistered ? (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Dashboard', {
              screen: 'Communities',
              params: {screen: isEvent ? 'Events' : 'Communities'},
            });
          }}
          style={{
            backgroundColor: 'white',
            padding: 14,
            alignSelf: 'center',
            borderRadius: 10,
            width: 200,
            marginTop: 30,
            borderWidth: 2,
          }}>
          <Text
            style={{
              color: 'black',
              fontWeight: '500',
              fontSize: 16,
              textAlign: 'center',
            }}>
            Close
          </Text>
        </TouchableOpacity>
      ) : (
        <Text
          style={{
            textAlign: 'center',
            color: 'gray',
            fontSize: 16,
            marginTop: 15,
          }}>
          Generating ticket in {timer}
        </Text>
      )}
    </View>
  );
};

export default SuccessCreation;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  image: {
    height: 400,
  },
  congrats: {
    fontWeight: 'bold',
    fontSize: 25,
    color: 'black',
    textAlign: 'center',
  },
});
