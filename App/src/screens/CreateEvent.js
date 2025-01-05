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
import {ScrollView} from 'react-native-gesture-handler';
import {Picker} from '@react-native-picker/picker';

const CreateEvent = ({navigation, route}) => {
  const {user} = useSelector(state => state.auth);
  const myCommunities = route?.params?.myCommunities;
  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState('');
  const [eventOcassion, setEventOcassion] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventStartTime, setEventStartTime] = useState('');
  const [eventEndTime, setEventEndTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [description, setDescription] = useState('');
  const [communityId, setCommunityId] = useState(
    route.params?.communityId ? myCommunities[0]?._id : '',
  );
  const [address, setAddress] = useState('');
  const [tags, setTags] = useState('');
  const [activeTab, setActiveTab] = useState('Basic');

  const [searchQuery, setSearchQuery] = useState('');
  const [connections, setConnections] = useState([]);
  const [filteredConnections, setFilteredConnections] = useState([]);

  //   const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);

  const [activeSubTab, setActiveSubTab] = useState('AllConnections');
  const [newConnectionName, setNewConnectionName] = useState('');
  const [newConnectionEmail, setNewConnectionEmail] = useState('');

  const [selectedInvitees, setSelectedInvitees] = useState([]);

  useEffect(() => {
    if (route.params?.communityId || myCommunities?.length) {
      setCommunityId(myCommunities[0]?._id || '');
    }
  }, [route.params, myCommunities]);

  console.log('commId', communityId);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/user/friends/${user?._id}`,
        );
        setConnections(response.data);
        setFilteredConnections(response.data); // Display all connections initially
        setFilteredMembers([]);
        // setMembers([])
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

  const handleCreateEvent = async () => {
    if (
      eventName &&
      profilePic &&
      description &&
      eventType &&
      eventOcassion &&
      eventLocation &&
      communityId
    ) {
      try {
        const formData = new FormData();
        formData.append('name', eventName);
        formData.append('eventType', eventType);
        formData.append('ocassion', eventOcassion);
        formData.append('date', eventDate);
        formData.append('startTime', eventStartTime);
        formData.append('endTime', eventEndTime);
        formData.append('location', eventLocation);
        formData.append('description', description);
        formData.append('communityId', communityId);
        formData.append('tags', tags);
        formData.append('address', address);

        formData.append('profilePicture', {
          uri: profilePic,
          type: 'image/jpeg',
          name: 'profile.jpg',
        });

        formData.append('createdBy', user?._id); // Ensure user object is passed correctly

        formData.append('invitees', selectedInvitees);
        // console.log('FormData', formData);
        const res = await axiosInstanceForm.post(
          '/api/communities/events',
          formData,
        );

        if (res.status === 201) {
          // alert('Event created successfully!');
          // Reset form state
          setEventName('');
          setProfilePic(null);
          setDescription('');
          setEventOcassion('');
          setEventLocation('');
          setEventDate('');
          setEventStartTime('');
          setEventEndTime('');

          navigation.replace('SuccessCreation', {
            isEvent: true,
            isRegistered: false,
          });
        }
      } catch (error) {
        console.error('Error creating event:', error.message);
        alert('Failed to create event. Please try again.');
      }
    } else {
      alert('Please fill all fields');
    }
  };

  // console.log(myCommunities);

  const handleAddConnection = () => {
    if (newConnectionName && newConnectionEmail) {
      // setConnections([
      //   ...connections,
      //   {name: newConnectionName, email: newConnectionEmail},
      // ]);
      setSelectedInvitees([...selectedInvitees, newConnectionEmail]);
      setNewConnectionName('');
      setNewConnectionEmail('');
      alert('Connection added successfully!');
    } else {
      alert('Please fill out all fields.');
    }
  };

  // console.log(selectedInvitees);
  console.log('communityId:', selectedInvitees);

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
        <Text style={styles.title}>Create Event</Text>
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
        <ScrollView style={styles.form}>
          <TextInput
            placeholder="Event Name"
            value={eventName}
            onChangeText={setEventName}
            style={styles.input}
            placeholderTextColor={'gray'}
          />
          <TextInput
            placeholder="Event Type"
            value={eventType}
            onChangeText={setEventType}
            style={styles.input}
            placeholderTextColor={'gray'}
          />
          <TextInput
            placeholder="Ocassion"
            value={eventOcassion}
            onChangeText={setEventOcassion}
            style={styles.input}
            placeholderTextColor={'gray'}
          />
          <TextInput
            placeholder="Date eg. 12/12/2021"
            value={eventDate}
            onChangeText={setEventDate}
            style={styles.input}
            placeholderTextColor={'gray'}
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 20,
            }}>
            <TextInput
              placeholder="Start time"
              value={eventStartTime}
              onChangeText={setEventStartTime}
              style={[styles.input, {flex: 1}]}
              placeholderTextColor={'gray'}
            />
            <TextInput
              placeholder="End time"
              value={eventEndTime}
              onChangeText={setEventEndTime}
              style={[styles.input, {flex: 1}]}
              placeholderTextColor={'gray'}
            />
          </View>
          <TextInput
            placeholder="Location"
            value={eventLocation}
            onChangeText={setEventLocation}
            style={styles.input}
            placeholderTextColor={'gray'}
          />
          <TextInput
            placeholder="Full Address"
            value={address}
            onChangeText={setAddress}
            style={styles.input}
            placeholderTextColor={'gray'}
          />
          <TextInput
            placeholder="Tags eg. Music,Concert,"
            value={tags}
            onChangeText={setTags}
            style={styles.input}
            placeholderTextColor={'gray'}
          />
          <TextInput
            numberOfLines={4}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            style={styles.input}
            multiline
            placeholderTextColor={'gray'}
          />
          <View style={[styles.input, {marginBottom: 30}]}>
            <Text>Select your community</Text>
            <Picker
              placeholder="Select your community"
              selectedValue={communityId}
              onValueChange={(itemValue, itemIndex) =>
                setCommunityId(itemValue)
              }>
              {myCommunities?.map(comm => (
                <Picker.Item
                  style={{padding: 30, color: 'black'}}
                  key={comm._id}
                  label={comm?.name}
                  value={comm?._id}
                />
              ))}
            </Picker>
          </View>
        </ScrollView>
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
              onPress={() => setActiveSubTab('Members')}
              style={[
                styles.tab,
                activeSubTab === 'Members' && styles.activeTab,
              ]}>
              <Text style={styles.tabText}>Members</Text>
            </TouchableOpacity>
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
          {activeSubTab === 'Members' && (
            <View style={styles.listContainer}>
              {filteredMembers.length > 0 ? (
                filteredMembers?.map((connection, index) => (
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
                      height={30}
                      width={30}
                      borderRadius={15}
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
                            connection.email,
                          ])
                        }
                        style={{
                          marginLeft: 'auto',
                          elevation: 5,
                          padding: 5,
                          width: 30,
                          height: 30,
                          borderRadius: 15,
                          backgroundColor: '#A274FF',
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
                <Text style={styles.noConnectionsText}>No members found.</Text>
              )}
            </View>
          )}
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
                            connection.email,
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
          onPress={handleCreateEvent}>
          <Text style={styles.submitButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CreateEvent;

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
    marginBottom: 80,
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
    // borderColor: '#ccc',
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
