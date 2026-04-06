import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

/**
 * Reusable Pill Chip Component
 */
export default function PillChip({
  label,
  selected = false,
  onPress,
  variant = 'default',
  size = 'md',
  riskLevel,
  style,
}) {
  const getVariantStyles = () => {
    if (variant === 'risk' && riskLevel) {
      switch (riskLevel) {
        case 'HIGH':
          return { container: styles.riskHigh, text: styles.textWhite };
        case 'MEDIUM':
          return { container: styles.riskMedium, text: styles.textWhite };
        case 'LOW':
          return { container: styles.riskLow, text: styles.textWhite };
        default: break;
      }
    }
    
    if (variant === 'outline') {
      return { container: styles.outline, text: styles.textOutline };
    }
    
    return {
      container: selected ? styles.selected : styles.default,
      text: selected ? styles.textSelected : styles.textDefault,
    };
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'xs': return styles.sizeXs;
      case 'sm': return styles.sizeSm;
      default: return null;
    }
  };

  const { container, text } = getVariantStyles();
  const sizeStyle = getSizeStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.base, container, sizeStyle, style]}
    >
      <Text style={[styles.textBase, text, size === 'xs' && { fontSize: 10 }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.radius.pill,
    marginRight: 8,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  default: {
    backgroundColor: theme.colors.bgSurface2,
    borderColor: theme.colors.border,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.border,
  },
  sizeXs: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 4,
    marginBottom: 0,
  },
  sizeSm: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  selected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    ...theme.shadows.sm,
  },
  riskHigh: {
    backgroundColor: theme.colors.riskHigh,
  },
  riskMedium: {
    backgroundColor: theme.colors.riskMedium,
  },
  riskLow: {
    backgroundColor: theme.colors.riskLow,
  },
  textBase: {
    ...theme.typography.body,
    fontSize: 14,
    fontWeight: '600',
  },
  textDefault: {
    color: theme.colors.textSecondary,
  },
  textOutline: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  textSelected: {
    color: '#FFFFFF',
  },
  textWhite: {
    color: '#FFFFFF',
  },
});
