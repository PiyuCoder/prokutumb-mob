import React, {useState} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import moment from 'moment-timezone';

const allTimezones = moment.tz.names();

const TimezoneDropdown = ({setTimezone, timezone}) => {
  return (
    <View style={styles.container}>
      <Picker
        selectedValue={timezone}
        onValueChange={itemValue => setTimezone(itemValue)}
        style={styles.picker}>
        <Picker.Item label="Select Timezone" value="" />
        {allTimezones.map(tz => (
          <Picker.Item key={tz} label={tz} value={tz} />
        ))}
      </Picker>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
    padding: 12,
    paddingStart: 20,
    marginBottom: 16,
    backgroundColor: 'white',
    color: 'black',
  },
  label: {
    fontSize: 16,
    color: 'black',
    marginBottom: 5,
    marginLeft: 10,
  },
  picker: {
    height: 50,
    color: 'black',
  },
});

export default TimezoneDropdown;
