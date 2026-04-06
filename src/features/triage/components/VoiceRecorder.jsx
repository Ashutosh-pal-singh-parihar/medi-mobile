import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../styles/theme';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

/**
 * VoiceRecorder Component
 * Large circular mic button.
 * Hold to record, release to send.
 * Shows recording duration timer while recording.
 */
export default function VoiceRecorder({ onStart, onStop, isRecording }) {
  const [timer, setTimer] = useState(0);
  const intervalRef = useRef(null);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
      scale.value = withSpring(1.4);
    } else {
      clearInterval(intervalRef.current);
      setTimer(0);
      scale.value = withSpring(1);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRecording]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onStart();
  };

  const handlePressOut = () => {
    onStop();
  };

  return (
    <View style={styles.container}>
      {isRecording && (
        <View style={styles.timerContainer}>
          <View style={styles.recordingDot} />
          <Text style={styles.timerText}>{formatTime(timer)}</Text>
        </View>
      )}
      
      <Animated.View style={[styles.micWrapper, animatedStyle]}>
        <TouchableOpacity 
          style={[styles.micBtn, isRecording && styles.micBtnActive]} 
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          <Ionicons name="mic" size={32} color={isRecording ? "#FFFFFF" : theme.colors.primary} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
    width: '100%',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  timerText: {
    ...theme.typography.label,
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  micWrapper: {
    ...theme.shadows.md,
  },
  micBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  micBtnActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
});
