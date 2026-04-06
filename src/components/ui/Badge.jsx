import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

/**
 * Reusable Badge Component
 * Props:
 * - label (string): Badge text
 * - variant (string): 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'ghost'
 * - size (string): 'sm' | 'md'
 */
export const Badge = ({
  label,
  variant = 'primary',
  size = 'md',
  style,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return { container: styles.success, text: styles.textSuccess };
      case 'warning':
        return { container: styles.warning, text: styles.textWarning };
      case 'danger':
        return { container: styles.danger, text: styles.textDanger };
      case 'info':
        return { container: styles.info, text: styles.textInfo };
      case 'ghost':
        return { container: styles.ghost, text: styles.textGhost };
      default:
        return { container: styles.primary, text: styles.textPrimary };
    }
  };

  const { container, text } = getVariantStyles();

  return (
    <View style={[styles.base, container, size === 'sm' && styles.sm, style]}>
      <Text style={[styles.textBase, text, size === 'sm' && styles.textSm]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sm: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  primary: {
    backgroundColor: theme.colors.primaryLight,
  },
  success: {
    backgroundColor: theme.colors.riskLowBg,
  },
  warning: {
    backgroundColor: theme.colors.riskMediumBg,
  },
  danger: {
    backgroundColor: theme.colors.riskHighBg,
  },
  info: {
    backgroundColor: '#F0F4FF',
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textBase: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  textSm: {
    fontSize: 11,
  },
  textPrimary: {
    color: theme.colors.primary,
  },
  textSuccess: {
    color: theme.colors.riskLow,
  },
  textWarning: {
    color: theme.colors.riskMedium,
  },
  textDanger: {
    color: theme.colors.riskHigh,
  },
  textInfo: {
    color: theme.colors.primary,
  },
  textGhost: {
    color: theme.colors.textSecondary,
  },
});
