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
import {setExperience} from '../../store/slices/profileSlice';
import {useDispatch, useSelector} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CreateProfileStepTwo = ({navigation}) => {
  const {experience} = useSelector(state => state.profile);
  const dispatch = useDispatch();
  const [experiences, setExperiences] = useState(
    !experience?.length
      ? [
          {
            company: '',
            role: '',
            startDate: new Date(), // Valid Date object
            endDate: new Date(), // Valid Date object
            description: '',
            isPresent: false,
          },
        ]
      : experience.map(exp => ({
          ...exp,
          startDate: new Date(exp.startDate), // Convert to Date object
          endDate: exp.endDate ? new Date(exp.endDate) : new Date(), // Handle null
        })),
  );
  const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null); // Track the active experience index for date pickers

  const handleAddExperience = () => {
    setExperiences([
      ...experiences,
      {
        company: '',
        role: '',
        startDate: new Date(),
        endDate: new Date(),
        description: '',
        isPresent: false,
      },
    ]);
  };

  const handleExperienceChange = (index, field, value) => {
    const updatedExperiences = [...experiences];
    updatedExperiences[index][field] = value;
    setExperiences(updatedExperiences);
  };

  const handleDateChange = (index, field, date) => {
    const updatedExperiences = [...experiences];
    updatedExperiences[index][field] = date;
    setExperiences(updatedExperiences);
  };

  const onSubmit = () => {
    // Serialize experience data
    const serializedExperiences = experiences.map(exp => ({
      ...exp,
      startDate: exp.startDate.toISOString().split('T')[0],
      endDate: exp.isPresent ? null : exp.endDate.toISOString().split('T')[0],
    }));

    dispatch(setExperience(serializedExperiences)); // Dispatch the serialized data
    navigation.navigate('CreateProfileStepThree');
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
          Experience
        </Text>

        {experiences.map((exp, index) => (
          <View
            key={index}
            style={{
              marginBottom: 20,
              borderBottomWidth: experiences.length <= 1 ? 0 : 1,
            }}>
            {index !== 0 && (
              <Ionicons
                name="close-outline"
                size={24}
                color="black"
                style={{alignSelf: 'flex-end'}}
                onPress={() =>
                  setExperiences(experiences.filter((_, i) => i !== index))
                }
              />
            )}
            <TextInput
              style={[styles.input, {marginTop: 10}]}
              placeholder={'Company'}
              placeholderTextColor={'gray'}
              value={exp.company}
              onChangeText={text =>
                handleExperienceChange(index, 'company', text)
              }
            />
            <TextInput
              style={styles.input}
              placeholderTextColor={'gray'}
              placeholder={'Role'}
              value={exp.role}
              onChangeText={text => handleExperienceChange(index, 'role', text)}
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
                placeholder="Start Date"
                value={exp.startDate.toISOString().split('T')[0]}
                editable={false}
              />
            </TouchableOpacity>

            <DatePicker
              modal
              open={isStartDatePickerVisible && activeIndex === index}
              date={exp.startDate instanceof Date ? exp.startDate : new Date()}
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
              <Text style={{color: 'black'}}>{'Currently Working Here'}</Text>
              <Switch
                value={exp.isPresent}
                onValueChange={value =>
                  handleExperienceChange(index, 'isPresent', value)
                }
              />
            </View>

            {/* End Date Picker (only visible if 'isPresent' is false) */}
            {!exp.isPresent && (
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
                    value={exp.endDate.toISOString().split('T')[0]}
                    editable={false}
                  />
                </TouchableOpacity>

                <DatePicker
                  modal
                  open={isEndDatePickerVisible && activeIndex === index}
                  date={exp.endDate instanceof Date ? exp.endDate : new Date()}
                  mode="date"
                  onConfirm={date => {
                    setEndDatePickerVisible(false);
                    handleDateChange(index, 'startDate', date);
                  }}
                  onCancel={() => {
                    setEndDatePickerVisible(false);
                  }}
                />
              </>
            )}

            <TextInput
              style={styles.input}
              placeholder={'Description'}
              placeholderTextColor={'gray'}
              value={exp.description}
              onChangeText={text =>
                handleExperienceChange(index, 'description', text)
              }
            />
          </View>
        ))}

        {/* Add experience button */}
        <TouchableOpacity
          onPress={handleAddExperience}
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

export default CreateProfileStepTwo;

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
