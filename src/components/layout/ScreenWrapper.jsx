import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, Text } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import { theme } from '../../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';

/**
 * Reusable ScreenWrapper Component with Offline Banner
 */
export default function ScreenWrapper({
  children,
  bg = theme.colors.bgBase,
  footer,
  style,
}) {
  const insets = useSafeAreaInsets();
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: bg }, style]}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.content}>
          {children}
        </View>
      </SafeAreaView>

      {/* Offline Banner */}
      {isOffline && (
        <Animated.View 
          entering={SlideInDown} 
          exiting={SlideOutDown} 
          style={[styles.offlineBanner, { bottom: footer ? 80 : 20 }]}
        >
          <Ionicons name="cloud-offline" size={20} color="#FFFFFF" />
          <Text style={styles.offlineText}>Awaiting Connection...</Text>
        </Animated.View>
      )}

      {footer && (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          {footer}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: theme.colors.bgSurface,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.md,
  },
  offlineBanner: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...theme.shadows.md,
  },
  offlineText: {
    ...theme.typography.label,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
