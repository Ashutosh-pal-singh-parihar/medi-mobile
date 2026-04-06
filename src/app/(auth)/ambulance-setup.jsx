import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import KeyboardAvoidingWrapper from '../../components/layout/KeyboardAvoidingWrapper';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import PillChip from '../../components/ui/PillChip';
import { theme } from '../../styles/theme';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/auth.store';
import { ambulanceService } from '../../features/ambulance/services/ambulance.service';
import { VEHICLE_TYPES, USER_ROLES } from '../../config/constants';
import { useLanguage } from '../../hooks/useLanguage';
import { authService } from '../../features/auth/services/auth.service';

export default function AmbulanceSetupScreen() {
  const router = useRouter();
  const { user, setUser, setRole } = useAuthStore();
  const { t } = useLanguage();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    vehicle_number: '',
    vehicle_type: 'Basic',
  });

  const nextStep = () => {
    if (step === 1) {
      if (!form.full_name || !form.phone || !form.vehicle_number) {
        return;
      }
      setStep(2);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const profileData = {
        user_id: user.id,
        full_name: form.full_name,
        phone: form.phone,
        vehicle_number: form.vehicle_number,
        vehicle_type: form.vehicle_type,
      };
      
      // Update role in auth.users
      await authService.setUserRole(user.id, USER_ROLES.AMBULANCE);
      
      // Create profile
      await ambulanceService.createProfile(profileData);
      
      setRole(USER_ROLES.AMBULANCE);
      router.replace('/(ambulance)/dashboard');
    } catch (error) {
      console.error('Setup error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper bg={theme.colors.bgBase}>
      <KeyboardAvoidingWrapper>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{step === 1 ? t('tell_us_about_you') : t('ready_to_save_lives')}</Text>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: step === 1 ? '50%' : '100%', backgroundColor: theme.colors.riskHigh }]} />
            </View>
          </View>

          {step === 1 ? (
            <View style={styles.stepContainer}>
              <Input
                label={t('full_name')}
                value={form.full_name}
                onChangeText={(val) => setForm(prev => ({ ...prev, full_name: val }))}
                placeholder="John Doe"
              />
              <Input
                label={t('contact_phone')}
                value={form.phone}
                onChangeText={(val) => setForm(prev => ({ ...prev, phone: val }))}
                placeholder="+91 98765 43210"
                keyboardType="phone-pad"
              />
              <Input
                label={t('vehicle_number')}
                value={form.vehicle_number}
                onChangeText={(val) => setForm(prev => ({ ...prev, vehicle_number: val }))}
                placeholder="MP09 AB 1234"
                autoCapitalize="characters"
              />
              
              <Text style={styles.sectionLabel}>{t('vehicle_type')}</Text>
              <View style={styles.pillsContainer}>
                {VEHICLE_TYPES.map((type) => (
                  <PillChip
                    key={type}
                    label={type}
                    selected={form.vehicle_type === type}
                    onPress={() => setForm(prev => ({ ...prev, vehicle_type: type }))}
                  />
                ))}
              </View>

              <Button
                title={t('next')}
                onPress={nextStep}
                fullWidth
                style={styles.primaryBtn}
                disabled={!form.full_name || !form.phone || !form.vehicle_number}
              />
            </View>
          ) : (
            <View style={styles.stepContainer}>
              <View style={styles.summaryCard}>
                <Text style={styles.emoji}>🚑</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>{t('full_name')}:</Text>
                  <Text style={styles.summaryValue}>{form.full_name}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>{t('contact_phone')}:</Text>
                  <Text style={styles.summaryValue}>{form.phone}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>{t('vehicle_number')}:</Text>
                  <Text style={styles.summaryValue}>{form.vehicle_number}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>{t('vehicle_type')}:</Text>
                  <Text style={styles.summaryValue}>{form.vehicle_type}</Text>
                </View>
              </View>

              <Button
                title={t('complete_setup')}
                onPress={handleComplete}
                loading={loading}
                fullWidth
                style={styles.primaryBtn}
              />
              <TouchableOpacity onPress={() => setStep(1)} style={styles.backBtn}>
                <Text style={styles.backBtnText}>Edit Details</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingWrapper>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  progressContainer: {
    height: 4,
    backgroundColor: theme.colors.divider,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  stepContainer: {
    gap: 16,
  },
  sectionLabel: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: theme.colors.bgSurface,
    borderRadius: theme.radius.lg,
    padding: 24,
    ...theme.shadows.md,
    alignItems: 'center',
    marginBottom: 32,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  summaryLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  summaryValue: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
  },
  primaryBtn: {
    backgroundColor: theme.colors.riskHigh,
  },
  backBtn: {
    marginTop: 16,
    alignItems: 'center',
  },
  backBtnText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textDecorationLine: 'underline',
  },
});
