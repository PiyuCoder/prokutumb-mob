import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {launchImageLibrary} from 'react-native-image-picker';
import {axiosInstance, axiosInstanceForm} from '../api/axios';
import AntDesignIcons from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSelector} from 'react-redux';
import ProfilePicture from '../components/ProfilePicture';

const CreateCommunity = ({navigation}) => {
  const {user} = useSelector(state => state.auth);
  const [communityName, setCommunityName] = useState('');
  const [communityType, setCommunityType] = useState('');
  const [communityAbout, setCommunityAbout] = useState('');
  const [communityLocation, setCommunityLocation] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [description, setDescription] = useState('');
  const [activeTab, setActiveTab] = useState('Basic');

  const [searchQuery, setSearchQuery] = useState('');
  const [connections, setConnections] = useState([]);
  const [filteredConnections, setFilteredConnections] = useState([]);

  const [activeSubTab, setActiveSubTab] = useState('AllConnections');
  const [newConnectionName, setNewConnectionName] = useState('');
  const [newConnectionEmail, setNewConnectionEmail] = useState('');

  const [selectedInvitees, setSelectedInvitees] = useState([]);

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
    if (
      communityName &&
      profilePic &&
      description &&
      communityType &&
      communityAbout &&
      communityLocation
    ) {
      try {
        const formData = new FormData();
        formData.append('name', communityName);
        formData.append('type', communityType);
        formData.append('about', communityAbout);
        formData.append('location', communityLocation);
        formData.append('description', description);
        formData.append('profilePicture', {
          uri: profilePic,
          type: 'image/jpeg',
          name: 'profile.jpg',
        });
        formData.append('createdBy', user?._id); // Replace with actual user ID
        formData.append('invitees', selectedInvitees);

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

  console.log(selectedInvitees);

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: 'row',
          gap: 20,
          alignItems: 'center',
          marginBottom: 16,
        }}>
        <TouchableOpacity
          style={{
            backgroundColor: 'white',
            padding: 5,
            borderRadius: 30,
            elevation: 5,
          }}
          onPress={() => navigation.goBack()}>
          <AntDesignIcons name="arrowleft" size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Create Community</Text>
      </View>

      <View
        style={[
          styles.tabContainer,
          {justifyContent: 'center', marginTop: 40},
        ]}>
        <TouchableOpacity
          onPress={() => setActiveTab('Basic')}
          style={[styles.tab, activeTab === 'Basic' && styles.activeTab]}>
          <Text style={styles.tabText}>Basic</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('Media')}
          style={[styles.tab, activeTab === 'Media' && styles.activeTab]}>
          <Text style={styles.tabText}>Media</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('Invitee')}
          style={[styles.tab, activeTab === 'Invitee' && styles.activeTab]}>
          <Text style={styles.tabText}>Invitee</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'Basic' && (
        <View style={styles.form}>
          <TextInput
            placeholder="Community Name"
            value={communityName}
            onChangeText={setCommunityName}
            style={styles.input}
          />
          <TextInput
            placeholder="Community Type"
            value={communityType}
            onChangeText={setCommunityType}
            style={styles.input}
          />
          <TextInput
            placeholder="About(Community goal)"
            value={communityAbout}
            onChangeText={setCommunityAbout}
            style={styles.input}
          />
          <TextInput
            placeholder="Location"
            value={communityLocation}
            onChangeText={setCommunityLocation}
            style={styles.input}
          />
          <TextInput
            numberOfLines={4}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            style={styles.input}
            multiline
          />
        </View>
      )}

      {activeTab === 'Media' && (
        <View style={styles.media}>
          <TouchableOpacity
            style={styles.imagePickerButton}
            onPress={handleImageSelection}>
            <Ionicons name="share-outline" size={35} color="white" />
            <Text style={styles.imagePickerText}>
              {profilePic ? 'Change Image' : 'Upload Media'}
            </Text>
          </TouchableOpacity>
          {profilePic && (
            <Image source={{uri: profilePic}} style={styles.selectedImage} />
          )}
        </View>
      )}

      {activeTab === 'Invitee' && (
        <View style={styles.invitee}>
          {/* Search Input */}
          {activeSubTab === 'AllConnections' && (
            <TextInput
              style={styles.searchInput}
              placeholder="Search connections..."
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={handleSearch}
            />
          )}
          <View
            style={[styles.tabContainer, {justifyContent: 'space-between'}]}>
            <TouchableOpacity
              onPress={() => setActiveSubTab('AllConnections')}
              style={[
                styles.tab,
                activeSubTab === 'AllConnections' && styles.activeTab,
              ]}>
              <Text style={styles.tabText}>All Connections</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveSubTab('AddNew')}
              style={[
                styles.tab,
                activeSubTab === 'AddNew' && styles.activeTab,
              ]}>
              <Text style={styles.tabText}>Add New</Text>
            </TouchableOpacity>
          </View>

          {activeSubTab === 'AllConnections' && (
            <View style={styles.listContainer}>
              {filteredConnections.length > 0 ? (
                filteredConnections.map((connection, index) => (
                  <View
                    key={index}
                    style={[
                      styles.connectionItem,
                      {
                        backgroundColor: selectedInvitees.includes(
                          connection.email,
                        )
                          ? '#a274ff6e'
                          : '#fff',
                      },
                    ]}>
                    <ProfilePicture
                      profilePictureUri={connection.profilePicture}
                      height={45}
                      width={45}
                      borderRadius={22.5}
                    />
                    <View>
                      <Text style={styles.connectionName}>
                        {connection.name}
                      </Text>
                      <Text style={styles.connectionEmail}>
                        {connection.email}
                      </Text>
                    </View>
                    {!selectedInvitees.includes(connection.email) ? (
                      <TouchableOpacity
                        onPress={() =>
                          setSelectedInvitees([
                            ...selectedInvitees,
                            connection?.email,
                          ])
                        }
                        style={{
                          marginLeft: 'auto',
                          backgroundColor: 'white',
                          //   borderWidth: 1,
                          padding: 5,
                          borderRadius: 30,
                          elevation: 5,
                        }}>
                        <Ionicons name="add" size={25} color="black" />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() => {
                          const filtered = selectedInvitees.filter(
                            item => item !== connection.email,
                          );
                          setSelectedInvitees(filtered);
                        }}
                        style={{marginLeft: 'auto'}}>
                        <Ionicons
                          name="close-outline"
                          size={25}
                          color="black"
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              ) : (
                <Text style={styles.noConnectionsText}>
                  No connections found.
                </Text>
              )}
            </View>
          )}

          {activeSubTab === 'AddNew' && (
            <View style={styles.addForm}>
              <TextInput
                placeholder="Name"
                value={newConnectionName}
                onChangeText={setNewConnectionName}
                style={styles.input}
              />
              <TextInput
                placeholder="Email"
                value={newConnectionEmail}
                onChangeText={setNewConnectionEmail}
                style={styles.input}
                keyboardType="email-address"
              />
            </View>
          )}
        </View>
      )}

      {activeTab === 'Media' && <View style={{height: 100}} />}
      {activeTab === 'Invitee' && <View style={{flex: 1}} />}

      {activeTab === 'Invitee' && activeSubTab === 'AddNew' && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddConnection}>
          <Text
            style={{
              color: 'black',
              fontWeight: 'bold',
              fontSize: 20,
              letterSpacing: 1,
            }}>
            Add
          </Text>
        </TouchableOpacity>
      )}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleCreateCommunity}>
          <Text style={styles.submitButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CreateCommunity;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
    height: '100%',
    position: 'relative',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
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
    borderRadius: 20,
    padding: 12,
    paddingStart: 20,
    marginBottom: 16,
    elevation: 7,
    backgroundColor: 'white',
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
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  media: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 7,
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#36454F',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 10,
  },
  imagePickerText: {
    color: '#fff',
    fontSize: 20,
    letterSpacing: 1,
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
