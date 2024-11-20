// SplashScreen.js
import React, {useEffect} from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import proku from '../assets/splash-logo.png';

const SplashScreen = ({navigation}) => {
  useEffect(() => {
    // Navigate to the login screen after 3 seconds
    const timer = setTimeout(() => {
      navigation.replace('Login'); // Use 'replace' to remove the splash screen from the stack
    }, 3000);

    return () => clearTimeout(timer); // Cleanup the timer
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={proku} // Replace with your logo URL
        style={styles.logo}
      />
      {/* <Text style={styles.title}>Connecting the World</Text> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff', // Customize the background color as needed
  },
  logo: {
    // Adjust size based on your logo
  },
  title: {
    marginTop: 10,
    fontSize: 24,
    color: '#8A4595', // Customize the text color
  },
});

export default SplashScreen;
