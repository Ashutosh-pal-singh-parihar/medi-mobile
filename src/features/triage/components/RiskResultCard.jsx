import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { theme } from '../../../styles/theme';
import { RISK_CONFIG } from '../../../config/constants';
import RiskBadge from './RiskBadge';

/**
 * RiskResultCard
 * Premium hero card for triage result screen.
 */
export default function RiskResultCard({ result }) {
  const config = RISK_CONFIG[result?.risk_level] || RISK_CONFIG.LOW;

  return (
    <Animated.View entering={FadeInUp.delay(100)}>
      <LinearGradient 
        colors={[config.color, config.color + 'CC']} 
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <RiskBadge riskLevel={result?.risk_level} style={styles.badge} />
          <Ionicons name="shield-checkmark" size={32} color="#FFFFFF" />
        </View>

        <Text style={styles.summary}>{result?.ai_summary || 'Your assessment is complete'}</Text>
        
        <View style={styles.footer}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>AI Confidence</Text>
            <Text style={styles.statValue}>{Math.round(result?.ai_confidence * 100 || 0)}%</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Status</Text>
            <Text style={styles.statValue}>Verified AI</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 24,
    borderRadius: 24,
    marginBottom: 24,
    ...theme.shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  badge: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
    paddingHorizontal: 12,
  },
  summary: {
    ...theme.typography.h1,
    color: '#FFFFFF',
    marginBottom: 24,
    lineHeight: 34,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    ...theme.typography.caption,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  statValue: {
    ...theme.typography.label,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 16,
  },
});
