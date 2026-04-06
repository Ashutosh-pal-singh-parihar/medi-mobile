import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, withDelay, interpolate } from 'react-native-reanimated';
import { theme } from '../../../styles/theme';

/**
 * TypingIndicator Component
 * 3 bouncing dots animation using Reanimated.
 * Shows in an AI chat bubble style container.
 */
export default function TypingIndicator() {
  return (
    <View style={styles.container}>
      <View style={styles.dotContainer}>
        <Dot delay={0} />
        <Dot delay={200} />
        <Dot delay={400} />
      </View>
    </View>
  );
}

function Dot({ delay }) {
  const bounce = useSharedValue(0);

  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(
        withDelay(delay, withTiming(1, { duration: 400 })),
        withTiming(0, { duration: 400 })
      ),
      -1,
      true
    );
  }, []);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(bounce.value, [0, 1], [0, -6]) }],
    opacity: interpolate(bounce.value, [0, 1], [0.4, 1]),
  }));

  return <Animated.View style={[styles.dot, dotStyle]} />;
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginLeft: 4,
    alignSelf: 'flex-start',
  },
  dotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    ...theme.shadows.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
  },
});
