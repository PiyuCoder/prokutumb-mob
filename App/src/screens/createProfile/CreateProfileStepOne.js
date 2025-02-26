import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {TextInput} from 'react-native-gesture-handler';
import {
  setAbout,
  setInterests,
  setLocation,
  setName,
  setProfilePicture,
  setSkills,
} from '../../store/slices/profileSlice';
import SelectModal from '../../components/SelectModal';
import Feather from 'react-native-vector-icons/Feather';
import {launchImageLibrary} from 'react-native-image-picker';

const interestsList = ['Networking', 'Business', 'Technology', 'Marketing'];
const skillsList = [
  'JavaScript',
  'React',
  'Node.js',
  'Python',
  'Java',

  // Core Business & Professional Skills
  'Leadership & Management',
  'Business Strategy',
  'Marketing & Sales',
  'Finance & Investment',
  'Data Analytics & AI',
  'Operations & Supply Chain',
  'Project Management',
  'Consulting',
  'Human Resources & Talent Management',
  'Public Speaking & Communication',
  'Negotiation & Conflict Resolution',

  // Industry-Specific Skills
  'Technology & Software Development',
  'Product Management',
  'UX/UI Design',
  'Cybersecurity',
  'Blockchain & Web3',
  'Healthcare & Biotech',
  'Legal & Compliance',
  'Real Estate & Property Management',
  'Retail & E-commerce',
  'Media & Entertainment',

  // Startup & Entrepreneurship
  'Fundraising & Venture Capital',
  'Startup Growth & Scaling',
  'Business Development',
  'Angel Investing',
  'Networking & Partnerships',
  'Bootstrapping',

  // Personal Development & Thought Leadership
  'Writing & Blogging',
  'Podcasting',
  'Personal Branding',
  'Mentorship & Coaching',
  'Public Relations & Media',

  // Emerging Trends & Interests
  'Sustainability & ESG',
  'AI & Automation',
  'Future of Work',
  'Diversity & Inclusion',
  'Remote Work & Digital Nomadism',
];

const CreateProfileStepOne = ({navigation, route}) => {
  const {name, about, interests, location, skills, profilePicture} =
    useSelector(state => state.profile);
  const dispatch = useDispatch();
  const [isInterestsModalVisible, setIsInterestsModalVisible] = useState(false);
  const [isSkillsModalVisible, setIsSkillsModalVisible] = useState(false);
  const isEditing = route?.params?.isEditing || false;

  const handleSelectInterests = selectedInterests => {
    dispatch(setInterests(selectedInterests));
  };

  const handleSelectSkills = selectedSkills => {
    dispatch(setSkills(selectedSkills));
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
        dispatch(setProfilePicture(result.assets[0].uri));
      }
    } catch (error) {
      console.error('Error selecting image:', error.message);
    }
  };

  const onSubmit = () => {
    if (
      name &&
      about &&
      interests?.length &&
      skills?.length &&
      profilePicture &&
      location
    ) {
      navigation.navigate('CreateProfileStepTwo', {isEditing});
    } else {
      Alert.alert(
        'Missing Fields',
        'Please fill in all required fields before proceeding.',
      );
    }
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
        <Text style={styles.title}>
          {isEditing ? 'Edit' : 'Create'} Profile
        </Text>
      </View>
      <View style={{padding: 20}}>
        <Text
          style={[
            styles.title,
            {color: 'black', textAlign: 'left', marginBottom: 25},
          ]}>
          Profile Details
        </Text>
        <TextInput
          placeholder="Name *"
          placeholderTextColor={'gray'}
          style={styles.input}
          value={name}
          onChangeText={text => dispatch(setName(text))}
        />
        <TextInput
          numberOfLines={4}
          placeholder="About *"
          value={about}
          onChangeText={text => dispatch(setAbout(text))}
          style={styles.input}
          multiline
          placeholderTextColor={'gray'}
        />
        <TouchableOpacity
          onPress={() => setIsInterestsModalVisible(true)}
          style={styles.input}>
          <Text style={{color: interests.length > 0 ? 'black' : 'gray'}}>
            {interests.length > 0 ? interests.join(', ') : 'Select Interests *'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setIsSkillsModalVisible(true)}
          style={styles.input}>
          <Text style={{color: skills.length > 0 ? 'black' : 'gray'}}>
            {skills.length > 0 ? skills.join(', ') : 'Select Skills *'}
          </Text>
        </TouchableOpacity>
        <View style={styles.media}>
          {profilePicture ? (
            <Image
              source={{uri: profilePicture}}
              style={styles.selectedImage}
            />
          ) : (
            <Feather name="image" size={50} color="#C1CAD5" />
          )}
          <TouchableOpacity
            style={styles.imagePickerButton}
            onPress={handleImageSelection}>
            <Text style={styles.imagePickerText}>
              {profilePicture ? 'Change Photo' : 'Upload Profile photo'}
            </Text>
          </TouchableOpacity>
        </View>
        <TextInput
          placeholder="Location *"
          value={location}
          onChangeText={text => dispatch(setLocation(text))}
          style={[styles.input, {marginTop: 10}]}
          placeholderTextColor={'gray'}
        />
        <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
          <Text style={styles.submitButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
      <SelectModal
        visible={isInterestsModalVisible}
        items={interestsList}
        selectedItems={interests}
        onClose={() => setIsInterestsModalVisible(false)}
        onSelect={handleSelectInterests}
      />
      <SelectModal
        visible={isSkillsModalVisible}
        items={skillsList}
        selectedItems={skills}
        onClose={() => setIsSkillsModalVisible(false)}
        onSelect={handleSelectSkills}
      />
    </ScrollView>
  );
};

export default CreateProfileStepOne;

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#A274FF',
    textAlign: 'center',
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
});
