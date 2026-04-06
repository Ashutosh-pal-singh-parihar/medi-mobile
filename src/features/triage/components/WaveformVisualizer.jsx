import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { theme } from '../../../styles/theme';

/**
 * WaveformVisualizer Component
 * Animated bars that move while recording.
 * Use Reanimated for smooth animation.
 * 5-7 bars with random height animation.
 */
export default function WaveformVisualizer({ isRecording }) {
  const [bars] = useState([10, 24, 40, 32, 16, 28, 12]);

  if (!isRecording) return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      {bars.map((height, i) => (
        <AnimatedBar key={i} baseHeight={height} delay={i * 100} />
      ))}
    </View>
  );
}

function AnimatedBar({ baseHeight, delay }) {
  const animatedStyle = useAnimatedStyle(() => ({
    height: withRepeat(
      withSequence(
        withTiming(baseHeight * 0.4, { duration: 300 }),
        withTiming(baseHeight * 1.5, { duration: 300 })
      ),
      -1,
      true
    ),
  }));

  return <Animated.View style={[styles.bar, animatedStyle]} />;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 60,
    width: '100%',
  },
  bar: {
    width: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    opacity: 0.6,
  },
});
