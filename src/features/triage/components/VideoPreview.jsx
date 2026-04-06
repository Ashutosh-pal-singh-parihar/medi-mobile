import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../styles/theme';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

/**
 * VideoPreview Component
 * Shows a thumbnail of the selected video with a play button overlay.
 */
export default function VideoPreview({ uri, onRemove, onPreview }) {
  if (!uri) return null;

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.container}>
      <View style={styles.thumbnailContainer}>
        {/* Note: In a real app we'd generate a thumbnail using expo-video-thumbnails */}
        {/* For now we'll show a placeholder or the URI if it's a valid image */}
        <View style={styles.placeholder}>
          <Ionicons name="videocam" size={32} color={theme.colors.textTertiary} />
        </View>
        
        <TouchableOpacity style={styles.playOverlay} onPress={onPreview}>
          <Ionicons name="play-circle" size={48} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
          <Ionicons name="close-circle" size={24} color={theme.colors.riskHigh} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  thumbnailContainer: {
    width: 120,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: theme.colors.bgSurface,
    position: 'relative',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
});
