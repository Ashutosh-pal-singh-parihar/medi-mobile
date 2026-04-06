import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import { theme } from '../../../styles/theme';
import Animated, { FadeInUp, FadeInLeft, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * ChatBubble Component
 * Generic message bubble for AI and User interactions.
 * Supports text, image, and video content types.
 * For video messages show a thumbnail with play button overlay.
 */
export default function ChatBubble({ message }) {
  const isAI = message.role === 'assistant';

  const Animation = isAI ? FadeInLeft.duration(300) : FadeInRight.duration(300);

  return (
    <Animated.View entering={Animation} style={[styles.container, isAI ? styles.aiContainer : styles.userContainer]}>
      {isAI && (
        <View style={styles.aiAvatar}>
          <Ionicons name="sparkles" size={12} color="#FFFFFF" />
        </View>
      )}
      
      <View style={[
        styles.bubble, 
        isAI ? styles.aiBubble : styles.userBubble,
        !isAI && (message.type === 'image' || message.type === 'video') && styles.mediaBubble
      ]}>
        {message.type === 'image' && message.imageUrl && (
          <Image 
            source={{ uri: message.imageUrl }} 
            style={styles.sentMedia} 
            resizeMode="cover" 
          />
        )}

        {message.type === 'video' && (
          <TouchableOpacity style={styles.videoWrapper} activeOpacity={0.9} onPress={() => alert('Video playback coming soon in Phase 6')}>
            <View style={styles.videoPlaceholder}>
              <Ionicons name="videocam" size={32} color={theme.colors.textTertiary} />
            </View>
            <View style={styles.playOverlay}>
              <Ionicons name="play" size={32} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        )}

        {message.content && (
          <Text style={[styles.text, isAI ? styles.aiText : styles.userText]}>
            {message.content}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  aiContainer: {
    alignSelf: 'flex-start',
    paddingLeft: 12,
  },
  userContainer: {
    alignSelf: 'flex-end',
    paddingRight: 12,
  },
  aiAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    maxWidth: SCREEN_WIDTH * 0.75,
    ...theme.shadows.sm,
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  mediaBubble: {
    padding: 2,
    overflow: 'hidden',
  },
  text: {
    ...theme.typography.body,
    lineHeight: 22,
  },
  aiText: {
    color: theme.colors.textPrimary,
  },
  userText: {
    color: '#FFFFFF',
  },
  sentMedia: {
    width: SCREEN_WIDTH * 0.65,
    height: 200,
    borderRadius: 16,
    marginBottom: 4,
  },
  videoWrapper: {
    width: SCREEN_WIDTH * 0.65,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: theme.colors.bgSurface,
    position: 'relative',
    marginBottom: 4,
  },
  videoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  }
});
