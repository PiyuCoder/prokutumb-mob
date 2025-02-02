import React from 'react';
import {View, Animated} from 'react-native';
import Svg, {Path} from 'react-native-svg';

const SineWaveArrow = ({arrowPosition}) => {
  return (
    <View style={{position: 'absolute', top: 40, width: '100%', zIndex: 150}}>
      <Animated.View
        style={{
          transform: [{translateX: arrowPosition}],
        }}>
        <Svg height="80" width="100" viewBox="10 0 120 50">
          {/* Extended sine wave to include complete start and end curves */}
          <Path
            d="
              M-20 25
              C0 50, 20 50, 40 25 
              C60 0, 80 0, 100 25
              C120 50, 140 50, 160 25
              L160 50
              L-20 50 
              Z"
            fill="#A274FF" // Solid wave
            stroke="#A274FF" // Optional stroke for clarity
            strokeWidth="2"
          />
        </Svg>
      </Animated.View>
    </View>
  );
};

export default SineWaveArrow;
