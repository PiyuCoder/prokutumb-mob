import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {saveUserInterests} from '../store/slices/authSlice';

const InterestsSelector = ({onClose, userId}) => {
  const {user} = useSelector(state => state.auth);
  const [selectedInterests, setSelectedInterests] = useState(
    user?.interests || [],
  );
  const dispatch = useDispatch();

  // List of example interests
  const interests = [
    'Finance',
    'Science',
    'Management',
    'Content',
    'Startup',
    'Funding',
    'AI',
    'Crypto',
    'Blockchain',
    'Technology',
    'Banking',
    'Pharma',
    'Marketing',
    'EdTech',
    'Research',
    'Design',
    'Sustainablity',
    'Growth',
    'Leads',
    'Strategy',
  ];

  const handleInterestClick = interest => {
    // Toggle selection if it's already selected, or add if not
    if (selectedInterests.includes(interest)) {
      // Remove interest from selectedInterests
      setSelectedInterests(selectedInterests.filter(item => item !== interest));
    } else {
      // Add interest if less than 3 interests are selected
      if (selectedInterests.length < 3) {
        setSelectedInterests([...selectedInterests, interest]);
      } else {
        selectedInterests.pop();
        // If 3 interests are already selected, replace the first one with the new interest
        setSelectedInterests([
          ...selectedInterests, // Remove the first item
          interest, // Add the new interest
        ]);
      }
    }
  };

  const handleClose = async () => {
    if (JSON.stringify(user?.interests) !== JSON.stringify(selectedInterests)) {
      dispatch(saveUserInterests({userId, interests: selectedInterests}));
    }
    onClose(); // Close the modal
  };

  return (
    <View style={styles.container}>
      {/* <StatusBar hidden={true} /> */}
      <TouchableOpacity onPress={handleClose}>
        <Text style={{alignSelf: 'flex-end'}}>Save & Close</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Interests</Text>

      <View style={styles.interestsContainer}>
        {interests.map((interest, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.interestItem,
              selectedInterests.includes(interest) && styles.selectedInterest,
            ]}
            onPress={() => handleInterestClick(interest)}>
            <Text
              style={[
                styles.interestText,
                selectedInterests.includes(interest) &&
                  styles.selectedInterestText,
              ]}>
              #{interest}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.selectedInterestsContainer}>
        <Text style={styles.selectedInterestsText}>Selected Interests: </Text>
        {selectedInterests.length > 0 ? (
          <Text style={styles.selectedInterestsList}>
            {selectedInterests.join(', ')}
          </Text>
        ) : (
          <Text style={styles.selectedInterestsList}>None</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#22172A',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  interestItem: {
    margin: 5,
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4B164C33',
  },
  selectedInterest: {
    backgroundColor: '#DD88CF',
  },
  interestText: {
    fontSize: 16,
    color: '#4B164C',
  },
  selectedInterestText: {
    color: '#fff',
  },
  selectedInterestsContainer: {
    marginTop: 20,
  },
  selectedInterestsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedInterestsList: {
    fontSize: 16,
    color: '#4B164C',
  },
});

export default InterestsSelector;
