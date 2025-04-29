import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
} from 'react-native';
import moment from 'moment-timezone';

const allTimezones = moment.tz.names();

const TimezoneDropdown = ({setTimezone, timezone}) => {
  const [search, setSearch] = useState('');
  const [showList, setShowList] = useState(false);

  const filteredTimezones = allTimezones.filter(tz =>
    tz.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setShowList(!showList)}>
        <Text style={styles.selectedValue}>
          {timezone || 'Select Timezone'}
        </Text>
      </TouchableOpacity>

      {showList && (
        <>
          <TextInput
            style={styles.searchInput}
            placeholder="Search timezone..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#888"
          />
          <View style={styles.listWrapper}>
            <FlatList
              data={filteredTimezones}
              keyExtractor={item => item}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => {
                    setTimezone(item);
                    setShowList(false);
                    setSearch('');
                  }}>
                  <Text style={styles.itemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    backgroundColor: 'white',
  },
  selectedValue: {
    fontSize: 16,
    color: '#000',
    paddingVertical: 8,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginVertical: 8,
    color: 'black',
  },
  listWrapper: {
    maxHeight: 200,
  },
  item: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
  itemText: {
    color: 'black',
  },
});

export default TimezoneDropdown;
