import React, {useEffect, useState} from 'react';
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

const backIcon = require('../assets/icons/black-back.png');
const callIcon = require('../assets/icons/telephone.png');
const videoIcon = require('../assets/icons/cam-recorder.png');
const infoIcon = require('../assets/icons/info.png');

const ChatScreen = ({route, navigation}) => {
  const {name, userId, profilePicture} = route.params;
  const {user} = useSelector(state => state.auth);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      const res = await axiosInstance.get(
        `/api/user/fetchMessages/${user?._id}/${userId}`,
      );
      if (res.data.success) {
        setMessages(res.data.messages);
      }
    };
    fetchMessages();
  }, []);

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

  const handleSend = () => {
    if (newMessage.trim()) {
      const messageData = {
        sender: user._id,
        recipient: userId,
        text: newMessage,
      };

      // Send message to the backend via socket
      socket.emit('sendMessage', messageData);

      // Update local messages state to display the sent message
      setMessages(prevMessages => [
        ...prevMessages,
        {...messageData, id: Date.now().toString(), sender: user?._id},
      ]);
      setNewMessage('');
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
            onPress={() => navigation.navigate('Message')}>
            <Image source={backIcon} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('UserProfile', {userId})}
            style={{flexDirection: 'row', alignItems: 'center'}}>
            <Image
              source={{uri: profilePicture}}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                marginRight: 10,
              }}
            />
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

        <View style={{flexDirection: 'row', alignItems: 'center', gap: 15}}>
          <TouchableOpacity onPress={handleAudioCall}>
            <Image source={callIcon} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleVideoCall}>
            <Image source={videoIcon} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={openInfoScreen}>
            <Image source={infoIcon} style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        data={messages}
        keyExtractor={item => item._id}
        renderItem={({item}) => (
          <View
            style={
              item.sender === user?._id
                ? styles.yourMessage
                : styles.otherMessage
            }>
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={styles.messagesList}
      />

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message"
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity onPress={handleSend}>
          <Text style={styles.sendButton}>Send</Text>
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
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  messagesList: {
    padding: 16,
  },
  yourMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#F8E7F6',
    borderRadius: 10,
    padding: 10,
    marginVertical: 4,
    maxWidth: '75%',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    marginVertical: 4,
    maxWidth: '75%',
  },
  messageText: {
    color: '#141414',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 16,
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 40,
    marginRight: 8,
    color: 'black',
  },
  sendButton: {
    color: '#0084ff',
    fontWeight: 'bold',
  },
});

export default ChatScreen;
