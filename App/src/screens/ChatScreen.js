import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import {useSelector} from 'react-redux';
import socket from '../socket';
import {axiosInstance} from '../api/axios';
import ProfilePicture from '../components/ProfilePicture';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';

const ChatScreen = ({route, navigation}) => {
  const {name, userId, profilePicture} = route.params;
  const {user} = useSelector(state => state.auth);
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const flatListRef = useRef();

  useEffect(() => {
    const fetchMessages = async () => {
      console.log('test');
      const res = await axiosInstance.get(
        `/api/user/fetchMessages/${user?._id}/${userId}`,
      );
      if (res.data.success) {
        setMessages(res.data.messages);
      }
    };
    fetchMessages();
  }, [messages.length]);

  useEffect(() => {
    // Listen for incoming messages
    socket.on('receiveMessage', message => {
      setMessages(prevMessages => [
        ...prevMessages,
        {id: Date.now().toString(), ...message},
      ]);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, []);

  const scrollToMessage = index => {
    console.log(index);
    flatListRef.current.scrollToIndex({animated: true, index});
  };

  useEffect(() => {
    if (!isUserScrolling && flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({animated: true});
    }
  }, [messages]);

  const handleScroll = event => {
    // Check how far the user is from the bottom
    const {layoutMeasurement, contentOffset, contentSize} = event.nativeEvent;
    const isAtBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

    setIsUserScrolling(!isAtBottom); // User scrolling is true unless they are at the bottom
  };

  const handleSend = () => {
    if (newMessage.trim()) {
      const messageData = {
        sender: user._id,
        recipient: userId,
        text: newMessage,
        replyTo: replyToMessage ? replyToMessage._id : null,
      };

      console.log('messageData:', messageData);

      // Send message to the backend via socket
      socket.emit('sendMessage', messageData);

      // Update local messages state to display the sent message
      setMessages(prevMessages => [
        ...prevMessages,
        {...messageData, _id: Date.now().toString(), sender: user._id},
      ]);
      setNewMessage('');
      setReplyToMessage(null); // Reset reply state
      setTimeout(() => {
        flatListRef.current.scrollToEnd({animated: true});
      }, 100);
    }
  };

  const handleAudioCall = () => {
    socket.emit('initiateCall', {
      recipientId: userId,
      callerId: user._id,
      callerName: user.name,
      recipientName: name,
      isVideo: false,
    });
    Alert.alert('Audio Call Initiated');
  };

  const handleVideoCall = () => {
    socket.emit('initiateCall', {
      recipientId: userId,
      callerId: user._id,
      callerName: user.name,
      recipientName: name,
      isVideo: true,
    });
    Alert.alert('Video Call Initiated');
  };

  const openInfoScreen = () => {
    navigation.navigate('UserInfoScreen', {userId: recipientId});
  };
  return (
    <View style={styles.container}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
          backgroundColor: 'white',
          padding: 16,
        }}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity
            style={{marginRight: 8}}
            onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back-outline" size={30} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('UserProfile', {userId})}
            style={{flexDirection: 'row', alignItems: 'center'}}>
            <ProfilePicture
              profilePictureUri={profilePicture}
              width={40}
              height={40}
              borderRadius={20}
              marginRight={10}
            />
            {/* <Image
              source={{uri: profilePicture}}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                marginRight: 10,
                borderColor: 'gray',
                borderWidth: 2,
                padding: 4,
                elevation: 2,
                backgroundColor: 'white',
              }}
            /> */}
            <Text
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: 'black',
                textAlign: 'left',
              }}>
              {name}
            </Text>
          </TouchableOpacity>
        </View>

        {/* <View style={{flexDirection: 'row', alignItems: 'center', gap: 15}}>
          <TouchableOpacity onPress={handleAudioCall}>
            <Image source={callIcon} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleVideoCall}>
            <Image source={videoIcon} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={openInfoScreen}>
            <Image source={infoIcon} style={styles.icon} />
          </TouchableOpacity>
        </View> */}
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item._id}
        onScroll={handleScroll} // Attach the scroll handler
        scrollEventThrottle={16}
        renderItem={({item}) => (
          <View
            style={
              item.sender === user?._id
                ? styles.yourMessage
                : styles.otherMessage
            }>
            {item.replyTo && (
              <TouchableOpacity
                onPress={() => {
                  // Scroll to the replied message if it exists
                  if (item.replyTo) {
                    const repliedMessageIndex = messages.findIndex(
                      msg => msg._id === item.replyTo._id,
                    );
                    if (repliedMessageIndex !== -1) {
                      scrollToMessage(repliedMessageIndex);
                    }
                  }
                }}
                style={styles.repliedMessage}>
                <Text style={{color: 'black', fontSize: 12}}>
                  {item.replyTo.text}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onLongPress={() => setReplyToMessage(item)}>
              <Text
                style={
                  item.sender === user?._id
                    ? styles.messageText
                    : {color: 'black'}
                }>
                {item.text}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.messagesList}
      />
      {replyToMessage && (
        <View style={styles.repliedMessage}>
          <Text style={{color: 'black'}}>
            <Text style={{color: '#A274FF'}}>Replying to:</Text>{' '}
            {replyToMessage.text}
          </Text>
          <TouchableOpacity onPress={() => setReplyToMessage(null)}>
            <SimpleLineIcons name="close" size={20} color="#A274FF" />
          </TouchableOpacity>
        </View>
      )}
      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message"
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={{color: 'white', fontWeight: 'bold'}}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  icon: {
    width: 30,
    height: 30,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  messagesList: {
    padding: 16,
  },
  repliedMessage: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    margin: 5,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: 'black',
  },

  yourMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#6219F4',
    borderRadius: 10,
    padding: 10,
    paddingHorizontal: 15,
    marginVertical: 4,
    maxWidth: '75%',
    minWidth: 50,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    marginVertical: 4,
    maxWidth: '75%',
    minWidth: 50,
    paddingHorizontal: 15,
  },
  messageText: {
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 16,
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    // borderColor: '#ccc',
    // borderWidth: 1,
    borderRadius: 22.5,
    paddingHorizontal: 20,
    height: 45,
    marginRight: 8,
    color: 'black',
    elevation: 5,
    backgroundColor: 'white',
  },
  sendButton: {
    backgroundColor: '#A274FF',
    padding: 10,
    borderRadius: 10,
  },
});

export default ChatScreen;
