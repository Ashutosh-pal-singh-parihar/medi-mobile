import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';

export default function VoiceRecorder({ onRecordingComplete, disabled }) {
  const { isRecording, startRecording, stopRecording, cancelRecording } = useVoiceRecorder();
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  const handlePress = async () => {
    if (disabled) return;
    if (isRecording) {
      const result = await stopRecording();
      if (result && onRecordingComplete) {
        onRecordingComplete(result);
      }
    } else {
      await startRecording();
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }], opacity: isRecording ? 0.3 : 0 }]} />
      <TouchableOpacity
        style={[styles.micButton, isRecording && styles.micButtonActive, disabled && styles.micButtonDisabled]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Ionicons name={isRecording ? 'stop' : 'mic'} size={28} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.label}>
        {disabled ? 'Voice unavailable' : isRecording ? 'Tap to stop' : 'Tap to speak'}
      </Text>
      {isRecording && (
        <TouchableOpacity onPress={cancelRecording} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 12 },
  pulseRing: {
    position: 'absolute', width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#EF4444',
  },
  micButton: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#3B82F6',
    alignItems: 'center', justifyContent: 'center',
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, shadowRadius: 4,
  },
  micButtonActive: { backgroundColor: '#EF4444' },
  micButtonDisabled: { backgroundColor: '#9CA3AF' },
  label: { marginTop: 8, fontSize: 13, color: '#6B7280' },
  cancelBtn: { marginTop: 6 },
  cancelText: { color: '#EF4444', fontSize: 13 },
});
