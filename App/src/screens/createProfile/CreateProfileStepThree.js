import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import DatePicker from 'react-native-date-picker';
import {setEducation} from '../../store/slices/profileSlice';
import {useDispatch, useSelector} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CreateProfileStepThree = ({navigation}) => {
  const {education} = useSelector(state => state.profile);
  const dispatch = useDispatch();
  const [educations, setEducations] = useState(
    !education.length
      ? [
          {
            school: '',
            degree: '',
            startDate: new Date(),
            endDate: new Date(),
            fieldOfStudy: '',
            isPresent: false,
          },
        ]
      : education.map(edu => ({
          ...edu,
          startDate: new Date(edu.startDate),
          endDate: edu.endDate ? new Date(edu.endDate) : new Date(),
        })),
  );

  const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null); // Track the active education index for date pickers

  const handleAddEducation = () => {
    setEducations([
      ...educations,
      {
        school: '',
        degree: '',
        startDate: new Date(),
        endDate: new Date(),
        fieldOfStudy: '',
        isPresent: false,
      },
    ]);
  };

  const handleEducationChange = (index, field, value) => {
    const updatedEducations = [...educations];
    updatedEducations[index][field] = value;
    setEducations(updatedEducations);
  };

  const handleDateChange = (index, field, date) => {
    const updatedEducations = [...educations];
    updatedEducations[index][field] = date;
    setEducations(updatedEducations);
  };

  const onSubmit = () => {
    // Check if any field is empty
    const hasEmptyFields = educations.some(
      edu => !edu.school || !edu.degree || !edu.fieldOfStudy,
    );

    if (hasEmptyFields) {
      Alert.alert(
        'Missing Fields',
        'Please fill in all required fields before proceeding.',
      );
      return; // Stop the function if fields are empty
    }

    const serializedEducations = educations.map(exp => ({
      ...exp,
      startDate: exp.startDate.toISOString().split('T')[0],
      endDate: exp.isPresent ? null : exp.endDate.toISOString().split('T')[0],
    }));

    dispatch(setEducation(serializedEducations)); // Dispatch the serialized data
    navigation.navigate('CreateProfileStepFour');
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
          Education
        </Text>

        {educations?.map((edu, index) => (
          <View
            key={index}
            style={{
              marginBottom: 20,
              borderBottomWidth: educations.length <= 1 ? 0 : 1,
            }}>
            {index !== 0 && (
              <Ionicons
                name="close-outline"
                size={24}
                color="black"
                style={{alignSelf: 'flex-end'}}
                onPress={() =>
                  setEducations(educations.filter((_, i) => i !== index))
                }
              />
            )}
            <TextInput
              style={[styles.input, {marginTop: 10}]}
              placeholder={'University Name *'}
              placeholderTextColor={'gray'}
              value={edu.school}
              onChangeText={text =>
                handleEducationChange(index, 'school', text)
              }
            />
            <TextInput
              style={styles.input}
              placeholderTextColor={'gray'}
              placeholder={'Degree *'}
              value={edu.degree}
              onChangeText={text =>
                handleEducationChange(index, 'degree', text)
              }
            />

            {/* Start Date Picker */}
            <TouchableOpacity
              onPress={() => {
                setActiveIndex(index);
                setStartDatePickerVisible(true);
              }}>
              <TextInput
                style={styles.input}
                placeholderTextColor={'gray'}
                placeholder="Start Date *"
                value={edu.startDate.toISOString().split('T')[0]}
                editable={false}
              />
            </TouchableOpacity>

            <DatePicker
              modal
              open={isStartDatePickerVisible && activeIndex === index}
              date={edu.startDate}
              mode="date"
              onConfirm={date => {
                setStartDatePickerVisible(false);
                handleDateChange(index, 'startDate', date);
              }}
              onCancel={() => {
                setStartDatePickerVisible(false);
              }}
            />

            {/* Checkbox for 'Present' job */}
            <View style={styles.presentSwitch}>
              <Text style={{color: 'black'}}>{'Currently pursuing'}</Text>
              <Switch
                value={edu.isPresent}
                onValueChange={value =>
                  handleEducationChange(index, 'isPresent', value)
                }
              />
            </View>

            {/* End Date Picker (only visible if 'isPresent' is false) */}
            {!edu.isPresent && (
              <>
                <TouchableOpacity
                  onPress={() => {
                    setActiveIndex(index);
                    setEndDatePickerVisible(true);
                  }}>
                  <TextInput
                    style={styles.input}
                    placeholderTextColor={'gray'}
                    placeholder="End Date *"
                    value={edu.endDate.toISOString().split('T')[0]}
                    editable={false}
                  />
                </TouchableOpacity>

                <DatePicker
                  modal
                  open={isEndDatePickerVisible && activeIndex === index}
                  date={edu.endDate}
                  mode="date"
                  onConfirm={date => {
                    setEndDatePickerVisible(false);
                    handleDateChange(index, 'endDate', date);
                  }}
                  onCancel={() => {
                    setEndDatePickerVisible(false);
                  }}
                />
              </>
            )}

            <TextInput
              style={styles.input}
              placeholder={'Field of study *'}
              placeholderTextColor={'gray'}
              value={edu.fieldOfStudy}
              onChangeText={text =>
                handleEducationChange(index, 'fieldOfStudy', text)
              }
            />
          </View>
        ))}

        {/* Add education button */}
        <TouchableOpacity
          onPress={handleAddEducation}
          style={styles.submitButton}>
          <Text style={styles.submitButtonText}>{'Add more'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
          <Text style={styles.submitButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default CreateProfileStepThree;

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
  presentSwitch: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
