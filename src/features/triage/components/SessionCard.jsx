import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming, 
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { theme } from '../../../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { formatRelativeTime } from '../../../utils/formatters';
import { getRiskColor } from '../../../utils/risk.helpers';
import RiskBadge from './RiskBadge';
import PillChip from '../../../components/ui/PillChip';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * SessionCard Component
 * Displays a summary of a triage session with risk-based visual cues.
 * Used in Home and Reports screens.
 */
export default function SessionCard({ 
  caseId,
  riskLevel,
  aiSummary,
  detectedSymptoms = [],
  createdAt,
  status,
  verifiedByDoctor,
  onPress 
}) {
  const scale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);
  const isHighRisk = riskLevel === 'HIGH';

  useEffect(() => {
    if (isHighRisk) {
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.4, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        true
      );
    } else {
      pulseOpacity.value = 1;
    }
  }, [isHighRisk, riskLevel]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const riskColor = getRiskColor(riskLevel);

  return (
    <AnimatedPressable 
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={[styles.card, animatedStyle]}
    >
      {/* Left indicator bar with optional pulse for HIGH risk */}
      <Animated.View 
        style={[
          styles.indicator, 
          { backgroundColor: riskColor }, 
          isHighRisk && pulseStyle
        ]} 
      />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <RiskBadge riskLevel={riskLevel} size="sm" />
          <Text style={styles.timeText}>{formatRelativeTime(createdAt)}</Text>
        </View>

        <Text style={styles.summary} numberOfLines={2} ellipsizeMode="tail">
          {aiSummary || 'No summary available for this session.'}
        </Text>

        <View style={styles.bottomRow}>
          <View style={styles.chipsContainer}>
            {detectedSymptoms.slice(0, 3).map((symptom, idx) => (
              <PillChip 
                key={`${caseId}-sym-${idx}`}
                label={symptom} 
                size="xs" 
                variant="outline" 
                style={styles.chip}
              />
            ))}
          </View>

          {verifiedByDoctor && (
            <View style={styles.doctorBadge}>
               <Ionicons name="checkmark-circle" size={12} color={theme.colors.riskLow} />
               <Text style={styles.doctorText}>Doctor reviewed</Text>
            </View>
          )}
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.bgSurface,
    borderRadius: theme.radius.lg,
    flexDirection: 'row',
    marginBottom: 16,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  indicator: {
    width: 4,
    height: '100%',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeText: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
  },
  summary: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    lineHeight: 20,
    marginBottom: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chipsContainer: {
    flexDirection: 'row',
    flex: 1,
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: 6,
    borderWidth: 1,
  },
  doctorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  doctorText: {
    ...theme.typography.label,
    fontSize: 10,
    color: theme.colors.riskLow,
    fontWeight: '700',
  },
});
