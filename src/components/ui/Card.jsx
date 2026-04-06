import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../styles/theme';

/**
 * Reusable Card Component
 * Props:
 * - children: Content
 * - onPress (function): Tap handler
 * - variant (string): 'default' | 'elevated' | 'outline'
 * - padding (number): Custom padding
 */
export const Card = ({
  children,
  onPress,
  variant = 'default',
  padding = theme.spacing.lg,
  style,
}) => {
  const CardContainer = onPress ? TouchableOpacity : View;

  const cardStyle = [
    styles.base,
    variant === 'elevated' && styles.elevated,
    variant === 'outline' && styles.outline,
    { padding },
    style,
  ];

  return (
    <CardContainer
      onPress={onPress}
      activeOpacity={0.9}
      style={cardStyle}
    >
      {children}
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: theme.colors.bgSurface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
  },
  elevated: {
    ...theme.shadows.md,
  },
  outline: {
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});
