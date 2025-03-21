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
  ImageBackground,
  KeyboardAvoidingView,
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
import {PERMISSIONS, RESULTS} from 'react-native-permissions';
import LottieView from 'lottie-react-native';

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
    } else if (Platform.OS === 'ios') {
      const result = await request(PERMISSIONS.IOS.MICROPHONE);
      return result === RESULTS.GRANTED;
    }
    return false;
  };

  const formatTime = dateString => {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0'); // Get hours and pad to 2 digits
    const minutes = date.getMinutes().toString().padStart(2, '0'); // Get minutes and pad to 2 digits
    return `${hours} ${minutes}`; // Return formatted string
  };

  function filterValidResponses(data, queryType) {
    const uniqueIds = new Set(); // Track unique _id values

    return data.filter(({output, _id, type}) => {
      if (type === undefined) {
        console.log(
          `❌ Skipping response due to missing type: ${JSON.stringify({
            _id,
            output,
          })}`,
        );
        return false;
      }

      type = type.toString();

      if (!['1', '2', '3', '4'].includes(type)) {
        console.log(
          `❌ Skipping response due to invalid type: ${JSON.stringify({
            _id,
            type,
            output,
          })}`,
        );
        return false;
      }

      // **Ensure uniqueness based on `_id`**
      if (_id && uniqueIds.has(_id)) {
        console.log(`❌ Skipping duplicate: ${_id}`);
        return false;
      }
      uniqueIds.add(_id);

      console.log(
        `✅ Keeping response: ${JSON.stringify({_id, type, output})}`,
      );
      return true;
    });
  }

  const sendMessage = async query => {
    const currentTime = new Date().toISOString();

    // Add user query with a loading state for AI response
    setMessages(prev => [
      ...prev,
      {
        query,
        response: [], // Placeholder for AI response
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
      console.log('AI Response Data: ', data);

      const validResponses = filterValidResponses(data.response, queryType);

      setMessages(prev => {
        // Update the last message with the AI response
        const updatedMessages = [...prev];
        const lastMessageIndex = updatedMessages.length - 1;

        updatedMessages[lastMessageIndex] = {
          query: data.query,
          response: validResponses.length ? validResponses : [],
          createdAt: data.createdAt || currentTime,
        };

        return updatedMessages;
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => {
        const updatedMessages = [...prev];
        const lastMessageIndex = updatedMessages.length - 1;

        updatedMessages[lastMessageIndex] = {
          query,
          response: [],
          createdAt: currentTime,
        };

        return updatedMessages;
      });
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
    // const beep = new Sound('beep.mp3', Sound.MAIN_BUNDLE, error => {
    //   if (error) {
    //     console.log('Failed to load sound:', error);
    //     return;
    //   }
    //   beep.play(success => {
    //     if (!success) {
    //       console.log('Sound playback failed.');
    //     }
    //   });
    // });
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
    <ImageBackground
      source={require('../assets/chatbot_bg.png')}
      style={{flex: 1, resizeMode: 'cover', justifyContent: 'center'}}>
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
                  disabled={
                    !msg?.response?.length || msg.response[0]?.type === 4 // Disable if response is empty or type is 4
                  }
                  onPress={() => {
                    if (!msg?.response?.length || msg.response[0]?.type === 4)
                      return; // Prevent navigation if type is 4

                    const firstResponseType = msg.response[0]?.type?.toString(); // Ensure type is a string

                    let screenName = 'ResultsScreen'; // Default to profile
                    if (firstResponseType === '3') {
                      screenName = 'ResultsScreenCommunity';
                    } else if (firstResponseType === '2') {
                      screenName = 'ResultsScreenEvent';
                    }

                    navigation.navigate(screenName, {results: msg.response});
                  }}>
                  <Text style={[styles.messageText, styles.aiMessage]}>
                    {msg?.loading ? (
                      <LottieView
                        source={require('../assets/loading.json')}
                        autoPlay
                        loop
                        style={{width: 50, height: 50}}
                      />
                    ) : msg?.response?.length ? (
                      msg.response[0]?.type === 4 ? ( // If type is 4, show the first response's output
                        msg.response[0].output
                      ) : (
                        `You have ${msg?.response?.length || 0} results.`
                      )
                    ) : (
                      'Sorry! There were no relevant responses for your query.'
                    )}
                    {msg?.response?.length > 0 &&
                      msg.response[0]?.type !== 4 && (
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
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={[styles.inputContainer]}>
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
          </KeyboardAvoidingView>
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
                <Icon name="mic-outline" size={30} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#A274FF',
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
    maxWidth: '70%',
    margin: 3,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 10, // Works only on Android
      },
    }),
  },

  aiMessage: {
    padding: 8,
    paddingHorizontal: 10,
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start',
    color: 'black',
    borderRadius: 10,
    borderTopLeftRadius: 0,
    maxWidth: '70%',
    margin: 3,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 10, // Works only on Android
      },
    }),
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
