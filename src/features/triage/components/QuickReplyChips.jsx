import React from 'react';
import { ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../../styles/theme';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

/**
 * QuickReplyChips Component
 * Horizontal scrollable row of tappable chips.
 * Chips disappear after one is selected.
 */
export default function QuickReplyChips({ chips, onSelect, visible }) {
  if (!visible || !chips || chips.length === 0) return null;

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {chips.map((chip, i) => (
          <TouchableOpacity 
            key={i} 
            style={styles.chip} 
            onPress={() => onSelect(chip)}
            activeOpacity={0.7}
          >
            <Text style={styles.chipText}>{chip}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.primary + '44',
    ...theme.shadows.sm,
  },
  chipText: {
    ...theme.typography.label,
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
});
