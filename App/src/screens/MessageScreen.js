import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {axiosInstance} from '../api/axios';
import {useSelector} from 'react-redux';
import socket from '../socket';

const backIcon = require('../assets/icons/black-back.png');
const chatIcon = require('../assets/icons/conversation.png');
const settingIcon = require('../assets/icons/settings.png');

const MessageScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [onlineStatus, setOnlineStatus] = useState({});
  const [conversations, setConversations] = useState([]);
  const [frequentContacts, setFrequentContacts] = useState([]);
  const navigation = useNavigation();
  const {user} = useSelector(state => state.auth);

  useEffect(() => {
    // Register user when connected
    socket.emit('registerUser', user._id);

    // Listen for userStatus events
    socket.on('userStatus', ({userId, online}) => {
      console.log('online: ', online);
      setOnlineStatus(prevStatus => ({
        ...prevStatus,
        [userId]: online,
      }));
    });

    // return () => {
    //   socket.disconnect();
    // };
  }, [user._id]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await axiosInstance.get(
          `/api/user/conversations/${user?._id}`,
        );
        if (res.data.success) {
          console.log(res.data.frequentContacts);
          setConversations(res.data.conversations);
          setFrequentContacts(res.data.frequentContacts);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    fetchConversations();
  }, [user?._id]);

  const isUserOnline = userId => onlineStatus[userId];

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
          padding: 16,
        }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={backIcon} />
        </TouchableOpacity>
        <Text style={{fontSize: 24, fontWeight: 'bold', color: 'black'}}>
          Direct Message
        </Text>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 15}}>
          <TouchableOpacity>
            <Image source={settingIcon} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image source={chatIcon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search messages"
        value={searchText}
        onChangeText={setSearchText}
      />

      {/* Frequently contacted */}
      <Text style={{fontWeight: 'bold', color: 'black', margin: 8}}>
        Frequently contacted
      </Text>

      {/* Horizontally Scrollable Profile Pictures */}
      <FlatList
        data={frequentContacts}
        horizontal
        contentContainerStyle={{paddingHorizontal: 9}}
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item._id}
        renderItem={({item}) => (
          <View key={item._id} style={{flexDirection: 'row', marginRight: 10}}>
            <Image
              source={{uri: item.profilePicture}}
              style={styles.profilePictureContact}
            />
            {isUserOnline(item._id) && (
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'green',
                }}
              />
            )}
          </View>
        )}
        style={styles.userScroll}
      />

      {/* List of Conversations */}
      <FlatList
        data={conversations}
        keyExtractor={item => item.message._id}
        renderItem={({item}) => {
          const contact =
            item.message.sender === user._id
              ? item.recipientDetails
              : item.senderDetails;
          return (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Chat', {
                  name: contact.name,
                  userId: contact._id,
                  profilePicture: contact.profilePicture,
                })
              }>
              <View style={styles.conversationContainer}>
                <Image
                  source={{uri: contact.profilePicture}}
                  style={styles.profilePicture}
                />
                <View style={styles.messageInfo}>
                  <View style={{flexDirection: 'row', gap: 3}}>
                    <Text style={styles.conversationName}>
                      {contact.name}
                      {/* {isUserOnline(item.senderDetails._id) ? '🟢' : '🟢'} */}
                    </Text>
                    {isUserOnline(contact._id) && (
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: 'green',
                          marginTop: 3,
                        }}
                      />
                    )}
                  </View>

                  <Text style={styles.conversationMessage}>
                    {item.message.text}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.conversationsList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F5F5F5', overflow: 'scroll'},
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    padding: 16,
  },
  headerText: {fontSize: 24, fontWeight: 'bold', color: 'black'},
  headerIcons: {flexDirection: 'row', alignItems: 'center', gap: 15},
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    margin: 16,
    color: 'black',
  },
  conversationsList: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: 'white',
    borderTopStartRadius: 25,
    borderTopEndRadius: 25,
    elevation: 5,
    minHeight: 300,
  },
  conversationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  profilePictureContact: {
    width: 40,
    height: 40,
    borderRadius: 20,
    // marginRight: 10,
  },
  messageInfo: {flex: 1},
  conversationName: {fontWeight: 'bold', fontSize: 16, color: 'black'},
  conversationMessage: {color: '#555'},
});

export default MessageScreen;
