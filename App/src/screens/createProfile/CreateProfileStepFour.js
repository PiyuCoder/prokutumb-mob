import {
  FlatList,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import Entypo from 'react-native-vector-icons/Entypo';
import {useDispatch, useSelector} from 'react-redux';
import {saveProfile, setSocialLinks} from '../../store/slices/profileSlice';

const platformsList = [
  {name: 'Facebook', logo: 'facebook', color: '#0073DE'},
  {name: 'Twitter', logo: 'twitter', color: '#2998FF'},
  {name: 'LinkedIn', logo: 'linkedin', color: '#0077B5'},
  {name: 'Instagram', logo: 'instagram', color: '#C74C4D'},
  {name: 'Youtube', logo: 'youtube', color: '#FF3A3A'},
  // Add more platforms as needed
];

const CreateProfileStepFour = ({navigation}) => {
  const profileData = useSelector(state => state.profile);
  const [socialLinkes, setSocialLinkes] = useState(
    !profileData?.socialLinks?.length
      ? [
          {
            platform: 'Instagram',
            url: '@',
            logo: 'instagram',
            color: '#C74C4D',
          },
        ]
      : profileData?.socialLinks?.map(link => ({...link})),
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.auth);

  const handleSelectPlatform = platform => {
    if (!socialLinkes.find(link => link.platform === platform.name))
      setSocialLinkes([
        ...socialLinkes,
        {
          platform: platform.name,
          url: '@',
          logo: platform.logo,
          color: platform.color,
        },
      ]);
    setIsModalVisible(false);
  };
  const onSubmit = () => {
    const formData = new FormData();
    formData.append('name', profileData.name);
    formData.append('profilePicture', {
      uri: profileData.profilePicture,
      type: 'image/jpeg', // or the appropriate type
      name: 'profilePicture.jpg',
    });
    formData.append('interests', JSON.stringify(profileData.interests));
    formData.append('about', profileData.about);
    formData.append('location', profileData.location);
    formData.append('skills', JSON.stringify(profileData.skills));
    formData.append('experience', JSON.stringify(profileData.experience));
    formData.append('education', JSON.stringify(profileData.education));
    formData.append('socialLinks', JSON.stringify(socialLinkes));
    formData.append('userId', user?._id);

    dispatch(saveProfile(formData)).then(action => {
      if (saveProfile.fulfilled.match(action)) {
        navigation.replace('Dashboard');
      }
    });
  };
  const handleInput = (index, value) => {
    const updatedLinks = [...socialLinkes];
    updatedLinks[index]['url'] = value;
    setSocialLinkes(updatedLinks);
  };
  return (
    <ScrollView>
      <StatusBar hidden />
      <View
        style={{
          flexDirection: 'row',
          gap: 20,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
          backgroundColor: 'white',
          padding: 25,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          paddingTop: 40,
        }}>
        <Text style={styles.title}>Create Profile</Text>
      </View>
      <View style={{padding: 20}}>
        <Text
          style={[
            styles.title,
            {color: 'black', textAlign: 'left', marginBottom: 25},
          ]}>
          Social Links
        </Text>
        {socialLinkes?.map((link, index) => (
          <View key={index} style={styles.linkContainer}>
            <Entypo name={`${link.logo}`} size={20} color={`${link.color}`} />
            <Text style={styles.platformName}>{link.platform}</Text>
            <TextInput
              value={link.url}
              onChangeText={text => handleInput(index, text)}
              style={styles.urlInput}
            />
          </View>
        ))}
        <TouchableOpacity
          onPress={() => setIsModalVisible(true)}
          style={styles.submitButton}>
          <Text style={styles.submitButtonText}>{'Add more'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
          <Text style={styles.submitButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <FlatList
              data={platformsList}
              keyExtractor={item => item.name}
              renderItem={({item}) => (
                <TouchableOpacity
                  onPress={() => handleSelectPlatform(item)}
                  style={styles.platformItem}>
                  <Entypo
                    name={`${item.logo}`}
                    size={20}
                    color={`${item.color}`}
                  />
                  <Text
                    style={[
                      styles.platformText,
                      {
                        color: socialLinkes.find(l => l.platform === item.name)
                          ? 'purple'
                          : '',
                      },
                    ]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              onPress={() => setIsModalVisible(false)}
              style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default CreateProfileStepFour;

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#A274FF',
    textAlign: 'center',
  },
  linkContainer: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
    padding: 12,
    paddingStart: 20,
    marginBottom: 16,
    backgroundColor: 'white',
    color: 'black',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  platformName: {
    color: 'black',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#A274FF',
    padding: 16,
    borderRadius: 48,
    alignItems: 'center',
    width: '70%',
    marginVertical: 20,
    alignSelf: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 17,
  },
  urlInput: {
    flex: 1,
    padding: 12,
    backgroundColor: 'white',
    color: 'black',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  platformItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 4,
  },
  platformLogo: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  platformText: {
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: '#A274FF',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
