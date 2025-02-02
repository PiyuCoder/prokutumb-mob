import {
  Image,
  ImageBackground,
  Modal,
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
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useSelector} from 'react-redux';
import ProfilePicture from '../components/ProfilePicture';
import {ScrollView} from 'react-native-gesture-handler';
import {Picker} from '@react-native-picker/picker';
import DatePicker from 'react-native-date-picker';
import {format} from 'date-fns';
import AntDesign from 'react-native-vector-icons/AntDesign';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';

const CreateEvent = ({navigation, route}) => {
  const {user} = useSelector(state => state.auth);
  const myCommunities = route?.params?.myCommunities;
  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState('');
  const [eventOcassion, setEventOcassion] = useState('');
  const [eventStartDate, setStartEventDate] = useState('');
  const [eventEndDate, setEndEventDate] = useState('');
  const [timezone, setTimezone] = useState('');
  const [eventStartTime, setEventStartTime] = useState('');
  const [eventEndTime, setEventEndTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [description, setDescription] = useState('');
  const [communityId, setCommunityId] = useState(
    route.params?.communityId ? myCommunities[0]?._id : '',
  );
  const [category, setCategory] = useState('');
  const [address, setAddress] = useState('');
  const [tags, setTags] = useState('');
  const [activeTab, setActiveTab] = useState('EventType');
  const [step, setStep] = useState(1);
  const [isDateToggled, setIsDateToggled] = useState(false);
  const [isToggled, setIsToggled] = useState(false);
  const [freeTickets, setFreeTickets] = useState(0);
  const [paidTickets, setPaidTickets] = useState(0);
  const [ticketName, setTicketName] = useState('');
  const [price, setPrice] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [connections, setConnections] = useState([]);
  const [filteredConnections, setFilteredConnections] = useState([]);
  const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);

  //   const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const formRef = useRef();

  const [isFreeTicket, setFreeTicket] = useState(true);
  const [newConnectionName, setNewConnectionName] = useState('');
  const [newConnectionEmail, setNewConnectionEmail] = useState('');

  const [selectedInvitees, setSelectedInvitees] = useState([]);
  const [isPreview, setIsPreview] = useState(false);

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

  useEffect(() => {
    if (formRef.current) {
      formRef.current.scrollTo({top: 0, behavior: 'smooth'}); // Smooth scrolling to the top
    }
  }, [step]);

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

  const handleDateToggle = () => {
    setIsDateToggled(!isDateToggled);
  };

  const handleToggle = () => {
    setIsToggled(!isToggled);
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

  const backPress = () => {
    if (activeTab === 'Basic') {
      setActiveTab('EventType');
      return;
    } else if (activeTab === 'Schedule') {
      setActiveTab('Basic');
      setStep(1);
      return;
    } else if (activeTab === 'TicketDetails') {
      setActiveTab('Schedule');
      setStep(2);
      return;
    }
  };

  const handleCreateEvent = async () => {
    if (activeTab === 'Basic') {
      setActiveTab('Schedule');
      setStep(2);
      return;
    } else if (activeTab === 'Schedule') {
      setActiveTab('TicketDetails');
      setStep(3);
      return;
    } else if (!isPreview && activeTab === 'TicketDetails') {
      setIsPreview(true);
      return;
    }
    if (
      eventName &&
      profilePic &&
      description &&
      eventType &&
      eventStartDate &&
      address &&
      timezone &&
      communityId
    ) {
      try {
        const formData = new FormData();
        formData.append('name', eventName);
        formData.append('eventType', eventType);
        formData.append('startDate', eventStartDate);
        formData.append('endDate', eventEndDate);
        formData.append('startTime', eventStartTime);
        formData.append('endTime', eventEndTime);
        formData.append('description', description);
        formData.append('communityId', communityId);
        formData.append('address', address);
        formData.append('freeTickets', freeTickets);
        formData.append('paidTickets', paidTickets);
        formData.append('timezone', timezone);
        formData.append('category', category);

        formData.append('profilePicture', {
          uri: profilePic,
          type: 'image/jpeg',
          name: 'profile.jpg',
        });

        formData.append('createdBy', user?._id); // Ensure user object is passed correctly
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
          setStartEventDate('');
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
  const handleCreateDraftEvent = async () => {
    if (
      eventName &&
      profilePic &&
      description &&
      eventType &&
      eventStartDate &&
      address &&
      timezone &&
      communityId
    ) {
      try {
        const formData = new FormData();
        formData.append('name', eventName);
        formData.append('eventType', eventType);
        formData.append('startDate', eventStartDate);
        formData.append('endDate', eventEndDate);
        formData.append('startTime', eventStartTime);
        formData.append('endTime', eventEndTime);
        formData.append('description', description);
        formData.append('communityId', communityId);
        formData.append('address', address);
        formData.append('freeTickets', freeTickets);
        formData.append('paidTickets', paidTickets);
        formData.append('timezone', timezone);
        formData.append('category', category);

        formData.append('profilePicture', {
          uri: profilePic,
          type: 'image/jpeg',
          name: 'profile.jpg',
        });

        formData.append('createdBy', user?._id); // Ensure user object is passed correctly
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
          setStartEventDate('');
          setEventStartTime('');
          setEventEndTime('');
          ToastAndroid.show('Saved as draft!', ToastAndroid.SHORT);
          navigation.goBack();
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
        <Text style={styles.title}>Create Event</Text>
      </View>
      {!isPreview ? (
        <>
          {activeTab !== 'EventType' && (
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
          {activeTab === 'EventType' && (
            <ScrollView style={{padding: 40}}>
              <TouchableOpacity
                onPress={() => {
                  setEventType('Physical');
                  setActiveTab('Basic');
                  setStep(1);
                }}
                style={{
                  backgroundColor: '#E7CBFE',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 40,
                  borderRadius: 20,
                  gap: 10,
                }}>
                <MaterialIcons
                  name="supervised-user-circle"
                  color="black"
                  size={30}
                />
                <Text style={[styles.title, {color: 'black'}]}>
                  Physical Event
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
                  setEventType('Virtual');
                  setActiveTab('Basic');
                  setStep(1);
                }}
                style={{
                  backgroundColor: '#D4E7DB',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 40,
                  borderRadius: 20,
                  gap: 10,
                  marginTop: 15,
                }}>
                <Ionicons name="desktop" color="#028707" size={30} />
                <Text style={[styles.title, {color: 'black'}]}>
                  Virtual Event
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
            <ScrollView style={styles.form}>
              <Text
                style={[
                  styles.title,
                  {color: 'black', textAlign: 'left', marginBottom: 15},
                ]}>
                Basic Event details
              </Text>
              <Text style={{marginBottom: 10, color: '#798CA3'}}>
                Create your event by provideing the details below
              </Text>
              <TextInput
                placeholder="Event Title *"
                value={eventName}
                onChangeText={setEventName}
                style={styles.input}
                placeholderTextColor={'gray'}
              />
              <TextInput
                numberOfLines={4}
                placeholder="Describe your event"
                value={description}
                onChangeText={setDescription}
                style={styles.input}
                multiline
                placeholderTextColor={'gray'}
              />
              <View style={[styles.input, {marginVertical: 10}]}>
                <Picker
                  placeholder="Category"
                  dropdownIconColor={'black'}
                  selectedValue={category}
                  onValueChange={(itemValue, itemIndex) =>
                    setCategory(itemValue)
                  }>
                  {['Networking', 'Business', 'Technology', 'Marketing']?.map(
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
                    {profilePic ? 'Change banner' : 'Upload event banner'}
                  </Text>
                </TouchableOpacity>
              </View>
              {/* <TextInput
            placeholder="Ocassion"
            value={eventOcassion}
            onChangeText={setEventOcassion}
            style={styles.input}
            placeholderTextColor={'gray'}
          /> */}

              <View style={[styles.input, {marginVertical: 20}]}>
                <Text style={{color: 'black'}}>Select your community</Text>
                <Picker
                  placeholder="Select your community"
                  dropdownIconColor={'black'}
                  selectedValue={communityId}
                  // itemStyle={{backgroundColor: 'red', color: 'yellow'}}
                  onValueChange={(itemValue, itemIndex) =>
                    setCommunityId(itemValue)
                  }>
                  {myCommunities?.map(comm => (
                    <Picker.Item
                      color="black"
                      style={{
                        padding: 30,
                        color: 'black',
                        backgroundColor: 'white',
                        borderRadius: 30,
                      }}
                      key={comm._id}
                      label={comm?.name}
                      value={comm?._id}
                    />
                  ))}
                </Picker>
              </View>
              {/* <View style={styles.buttonContainer}>
           
          </View> */}
            </ScrollView>
          )}
          {activeTab === 'Schedule' && (
            <ScrollView style={styles.form}>
              <Text
                style={[
                  styles.title,
                  {color: 'black', textAlign: 'left', marginBottom: 15},
                ]}>
                Event date and location
              </Text>
              <Text style={{marginBottom: 10, color: '#798CA3'}}>
                Create your event by providing the details below
              </Text>
              <TouchableOpacity
                onPress={() => setActiveTab('EventType')}
                style={{
                  backgroundColor: '#F6F6F6',
                  padding: 4,
                  paddingHorizontal: 8,
                  borderRadius: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 3,
                  width: 120,
                  marginBottom: 35,
                  marginTop: 20,
                }}>
                <Text style={{fontSize: 12, color: '#B0B8C3'}}>
                  {eventType} Event
                </Text>
                <SimpleLineIcons name="pencil" color="#200E32" />
              </TouchableOpacity>
              <TextInput
                placeholder="Full Address"
                value={address}
                onChangeText={setAddress}
                style={styles.input}
                placeholderTextColor={'gray'}
              />
              {/* Start Date Picker */}
              <TouchableOpacity onPress={() => setStartDatePickerVisible(true)}>
                <TextInput
                  placeholder="Start Date"
                  value={eventStartDate} // Display formatted string
                  style={styles.input}
                  placeholderTextColor="gray"
                  editable={false}
                />
              </TouchableOpacity>
              <DatePicker
                modal
                open={isStartDatePickerVisible}
                date={new Date()}
                mode="date"
                onConfirm={date => {
                  setStartDatePickerVisible(false);
                  setStartEventDate(format(date, 'MM/dd/yyyy')); // Format date
                }}
                onCancel={() => {
                  setStartDatePickerVisible(false);
                }}
              />

              {/* End Date Picker */}
              {!isDateToggled && (
                <TouchableOpacity
                  disabled={isDateToggled}
                  onPress={() => setEndDatePickerVisible(true)}>
                  <TextInput
                    placeholder="End Date"
                    value={eventEndDate} // Display formatted string
                    style={styles.input}
                    placeholderTextColor="gray"
                    editable={false}
                  />
                </TouchableOpacity>
              )}
              <DatePicker
                modal
                open={isEndDatePickerVisible}
                date={new Date()}
                mode="date"
                onConfirm={date => {
                  setEndDatePickerVisible(false);
                  setEndEventDate(format(date, 'MM/dd/yyyy')); // Format date
                }}
                onCancel={() => {
                  setEndDatePickerVisible(false);
                }}
              />
              <View
                // className="bg-[#898989]"
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 15,
                }}>
                <Text style={{color: 'black', fontWeight: '500'}}>
                  Same as start date
                </Text>
                <TouchableOpacity
                  style={[
                    styles.switchContainer,
                    isDateToggled ? styles.switchOn : styles.switchOff,
                  ]}
                  onPress={handleDateToggle}>
                  <View
                    style={[
                      styles.switchKnob,
                      isDateToggled ? styles.knobOn : styles.knobOff,
                    ]}
                  />
                </TouchableOpacity>
              </View>
              <View
                style={{
                  height: 10,
                  width: '100%',
                  backgroundColor: 'black',
                  marginBottom: 35,
                  marginTop: 10,
                }}
              />
              <TextInput
                placeholder="Select Timezone"
                value={timezone} // Display formatted string
                style={styles.input}
                placeholderTextColor="gray"
                onChangeText={setTimezone}
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
            </ScrollView>
          )}
          {activeTab === 'TicketDetails' && (
            <ScrollView style={styles.form}>
              <Text
                style={[
                  styles.title,
                  {color: 'black', textAlign: 'left', marginBottom: 15},
                ]}>
                Ticket details
              </Text>
              <Text style={{marginBottom: 10, color: '#798CA3'}}>
                Create your event by providing the details below
              </Text>
              <TouchableOpacity
                onPress={() => setActiveTab('EventType')}
                style={{
                  backgroundColor: '#F6F6F6',
                  padding: 4,
                  paddingHorizontal: 8,
                  borderRadius: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 3,
                  width: 120,
                  marginBottom: 35,
                  marginTop: 20,
                }}>
                <Text style={{fontSize: 12, color: '#B0B8C3'}}>
                  {eventType} Event
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
                  onPress={() => setFreeTicket(true)}
                  style={{
                    flex: 1,
                    backgroundColor: isFreeTicket ? 'white' : '#333333',
                    padding: 7,
                    borderRadius: 40,
                  }}>
                  <Text
                    style={{
                      textAlign: 'center',
                      color: !isFreeTicket ? 'white' : '#333333',
                    }}>
                    Free Ticket
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setFreeTicket(false)}
                  style={{
                    flex: 1,
                    backgroundColor: !isFreeTicket ? 'white' : '#333333',
                    padding: 7,
                    borderRadius: 40,
                  }}>
                  <Text
                    style={{
                      textAlign: 'center',
                      color: isFreeTicket ? 'white' : '#333333',
                    }}>
                    Paid Ticket
                  </Text>
                </TouchableOpacity>
              </View>
              {isFreeTicket ? (
                <>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderWidth: 1,
                      borderColor: 'black',
                      borderRadius: 10,
                      paddingHorizontal: 10,
                      marginBottom: 16,
                      marginTop: 15,
                      backgroundColor: 'white',
                    }}>
                    <Text style={{color: '#333333'}}>Number of tickets *</Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      {/* Decrease Button */}
                      <TouchableOpacity
                        onPress={() =>
                          freeTickets > 0 && setFreeTickets(prev => prev - 1)
                        }
                        style={{borderWidth: 1, borderRadius: 30, padding: 4}}>
                        <AntDesign name="minus" size={20} color="black" />
                      </TouchableOpacity>

                      {/* Ticket Input */}
                      <TextInput
                        style={{
                          textAlign: 'center',
                          fontSize: 20,
                          color: '#273C54',
                          paddingHorizontal: 15,
                        }}
                        value={String(freeTickets)} // Convert number to string for TextInput
                        keyboardType="numeric" // Ensure numeric input only
                        onChangeText={text => {
                          const value = parseInt(text, 10); // Parse input as an integer
                          if (!isNaN(value)) {
                            setFreeTickets(value);
                          } else {
                            setFreeTickets(0); // Reset to 0 if input is invalid
                          }
                        }}
                      />

                      {/* Increase Button */}
                      <TouchableOpacity
                        onPress={() => setFreeTickets(prev => prev + 1)}
                        style={{borderWidth: 1, borderRadius: 30, padding: 4}}>
                        <AntDesign name="plus" size={20} color="black" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                    <TextInput
                      placeholder="Ticket name"
                      value={isToggled ? eventName : ticketName}
                      onChangeText={setTicketName}
                      style={[styles.input, {width: '60%'}]}
                      placeholderTextColor={'gray'}
                    />
                    <Text
                      style={{
                        backgroundColor: '#F0F5F9',
                        padding: 12,
                        paddingHorizontal: 25,
                        color: '#333333',
                        elevation: 5,
                        marginBottom: 16,
                        borderRadius: 30,
                      }}>
                      Free $0.00
                    </Text>
                  </View>
                  <View
                    // className="bg-[#898989]"
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 15,
                    }}>
                    <Text style={{color: 'black', fontWeight: '500'}}>
                      Use name of event
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.switchContainer,
                        isToggled ? styles.switchOn : styles.switchOff,
                      ]}
                      onPress={handleToggle}>
                      <View
                        style={[
                          styles.switchKnob,
                          isToggled ? styles.knobOn : styles.knobOff,
                        ]}
                      />
                    </TouchableOpacity>
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
                      paddingHorizontal: 10,
                      marginBottom: 16,
                      marginTop: 15,
                      backgroundColor: 'white',
                    }}>
                    <Text style={{color: '#333333'}}>Number of tickets *</Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      {/* Decrease Button */}
                      <TouchableOpacity
                        onPress={() =>
                          paidTickets > 0 && setPaidTickets(prev => prev - 1)
                        }
                        style={{borderWidth: 1, borderRadius: 30, padding: 4}}>
                        <AntDesign name="minus" size={20} color="black" />
                      </TouchableOpacity>

                      {/* Ticket Input */}
                      <TextInput
                        style={{
                          textAlign: 'center',
                          fontSize: 20,
                          color: '#273C54',
                          paddingHorizontal: 15,
                        }}
                        value={String(paidTickets)} // Convert number to string for TextInput
                        keyboardType="numeric" // Ensure numeric input only
                        onChangeText={text => {
                          const value = parseInt(text, 10); // Parse input as an integer
                          if (!isNaN(value)) {
                            setPaidTickets(value);
                          } else {
                            setPaidTickets(0); // Reset to 0 if input is invalid
                          }
                        }}
                      />

                      {/* Increase Button */}
                      <TouchableOpacity
                        onPress={() => setPaidTickets(prev => prev + 1)}
                        style={{borderWidth: 1, borderRadius: 30, padding: 4}}>
                        <AntDesign name="plus" size={20} color="black" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 15,
                    }}>
                    <TextInput
                      placeholder="Ticket name"
                      value={ticketName}
                      onChangeText={setTicketName}
                      style={[styles.input, {width: '60%'}]}
                      placeholderTextColor={'gray'}
                    />
                    <TextInput
                      placeholder="Price in $"
                      value={price}
                      onChangeText={setPrice}
                      style={[styles.input, {flex: 1}]}
                      placeholderTextColor={'gray'}
                    />
                  </View>
                  <View style={{height: 45}} />
                </>
              )}
            </ScrollView>
          )}
          {activeTab !== 'EventType' && (
            <View style={{flex: 1}}>
              {/* Dynamic content taking up the available space */}
              <View style={{height: activeTab !== 'Basic' ? 100 : 0}} />

              {/* Button fixed at the bottom */}
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleCreateEvent}>
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
              setActiveTab('TicketDetails');
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
              {color: 'black', textAlign: 'left', marginBottom: 15},
            ]}>
            Preview event details
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
              {eventName}
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
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  marginTop: 5,
                }}>
                <Feather name="calendar" size={20} color="#2D264B40" />
                <View style={{marginLeft: 10}}>
                  <Text style={{color: 'black'}}>
                    {`${eventStartDate}, ${eventStartTime} - ${eventEndTime}` ||
                      ''}
                  </Text>
                </View>
              </View>
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
                  <Text style={{color: 'black'}}>{address || ''}</Text>
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
            Tickets
          </Text>
          <View style={{flex: 1}}>
            {/* Button fixed at the bottom */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleCreateEvent}>
              <Text style={styles.submitButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={handleCreateDraftEvent}
            style={[styles.submitButton, {backgroundColor: 'black'}]}>
            <Text style={styles.submitButtonText}>Save as Draft</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </ScrollView>
  );
};

export default CreateEvent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F4F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#A274FF',
    textAlign: 'center',
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
    // flex: 1,
    padding: 16,
  },
  addForm: {
    // flex: 1,
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
  // addButton: {
  //   backgroundColor: 'white',
  //   padding: 12,
  //   borderWidth: 2,
  //   borderRadius: 8,
  //   alignItems: 'center',
  //   alignSelf: 'center',
  //   position: 'absolute',
  //   bottom: 80,
  //   width: '100%',
  // },
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
  switchContainer: {
    width: 60,
    height: 30,
    borderRadius: 15,
    padding: 3,
    justifyContent: 'center',
    position: 'relative',
  },
  switchOn: {
    backgroundColor: 'black',
  },
  switchOff: {
    backgroundColor: '#dadada',
  },
  switchKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    position: 'absolute',
    top: 3,
  },
  knobOn: {
    backgroundColor: 'white',
    right: 3,
  },
  knobOff: {
    backgroundColor: 'black',
    left: 3,
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
