import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import KeyboardAvoidingWrapper from '../../components/layout/KeyboardAvoidingWrapper';
import PillChip from '../../components/ui/PillChip';
import Avatar from '../../components/ui/Avatar';
import { theme } from '../../styles/theme';
import { useRouter } from 'expo-router';
import { authService } from '../../features/auth/services/auth.service';
import useAuthStore from '../../store/auth.store';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLanguage } from '../../hooks/useLanguage';

export default function PatientSetupScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user, setPatientProfile } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const STEPS = [
    { id: 1, title: t('tell_us_about_you') },
    { id: 2, title: t('health_background') },
  ];

  const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const CONDITIONS = ['Diabetes', 'Hypertension', 'Asthma', 'Heart Disease', 'Thyroid', 'Kidney', 'Obesity', 'None'];

  // Step 1 Data
  const { patientProfile } = useAuthStore();
  const [fullName, setFullName] = useState(patientProfile?.full_name || '');
  const [whatsappNumber, setWhatsappNumber] = useState(patientProfile?.whatsapp_number || ''); 
  const [age, setAge] = useState(patientProfile?.age?.toString() || '');
  const [gender, setGender] = useState(patientProfile?.gender || '');
  const [bloodGroup, setBloodGroup] = useState(patientProfile?.blood_group || '');
  const [avatar, setAvatar] = useState(patientProfile?.avatar_url || null);

  // Step 2 Data
  const [conditions, setConditions] = useState(patientProfile?.known_conditions || []);
  const [allergies, setAllergies] = useState(patientProfile?.allergies || '');
  const [emergencyContactName, setEmergencyContactName] = useState(patientProfile?.emergency_contact_name || '');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(patientProfile?.emergency_contact_phone || '');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!fullName || !age || !gender || !bloodGroup || !whatsappNumber) {
        Alert.alert(t('error_generic'), 'Please fill in all basic details including WhatsApp number');
        return;
      }
      setStep(2);
    } else {
      handleSubmit();
    }
  };

  const toggleCondition = (item) => {
    if (item === 'None') {
      setConditions(['None']);
    } else {
      const newItems = conditions.filter(c => c !== 'None');
      if (newItems.includes(item)) {
        setConditions(newItems.filter(c => c !== item));
      } else {
        setConditions([...newItems, item]);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      let avatarUrl = null;
      if (avatar) {
        avatarUrl = await authService.uploadAvatar(user.id, avatar);
      }

      const profileData = {
        user_id: user.id,
        full_name: fullName,
        whatsapp_number: whatsappNumber,
        age: parseInt(age),
        gender,
        blood_group: bloodGroup,
        known_conditions: conditions,
        allergies,
        emergency_contact_name: emergencyContactName,
        emergency_contact_phone: emergencyContactPhone,
        avatar_url: avatarUrl,
      };

      const newProfile = await authService.createPatientProfile(profileData);
      await authService.setUserRole(user.id, 'patient');
      setPatientProfile(newProfile);
      router.replace('/(patient)/home');
    } catch (e) {
      Alert.alert(t('error_generic'), e.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.formContainer}>
      <Text style={styles.sectionTitle}>{STEPS[0].title}</Text>
      
      <View style={styles.avatarContainer}>
        <Avatar uri={avatar} size={100} onPress={pickImage} />
        <TouchableOpacity style={styles.editBtn} onPress={pickImage}>
          <Ionicons name="camera" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <Input label={t('full_name')} value={fullName} onChangeText={setFullName} icon="person-outline" autoCapitalize="words" autoCorrect={false} autoFocus={false} blurOnSubmit={true} returnKeyType="done" />
      <Input label="WhatsApp Number" value={whatsappNumber} onChangeText={setWhatsappNumber} keyboardType="phone-pad" icon="logo-whatsapp" placeholder="+91 98765 43210" />
      <Input label={t('age')} value={age} onChangeText={setAge} keyboardType="numeric" icon="calendar-outline" autoCorrect={false} autoFocus={false} blurOnSubmit={true} returnKeyType="done" />

      <Text style={styles.label}>{t('gender')}</Text>
      <View style={styles.chipRow}>
        {['male', 'female', 'other'].map(g => (
          <PillChip key={g} label={t(g)} selected={gender === g} onPress={() => setGender(g)} />
        ))}
      </View>

      <Text style={styles.label}>{t('blood_group')}</Text>
      <View style={styles.chipGrid}>
        {BLOOD_GROUPS.map(bg => (
          <PillChip key={bg} label={bg} selected={bloodGroup === bg} onPress={() => setBloodGroup(bg)} />
        ))}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.formContainer}>
      <Text style={styles.sectionTitle}>{STEPS[1].title}</Text>
      
      <Text style={styles.label}>{t('known_conditions')}</Text>
      <View style={styles.chipGrid}>
        {CONDITIONS.map(c => (
          <PillChip 
            key={c} 
            label={c} 
            selected={conditions.includes(c)} 
            onPress={() => toggleCondition(c)} 
          />
        ))}
      </View>

      <Input label={t('allergies')} value={allergies} onChangeText={setAllergies} icon="alert-circle-outline" autoCorrect={false} autoFocus={false} blurOnSubmit={true} returnKeyType="done" />

      <Text style={styles.label}>{t('emergency_contact')}</Text>
      <Input label={t('contact_name')} value={emergencyContactName} onChangeText={setEmergencyContactName} icon="heart-outline" autoCapitalize="words" autoCorrect={false} autoFocus={false} blurOnSubmit={true} returnKeyType="done" />
      <Input label={t('contact_phone')} value={emergencyContactPhone} onChangeText={setEmergencyContactPhone} keyboardType="phone-pad" icon="call-outline" autoCorrect={false} autoFocus={false} blurOnSubmit={true} returnKeyType="done" />
    </View>
  );

  const progress = (step / STEPS.length) * 100;

  return (
    <ScreenWrapper bg={theme.colors.bgBase}>
      <KeyboardAvoidingWrapper>
        <View style={styles.container}>
          {/* Progress Bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>

          {step === 1 ? renderStep1() : renderStep2()}

          <View style={styles.footer}>
            {step === 2 && (
              <TouchableOpacity onPress={() => setStep(1)} style={styles.backLink}>
                <Text style={styles.backLinkText}>← {t('cancel')}</Text>
              </TouchableOpacity>
            )}
            <Button 
              title={step === 1 ? t('next') : t('complete_setup')} 
              onPress={handleNext} 
              loading={loading}
              fullWidth
              style={styles.nextBtn}
            />
          </View>
        </View>
      </KeyboardAvoidingWrapper>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginBottom: 40,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  sectionTitle: {
    ...theme.typography.h1,
    color: theme.colors.textPrimary,
    marginBottom: 32,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
    alignSelf: 'center',
  },
  editBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  label: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
    marginBottom: 12,
    marginTop: 16,
  },
  chipRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  formContainer: {
    flex: 1,
  },
  footer: {
    marginTop: 32,
    marginBottom: 48,
  },
  nextBtn: {
    marginTop: 8,
  },
  backLink: {
    alignItems: 'center',
    marginBottom: 16,
  },
  backLinkText: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
  },
});
