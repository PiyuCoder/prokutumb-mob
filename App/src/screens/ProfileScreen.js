import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  FlatList,
  ImageBackground,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {editAbout, editProfile} from '../store/slices/authSlice';
import ExperienceModal from '../components/ExperienceModal';
import ProfilePicture from '../components/ProfilePicture';
import InterestsSelector from '../components/InterestsSelector';

const editIcon = require('../assets/icons/edit.png');
const penIcon = require('../assets/icons/pen.png');
const settingIcon = require('../assets/icons/setting.png');
const closeIcon = require('../assets/icons/close.png');

const ProfileScreen = () => {
  const {user} = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const [webData, setWebData] = useState(null);
  const navigation = useNavigation();
  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  const [interestEditing, setInterestEditing] = useState(false);
  const [isExperienceModalVisible, setExperienceModalVisible] = useState(false);

  const [editedAbout, setEditedAbout] = useState(user.bio);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // console.log(user);

  // Hide the status bar when the screen is rendered
  useEffect(() => {
    StatusBar.setHidden(true);

    return () => {
      // Show the status bar when the screen is unmounted
      StatusBar.setHidden(false);
    };
  }, []);

  // Fetch user info from external APIs (LinkedIn, etc.)
  const fetchUserWebInfo = async () => {
    try {
      // Fetch GitHub user info using email
      const githubResponse = await axios.get(
        `https://api.github.com/search/users?q=${user?.email}`,
      ); // This will work if you have the username

      console.log(githubResponse);

      // For LinkedIn, you cannot fetch by email without OAuth, but you can assume a function exists
      // const linkedInProfile = await fetchLinkedInProfile(email); // Placeholder function

      const webData = {
        github: githubResponse.data,
        // linkedIn: linkedInProfile
      };

      setWebData(webData);
    } catch (error) {
      console.error('Error fetching web data:', error);
    }
  };

  useEffect(() => {
    // fetchUserWebInfo();
  }, []);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      e => {
        setKeyboardHeight(e.endCoordinates.height);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      },
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const handleAboutEditPress = () => {
    setAboutModalVisible(true);
  };
  const handleInterestEditPress = () => {
    setInterestEditing(true);
  };

  const handleAboutSave = () => {
    dispatch(editAbout({userId: user?._id, about: editedAbout}))
      .unwrap()
      .then(() => {
        // Handle success, close modal
        setAboutModalVisible(false);
      })
      .catch(error => {
        // Handle error
        console.error(error);
      });

    // You would also send the updated about data to your backend/API
  };

  const formatDate = dateString => {
    const options = {year: 'numeric', month: 'short', day: 'numeric'};
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  console.log(user.interests);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileCard}>
        {/* <View style={styles.profileIconContainer}>
          <TouchableOpacity
            onPress={handleBackPress}
            className="border h-8 w-8 border-white  rounded-full p-2 flex items-center justify-center">
            <Image style={{height: 15, width: 15}} source={backIcon} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleEditPress}
            className="border h-8 w-8 border-white rounded-full p-2 flex items-center justify-center">
            <Image style={{height: 15, width: 15}} source={editIcon} />
          </TouchableOpacity>
        </View> */}

        <View style={{width: '100%', position: 'relative'}}>
          <ImageBackground
            style={styles.coverPicture}
            source={{
              uri:
                user?.coverPicture ||
                'https://img.freepik.com/free-vector/gradient-network-connection-background_23-2148880712.jpg',
            }}
          />
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            className=" absolute right-5 top-7 bg-white h-7 w-7 flex items-center justify-center rounded-full bg-opacity-20 shadow-lg">
            <Image style={{height: 20, width: 20}} source={settingIcon} />
          </TouchableOpacity>

          <View
            style={{
              position: 'absolute',
              alignSelf: 'center',
              bottom: -90,
              width: 150,
              height: 150,
              borderRadius: 75,
              backgroundColor: '#FDF7FD',
              padding: 5,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <View
              style={{
                width: 100,
                height: 100,
                position: 'absolute',
                bottom: 60,
                left: -85,
                zIndex: -2,
                transform: [{rotateZ: '43deg'}],
                alignSelf: 'center',
                borderColor: '#FDF7FD',
                borderEndEndRadius: 80,
                borderRightWidth: 20,
                borderBottomWidth: 0,
              }}
            />

            <View
              style={{
                width: 50,
                height: 50,
                position: 'absolute',
                bottom: 72,
                left: -45,
                zIndex: -2,
                transform: [{rotateZ: '-18deg'}],
                alignSelf: 'center',
                borderColor: '#FDF7FD',
                borderEndEndRadius: 40,
                borderRightWidth: 0,
                borderBottomWidth: 20,
              }}
            />

            <View
              style={{
                width: 100,
                height: 100,
                position: 'absolute',
                bottom: 60,
                right: -85,
                zIndex: -2,
                transform: [{rotateZ: '-43deg'}],
                alignSelf: 'center',
                borderColor: '#FDF7FD',
                borderBottomStartRadius: 80,
                borderLeftWidth: 20,
                borderBottomWidth: 0,
              }}
            />
            <View
              style={{
                width: 50,
                height: 50,
                position: 'absolute',
                bottom: 70,
                right: -50,
                zIndex: -2,
                transform: [{rotateZ: '22deg'}],
                alignSelf: 'center',
                borderColor: '#FDF7FD',
                borderBottomStartRadius: 20,
                borderLeftWidth: 0,
                borderBottomWidth: 20,
              }}
            />
            <View style={{zIndex: 4}}>
              <ProfilePicture
                profilePictureUri={user.profilePicture}
                width={120}
                height={120}
                borderRadius={60}
                borderColor="#242760"
              />
            </View>
          </View>
          {/* <Image
            source={{uri: user.profilePicture}}
            style={styles.profilePicture}
          /> */}
        </View>
      </View>
      <View style={{marginTop: 90}}>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userLocation}>
          {user.location?.state || 'State'},{' '}
          {user.location?.country || 'Country'}
        </Text>
        <View
          style={{
            width: '70%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around',
            alignSelf: 'center',
            marginTop: 10,
          }}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('Connections', {userId: user?._id})
            }>
            <Text
              style={{
                color: '#242760',
                fontSize: 20,
                fontWeight: 'bold',
                textAlign: 'center',
              }}>
              {user?.friends?.length}
            </Text>
            <Text>Connections</Text>
          </TouchableOpacity>
          <View>
            <Text
              style={{
                color: '#242760',
                fontSize: 20,
                fontWeight: 'bold',
                textAlign: 'center',
              }}>
              0
            </Text>
            <Text>Communities</Text>
          </View>
        </View>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 10,
            gap: 10,
          }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('EditProfile')}
            style={{
              backgroundColor: '#242760',
              padding: 6,
              width: 100,
              borderRadius: 8,
            }}>
            <Text style={{color: 'white', textAlign: 'center'}}>
              Edit profile
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Match')}
            style={{
              backgroundColor: '#242760',
              padding: 6,
              width: 100,
              borderRadius: 8,
            }}>
            <Text style={{color: 'white', textAlign: 'center'}}>
              Add friends
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mainCard}>
        {/* About Section */}
        <View style={styles.titleSection}>
          <Text style={styles.sectionTitle}>About</Text>
          <TouchableOpacity onPress={handleAboutEditPress}>
            <Image style={{height: 15, width: 15}} source={penIcon} />
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionText}>{user.bio}</Text>
        </View>

        {/* Experience Section */}
        <View style={styles.titleSection}>
          <Text style={styles.sectionTitle}>Experience</Text>
          <TouchableOpacity onPress={() => setExperienceModalVisible(true)}>
            <Image style={{height: 15, width: 15}} source={penIcon} />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          {user.experience?.map((exp, index) => (
            <View key={index} style={styles.experienceItem}>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Text style={styles.experienceCompany}>{exp.company}</Text>
                <Text style={styles.experienceDuration}>
                  {formatDate(exp.startDate)}-
                  {exp.isPresent ? 'Present' : formatDate(exp.endDate)}
                </Text>
              </View>
              <Text style={styles.experienceTitle}>{exp.role}</Text>
            </View>
          ))}
        </View>

        {/* Interest Section */}
        <View style={styles.titleSection}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <TouchableOpacity onPress={handleInterestEditPress}>
            <Image style={{height: 15, width: 15}} source={penIcon} />
          </TouchableOpacity>
        </View>
        <View
          style={[
            styles.card,
            {flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20},
          ]}>
          {user?.interests?.map((interest, index) => (
            <View
              key={index}
              style={{
                margin: 5,
                paddingVertical: 7,
                paddingHorizontal: 18,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: '#4B164C33',
              }}>
              <Text style={styles.sectionText}>{interest}</Text>
            </View>
          ))}
        </View>

        {/* On the Web Section */}
        <View style={styles.titleSection}>
          <Text style={styles.sectionTitle}>On the Web</Text>
          <Image style={{height: 15, width: 15}} source={penIcon} />
        </View>
        <View style={styles.card}>
          {webData ? (
            <>
              <Text style={styles.sectionText}>
                LinkedIn: {webData.linkedin}
              </Text>
              <Text style={styles.sectionText}>GitHub: {webData.github}</Text>
              <Text style={styles.sectionText}>Website: {webData.website}</Text>
            </>
          ) : (
            <Text style={styles.sectionText}>Loading web data...</Text>
          )}
        </View>
      </View>

      {/* Edit About Modal */}
      <Modal
        visible={aboutModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAboutModalVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}>
          <View className="bg-white p-3">
            <TouchableOpacity onPress={() => setAboutModalVisible(false)}>
              <Image source={closeIcon} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            {/* <Text style={styles.modalTitle}>Edit About</Text> */}

            <TextInput
              value={editedAbout}
              onChangeText={setEditedAbout}
              multiline
              numberOfLines={4}
              placeholder="Edit About"
              placeholderTextColor={'gray'}
              style={styles.input}
              autoFocus={true} // Auto-focus on the TextInput when the modal opens
            />

            <View>
              <Button color="#DD88CF" title="Save" onPress={handleAboutSave} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Experience Modal */}
      <ExperienceModal
        isVisible={isExperienceModalVisible}
        onClose={() => setExperienceModalVisible(false)}
      />

      {interestEditing && (
        <Modal
          style={{flex: 1}}
          animationType="slide"
          transparent={true}
          visible={interestEditing}
          onRequestClose={() => setInterestEditing(false)}>
          <InterestsSelector
            onClose={() => setInterestEditing(false)}
            userId={user?._id}
          />
        </Modal>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#FDF7FD',
  },
  mainCard: {
    backgroundColor: '#FDF7FD',
    padding: 20,

    // marginTop: -50,
    zIndex: 2,
  },
  profileCard: {
    position: 'relative',
    alignItems: 'center',
  },
  coverPicture: {
    width: '100%',
    height: 250,
    alignSelf: 'center',
    resizeMode: 'cover',
  },
  profilePicture: {
    width: '100%',
    height: 500,
    alignSelf: 'center',
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  closeIconContainer: {
    backgroundColor: 'white',
    padding: 8,
  },
  profileIconContainer: {
    width: '100%',
    paddingHorizontal: 30,
    position: 'absolute',
    top: 40,
    zIndex: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#242760',
    zIndex: 2,
  },
  userLocation: {
    fontSize: 12,
    textAlign: 'center',
    color: '#544C4C',
    marginTop: 5,
    zIndex: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  titleSection: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingEnd: 5,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#242760',
  },
  sectionText: {
    fontSize: 14,
    color: 'black',
  },
  experienceItem: {
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FDF7FD',
    padding: 20,
    borderBottomStartRadius: 10,
    borderBottomEndRadius: 10,
    width: '100%',
    height: '100%',
    alignSelf: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  experienceTitle: {
    color: 'black',
  },
  experienceCompany: {
    color: 'black',
    fontWeight: 'bold',
  },
  experienceDuration: {
    color: 'black',
  },
  input: {
    // borderWidth: 1,
    // borderColor: '#DDD',
    paddingHorizontal: 10,
    // height: 200,
    backgroundColor: 'white',
    marginBottom: 15,
    borderRadius: 5,
    color: 'black',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  button: {
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    marginBottom: 20,
    alignItems: 'center',
  },
  uploadButton: {
    padding: 10,
    backgroundColor: '#28A745',
    borderRadius: 5,
    alignItems: 'center',
  },
  imagePreview: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
});

export default ProfileScreen;
