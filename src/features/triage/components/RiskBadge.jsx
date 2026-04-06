import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../../styles/theme';
import { RISK_CONFIG } from '../../../config/constants';

export default function RiskBadge({ riskLevel, style, size = 'md' }) {
  const config = RISK_CONFIG[riskLevel] || RISK_CONFIG.LOW;
  
  const isSmall = size === 'sm';

  return (
    <View style={[
      styles.badge, 
      { backgroundColor: config.bg, borderColor: config.border }, 
      isSmall && styles.badgeSm,
      style
    ]}>
      {!isSmall && <View style={[styles.dot, { backgroundColor: config.color }]} />}
      <Text style={[
        styles.label, 
        { color: config.color },
        isSmall && styles.labelSm
      ]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    gap: 0,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    ...theme.typography.label,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  labelSm: {
    fontSize: 9,
    fontWeight: '900',
  },
});
