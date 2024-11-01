import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Switch,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import {useSelector, useDispatch} from 'react-redux';
import {
  deleteUserExperience,
  editUserExperience,
} from '../store/slices/authSlice';

const ExperienceModal = ({isVisible, onClose}) => {
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.auth);

  // Local state to toggle between "view" and "add" modes
  const [isAddMode, setIsAddMode] = useState(false);

  // Local state to hold new experience data
  const [newExperience, setNewExperience] = useState({
    company: '',
    role: '',
    startDate: new Date(),
    endDate: new Date(),
    description: '',
    isPresent: false, // Toggle for "Present" checkbox
  });

  // States to control date pickers visibility
  const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);

  // Handle adding a new experience
  const handleAddExperience = () => {
    dispatch(
      editUserExperience({
        userId: user._id,
        experience: {
          ...newExperience,
          startDate: newExperience.startDate.toISOString().split('T')[0],
          endDate: newExperience.isPresent
            ? null
            : newExperience.endDate.toISOString().split('T')[0],
        },
      }),
    ).then(() => {
      // Clear form after adding experience
      setNewExperience({
        company: '',
        role: '',
        startDate: new Date(),
        endDate: new Date(),
        description: '',
        isPresent: false,
      });
      setIsAddMode(false); // Switch back to view mode after saving
    });
  };

  // Handle deleting an experience
  const handleDeleteExperience = expId => {
    dispatch(
      deleteUserExperience({userId: user._id, experienceId: expId}),
    ).then(() => {
      // Optionally close the modal or show feedback
    });
  };

  const formatDate = dateString => {
    const options = {year: 'numeric', month: 'long', day: 'numeric'};
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  return (
    <Modal visible={isVisible} animationType="slide">
      <View style={styles.modalContainer}>
        {/* Header with Close and Add buttons */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>Close</Text>
          </TouchableOpacity>

          {!isAddMode && (
            <TouchableOpacity onPress={() => setIsAddMode(true)}>
              <Text style={styles.addButton}>Add</Text>
            </TouchableOpacity>
          )}
        </View>

        {isAddMode ? (
          // Experience Form for adding new experience
          <View>
            <TextInput
              style={styles.input}
              placeholder="Company"
              placeholderTextColor={'gray'}
              value={newExperience.company}
              onChangeText={text =>
                setNewExperience({...newExperience, company: text})
              }
            />
            <TextInput
              style={styles.input}
              placeholderTextColor={'gray'}
              placeholder="Role"
              value={newExperience.role}
              onChangeText={text =>
                setNewExperience({...newExperience, role: text})
              }
            />

            {/* Start Date Picker */}
            <TouchableOpacity onPress={() => setStartDatePickerVisible(true)}>
              <TextInput
                style={styles.input}
                placeholderTextColor={'gray'}
                placeholder="Start Date"
                value={newExperience.startDate.toISOString().split('T')[0]}
                editable={false}
              />
            </TouchableOpacity>
            <DatePicker
              modal
              open={isStartDatePickerVisible}
              date={newExperience.startDate}
              mode="date"
              onConfirm={date => {
                setStartDatePickerVisible(false);
                setNewExperience({...newExperience, startDate: date});
              }}
              onCancel={() => {
                setStartDatePickerVisible(false);
              }}
            />

            {/* Checkbox for 'Present' job */}
            <View style={styles.presentSwitch}>
              <Text style={{color: 'black'}}>Currently Working Here</Text>
              <Switch
                value={newExperience.isPresent}
                onValueChange={value =>
                  setNewExperience({...newExperience, isPresent: value})
                }
              />
            </View>

            {/* End Date Picker (only visible if 'isPresent' is false) */}
            {!newExperience.isPresent && (
              <>
                <TouchableOpacity onPress={() => setEndDatePickerVisible(true)}>
                  <TextInput
                    style={styles.input}
                    placeholderTextColor={'gray'}
                    placeholder="End Date"
                    value={newExperience.endDate.toISOString().split('T')[0]}
                    editable={false}
                  />
                </TouchableOpacity>
                <DatePicker
                  modal
                  open={isEndDatePickerVisible}
                  date={newExperience.endDate}
                  mode="date"
                  onConfirm={date => {
                    setEndDatePickerVisible(false);
                    setNewExperience({...newExperience, endDate: date});
                  }}
                  onCancel={() => {
                    setEndDatePickerVisible(false);
                  }}
                />
              </>
            )}

            <TextInput
              style={styles.input}
              placeholder="Description"
              placeholderTextColor={'gray'}
              value={newExperience.description}
              onChangeText={text =>
                setNewExperience({...newExperience, description: text})
              }
            />

            {/* Add experience button */}
            <TouchableOpacity
              onPress={handleAddExperience}
              style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save Experience</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // List of existing experiences when not in add mode
          <FlatList
            data={user.experience}
            keyExtractor={item => item._id}
            renderItem={({item}) => (
              <View style={styles.experienceCard}>
                <Text style={styles.experienceTitle}>
                  {item.role} at {item.company}
                </Text>
                <Text style={styles.experienceDates}>
                  {formatDate(item.startDate)} -{' '}
                  {item.isPresent ? 'Present' : formatDate(item.endDate)}
                </Text>
                <Text style={styles.experienceDescription}>
                  {item.description}
                </Text>
                {/* Delete button */}
                {/* <TouchableOpacity
                  onPress={() => handleDeleteExperience(item._id)}>
                  <Text style={styles.deleteButton}>Delete</Text>
                </TouchableOpacity> */}
              </View>
            )}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  closeButton: {
    fontSize: 16,
    color: '#888',
  },
  addButton: {
    fontSize: 16,
    color: '#007BFF',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    color: 'black',
  },
  presentSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  experienceCard: {
    padding: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 10,
  },
  experienceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  experienceDates: {
    fontSize: 14,
    color: '#888',
    marginVertical: 5,
  },
  experienceDescription: {
    fontSize: 14,
    color: '#555',
  },
  deleteButton: {
    color: 'red',
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ExperienceModal;
