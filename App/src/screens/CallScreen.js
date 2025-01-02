import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import {mediaDevices} from 'react-native-webrtc';
import {useNavigation} from '@react-navigation/native';
import socket from '../socket';

const CallScreen = ({route}) => {
  const {callData, isVideo} = route.params;
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    // Get user media for audio/video
    const getMedia = async () => {
      try {
        const stream = await mediaDevices.getUserMedia({
          video: isVideo && !isVideoMuted,
          audio: !isVideo || !isMuted,
        });
        setLocalStream(stream);
        // In a real app, you would handle the remote stream setup here, after the call is established
      } catch (error) {
        console.error('Error getting media:', error);
      }
    };

    getMedia();

    return () => {
      // Cleanup the media resources when the call ends or the component unmounts
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isVideo, isMuted, isVideoMuted]);

  useEffect(() => {
    // Listen for 'callEnded' event to close the call screen for both users
    socket.on('callEnded', () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      navigation.goBack();
    });

    // Cleanup the event listener on component unmount
    return () => {
      socket.off('callEnded');
    };
  }, []);

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    localStream.getAudioTracks().forEach(track => {
      track.enabled = !isMuted;
    });
  };

  const handleVideoToggle = () => {
    setIsVideoMuted(!isVideoMuted);
    localStream.getVideoTracks().forEach(track => {
      track.enabled = !isVideoMuted;
    });
  };

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }

    // Notify the other user that the call has ended
    socket.emit('callEnded', {
      callerId: callData.callerId,
      recipientId: callData.recipientId,
    });

    // Go back to the previous screen
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {isVideo ? (
        <View style={styles.videoContainer}>
          <Text style={styles.text}>Video Call with {callData.callerName}</Text>
          <View style={styles.localVideoContainer}>
            <Text>Your Video Stream</Text>
            {/* Display your local video stream here */}
          </View>
          <View style={styles.remoteVideoContainer}>
            <Text>Remote Video Stream</Text>
            {/* Display the remote video stream here */}
          </View>
        </View>
      ) : (
        <Text style={styles.text}>Audio Call with {callData.callerName}</Text>
      )}

      <View style={styles.controls}>
        <TouchableOpacity onPress={handleMuteToggle}>
          {/* <Image
            source={
              isMuted
                ? require('../assets/icons/mute-button.png')
                : require('../assets/icons/microphone.png')
            }
            style={styles.icon}
          /> */}
        </TouchableOpacity>

        {isVideo && (
          <TouchableOpacity onPress={handleVideoToggle}>
            {/* <Image
              source={
                isVideoMuted
                  ? require('../assets/icons/cam-recorder.png')
                  : require('../assets/icons/no-video.png')
              }
              style={styles.icon}
            /> */}
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={endCall}>
          {/* <Image
            source={require('../assets/icons/end-call-icon.png')}
            style={styles.icon}
          /> */}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  videoContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  localVideoContainer: {
    marginBottom: 20,
    borderColor: '#ccc',
    borderWidth: 1,
    width: '100%',
    height: 200,
  },
  remoteVideoContainer: {
    marginBottom: 20,
    borderColor: '#ccc',
    borderWidth: 1,
    width: '100%',
    height: 200,
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
  },
  icon: {
    width: 40,
    height: 40,
    marginHorizontal: 15,
  },
});

export default CallScreen;
