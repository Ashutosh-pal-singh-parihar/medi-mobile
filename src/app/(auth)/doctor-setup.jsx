import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import Button from '../../components/ui/Button';
import { theme } from '../../styles/theme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

/**
 * Doctor Setup Screen
 * Informs medical professionals that they must use the Web Portal for management.
 */
export default function DoctorSetupScreen() {
  const router = useRouter();

  const handleOpenWebPortal = async () => {
    try {
      await Linking.openURL('https://meditriage.app/doctor');
    } catch (error) {
      console.error('Failed to open URL:', error);
    }
  };

  return (
    <ScreenWrapper bg={theme.colors.bgBase}>
      <View style={styles.container}>
        {/* Simple navigation - Back button at top */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.content}>
          {/* Visual Indicator */}
          <View style={styles.iconContainer}>
            <Ionicons name="medical" size={64} color={theme.colors.primary} />
          </View>
          
          <View style={styles.textGroup}>
            <Text style={styles.heading}>Doctor Portal</Text>
            <Text style={styles.body}>
              Doctor accounts are managed via the MediTriage web portal. Please sign in at meditriage.app/doctor
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button 
              title="Open Web Portal" 
              onPress={handleOpenWebPortal} 
              variant="primary"
              fullWidth
              style={styles.mainBtn}
            />

            <Button 
              title="← Back to role selection" 
              onPress={() => router.back()} 
              variant="ghost"
              fullWidth
            />
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  textGroup: {
    alignItems: 'center',
    marginBottom: 48,
  },
  heading: {
    ...theme.typography.display,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    fontSize: 32,
    marginBottom: 16,
  },
  body: {
    ...theme.typography.bodyLg,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  actions: {
    width: '100%',
    paddingHorizontal: 8,
  },
  mainBtn: {
    marginBottom: 16,
  },
});
