import React from 'react';
import {View, ActivityIndicator, StyleSheet} from 'react-native';

const Loader = ({isLoading}) => {
  if (!isLoading) return null;

  return (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size="large" color="#A274FF" />
    </View>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // Semi-transparent background
    zIndex: 50, // Ensure it appears above other components
  },
});

export default Loader;
