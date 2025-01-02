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
  padding,
}) => {
  const [imageSource, setImageSource] = useState({uri: profilePictureUri});

  useEffect(() => {
    setImageSource({uri: profilePictureUri});
  }, [profilePictureUri]);

  return (
    <View
      style={{
        backgroundColor: 'white',
        padding: padding || 2,
        width: isUser ? width + 4 : width + 5,
        height: isUser ? height + 4 : height + 5,
        borderRadius: isUser ? width + 4 / 2 : width + 5 / 2,
        marginRight,
        elevation: 2,
        borderColor: isUser ? '#A274FF' : '#F5F5F5',
        borderWidth: 2,
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
          // borderWidth: isUser ? 2 : 0,
          // borderColor: isUser ? '' : '',
        }}
        onError={() => setImageSource(require('../assets/default-pp.png'))} // Android fallback
      />
    </View>
  );
};

export default ProfilePicture;
