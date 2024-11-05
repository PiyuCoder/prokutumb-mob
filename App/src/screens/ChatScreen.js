import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';

const backIcon = require('../assets/icons/black-back.png');
const callIcon = require('../assets/icons/telephone.png');
const videoIcon = require('../assets/icons/cam-recorder.png');
const infoIcon = require('../assets/icons/info.png');

const ChatScreen = ({route, navigation}) => {
  const {name} = route.params;

  const [messages, setMessages] = useState([
    {id: '1', text: 'Hi there!', sender: 'Alice'},
    {id: '2', text: 'How are you?', sender: 'You'},
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSend = () => {
    if (newMessage.trim()) {
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: (prevMessages.length + 1).toString(),
          text: newMessage,
          sender: 'You',
        },
      ]);
      setNewMessage('');
    }
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
        <TouchableOpacity onPress={() => navigation.navigate('Message')}>
          <Image source={backIcon} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: 'black',
            textAlign: 'left',
          }}>
          {name}
        </Text>

        <View style={{flexDirection: 'row', alignItems: 'center', gap: 15}}>
          <TouchableOpacity>
            <Image source={callIcon} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image source={videoIcon} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image source={infoIcon} />
          </TouchableOpacity>
        </View>
      </View>
      {/* <Text style={styles.header}>{name}</Text> */}

      {/* Messages List */}
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View
            style={
              item.sender === 'You' ? styles.yourMessage : styles.otherMessage
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
