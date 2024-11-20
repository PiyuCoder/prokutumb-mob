import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Button,
  KeyboardAvoidingView,
  StyleSheet,
  Platform,
  ImageBackground,
} from 'react-native';
import React, {useState} from 'react';
import {launchImageLibrary} from 'react-native-image-picker';
import {editProfile} from '../store/slices/authSlice';
import {useSelector, useDispatch} from 'react-redux';
import DatePicker from 'react-native-date-picker';

const backIcon = require('../assets/icons/black-back.png');

export default function EditProfile({navigation}) {
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.auth);

  // State Variables
  const [editedName, setEditedName] = useState(user.name || '');
  const [editedEmail, setEditedEmail] = useState(user.email || '');
  const [editedDob, setEditedDob] = useState(
    user.dob ? new Date(user.dob) : new Date(),
  );

  const [editedPassword, setEditedPassword] = useState('');
  const [editedState, setEditedState] = useState(user.location?.state || '');
  const [editedCountry, setEditedCountry] = useState(
    user.location?.country || '',
  );
  const [profilePicture, setProfilePicture] = useState(null);
  const [coverPicture, setCoverPicture] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  const selectImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 1,
      },
      response => {
        if (response.assets) {
          setProfilePicture(response.assets[0]);
        }
      },
    );
  };

  const selectCover = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 1,
      },
      response => {
        if (response.assets) {
          setCoverPicture(response.assets[0]);
        }
      },
    );
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

    if (coverPicture) {
      formData.append('coverPicture', {
        uri: coverPicture.uri,
        name: coverPicture.fileName,
        type: coverPicture.type,
      });
    }
    console.log(coverPicture);
    // Append other profile details
    formData.append('userId', user?._id);
    formData.append('name', editedName);
    formData.append('email', editedEmail);
    formData.append('dob', editedDob.toISOString().split('T')[0]);
    if (editedPassword) {
      formData.append('password', editedPassword); // Append only if edited
    }
    formData.append('location[state]', editedState);
    formData.append('location[country]', editedCountry);

    // Dispatch action or make API call to backend
    dispatch(editProfile(formData))
      .unwrap()
      .then(() => {
        // Handle success
        navigation.goBack();
      })
      .catch(error => {
        // Handle error
        console.error('Error updating profile:', error);
      });
  };

  return (
    <View style={[styles.modalContainer, {padding: 16}]}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 10,
        }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={backIcon} style={styles.icon} />
        </TouchableOpacity>
        <View style={{flex: 1}}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: 'black',
              textAlign: 'center',
            }}>
            Edit Profile
          </Text>
        </View>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={selectCover}
              className=" absolute right-8 top-8 z-10 bg-white h-7 w-7 flex items-center justify-center rounded-full bg-opacity-20 shadow-lg">
              <Image
                style={{height: 15, width: 15}}
                source={require('../assets/icons/pen.png')}
              />
            </TouchableOpacity>
            <ImageBackground
              style={styles.coverPicture}
              source={{
                uri:
                  coverPicture?.uri ||
                  user?.coverPicture ||
                  'https://img.freepik.com/free-vector/gradient-network-connection-background_23-2148880712.jpg',
              }}
            />
            <TouchableOpacity
              style={{
                backgroundColor: 'white',
                bottom: 60,
                width: 130,
                height: 130,
                borderRadius: 65,
                alignSelf: 'center',
                alignItems: 'center',
                justifyContent: 'center',
                borderColor: '#242760',
                borderWidth: 1,
              }}
              onPress={selectImage}>
              <View
                style={{
                  position: 'relative',
                }}>
                <Image
                  source={{uri: profilePicture?.uri || user?.profilePicture}}
                  defaultSource={require('../assets/default-pp.png')} // iOS only
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                  }}
                />
                <Image
                  style={{
                    position: 'absolute',
                    bottom: 7,
                    right: 4,
                    width: 20,
                    height: 20,
                  }}
                  source={require('../assets/icons/camera.png')}
                />
              </View>
            </TouchableOpacity>

            <View style={{bottom: 50}}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Edit Name"
                placeholderTextColor={'gray'}
                style={styles.input}
              />

              <Text style={styles.label}>Email</Text>
              <TextInput
                value={editedEmail}
                onChangeText={setEditedEmail}
                placeholder="Edit Email"
                placeholderTextColor={'gray'}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                editable={false}
              />

              <Text style={styles.label}>Date of birth</Text>
              <TouchableOpacity onPress={() => setDatePickerVisible(true)}>
                <TextInput
                  style={styles.input}
                  placeholderTextColor={'gray'}
                  placeholder="Date of birth"
                  value={
                    editedDob
                      ? editedDob?.toISOString()?.split('T')[0]
                      : editedDob
                  }
                  editable={false}
                />
              </TouchableOpacity>
              <DatePicker
                modal
                open={isDatePickerVisible}
                date={editedDob}
                mode="date"
                onConfirm={date => {
                  setDatePickerVisible(false);
                  setEditedDob(date);
                }}
                onCancel={() => {
                  setDatePickerVisible(false);
                }}
              />

              {/* <Text style={styles.label}>Password</Text>
            <TextInput
              value={editedPassword}
              onChangeText={setEditedPassword}
              placeholder="Edit Password"
              placeholderTextColor={'gray'}
              secureTextEntry
              style={styles.input}
            /> */}

              {/* <Text style={styles.label}>State</Text>
            <TextInput
              value={editedState}
              onChangeText={setEditedState}
              placeholder="Edit State"
              placeholderTextColor={'gray'}
              style={styles.input}
            /> */}

              <Text style={styles.label}>Country/Region</Text>
              <TextInput
                value={editedCountry}
                onChangeText={setEditedCountry}
                placeholder="Edit Country"
                placeholderTextColor={'gray'}
                style={styles.input}
              />

              <Button color="#242760" title="Save" onPress={handleSave} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: '#FDF7FD',
  },
  icon: {
    width: 30,
    height: 30,
  },
  coverPicture: {
    width: '100%',
    height: 200,
    alignSelf: 'center',
    resizeMode: 'cover',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalContent: {
    backgroundColor: '#FDF7FD',
    padding: 20,
    borderBottomStartRadius: 10,
    borderBottomEndRadius: 10,
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    paddingHorizontal: 10,
    backgroundColor: '#FDF7FD',
    marginBottom: 15,
    borderRadius: 5,
    color: 'black',
  },
  label: {
    color: 'black',
    fontWeight: '500',
    marginBottom: 5,
  },
});
