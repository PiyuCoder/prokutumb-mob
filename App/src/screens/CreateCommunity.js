import {
  Alert,
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {launchImageLibrary} from 'react-native-image-picker';
import {axiosInstance, axiosInstanceForm} from '../api/axios';
import AntDesignIcons from 'react-native-vector-icons/AntDesign';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSelector} from 'react-redux';
import ProfilePicture from '../components/ProfilePicture';
import {Picker} from '@react-native-picker/picker';

const CreateCommunity = ({navigation}) => {
  const {user} = useSelector(state => state.auth);
  const [communityName, setCommunityName] = useState('');
  const [communityType, setCommunityType] = useState('');
  const [communityAbout, setCommunityAbout] = useState('');
  const [communityLocation, setCommunityLocation] = useState('');
  const [timezone, setTimezone] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [description, setDescription] = useState('');
  const [activeTab, setActiveTab] = useState('CommunityType');
  const [isFreeMembership, setFreeMembership] = useState(true);
  const [isPreview, setIsPreview] = useState(false);
  const [category, setCategory] = useState('');

  const [step, setStep] = useState(1);

  const [searchQuery, setSearchQuery] = useState('');
  const [connections, setConnections] = useState([]);
  const [filteredConnections, setFilteredConnections] = useState([]);

  const [activeSubTab, setActiveSubTab] = useState('AllConnections');
  const [newConnectionName, setNewConnectionName] = useState('');
  const [newConnectionEmail, setNewConnectionEmail] = useState('');

  const [selectedInvitees, setSelectedInvitees] = useState([]);

  const formRef = useRef();

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/user/friends/${user?._id}`,
        );
        setConnections(response.data);
        setFilteredConnections(response.data); // Display all connections initially
      } catch (error) {
        console.error('Error fetching connections:', error);
      }
    };
    if (user?._id) fetchConnections();
  }, [user?._id]);

  // Filter connections based on search query
  const handleSearch = query => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredConnections(connections);
    } else {
      setFilteredConnections(
        connections.filter(connection =>
          connection.name.toLowerCase().includes(query.toLowerCase()),
        ),
      );
    }
  };

  const handleImageSelection = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        maxWidth: 300,
        maxHeight: 300,
        quality: 0.7,
      });

      if (!result.didCancel && result.assets?.length > 0) {
        setProfilePic(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting image:', error.message);
    }
  };

  const handleCreateCommunity = async () => {
    if (activeTab === 'Basic') {
      if (!communityName || !profilePic || !description) {
        Alert.alert(
          'Missing Fields',
          'Please fill in all required fields before proceeding.',
        );
        return;
      }
      setActiveTab('Schedule');
      setStep(2);
      return;
    } else if (activeTab === 'Schedule') {
      if (!communityLocation || !timezone) {
        Alert.alert(
          'Missing Fields',
          'Please fill in all required fields before proceeding.',
        );
        return;
      }
      setActiveTab('MembershipDetails');
      setStep(3);
      return;
    } else if (!isPreview && activeTab === 'MembershipDetails') {
      setIsPreview(true);
      return;
    }
    if (
      communityName &&
      profilePic &&
      description &&
      communityType &&
      communityLocation &&
      timezone
    ) {
      try {
        const formData = new FormData();
        formData.append('name', communityName);
        formData.append('communityType', communityType);
        formData.append('timezone', timezone);
        formData.append('location', communityLocation);
        formData.append('description', description);
        formData.append('category', category);
        formData.append('profilePicture', {
          uri: profilePic,
          type: 'image/jpeg',
          name: 'profile.jpg',
        });
        formData.append('createdBy', user?._id);

        const res = await axiosInstanceForm.post('/api/communities', formData);

        if (res.status === 201) {
          // alert('Community created successfully!');
          setCommunityName('');
          setProfilePic(null);
          setDescription('');
          navigation.replace('SuccessCreation', {
            isEvent: false,
            isRegistered: false,
          });
        }
      } catch (error) {
        console.error('Error creating community:', error.message);
      }
    } else {
      alert('Please fill all fields');
    }
  };
  const handleCreateDraftCommunity = async () => {
    if (
      communityName &&
      profilePic &&
      description &&
      communityType &&
      communityLocation &&
      timezone
    ) {
      try {
        const formData = new FormData();
        formData.append('name', communityName);
        formData.append('type', communityType);
        formData.append('timezone', timezone);
        formData.append('location', communityLocation);
        formData.append('description', description);
        formData.append('category', category);
        formData.append('profilePicture', {
          uri: profilePic,
          type: 'image/jpeg',
          name: 'profile.jpg',
        });
        formData.append('createdBy', user?._id);

        const res = await axiosInstanceForm.post('/api/communities', formData);

        if (res.status === 201) {
          setCommunityName('');
          setProfilePic(null);
          setDescription('');

          ToastAndroid.show('Saved as draft!', ToastAndroid.SHORT);

          navigation.goBack();
        }
      } catch (error) {
        console.error('Error creating community:', error.message);
      }
    } else {
      alert('Please fill all fields');
    }
  };

  const backPress = () => {
    if (activeTab === 'Basic') {
      setActiveTab('CommunityType');
      return;
    } else if (activeTab === 'Schedule') {
      setActiveTab('Basic');
      setStep(1);
      return;
    } else if (activeTab === 'MembershipDetails') {
      setActiveTab('Schedule');
      setStep(2);
      return;
    }
  };

  const handleAddConnection = () => {
    if (newConnectionName && newConnectionEmail) {
      // setFilteredConnections([
      //   {
      //     name: newConnectionName,
      //     email: newConnectionEmail,
      //     profilePicture: '',
      //   },
      //   ...connections,
      // ]);
      setSelectedInvitees([...selectedInvitees, newConnectionEmail]);
      setNewConnectionName('');
      setNewConnectionEmail('');
      alert('Connection added successfully!');
    } else {
      alert('Please fill out all fields.');
    }
  };

  useEffect(() => {
    if (formRef.current) {
      formRef.current.scrollTo({top: 0, behavior: 'smooth'}); // Smooth scrolling to the top
    }
  }, [step]);

  return (
    <ScrollView ref={formRef} style={styles.container}>
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
        <Text style={styles.title}>Create Community</Text>
      </View>
      {!isPreview ? (
        <>
          {activeTab !== 'CommunityType' && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
              }}>
              <TouchableOpacity
                onPress={backPress}
                style={{
                  borderWidth: 1,
                  height: 35,
                  width: 35,
                  borderRadius: 17.5,
                  aspectRatio: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderColor: '#EBEBEB',
                }}>
                <Feather name="chevron-left" size={20} color="black" />
              </TouchableOpacity>
              <View
                style={{
                  borderWidth: 1,
                  padding: 4,
                  paddingHorizontal: 15,
                  borderRadius: 30,
                  borderColor: '#B0B8C3',
                }}>
                <Text style={{color: 'gray'}}>{`${step}/3`}</Text>
              </View>
            </View>
          )}
          {activeTab === 'CommunityType' && (
            <ScrollView style={{padding: 40}}>
              <TouchableOpacity
                onPress={() => {
                  setCommunityType('Regional');
                  setActiveTab('Basic');
                  setStep(1);
                }}
                style={{
                  backgroundColor: '#E7CBFE',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 30,
                  paddingVertical: 40,
                  borderRadius: 20,
                  gap: 10,
                }}>
                <MaterialIcons
                  name="supervised-user-circle"
                  color="black"
                  size={30}
                />
                <Text style={[styles.title, {color: 'black'}]}>
                  Regional Community
                </Text>
                <Text
                  style={{
                    color: '#273C54',
                    width: '70%',
                    textAlign: 'center',
                    fontSize: 16,
                  }}>
                  In person attendees at a physical location
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setCommunityType('Worldwide');
                  setActiveTab('Basic');
                  setStep(1);
                }}
                style={{
                  backgroundColor: '#D4E7DB',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 20,
                  paddingVertical: 40,
                  borderRadius: 20,
                  gap: 10,
                  marginTop: 15,
                }}>
                <Ionicons name="desktop" color="#028707" size={30} />
                <Text style={[styles.title, {color: 'black'}]}>
                  Worldwide Community
                </Text>
                <Text
                  style={{
                    color: '#273C54',
                    width: '70%',
                    textAlign: 'center',
                    fontSize: 16,
                  }}>
                  In person attendees at a physical location
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}
          {activeTab === 'Basic' && (
            <View style={styles.form}>
              <Text
                style={[
                  styles.title,
                  {color: 'black', textAlign: 'left', marginBottom: 15},
                ]}>
                Basic Community details
              </Text>
              <Text style={{marginBottom: 10, color: '#798CA3'}}>
                Create your {communityType?.toLowerCase()} community by
                providing the details below
              </Text>
              <TextInput
                placeholder="Community Name *"
                value={communityName}
                onChangeText={setCommunityName}
                style={styles.input}
                placeholderTextColor={'gray'}
              />
              <TextInput
                numberOfLines={4}
                placeholder="Description *"
                value={description}
                onChangeText={setDescription}
                style={styles.input}
                multiline
                placeholderTextColor={'gray'}
              />
              {/* <TextInput
                placeholder="Community Type"
                value={communityType}
                onChangeText={setCommunityType}
                style={styles.input}
                placeholderTextColor={'gray'}
              /> */}
              <View style={[styles.input, {marginVertical: 10}]}>
                <Picker
                  placeholder="Category"
                  dropdownIconColor="black"
                  selectedValue={category}
                  onValueChange={itemValue => setCategory(itemValue)}>
                  <Picker.Item
                    label="Category (Optional)"
                    value=""
                    enabled={false}
                    color="gray"
                  />
                  {['Networking', 'Business', 'Technology', 'Marketing'].map(
                    (cat, index) => (
                      <Picker.Item
                        color="black"
                        style={{
                          padding: 30,
                          color: 'black',
                          backgroundColor: 'white',
                          borderRadius: 30,
                        }}
                        key={index}
                        label={cat}
                        value={cat}
                      />
                    ),
                  )}
                </Picker>
              </View>

              <View style={styles.media}>
                {profilePic ? (
                  <Image
                    source={{uri: profilePic}}
                    style={styles.selectedImage}
                  />
                ) : (
                  <Feather name="image" size={50} color="#C1CAD5" />
                )}
                <TouchableOpacity
                  style={styles.imagePickerButton}
                  onPress={handleImageSelection}>
                  <Text style={styles.imagePickerText}>
                    {profilePic ? 'Change banner' : 'Upload community banner'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {activeTab === 'Schedule' && (
            <View style={styles.form}>
              <Text
                style={[
                  styles.title,
                  {color: 'black', textAlign: 'left', marginBottom: 15},
                ]}>
                Community Location
              </Text>
              <Text style={{marginBottom: 10, color: '#798CA3'}}>
                Create your {communityType?.toLowerCase()} community by
                providing the details below
              </Text>
              <TouchableOpacity
                onPress={() => setActiveTab('CommunityType')}
                style={{
                  backgroundColor: '#F6F6F6',
                  padding: 4,
                  paddingHorizontal: 8,
                  borderRadius: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 3,
                  width: 160,
                  marginBottom: 35,
                  marginTop: 20,
                }}>
                <Text style={{fontSize: 12, color: '#B0B8C3'}}>
                  {communityType} community
                </Text>
                <SimpleLineIcons name="pencil" color="#200E32" />
              </TouchableOpacity>
              <TextInput
                placeholder="Enter Address *"
                value={communityLocation}
                onChangeText={setCommunityLocation}
                style={styles.input}
                placeholderTextColor={'gray'}
              />
              <TextInput
                placeholder="Timezone *"
                value={timezone}
                onChangeText={setTimezone}
                style={styles.input}
                placeholderTextColor={'gray'}
              />
              <View style={{height: 100}} />
            </View>
          )}
          {activeTab === 'MembershipDetails' && (
            <ScrollView style={styles.form}>
              <Text
                style={[
                  styles.title,
                  {color: 'black', textAlign: 'left', marginBottom: 15},
                ]}>
                Membership details
              </Text>
              <Text style={{marginBottom: 10, color: '#798CA3'}}>
                Create your community by providing the details below
              </Text>
              <TouchableOpacity
                onPress={() => setActiveTab('CommunityType')}
                style={{
                  backgroundColor: '#F6F6F6',
                  padding: 4,
                  paddingHorizontal: 8,
                  borderRadius: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 3,
                  width: 160,
                  marginBottom: 35,
                  marginTop: 20,
                }}>
                <Text style={{fontSize: 12, color: '#B0B8C3'}}>
                  {communityType} community
                </Text>
                <SimpleLineIcons name="pencil" color="#200E32" />
              </TouchableOpacity>
              <View
                style={{
                  backgroundColor: '#333333',
                  padding: 7,
                  flexDirection: 'row',
                  borderRadius: 40,
                }}>
                <TouchableOpacity
                  onPress={() => setFreeMembership(true)}
                  style={{
                    flex: 1,
                    backgroundColor: isFreeMembership ? 'white' : '#333333',
                    padding: 7,
                    borderRadius: 40,
                  }}>
                  <Text
                    style={{
                      textAlign: 'center',
                      color: !isFreeMembership ? 'white' : '#333333',
                    }}>
                    Free Membership
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setFreeMembership(false)}
                  style={{
                    flex: 1,
                    backgroundColor: !isFreeMembership ? 'white' : '#333333',
                    padding: 7,
                    borderRadius: 40,
                  }}>
                  <Text
                    style={{
                      textAlign: 'center',
                      color: isFreeMembership ? 'white' : '#333333',
                    }}>
                    Paid Membership
                  </Text>
                </TouchableOpacity>
              </View>
              {isFreeMembership ? (
                <>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      alignSelf: 'center',
                      marginTop: 30,
                      marginBottom: 16,
                    }}>
                    <Text
                      style={{
                        backgroundColor: '#F0F5F9',
                        padding: 12,
                        paddingHorizontal: 25,
                        color: '#333333',
                        elevation: 5,
                        borderRadius: 30,
                      }}>
                      Free $0.00
                    </Text>
                    <View style={{height: 150}} />
                  </View>
                </>
              ) : (
                <>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderWidth: 1,
                      borderColor: 'black',
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 16,
                      marginTop: 15,
                      backgroundColor: 'white',
                      alignSelf: 'center',
                      borderColor: 'gold',
                    }}>
                    <Text style={{color: 'gold'}}>Launching soon!</Text>
                  </View>

                  <View style={{height: 127}} />
                </>
              )}
            </ScrollView>
          )}
          {activeTab !== 'CommunityType' && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleCreateCommunity}>
                <Text style={styles.submitButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      ) : (
        <ScrollView style={{padding: 16, flex: 1}}>
          <TouchableOpacity
            onPress={() => {
              setIsPreview(false);
              setActiveTab('MembershipDetails');
              setStep(3);
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: 7,
            }}>
            <Feather name="chevron-left" size={25} color="black" />
            <Text style={{color: '#375476', fontSize: 17}}>Back</Text>
          </TouchableOpacity>
          <Text
            style={[
              styles.title,
              {color: 'black', textAlign: 'left', marginVertical: 15},
            ]}>
            Preview Community details
          </Text>
          <ImageBackground
            style={{
              height: 300,
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            imageStyle={{borderRadius: 10}}
            source={{uri: profilePic}}>
            <TouchableOpacity
              style={{
                backgroundColor: 'white',
                padding: 12,
                paddingHorizontal: 30,
                borderRadius: 30,
              }}>
              <Text style={{color: '#798CA3'}}>Edit Banner</Text>
            </TouchableOpacity>
          </ImageBackground>
          <View
            style={{
              height: 10,
              width: '100%',
              backgroundColor: 'black',
              marginVertical: 35,
            }}
          />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text
              style={[
                styles.title,
                {color: 'black', textAlign: 'left', marginBottom: 15},
              ]}>
              {communityName}
            </Text>
            <TouchableOpacity
              style={{
                borderRadius: 30,
                padding: 10,
                backgroundColor: '#F6F6F6',
              }}
              onPress={() => {
                setIsPreview(false);
                setStep(1);
                setActiveTab('Basic');
              }}>
              <SimpleLineIcons name="pencil" size={15} color="#585C60" />
            </TouchableOpacity>
          </View>
          <Text style={{marginBottom: 10, color: '#375476'}}>
            {description}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <View style={{width: '60%'}}>
              <View
                // className="bg-[#ffffff3e]"
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  marginTop: 5,
                  // width: '100%',
                  paddingRight: 10,
                }}>
                <Ionicons name="location-outline" size={20} color="#2D264B40" />
                <View style={{marginLeft: 10}}>
                  <Text style={{color: 'black'}}>
                    {communityLocation || ''}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={{
                borderRadius: 30,
                padding: 10,
                backgroundColor: '#F6F6F6',
              }}
              onPress={() => {
                setIsPreview(false);
                setStep(2);
                setActiveTab('Schedule');
              }}>
              <SimpleLineIcons name="pencil" size={15} color="#585C60" />
            </TouchableOpacity>
          </View>
          <View
            style={{
              height: 10,
              width: '100%',
              backgroundColor: 'black',
              marginTop: 35,
              marginBottom: 20,
            }}
          />
          <Text style={{fontWeight: '600', color: 'black', fontSize: 17}}>
            Membership
          </Text>
          <View style={{flex: 1}}>
            {/* Button fixed at the bottom */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleCreateCommunity}>
              <Text style={styles.submitButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
          {/* <TouchableOpacity
            onPress={handleCreateDraftCommunity}
            style={[styles.submitButton, {backgroundColor: 'black'}]}>
            <Text style={styles.submitButtonText}>Save as Draft</Text>
          </TouchableOpacity> */}
        </ScrollView>
      )}
    </ScrollView>
  );
};

export default CreateCommunity;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F4F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#A274FF',
  },
  tabContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 16,
    gap: 20,
  },
  tab: {
    padding: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: 'black',
  },
  tabText: {
    fontSize: 16,
    color: 'black',
  },
  form: {
    flex: 1,
    padding: 16,
  },
  addForm: {
    flex: 1,
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
    padding: 12,
    paddingStart: 20,
    marginBottom: 16,
    backgroundColor: 'white',
    color: 'black',
  },
  addButton: {
    backgroundColor: 'white',
    padding: 12,
    borderWidth: 2,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'center',
    position: 'absolute',
    bottom: 80,
    width: '100%',
  },
  submitButton: {
    backgroundColor: '#A274FF',
    padding: 16,
    borderRadius: 48,
    alignItems: 'center',
    // position: 'absolute',
    // bottom: 0,
    width: '70%',
    marginVertical: 20,
    alignSelf: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 17,
  },
  media: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#EBEBEB',
    height: 300,
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 48,
    marginVertical: 16,
    gap: 10,
    paddingHorizontal: 16,
  },
  imagePickerText: {
    color: '#798CA3',
    fontSize: 15,
  },
  selectedImage: {
    width: 200,
    height: 200,
    borderRadius: 20,
  },
  invitee: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // padding: 16,
  },
  searchInput: {
    borderWidth: 1,
    marginBottom: 15,
    width: '100%',
    borderRadius: 30,
    paddingHorizontal: 20,
    marginTop: 30,
    elevation: 7,
    backgroundColor: 'white',
    color: 'black',
  },
  inviteeText: {
    fontSize: 18,
    color: '#777',
  },
  listContainer: {
    // padding: 8,
    width: '100%',
  },
  connectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginBottom: 8,
    // borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    gap: 10,
    width: '100%',
  },
  connectionName: {
    fontSize: 16,
    fontWeight: '500',
    color: 'black',
  },
  connectionEmail: {
    fontSize: 14,
    color: 'gray',
  },
  noConnectionsText: {
    textAlign: 'center',
    color: '#777',
    fontSize: 16,
  },
});
