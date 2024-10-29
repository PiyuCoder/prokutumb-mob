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
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import {launchImageLibrary} from 'react-native-image-picker';
import {useNavigation} from '@react-navigation/native';
import {editAbout, editProfile} from '../store/slices/authSlice';
import ExperienceModal from '../components/ExperienceModal';

const editIcon = require('../assets/icons/edit.png');
const penIcon = require('../assets/icons/pen.png');
const backIcon = require('../assets/icons/back.png');
const closeIcon = require('../assets/icons/close.png');

const ProfileScreen = () => {
  const {user} = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const [webData, setWebData] = useState(null);
  const navigation = useNavigation(); // Hook for navigation
  const [modalVisible, setModalVisible] = useState(false);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  const [isExperienceModalVisible, setExperienceModalVisible] = useState(false);
  const [editedName, setEditedName] = useState(user.name);
  const [profilePicture, setProfilePicture] = useState(null); // Stores the image data
  const [uploading, setUploading] = useState(false);
  const [editedState, setEditedState] = useState(user.location?.state);
  const [editedCountry, setEditedCountry] = useState(user.location?.country);
  const [newProfilePicture, setNewProfilePicture] = useState(
    user.profilePicture,
  );
  const [editedAbout, setEditedAbout] = useState(user.about);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Function to pick image from the device
  const selectImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 1,
      },
      response => {
        if (response.assets) {
          setProfilePicture(response.assets[0]); // Select the first image
        }
      },
    );
  };

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

  const handleBackPress = () => {
    navigation.goBack(); // Navigate back to the previous screen
  };

  const handleEditPress = () => {
    setModalVisible(true); // Open the edit modal
  };

  const handleSave = () => {
    // Prepare the form data
    const formData = new FormData();

    // Append the image if it exists
    if (profilePicture) {
      formData.append('profilePicture', {
        uri: profilePicture.uri,
        name: profilePicture.fileName,
        type: profilePicture.type,
      });
    }

    // Append other profile details (location, userId, etc.)
    formData.append('userId', user?._id);
    formData.append('name', editedName);
    formData.append('location[state]', editedState);
    formData.append('location[country]', editedCountry);

    // Dispatch action or make API call to backend
    dispatch(editProfile(formData))
      .unwrap()
      .then(() => {
        // Handle success, close modal
        setModalVisible(false);
      })
      .catch(error => {
        // Handle error
        console.error('Error updating profile:', error);
      });
  };

  const handleAboutEditPress = () => {
    setAboutModalVisible(true); // Open the About edit modal
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
    const options = {year: 'numeric', month: 'long', day: 'numeric'};
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileCard}>
        <View style={styles.profileIconContainer}>
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
        </View>
        <Image
          source={{uri: user.profilePicture}}
          style={styles.profilePicture}
        />
        {/* Overlay with Linear Gradient */}
        <LinearGradient
          colors={['#4B164C00', '#4B164C99', '#4B164CF2']}
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}
          style={styles.overlay}
        />
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userLocation}>
          {user.location?.state || 'State'},{' '}
          {user.location?.country || 'Country'}
        </Text>
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
          <Text style={styles.sectionText}>{user.about}</Text>
        </View>

        {/* Experience Section */}
        <View style={styles.titleSection}>
          <Text style={styles.sectionTitle}>Experience</Text>
          <TouchableOpacity onPress={() => setExperienceModalVisible(true)}>
            <Image style={{height: 15, width: 15}} source={penIcon} />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          {user.experience.map((exp, index) => (
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

      {/* Edit Profile Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}>
          <View style={styles.closeIconContainer}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Image source={closeIcon} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.modalContent}>
              {/* Edit Profile Picture URL */}
              <TextInput
                value={newProfilePicture}
                onChangeText={setNewProfilePicture}
                placeholderTextColor={'gray'}
                placeholder="New Profile Picture URL"
                style={styles.input}
              />

              {/* Image Selection Button */}
              <TouchableOpacity onPress={selectImage} style={styles.button}>
                <Text>Select Image</Text>
              </TouchableOpacity>

              {/* Display Selected Image */}
              {profilePicture && (
                <Image
                  source={{uri: profilePicture.uri}}
                  style={styles.imagePreview}
                />
              )}

              {/* Edit Name */}
              <TextInput
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Edit Name"
                placeholderTextColor={'gray'}
                style={styles.input}
              />

              {/* Edit State */}
              <TextInput
                value={editedState}
                onChangeText={setEditedState}
                placeholder="Edit State"
                placeholderTextColor={'gray'}
                style={styles.input}
              />

              {/* Edit Country */}
              <TextInput
                value={editedCountry}
                onChangeText={setEditedCountry}
                placeholder="Edit Country"
                placeholderTextColor={'gray'}
                style={styles.input}
              />

              {/* Save Button */}
              <Button color="#DD88CF" title="Save" onPress={handleSave} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Experience Modal */}
      <ExperienceModal
        isVisible={isExperienceModalVisible}
        onClose={() => setExperienceModalVisible(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F9F9F9',
  },
  mainCard: {
    backgroundColor: '#DD88CF',
    padding: 20,
    borderTopStartRadius: 30,
    borderTopEndRadius: 30,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    marginTop: -50,
    zIndex: 2,
  },
  profileCard: {
    position: 'relative',
    alignItems: 'center',
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
    position: 'absolute',
    bottom: 120,
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FFFFFF',
    zIndex: 2,
  },
  userLocation: {
    position: 'absolute',
    bottom: 100,
    fontSize: 16,
    textAlign: 'center',
    color: 'white',
    marginTop: 5,
    zIndex: 2,
  },
  card: {
    backgroundColor: '#6619d2',
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
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white',
  },
  sectionText: {
    fontSize: 16,
    color: 'white',
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
    color: 'white',
  },
  experienceCompany: {
    color: 'white',
    fontWeight: 'bold',
  },
  experienceDuration: {
    color: 'white',
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
