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
        width: width,
        height: height,
        borderRadius: width / 2,
        marginRight,
        elevation: 2,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Image
        source={imageSource}
        defaultSource={require('../assets/default-cp.png')} // iOS only
        style={{
          width,
          height,
          borderRadius,
          // borderWidth: isUser ? 2 : 0,
          // borderColor: isUser ? '' : '',
        }}
        onError={() => setImageSource(require('../assets/default-cp.png'))} // Android fallback
      />
    </View>
  );
};

export default ProfilePicture;
