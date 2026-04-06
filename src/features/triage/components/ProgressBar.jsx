import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, withTiming, useSharedValue } from 'react-native-reanimated';
import { theme } from '../../../styles/theme';

/**
 * ProgressBar Component
 * Thin bar at top of session screen.
 * Fills from 0 to 100% as conversation progresses.
 * Smooth animation using Reanimated.
 */
export default function ProgressBar({ progress }) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withSpring(progress, { damping: 15, stiffness: 40 });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 4,
    backgroundColor: '#E2E8F0',
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
});
