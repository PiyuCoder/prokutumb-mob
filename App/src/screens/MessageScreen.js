import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

const backIcon = require('../assets/icons/black-back.png');
const chatIcon = require('../assets/icons/conversation.png');
const settingIcon = require('../assets/icons/settings.png');

const MessageScreen = () => {
  const [searchText, setSearchText] = useState('');
  const navigation = useNavigation();

  // Dummy data for profile pictures and conversations
  const users = [
    {id: '1', uri: require('../assets/login1.jpg')},
    {id: '2', uri: require('../assets/login1.jpg')},
    {id: '3', uri: require('../assets/login1.jpg')},
    {id: '4', uri: require('../assets/login1.jpg')},
    {id: '5', uri: require('../assets/login1.jpg')},
  ];

  const conversations = [
    {id: '1', name: 'Alice', message: 'Hey! How are you?'},
    {id: '2', name: 'Bob', message: 'Let’s catch up soon!'},
    {id: '3', name: 'Charlie', message: 'Can we reschedule our meeting?'},
    {id: '4', name: 'David', message: 'I sent you the files.'},
    {id: '5', name: 'Eve', message: 'Looking forward to our project!'},
    {id: '6', name: 'Rick', message: 'I sent you the files.'},
    {id: '7', name: 'Glenn', message: 'Looking forward to our project!'},
    {id: '8', name: 'Maggie', message: 'I sent you the files.'},
    {id: '9', name: 'Carl', message: 'Looking forward to our project!'},
  ];

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
        data={users}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View key={item.id} style={styles.profilePictureContainer}>
            <Image source={item.uri} style={styles.profilePicture} />
          </View>
        )}
        style={styles.userScroll}
      />

      {/* List of Conversations */}
      <FlatList
        data={conversations}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('Chat', {name: item.name})}>
            <View style={styles.conversationContainer}>
              <Text style={styles.conversationName}>{item.name}</Text>
              <Text style={styles.conversationMessage}>{item.message}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.conversationsList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    margin: 16,
  },
  userScroll: {
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 100,
  },
  profilePictureContainer: {
    marginRight: 10,
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  conversationsList: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: 'white',
    borderTopStartRadius: 25,
    borderTopEndRadius: 25,
    elevation: 5,
    overflow: 'hidden',
  },
  conversationContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  conversationName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  conversationMessage: {
    color: '#555',
  },
});

export default MessageScreen;
