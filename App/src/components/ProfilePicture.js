import React, {useEffect, useState} from 'react';
import {Image, View} from 'react-native';

const ProfilePicture = ({
  profilePictureUri,
  width,
  height,
  borderRadius,
  marginRight,
}) => {
  const defaultImage = require('../assets/default-dp.png');

  const [imageSource, setImageSource] = useState(
    profilePictureUri ? {uri: profilePictureUri} : defaultImage,
  );

  useEffect(() => {
    if (profilePictureUri) {
      setImageSource({uri: profilePictureUri});
    } else {
      setImageSource(defaultImage);
    }
  }, [profilePictureUri]);

  return (
    <View
      style={{
        backgroundColor: 'white',
        width,
        height,
        borderRadius: width / 2,
        marginRight,
        elevation: 2,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Image
        source={imageSource}
        defaultSource={defaultImage} // iOS only fallback
        style={{
          width,
          height,
          borderRadius,
        }}
        onError={() => setImageSource(defaultImage)} // Android & iOS fallback
      />
    </View>
  );
};

export default ProfilePicture;
