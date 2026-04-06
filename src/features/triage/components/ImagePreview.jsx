import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../styles/theme';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

/**
 * ImagePreview Component
 * Shows selected image as thumbnail in chat.
 * Has X button to remove image before sending.
 */
export default function ImagePreview({ uri, onRemove }) {
  if (!uri) return null;

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.container}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri }} style={styles.image} />
        <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
          <View style={styles.iconBg}>
            <Ionicons name="close" size={16} color="#FFFFFF" />
          </View>
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
  imageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 12,
    position: 'relative',
    ...theme.shadows.sm,
    backgroundColor: theme.colors.bgSurface,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    zIndex: 10,
  },
  iconBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.riskHigh,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  }
});
