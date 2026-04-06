import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../../styles/theme';
import { Ionicons } from '@expo/vector-icons';

export default function SymptomChip({ label, icon = 'medical-outline' }) {
  return (
    <View style={styles.chip}>
      <Ionicons name={icon} size={14} color={theme.colors.primary} />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    ...theme.shadows.sm,
  },
  text: {
    ...theme.typography.body,
    fontSize: 13,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
});
