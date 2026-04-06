import * as Haptics from 'expo-haptics';

/**
 * useHaptics
 * Custom hook and utility for standardized haptic feedback across the app.
 * Follows the MediTriage design specification for risk-based feedback.
 */

export const triggerRiskHaptic = (riskLevel) => {
  switch (riskLevel) {
    case 'HIGH':
      // 3 heavy pulses at 0ms, 400ms, 800ms
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 400);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 800);
      break;
    case 'MEDIUM':
      // 1 medium impact
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      break;
    case 'LOW':
      // 1 light impact
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      break;
    default:
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

export const triggerPress = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

export const triggerSuccess = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

export const triggerError = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

export const triggerSOSPulse = () => {
  // Continuous heavy pulse — used in SOS screen
  const interval = setInterval(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, 2000);
  return () => clearInterval(interval); // Return cleanup function
};

// Hook version for components that prefer it
export default function useHaptics() {
  return {
    triggerRiskHaptic,
    triggerPress,
    triggerSuccess,
    triggerError,
    triggerSOSPulse,
  };
}
