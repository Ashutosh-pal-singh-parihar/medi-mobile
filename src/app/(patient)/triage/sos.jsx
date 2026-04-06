import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming, 
  withDelay, 
  FadeInUp,
  FadeIn
} from 'react-native-reanimated';
import { triggerSOSPulse } from '../../../hooks/useHaptics';

import ScreenWrapper from '../../../components/layout/ScreenWrapper';
import { theme } from '../../../styles/theme';
import useAuthStore from '../../../store/auth.store';
import { useLanguage } from '../../../hooks/useLanguage';

export default function SOSScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { patientProfile } = useAuthStore();
  
  const pulseValue = useSharedValue(1);
  const ring1Value = useSharedValue(1);
  const ring2Value = useSharedValue(1);

  useEffect(() => {
    pulseValue.value = withRepeat(withTiming(1.1, { duration: 1000 }), -1, true);
    ring1Value.value = withRepeat(withTiming(2, { duration: 2500 }), -1, false);
    ring2Value.value = withDelay(1250, withRepeat(withTiming(2, { duration: 2500 }), -1, false));
    const cleanupHaptic = triggerSOSPulse();
    return () => cleanupHaptic();
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
  }));

  const ringStyle = (value) => useAnimatedStyle(() => ({
    transform: [{ scale: value.value }],
    opacity: 1 - (value.value - 1),
  }));

  const handleCallEmergency = () => {
    Linking.openURL('tel:102');
  };

  const handleCallContact = () => {
    if (patientProfile?.emergency_contact_phone) {
      Linking.openURL(`tel:${patientProfile.emergency_contact_phone}`);
    }
  };

  return (
    <ScreenWrapper bg={theme.colors.bgBase} statusBarStyle="dark-content">
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.visualContainer}>
            <Animated.View style={[styles.ring, ringStyle(ring1Value)]} />
            <Animated.View style={[styles.ring, ringStyle(ring2Value)]} />
            <Animated.View style={[styles.sosButton, pulseStyle]}>
              <LinearGradient 
                colors={['#DC2626', '#991B1B']} 
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="alert-circle" size={80} color="#FFFFFF" />
              </LinearGradient>
            </Animated.View>
          </View>

          <Animated.View entering={FadeInUp.delay(200)} style={styles.textSection}>
            <Text style={styles.title}>{t('risk_high')}</Text>
            <Text style={styles.subtitle}>{t('how_feeling')}</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(400)} style={styles.actions}>
            <TouchableOpacity style={styles.mainAction} onPress={handleCallEmergency}>
              <View style={styles.actionIcon}>
                <Ionicons name="call" size={28} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionLabel}>{t('emergency_contact')}</Text>
                <Text style={styles.actionSubtext}>{t('contact_phone')}</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.line} />
            </View>

            {patientProfile?.emergency_contact_phone ? (
              <TouchableOpacity style={styles.contactBtn} onPress={handleCallContact}>
                <View style={styles.contactIcon}>
                  <Ionicons name="people" size={24} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.contactName}>{patientProfile.emergency_contact_name}</Text>
                  <Text style={styles.contactRole}>{t('contact_name')}</Text>
                </View>
                <Ionicons name="call-outline" size={22} color={theme.colors.primary} />
              </TouchableOpacity>
            ) : (
              <View style={styles.noContactBox}>
                <Text style={styles.noContactText}>{t('already_have_account')}</Text>
              </View>
            )}

            <TouchableOpacity 
              style={styles.hospitalBtn} 
              onPress={() => Linking.openURL('https://www.google.com/maps/search/hospital+near+me')}
            >
              <Ionicons name="location" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.hospitalText}>{t('no_reports_yet')}</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
    zIndex: 10,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  visualContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  ring: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#DC2626',
  },
  sosButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: 'hidden',
    ...theme.shadows.lg,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.riskHigh,
    fontSize: 32,
    marginBottom: 12,
  },
  subtitle: {
    ...theme.typography.body,
    textAlign: 'center',
    color: theme.colors.textSecondary,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  actions: {
    width: '100%',
    gap: 16,
  },
  mainAction: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    gap: 16,
    ...theme.shadows.md,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    ...theme.typography.label,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  actionSubtext: {
    ...theme.typography.caption,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    gap: 12,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    ...theme.typography.caption,
    fontSize: 10,
    color: theme.colors.textTertiary,
    letterSpacing: 2,
  },
  contactBtn: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactName: {
    ...theme.typography.h3,
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  contactRole: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  noContactBox: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  noContactText: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
  },
  hospitalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  hospitalText: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
    textDecorationLine: 'underline',
  },
});
