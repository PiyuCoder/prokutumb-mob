import React, {useEffect, useRef} from 'react';
import {Animated, Text, View, StyleSheet} from 'react-native';

const OnlineEventPulse = () => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [scaleAnim]);

  return (
    <Animated.View
      style={[styles.pulseContainer, {transform: [{scale: scaleAnim}]}]}>
      <Text style={styles.text}>Virtual Event</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  pulseContainer: {
    alignSelf: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: '#d1f0e1', // light green
    marginBottom: 10,
  },
  text: {
    color: '#1e7f4c', // darker green
    fontWeight: 'bold',
  },
});

export default OnlineEventPulse;
