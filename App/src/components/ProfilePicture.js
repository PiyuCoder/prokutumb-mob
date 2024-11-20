import React, {useEffect, useState} from 'react';
import {Image, View} from 'react-native';

const ProfilePicture = ({
  profilePictureUri,
  width,
  height,
  borderRadius,
  marginRight,
  story,
  isUser,
  borderColor,
}) => {
  const [imageSource, setImageSource] = useState({uri: profilePictureUri});

  useEffect(() => {
    setImageSource({uri: profilePictureUri});
  }, [profilePictureUri]);

  return (
    <View
      style={{
        backgroundColor: 'white',
        padding: 2,
        width: width + 5,
        height: height + 5,
        borderRadius: width + 5 / 2,
        marginRight,
        elevation: 2,
        borderColor: borderColor,
        borderWidth: borderColor && 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Image
        source={imageSource}
        defaultSource={require('../assets/default-pp.png')} // iOS only
        style={{
          width,
          height,
          borderRadius,

          borderWidth: story && isUser ? 2 : 0,
          borderColor: story && isUser ? '' : '#DD88CF',
        }}
        onError={() => setImageSource(require('../assets/default-pp.png'))} // Android fallback
      />
    </View>
  );
};

export default ProfilePicture;
