import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Switch, FlatList, TouchableOpacity, Animated, Alert } from 'react-native';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import { theme } from '../../styles/theme';
import { useAuthStore } from '../../store/auth.store';
import { ambulanceService } from '../../features/ambulance/services/ambulance.service';
import { AMBULANCE_STATUS } from '../../config/constants';
import { useAmbulanceAlerts } from '../../features/ambulance/hooks/useAmbulanceAlerts';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../hooks/useLanguage';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';

export default function AmbulanceDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { t } = useLanguage();
  
  const [profile, setProfile] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Flash animation
  const flashOpacity = useRef(new Animated.Value(0)).current;

  // Ambulance Alerts Hook
  const { alerts, setAlerts, newAlertTrigger } = useAmbulanceAlerts(profile?.id);

  useEffect(() => {
    fetchProfile();
  }, [user.id]);

  useEffect(() => {
    if (newAlertTrigger) {
      triggerFlash();
    }
  }, [newAlertTrigger]);

  const fetchProfile = async () => {
    const data = await ambulanceService.getProfile(user.id);
    setProfile(data);
    setIsOnline(data?.is_online || false);
    
    // Fetch initial pending alerts
    if (data) {
      const pendingAlerts = await ambulanceService.getPendingAlerts(data.id);
      setAlerts(pendingAlerts);
    }
    
    setLoading(false);
  };

  const triggerFlash = () => {
    Animated.sequence([
      Animated.timing(flashOpacity, { toValue: 0.3, duration: 200, useNativeDriver: true }),
      Animated.timing(flashOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(flashOpacity, { toValue: 0.3, duration: 200, useNativeDriver: true }),
      Animated.timing(flashOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  };

  const toggleOnline = async (value) => {
    if (value) {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is required to receive alerts.');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      await ambulanceService.setOnlineStatus(profile.id, true, location.coords.latitude, location.coords.longitude);
      setIsOnline(true);
    } else {
      await ambulanceService.setOnlineStatus(profile.id, false, null, null);
      setIsOnline(false);
    }
  };

  const handleAccept = async (caseId) => {
    try {
      await ambulanceService.acceptCase(caseId, profile.id);
      router.push({ pathname: '/(ambulance)/map', params: { caseId } });
    } catch (e) {
      console.error('Accept error:', e);
    }
  };

  const handleDismiss = (caseId) => {
    Alert.alert(
      'Dismiss Alert',
      'Choose a reason:',
      [
        { text: 'Patient too far', onPress: () => dismissWithReason(caseId, 'too_far') },
        { text: 'Already on another case', onPress: () => dismissWithReason(caseId, 'busy') },
        { text: 'Vehicle issue', onPress: () => dismissWithReason(caseId, 'vehicle_issue') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const dismissWithReason = async (caseId, reason) => {
    await ambulanceService.dismissCase(caseId, profile.id, reason);
    setAlerts(prev => prev.filter(al => al.id !== caseId));
  };

  const renderAlertItem = ({ item }) => (
    <View style={styles.alertCard}>
      <View style={styles.alertHeader}>
        <View style={styles.pulseContainer}>
            <View style={styles.pulseDot} />
        </View>
        <Text style={styles.patientInfo}>
          Patient #{item.id.slice(-4)} • {item.triage_cases.patient_profiles.gender}, {item.triage_cases.patient_profiles.age}y
        </Text>
        <Text style={styles.timeAgo}>5 min ago</Text>
      </View>
      
      <Text style={styles.distanceText}>2.3 km away (~8 mins)</Text>
      
      <View style={styles.symptomsContainer}>
        {item.triage_cases.detected_symptoms?.slice(0, 3).map((s, idx) => (
          <View key={idx} style={styles.symptomChip}>
            <Text style={styles.symptomChipText}>{s}</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.dismissBtn} onPress={() => handleDismiss(item.id)}>
          <Text style={styles.dismissBtnText}>{t('dismiss')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAccept(item.id)}>
          <Text style={styles.acceptBtnText}>{t('accept')} →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScreenWrapper bg={theme.colors.bgBase}>
      <Animated.View style={[styles.flashOverlay, { opacity: flashOpacity }]} pointerEvents="none" />
      
      <View style={styles.container}>
        <View style={[styles.statusToggle, { backgroundColor: isOnline ? '#DCFCE7' : '#F1F5F9' }]}>
          <View style={styles.toggleTextContainer}>
            <Text style={[styles.toggleText, { color: isOnline ? '#166534' : '#475569' }]}>
              {isOnline ? t('online_status') : t('offline_status')}
            </Text>
          </View>
          <Switch
            value={isOnline}
            onValueChange={toggleOnline}
            trackColor={{ false: '#CBD5E1', true: '#22C55E' }}
            thumbColor={'#FFFFFF'}
          />
        </View>

        <Text style={styles.sectionTitle}>Active Alerts</Text>

        <FlatList
          data={alerts}
          renderItem={renderAlertItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyStateComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🚑</Text>
              <Text style={styles.emptyTitle}>{t('no_active_alerts')}</Text>
              <Text style={styles.emptySubtitle}>{t('notified_on_high_risk')}</Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🚑</Text>
              <Text style={styles.emptyTitle}>{t('no_active_alerts')}</Text>
              <Text style={styles.emptySubtitle}>{t('notified_on_high_risk')}</Text>
            </View>
          }
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#DC2626',
    zIndex: 99,
  },
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: theme.radius.lg,
    marginBottom: 32,
    marginTop: 12,
  },
  toggleTextContainer: {
    flex: 1,
  },
  toggleText: {
    ...theme.typography.h3,
    fontSize: 16,
  },
  sectionTitle: {
    ...theme.typography.h2,
    marginBottom: 16,
    color: theme.colors.textPrimary,
  },
  alertCard: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    borderRadius: theme.radius.md,
    padding: 20,
    marginBottom: 16,
    ...theme.shadows.sm,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pulseContainer: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DC2626',
  },
  patientInfo: {
    ...theme.typography.h3,
    fontSize: 16,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  timeAgo: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
  },
  distanceText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  symptomsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  symptomChip: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  symptomChipText: {
    ...theme.typography.caption,
    color: '#B91C1C',
    fontWeight: '600',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dismissBtn: {
    flex: 1,
    height: 48,
    borderRadius: theme.radius.md,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissBtnText: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
  },
  acceptBtn: {
    flex: 1,
    height: 48,
    borderRadius: theme.radius.md,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptBtnText: {
    ...theme.typography.label,
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    ...theme.typography.h3,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtitle: {
    ...theme.typography.body,
    color: theme.colors.textTertiary,
    textAlign: 'center',
  },
});
