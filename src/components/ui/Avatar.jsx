import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../styles/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

/**
 * Reusable Avatar Component
 */
export default function Avatar({
  uri,
  size = 40,
  ring = true,
  ringColor = ['#2563EB', '#0891B2'],
  onPress,
  fallbackIcon = 'person',
  style,
}) {
  const AvatarContainer = onPress ? TouchableOpacity : View;

  return (
    <AvatarContainer onPress={onPress} activeOpacity={0.8} style={[styles.container, { width: size, height: size }, style]}>
      {ring ? (
        <LinearGradient
          colors={ringColor}
          style={[styles.ring, { width: size, height: size, borderRadius: size / 2 }]}
        >
          <View style={[styles.innerBorder, { borderRadius: size / 2 }]}>
            {uri ? (
              <Image 
                source={{ uri }} 
                style={[styles.image, { width: size - 6, height: size - 6, borderRadius: (size - 6) / 2 }]} 
              />
            ) : (
              <View style={[styles.fallback, { width: size - 6, height: size - 6, borderRadius: (size - 6) / 2 }]}>
                <Ionicons name={fallbackIcon} size={size * 0.5} color={theme.colors.textTertiary} />
              </View>
            )}
          </View>
        </LinearGradient>
      ) : (
        <View style={[styles.imageOnly, { width: size, height: size, borderRadius: size / 2 }]}>
          {uri ? (
            <Image 
              source={{ uri }} 
              style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]} 
            />
          ) : (
            <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2 }]}>
              <Ionicons name={fallbackIcon} size={size * 0.5} color={theme.colors.textTertiary} />
            </View>
          )}
        </View>
      )}
    </AvatarContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerBorder: {
    padding: 1,
    backgroundColor: theme.colors.bgBase,
  },
  image: {
    backgroundColor: theme.colors.bgSurface2,
  },
  imageOnly: {
    overflow: 'hidden',
    backgroundColor: theme.colors.bgSurface2,
  },
  fallback: {
    backgroundColor: theme.colors.bgSurface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
