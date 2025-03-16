import React from 'react';
import {
  Modal,
  View,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';

const {width, height} = Dimensions.get('window'); // Get full screen dimensions

const Loader = ({isLoading}) => {
  return (
    <Modal visible={isLoading} transparent animationType="fade">
      <View style={styles.overlay}>
        <ActivityIndicator size="large" color="#A274FF" />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // Semi-transparent overlay
  },
});

export default Loader;
