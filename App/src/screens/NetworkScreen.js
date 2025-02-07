import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  TextInput,
  Keyboard,
  ScrollView,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import Voice from '@react-native-voice/voice';
import {PermissionsAndroid, Platform} from 'react-native';
import {axiosInstance} from '../api/axios';
import {useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import Sound from 'react-native-sound';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import Loader from '../components/Loader';

const NetworkScreen = ({navigation, route}) => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [messages, setMessages] = useState([]);
  const scrollViewRef = useRef();
  const {user} = useSelector(state => state.auth);
  const queryType = route?.params?.queryType
    ? route?.params?.queryType
    : 'profile';
  const id = route?.params?.id;

  useEffect(() => {
    // Fetch previous messages on load
    const fetchMessages = async () => {
      const res = await axiosInstance.get(`/api/interactions/${user?._id}`);
      setMessages(res?.data);
      setIsFetching(false);
      // console.log('Response chats', res?.data);
    };
    fetchMessages();
  }, [user?._id]);

  useEffect(() => {
    // Scroll to the end of the ScrollView when messages change
    scrollViewRef.current?.scrollToEnd({animated: true});
  }, [messages, isFetching]);

  useEffect(() => {
    // Monitor keyboard visibility
    const keyboardShowListener = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardVisible(true),
    );
    const keyboardHideListener = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false),
    );

    // Cleanup listeners on unmount
    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, []);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  useEffect(() => {
    const initializeVoice = async () => {
      console.log('Initializing voice recognition...');
      const hasPermission = await requestMicrophonePermission();
      if (hasPermission) {
        console.log('Microphone permission granted.');

        Voice.onSpeechStart = () => {
          console.log('Speech recognition started');
          setIsListening(true);
        };

        Voice.onSpeechError = error => {
          console.error('Speech error:', error);
          setMessage('');
        };
        Voice.onSpeechEnd = () => {
          console.log('Speech recognition ended');
          setIsListening(false);
        };
        Voice.onSpeechResults = event => {
          console.log('Speech results:', event.value);
          if (event.value && event.value[0]) {
            setMessage(event.value[0]);
            sendMessage(event.value[0]);
          }
        };
      } else {
        console.log('Microphone permission not granted.');
      }
    };

    initializeVoice();

    // Cleanup listeners on unmount
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
      console.log('Voice listeners removed on unmount.');
    };
  }, []);

  const requestMicrophonePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message:
              'This app needs access to your microphone to recognize speech.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const formatTime = dateString => {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0'); // Get hours and pad to 2 digits
    const minutes = date.getMinutes().toString().padStart(2, '0'); // Get minutes and pad to 2 digits
    return `${hours} ${minutes}`; // Return formatted string
  };

  function filterValidResponses(data, queryType) {
    return data.filter(response => {
      const parts = response.split(' ');
      if (parts.length <= 2 || !['1', '2', '3'].includes(parts[1]))
        return false;

      // Apply additional filtering based on queryType
      if (queryType === 'profile' && ['2', '3'].includes(parts[1]))
        return false;
      if (queryType === 'community' && ['1', '2'].includes(parts[1]))
        return false;
      if (queryType === 'event' && ['1', '3'].includes(parts[1])) return false;

      return true;
    });
  }

  const sendMessage = async query => {
    const currentTime = new Date().toISOString();

    // Add user query to local state with a loading state for AI response
    setMessages(prev => [
      ...prev,
      {
        query,
        response: [] /* Placeholder for AI response */,
        createdAt: currentTime,
        loading: true,
      },
    ]);

    try {
      const res = await axiosInstance.post('/api/interactions', {
        userId: user?._id,
        query,
        queryType,
        id,
      });

      const data = res.data; // Get response data directly
      console.log('Data: ', data);

      const validResponses = filterValidResponses(data.response, queryType);

      // console.log('parsedResponse', parsedResponse);
      setMessages(prev => {
        // Update the latest message with the actual AI response
        const updatedMessages = [...prev];
        const lastMessageIndex = updatedMessages.length - 1;
        updatedMessages[lastMessageIndex] = {
          query: data.query,
          response: validResponses || [],
          createdAt: data.createdAt || currentTime,
        };

        // console.log('updatedMessages: ', updatedMessages[lastMessageIndex]);
        return updatedMessages;
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }

    setMessage('');
  };

  const openAttachmentPicker = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      console.log('Selected file:', res);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User canceled the picker');
      } else {
        console.error(err);
      }
    }
  };

  const startVoiceRecognition = async () => {
    // setKeyboardVisible(true);
    console.log('Starting voice recognition...');

    // Vibrate the phone
    ReactNativeHapticFeedback.trigger('impactLight', {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });

    // Play a sound
    const beep = new Sound('beep.mp3', Sound.MAIN_BUNDLE, error => {
      if (error) {
        console.log('Failed to load sound:', error);
        return;
      }
      beep.play(success => {
        if (!success) {
          console.log('Sound playback failed.');
        }
      });
    });
    // setMessage('Speak now...');
    try {
      await Voice.start('en-US');
    } catch (error) {
      console.error('Voice start error:', error);
    }
  };

  const stopVoiceRecognition = async () => {
    console.log('Stopping voice recognition...', message);
    try {
      await Voice.stop();
    } catch (error) {
      console.error('Voice stop error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={'#A274FF'} barStyle={'light-content'} />
      <Loader isLoading={isFetching} />
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.iconButtons}>
        <EntypoIcon name="chevron-left" size={20} color="white" />
      </TouchableOpacity>
      <View style={styles.chatContainer}>
        <Text style={styles.chatText}>
          You're talking with <Text style={{color: 'white'}}>MajlisAI</Text>
        </Text>
      </View>
      <ScrollView ref={scrollViewRef}>
        <View
          style={[
            styles.container,
            {paddingBottom: isKeyboardVisible ? 10 : 150},
          ]}>
          {messages.map((msg, index) => (
            <View key={index} style={styles.messageContainer}>
              <Text style={[styles.messageText, styles.userMessage]}>
                {msg.query}
              </Text>
              <Text style={styles.queryTimeText}>
                {formatTime(msg.createdAt)}
              </Text>
              <TouchableOpacity
                disabled={!msg?.response?.length}
                onPress={() => {
                  if (!msg?.response?.length) return;

                  // Extract the category (1, 2, or 3) from the first valid response
                  const firstResponse = msg.response[0]?.split(' ')[1];

                  let screenName = 'ResultsScreen'; // Default to profile
                  if (firstResponse === '3') {
                    screenName = 'ResultsScreenCommunity';
                  } else if (firstResponse === '2') {
                    screenName = 'ResultsScreenEvent';
                  }

                  navigation.navigate(screenName, {results: msg.response});
                }}>
                <Text style={[styles.messageText, styles.aiMessage]}>
                  {msg?.loading
                    ? '....'
                    : msg?.response?.length
                    ? `You have ${msg?.response?.length || 0} results.`
                    : 'Sorry! There were no relevant responses for your query.'}
                  {msg?.response?.length > 0 && (
                    <Text style={{color: 'blue'}}> Click to view</Text>
                  )}
                </Text>
              </TouchableOpacity>
              <Text style={styles.timeText}>{formatTime(msg.createdAt)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {isKeyboardVisible && (
        <View
          style={[
            styles.inputContainer,
            {marginBottom: isKeyboardVisible ? 20 : 140},
          ]}>
          <TextInput
            autoFocus
            style={styles.textInput}
            value={message}
            onChangeText={setMessage}
            placeholder="Type your message"
            onSubmitEditing={() => {
              sendMessage(message);
              Keyboard.dismiss();
            }}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => {
              sendMessage(message);
              Keyboard.dismiss();
            }}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isKeyboardVisible && (
        <View style={styles.floatingContainer}>
          <View style={styles.floatingSubContainer}>
            <View className="bg-white flex-1 h-20 rounded-l-full rounded-tr-full flex items-center justify-center">
              <TouchableOpacity
                onPress={openAttachmentPicker}
                style={styles.button}>
                {/* <Image
                source={require('../assets/icons/attachment.png')}
                style={styles.icon}
              /> */}
                <EntypoIcon name="attachment" size={30} color="#4B164C" />
              </TouchableOpacity>
            </View>
            <View className="bg-white flex-1 h-20 rounded-r-full rounded-tl-full flex items-center justify-center">
              <TouchableOpacity
                onPress={() => setKeyboardVisible(prev => !prev)}
                style={styles.button}>
                {/* <Image
                source={require('../assets/icons/keyboard.png')}
                style={styles.icon}
              /> */}
                <FAIcon name="keyboard-o" size={30} color="#4B164C" />
              </TouchableOpacity>
            </View>
            <View
              style={{
                position: 'absolute',
                backgroundColor: 'white',
                height: 54,
                width: 150,
                left: '50%',
                bottom: 0,
                transform: [{translateX: -75}],
              }}
            />
          </View>

          <View style={styles.micButtonWrapper}>
            <TouchableOpacity
              onPressIn={startVoiceRecognition} // Start recording on press
              onPressOut={stopVoiceRecognition}
              style={styles.micButton}>
              {/* <Image
              source={require('../assets/icons/mic.png')}
              style={styles.icon}
            /> */}
              <Icon name="mic-outline" size={30} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#A274FF',
  },
  chatContainer: {
    // width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  chatText: {
    fontSize: 24,
    color: 'black',
    fontWeight: 'bold',
  },
  inputContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
    // paddingHorizontal: 10,
    elevation: 5,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f9f9f9', // Lighter background for input
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    color: 'black',
    // borderColor: '#A274FF',
    // borderWidth: 1,
  },
  iconButtons: {
    padding: 2,
    height: 40,
    width: 40,
    borderRadius: 25,
    borderColor: 'white',
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 20,
    marginTop: 10,
  },
  sendButton: {
    backgroundColor: '#A274FF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  micButtonWrapper: {
    position: 'absolute',
    left: '50%',
    marginLeft: -50,
    bottom: 30,
    zIndex: 50,
    backgroundColor: '#A274FF',
    borderRadius: 50,
  },
  micButton: {
    backgroundColor: '#6219F4',
    padding: 10,
    height: 100,
    width: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#a274ff11',
    borderWidth: 15,
  },
  floatingContainer: {
    position: 'absolute',
    shadowColor: '#75227726',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 5,
    margin: 9,
    borderRadius: 50,
  },
  floatingSubContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 80,
    position: 'relative',
  },
  button: {
    padding: 10,
  },
  icon: {
    width: 25,
    height: 25,
  },
  messageContainer: {
    // marginVertical: 10,
    padding: 10,
    borderRadius: 10,
    flexDirection: 'column', // Stack the messages vertically
  },

  userMessage: {
    padding: 8,
    paddingHorizontal: 10,
    backgroundColor: '#6219F4',
    alignSelf: 'flex-end',
    color: 'white',
    borderRadius: 10,
    borderBottomLeftRadius: 0,
    elevation: 10,
    maxWidth: '70%',
    margin: 3,
  },
  aiMessage: {
    padding: 8,
    paddingHorizontal: 10,
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start',
    color: 'black',
    borderRadius: 10,
    borderTopLeftRadius: 0,
    elevation: 10,
    maxWidth: '70%',
    margin: 3,
  },

  messageText: {
    color: 'black',
    marginVertical: 20,
  },

  timeText: {
    fontSize: 10,
    color: 'black',
    marginLeft: 5,
  },
  queryTimeText: {
    fontSize: 10,
    color: 'black',
    marginRight: 5,
    textAlign: 'right',
  },
});

export default NetworkScreen;
