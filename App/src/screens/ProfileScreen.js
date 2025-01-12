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
import {
  editAbout,
  editEdu,
  editExperience,
  editProfile,
} from '../store/slices/authSlice';
import ExperienceModal from '../components/ExperienceModal';
import ProfilePicture from '../components/ProfilePicture';
import InterestsSelector from '../components/InterestsSelector';
import Icons from 'react-native-vector-icons/Ionicons';
import AntDesignIcons from 'react-native-vector-icons/AntDesign';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {axiosInstance} from '../api/axios';

const ProfileScreen = () => {
  const {user} = useSelector(state => state.auth);
  const [userInfo, setUserInfo] = useState({});
  const dispatch = useDispatch();
  const [webData, setWebData] = useState(null);
  const navigation = useNavigation();
  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  const [interestEditing, setInterestEditing] = useState(false);
  const [isExperienceModalVisible, setExperienceModalVisible] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editedExperience, setEditedExperience] = useState({});
  const [editEduIndex, setEditEduIndex] = useState(null);
  const [editedEducation, setEditedEducation] = useState({});
  const [editedAbout, setEditedAbout] = useState(user.bio);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isEdu, setIsEdu] = useState(false);

  // Fetch user info from external APIs (LinkedIn, etc.)
  const fetchUserInfo = async () => {
    try {
      console.log(user?._id);
      const res = await axiosInstance.get(
        `/api/user/fetchUserInfo/${user?._id}`,
      );
      if (res.status === 200) {
        console.log(res?.data?.info);
        setUserInfo(res?.data?.info);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, [user?._id, isExperienceModalVisible]);

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

  const handleSave = async (index, expId) => {
    console.log('triggered');
    // Here, save the edited data into the user's experience array
    const updatedExperience = [...user.experience];
    updatedExperience[index] = {
      ...updatedExperience[index],
      ...editedExperience,
    };
    dispatch(
      editExperience({
        userId: user?._id,
        expId,
        experience: updatedExperience[index],
      }),
    );
    setEditIndex(null); // Exit edit mode
    setEditedExperience({});
  };
  const handleSaveEdu = async (index, eduId) => {
    console.log('triggered');
    // Here, save the edited data into the user's experience array
    const updatedEducation = [...user.education];
    updatedEducation[index] = {
      ...updatedEducation[index],
      ...editedEducation,
    };
    dispatch(
      editEdu({
        userId: user?._id,
        eduId,
        education: updatedEducation[index],
      }),
    );
    setEditEduIndex(null); // Exit edit mode
    setEditedEducation({});
  };

  const handleInputChange = (key, value) => {
    setEditedExperience({...editedExperience, [key]: value});
  };
  const handleInputEduChange = (key, value) => {
    setEditedEducation({...editedEducation, [key]: value});
  };

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
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 15,
            borderBottomWidth: 1,
            borderColor: '#E0DFDC',
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-around',
              gap: 70,
            }}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <AntDesignIcons name="arrowleft" size={30} color="#585C60" />
            </TouchableOpacity>
            <Text style={{color: 'black', fontSize: 20}}>MY PROFILE</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Icons name="settings-sharp" size={30} color="black" />
          </TouchableOpacity>
        </View>
        <View
          style={{
            flexDirection: 'row',
            width: '100%',
            padding: 5,
            paddingTop: 14,
            justifyContent: 'space-between',
          }}>
          <View
            style={{
              flexDirection: 'row',
              gap: 20,
              // justifyContent: 'space-between',
            }}>
            <ProfilePicture
              profilePictureUri={user.profilePicture}
              width={120}
              height={120}
              borderRadius={60}
              borderColor="#242760"
            />
            <View style={{marginRight: 10}}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userLocation}>
                {user.location?.state || 'State'},{' '}
                {user.location?.country || 'Country'}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 7,
                  marginTop: 8,
                }}>
                <Icons name="logo-linkedin" size={25} color="#0A66C2" />
                <AntDesignIcons name="github" size={25} color="#24292F" />
                <FontAwesome name="reddit" size={25} color="#FF4500" />
                <FontAwesome name="whatsapp" size={25} color="#25D366" />
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={{marginRight: 15}}
            onPress={() => navigation.navigate('EditProfile')}>
            <SimpleLineIcons name="pencil" size={20} color="#585C60" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{marginTop: 20}}>
        <View
          style={{
            width: '100%',
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
                color: '#A274FF',
                fontSize: 22,
                fontWeight: '500',
                textAlign: 'center',
              }}>
              {user?.friends?.length}
            </Text>
            <Text style={{color: 'black', fontWeight: '500'}}>Connections</Text>
          </TouchableOpacity>
          <View>
            <Text
              style={{
                color: '#A274FF',
                fontSize: 22,
                fontWeight: '500',
                textAlign: 'center',
              }}>
              {userInfo?.communities?.total}
            </Text>
            <Text style={{color: 'black', fontWeight: '500'}}>Communities</Text>
          </View>
          <View>
            <Text
              style={{
                color: '#A274FF',
                fontSize: 22,
                fontWeight: '500',
                textAlign: 'center',
              }}>
              0
            </Text>
            <Text style={{color: 'black', fontWeight: '500'}}>Events Done</Text>
          </View>
        </View>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 10,
            gap: 10,
            paddingHorizontal: 20,
          }}>
          <TouchableOpacity
            // onPress={() => navigation.navigate('EditProfile')}
            style={{
              backgroundColor: '#A274FF',
              padding: 13,
              borderRadius: 30,
              flex: 1,
            }}>
            <Text
              style={{color: 'white', textAlign: 'center', fontWeight: '500'}}>
              My Posts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            // onPress={() => navigation.navigate('Match')}
            style={{
              backgroundColor: 'white',
              padding: 12,
              borderRadius: 30,
              borderWidth: 1.4,
              borderColor: '#585C60',
              flex: 1,
            }}>
            <Text
              style={{
                color: '#585C60',
                textAlign: 'center',
                fontWeight: '500',
              }}>
              Add Section
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1.4,
              borderColor: '#585C60',
            }}>
            <SimpleLineIcons name="options" size={20} color="#585C60" />
          </TouchableOpacity>
        </View>
        <View
          style={{
            backgroundColor: '#E9E5DF',
            margin: 15,
            padding: 15,
            borderRadius: 10,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text style={{fontWeight: 'bold', color: 'black'}}>
              Networking Goal
            </Text>
            {!aboutModalVisible ? (
              <TouchableOpacity onPress={() => setAboutModalVisible(true)}>
                <SimpleLineIcons name="pencil" size={15} color="#585C60" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  setAboutModalVisible(false);
                  handleAboutSave();
                }}>
                <SimpleLineIcons name="check" size={15} color="#A274FF" />
              </TouchableOpacity>
            )}
          </View>
          {!aboutModalVisible ? (
            <Text style={{color: 'black', marginBottom: 5}}>{user?.bio}</Text>
          ) : (
            <TextInput
              value={editedAbout}
              onChangeText={setEditedAbout}
              placeholder="Edit About"
              placeholderTextColor={'gray'}
              style={{color: 'black'}}
              autoFocus={true} // Auto-focus on the TextInput when the modal opens
            />
          )}

          <TouchableOpacity>
            <Text style={{color: '#A274FF'}}>See all details</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{backgroundColor: '#A274FF', padding: 15}}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Text style={{fontSize: 17, fontWeight: '500', color: 'white'}}>
            Your Dashboard
          </Text>
          <View>
            <Text style={{fontSize: 17, fontWeight: '500', color: 'white'}}>
              ALL-STAR
            </Text>
          </View>
        </View>
        <Text style={{fontStyle: 'italic', color: 'white', marginBottom: 8}}>
          Private to you
        </Text>
        <View
          style={{
            backgroundColor: 'white',
            // padding: 5,
            borderRadius: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-evenly',
          }}>
          <View
            style={{
              borderRightWidth: 1,
              padding: 5,
              flex: 1,
              justifyContent: 'flex-start',
              borderColor: '#E0DFDC',
              margin: 5,
            }}>
            <Text
              style={{
                textAlign: 'center',
                color: '#0A66C2',
                fontWeight: 'bold',
                fontSize: 18,
              }}>
              22,25,200
            </Text>
            <Text style={{textAlign: 'center', color: '#585C60'}}>
              Who viewed your profile
            </Text>
          </View>
          <View
            style={{
              padding: 2,
              flex: 1,
              flexDirection: 'column',
              alignSelf: 'flex-start',
              height: '100%',
              margin: 5,
            }}>
            <Text
              style={{
                textAlign: 'center',
                color: '#0A66C2',
                fontWeight: 'bold',
                fontSize: 18,
              }}>
              22,25,200
            </Text>
            <Text style={{textAlign: 'center', color: '#585C60'}}>
              Post views
            </Text>
          </View>
          <View
            style={{
              borderLeftWidth: 1,
              padding: 5,
              flex: 1,
              margin: 5,
              borderColor: '#E0DFDC',
            }}>
            <Text
              style={{
                textAlign: 'center',
                color: '#0A66C2',
                fontWeight: 'bold',
                fontSize: 18,
              }}>
              22,25,200
            </Text>
            <Text style={{textAlign: 'center', color: '#585C60'}}>
              Search appearances
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.mainCard}>
        {/* About Section */}
        {/* <View style={styles.titleSection}>
          <Text style={styles.sectionTitle}>About</Text>
          <TouchableOpacity onPress={handleAboutEditPress}>
            <Image style={{height: 15, width: 15}} source={penIcon} />
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionText}>{user.bio}</Text>
        </View> */}

        {/* Experience Section */}
        <View style={styles.titleSection}>
          <Text style={styles.sectionTitle}>Experience</Text>
          <View style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}>
            <TouchableOpacity onPress={() => setExperienceModalVisible(true)}>
              <AntDesignIcons name="plus" size={21} color="#A274FF" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                editIndex ? setEditIndex(null) : setEditIndex(true)
              }>
              <SimpleLineIcons
                name={editIndex !== null ? 'close' : 'pencil'}
                size={18}
                color="#A274FF"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          {user.experience?.map((exp, index) => (
            <View key={index} style={styles.experienceItem}>
              {editIndex != null && (
                <TouchableOpacity
                  style={{alignSelf: 'flex-end'}}
                  onPress={() =>
                    editIndex === index
                      ? handleSave(index, exp._id)
                      : setEditIndex(index)
                  }>
                  <SimpleLineIcons
                    name={editIndex === index ? 'check' : 'pencil'}
                    size={18}
                    color="#A274FF"
                  />
                </TouchableOpacity>
              )}
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                {editIndex === index ? (
                  <TextInput
                    defaultValue={exp.company || ''}
                    style={[styles.experienceInput, styles.experienceCompany]}
                    value={editedExperience.company}
                    onChangeText={text => handleInputChange('company', text)}
                  />
                ) : (
                  <Text style={styles.experienceCompany}>{exp.company}</Text>
                )}
                <Text style={styles.experienceDuration}>
                  {formatDate(exp.startDate)}-
                  {exp.isPresent ? 'Present' : formatDate(exp.endDate)}
                </Text>
              </View>
              {editIndex === index ? (
                <TextInput
                  defaultValue={exp.role || ''}
                  style={[styles.experienceInput, styles.experienceTitle]}
                  value={editedExperience.role}
                  onChangeText={text => handleInputChange('role', text)}
                />
              ) : (
                <Text style={styles.experienceTitle}>{exp.role}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Education Section */}
        <View style={styles.titleSection}>
          <Text style={styles.sectionTitle}>Education</Text>
          <View style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}>
            <TouchableOpacity
              onPress={() => {
                setExperienceModalVisible(true);
                setIsEdu(true);
              }}>
              <AntDesignIcons name="plus" size={21} color="#A274FF" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                editEduIndex ? setEditEduIndex(null) : setEditEduIndex(true);
              }}>
              <SimpleLineIcons
                name={editEduIndex !== null ? 'close' : 'pencil'}
                size={18}
                color="#A274FF"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          {user?.education?.map((edu, index) => (
            <View key={index} style={styles.experienceItem}>
              {editEduIndex !== null && (
                <TouchableOpacity
                  style={{alignSelf: 'flex-end'}}
                  onPress={() =>
                    editEduIndex === index
                      ? handleSaveEdu(index, edu._id)
                      : setEditEduIndex(index)
                  }>
                  <SimpleLineIcons
                    name={editEduIndex === index ? 'check' : 'pencil'}
                    size={18}
                    color="#A274FF"
                  />
                </TouchableOpacity>
              )}
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                {editEduIndex === index ? (
                  <TextInput
                    defaultValue={edu.school || ''}
                    style={[styles.experienceInput, styles.experienceTitle]}
                    value={editedEducation.school}
                    onChangeText={text => handleInputEduChange('school', text)}
                  />
                ) : (
                  <Text style={styles.experienceCompany}>{edu.school}</Text>
                )}
                <Text style={styles.experienceDuration}>
                  {formatDate(edu.startDate)}-{formatDate(edu.endDate)}
                </Text>
              </View>

              {editEduIndex === index ? (
                <TextInput
                  defaultValue={edu.degree || ''}
                  style={[styles.experienceInput, styles.experienceTitle]}
                  value={editedEducation.degree}
                  onChangeText={text => handleInputEduChange('degree', text)}
                />
              ) : (
                <Text style={styles.experienceTitle}>{edu.degree}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Interest Section */}
        {/* <View style={styles.titleSection}>
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
        </View> */}

        {/* On the Web Section */}
        {/* <View style={styles.titleSection}>
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
        </View> */}
      </View>

      {/* Edit About Modal */}

      {/* Experience Modal */}
      <ExperienceModal
        isVisible={isExperienceModalVisible}
        onClose={() => {
          setExperienceModalVisible(false);
          setIsEdu(false);
        }}
        isEdu={isEdu}
        userInfo={userInfo}
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
    backgroundColor: 'white',
  },
  mainCard: {
    backgroundColor: 'white',
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
  experienceInput: {
    borderBottomWidth: 1,
    borderColor: '#A274FF',
    padding: 5,
    fontSize: 14,
    color: '#333',
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
    fontSize: 25,
    fontWeight: '500',
    textAlign: 'left',
    color: 'black',
    zIndex: 2,
  },
  userLocation: {
    fontSize: 17,
    textAlign: 'left',
    color: '#585C60',
    marginTop: 5,
    zIndex: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    // paddingVertical: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  titleSection: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    // marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    color: 'black',
  },
  sectionText: {
    fontSize: 14,
    color: 'black',
  },
  experienceItem: {
    // marginBottom: 10,
    borderBottomWidth: 1,
    padding: 20,
    borderColor: '#E0DFDC',
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
    fontWeight: '500',
    fontSize: 16,
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
