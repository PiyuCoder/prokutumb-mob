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

const NetworkScreen = () => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([]);
  const scrollViewRef = useRef();
  const {user} = useSelector(state => state.auth);

  useEffect(() => {
    // Fetch previous messages on load
    const fetchMessages = async () => {
      const res = await axiosInstance.get(`/api/interactions/${user?._id}`);
      setMessages(res?.data);
      console.log('Response chats', res?.data);
    };
    fetchMessages();
  }, [user?._id]);

  useEffect(() => {
    // Scroll to the end of the ScrollView when messages change
    scrollViewRef.current?.scrollToEnd({animated: true});
  }, [messages]);

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

  const sendMessage = async query => {
    const currentTime = new Date().toISOString();

    // Add user query to local state with a loading state for AI response
    setMessages(prev => [
      ...prev,
      {
        query,
        response: '...' /* Placeholder for AI response */,
        createdAt: currentTime,
      },
    ]);

    try {
      const res = await axiosInstance.post('/api/interactions', {
        userId: user?._id,
        query,
      });

      const data = res.data; // Get response data directly
      setMessages(prev => {
        // Update the latest message with the actual AI response
        const updatedMessages = [...prev];
        const lastMessageIndex = updatedMessages.length - 1;
        updatedMessages[lastMessageIndex] = {
          query: data.query,
          response: data.response,
          createdAt: data.createdAt || currentTime,
        };
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
      <StatusBar backgroundColor={'#4B164C'} barStyle={'light-content'} />
      <View style={styles.chatContainer}>
        <Text style={styles.chatText}>
          You're talking with <Text style={{color: '#DD88CF'}}>Proku</Text>
        </Text>
      </View>
      <ScrollView ref={scrollViewRef}>
        <View
          style={[
            styles.container,
            {paddingBottom: isKeyboardVisible ? 10 : 100},
          ]}>
          {messages.map((msg, index) => (
            <View key={index} style={styles.messageContainer}>
              <Text style={[styles.messageText, styles.userMessage]}>
                {msg.query}
              </Text>
              <Text style={[styles.messageText, styles.aiMessage]}>
                {msg.response}
              </Text>
              <Text style={styles.timeText}>{formatTime(msg.createdAt)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {isKeyboardVisible && (
        <View style={styles.inputContainer}>
          <TextInput
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

      <View style={styles.floatingContainer}>
        <View style={styles.floatingSubContainer}>
          <View className="bg-white flex-1 h-20 rounded-l-full rounded-tr-full flex items-center justify-center">
            <TouchableOpacity
              onPress={openAttachmentPicker}
              style={styles.button}>
              <Image
                source={require('../assets/icons/attachment.png')}
                style={styles.icon}
              />
            </TouchableOpacity>
          </View>
          <View className="bg-white flex-1 h-20 rounded-r-full rounded-tl-full flex items-center justify-center">
            <TouchableOpacity
              onPress={() => setKeyboardVisible(prev => !prev)}
              style={styles.button}>
              <Image
                source={require('../assets/icons/keyboard.png')}
                style={styles.icon}
              />
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
            <Image
              source={require('../assets/icons/mic.png')}
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4B164C',
  },
  chatContainer: {
    // width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  chatText: {
    fontSize: 24,
    color: 'white',
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
    marginBottom: 140,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f9f9f9', // Lighter background for input
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    color: 'black',
    // borderColor: '#DD88CF',
    // borderWidth: 1,
  },
  sendButton: {
    backgroundColor: '#DD88CF',
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
    backgroundColor: '#4B164C',
    borderRadius: 50,
  },
  micButton: {
    backgroundColor: '#DD88CF',
    padding: 10,
    height: 100,
    width: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#4B164C',
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
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    flexDirection: 'column', // Stack the messages vertically
  },
  userMessage: {
    padding: 5,
    paddingHorizontal: 10,
    backgroundColor: '#DD88CF',
    alignSelf: 'flex-end',
    color: 'black',
    borderRadius: 5,
    elevation: 10,
    maxWidth: '70%',
    margin: 3,
  },
  aiMessage: {
    padding: 5,
    paddingHorizontal: 10,
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start',
    color: 'black',
    borderRadius: 5,
    elevation: 10,
    maxWidth: '70%',
    margin: 3,
  },

  messageText: {
    color: 'black',
  },

  timeText: {
    fontSize: 10,
    color: 'gray',
    marginLeft: 5,
  },
});

export default NetworkScreen;
