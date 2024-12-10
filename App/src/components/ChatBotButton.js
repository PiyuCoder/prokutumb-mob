import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Dimensions,
  Image,
  ImageBackground,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ChatBotButton = ({setIsChatBotVisible}) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Chatbot Button */}
      <TouchableOpacity
        style={styles.chatBotButton}
        onPress={() => navigation.navigate('Network')}>
        <ImageBackground
          style={{height: '100%', width: '100%'}}
          source={require('../assets/chat-bot.png')}
        />
      </TouchableOpacity>

      {/* Close (Cross) Button */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => setIsChatBotVisible(false)}>
        {/* <Icon name="close" size={20} color="white" /> */}
        <Text>X</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ChatBotButton;

const {height, width} = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 100, // Ensures the button stays above other UI elements
  },
  chatBotButton: {
    backgroundColor: 'white',
    width: 60,
    height: 60,
    borderRadius: 30, // Makes the button circular
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // Adds shadow for Android
  },
  closeButton: {
    position: 'absolute',
    top: 0, // Adjust to position above the chatbot button
    right: 0, // Adjust to position to the side
    backgroundColor: '#FF6B6B', // Red background for visibility
    width: 20,
    height: 20,
    borderRadius: 15, // Circular button
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
});
