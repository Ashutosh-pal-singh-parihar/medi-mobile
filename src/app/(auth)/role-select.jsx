import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import Button from '../../components/ui/Button';
import { theme } from '../../styles/theme';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLanguage } from '../../hooks/useLanguage';

export default function RoleSelectScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [selectedRole, setSelectedRole] = useState(null);

  const patientCardStyle = useAnimatedStyle(() => {
    const isSelected = selectedRole === 'patient';
    return {
      transform: [{ scale: withSpring(isSelected ? 1.05 : 1) }],
      borderWidth: withSpring(isSelected ? 2 : 0),
      borderColor: theme.colors.primary,
      opacity: withTiming(selectedRole && !isSelected ? 0.7 : 1, { duration: 200 }),
      backgroundColor: '#FFFFFF',
    };
  });

  const doctorCardStyle = useAnimatedStyle(() => {
    const isSelected = selectedRole === 'doctor';
    return {
      transform: [{ scale: withSpring(isSelected ? 1.05 : 1) }],
      borderWidth: withSpring(isSelected ? 2 : 0),
      borderColor: '#8B5CF6',
      opacity: withTiming(selectedRole && !isSelected ? 0.7 : 1, { duration: 200 }),
      backgroundColor: '#FFFFFF',
    };
  });

  const ambulanceCardStyle = useAnimatedStyle(() => {
    const isSelected = selectedRole === 'ambulance';
    return {
      transform: [{ scale: withSpring(isSelected ? 1.05 : 1) }],
      borderWidth: withSpring(isSelected ? 2 : 0),
      borderColor: theme.colors.riskHigh,
      opacity: withTiming(selectedRole && !isSelected ? 0.7 : 1, { duration: 200 }),
      backgroundColor: '#FFFFFF',
    };
  });

  const handleContinue = () => {
    if (selectedRole === 'doctor') {
      Alert.alert(
        t('doctor'),
        t('doctor_web_only'),
        [{ text: t('cancel'), style: 'cancel' }]
      );
    } else if (selectedRole === 'ambulance') {
      router.push('/(auth)/ambulance-setup');
    } else {
      router.push('/(auth)/patient-setup');
    }
  };

  return (
    <ScreenWrapper bg={theme.colors.bgBase}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('who_are_you')}</Text>
        </View>

        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={() => setSelectedRole('patient')}
        >
          <Animated.View style={[styles.roleCard, patientCardStyle]}>
            <View style={styles.iconCircle}>
              <LinearGradient 
                colors={['#2563EB', '#0891B2']} 
                style={styles.gradientRing}
              >
                <View style={styles.iconInner}>
                  <Ionicons name="person" size={32} color={theme.colors.primary} />
                </View>
              </LinearGradient>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{t('patient')}</Text>
              <Text style={styles.cardDesc}>Get AI-powered health assessment</Text>
            </View>
          </Animated.View>
        </TouchableOpacity>

        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={() => setSelectedRole('doctor')}
        >
          <Animated.View style={[styles.roleCard, doctorCardStyle]}>
            <View style={styles.iconCircle}>
              <LinearGradient 
                colors={['#8B5CF6', '#C026D3']} 
                style={styles.gradientRing}
              >
                <View style={styles.iconInner}>
                  <Ionicons name="medical" size={32} color="#8B5CF6" />
                </View>
              </LinearGradient>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{t('doctor')}</Text>
              <Text style={styles.cardDesc}>Review cases and manage patients</Text>
            </View>
          </Animated.View>
        </TouchableOpacity>

        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={() => setSelectedRole('ambulance')}
        >
          <Animated.View style={[styles.roleCard, ambulanceCardStyle]}>
            <View style={styles.iconCircle}>
              <LinearGradient 
                colors={['#EF4444', '#B91C1C']} 
                style={styles.gradientRing}
              >
                <View style={styles.iconInner}>
                  <MaterialCommunityIcons name="ambulance" size={32} color="#DC2626" />
                </View>
              </LinearGradient>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{t('ambulance_operator')}</Text>
              <Text style={styles.cardDesc}>{t('ambulance_subtitle')}</Text>
            </View>
          </Animated.View>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Button 
            title={t('continue')} 
            onPress={handleContinue} 
            disabled={!selectedRole}
            fullWidth
            style={selectedRole === 'patient' ? styles.primaryBtn : (selectedRole === 'ambulance' ? styles.ambulanceBtn : styles.ghostBtn)}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 48,
  },
  title: {
    ...theme.typography.display,
    fontSize: 40,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.radius.xl,
    padding: 24,
    marginBottom: 24,
    ...theme.shadows.sm,
  },
  iconCircle: {
    width: 64,
    height: 64,
    marginRight: 20,
  },
  gradientRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  iconInner: {
    backgroundColor: '#FFFFFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  cardTitleSelected: {
    color: theme.colors.primary,
  },
  cardDesc: {
    ...theme.typography.caption,
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    marginTop: 'auto',
    marginBottom: 48,
  },
  primaryBtn: {
    backgroundColor: theme.colors.primary,
  },
  ambulanceBtn: {
    backgroundColor: theme.colors.riskHigh,
  },
  ghostBtn: {
    backgroundColor: theme.colors.textTertiary,
  },
});
