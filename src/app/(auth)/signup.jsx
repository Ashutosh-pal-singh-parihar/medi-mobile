import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import KeyboardAvoidingWrapper from '../../components/layout/KeyboardAvoidingWrapper';
import { theme } from '../../styles/theme';
import { useRouter } from 'expo-router';
import { authService } from '../../features/auth/services/auth.service';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withTiming, FadeInDown, FadeOutUp } from 'react-native-reanimated';

export default function SignupScreen() {
  const router = useRouter();
  const [role, setRole] = useState('patient'); // 'patient' or 'ambulance'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('Basic');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const getStrength = (pass) => {
    if (pass.length === 0) return { width: '0%', color: '#E2E8F0', label: '' };
    if (pass.length < 6) return { width: '33%', color: '#F56565', label: 'Weak' };
    const hasUpper = /[A-Z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    if (pass.length >= 10 && hasUpper && hasNumber) return { width: '100%', color: '#48BB78', label: 'Strong' };
    if (pass.length >= 6 || hasUpper) return { width: '66%', color: '#ECC94B', label: 'Fair' };
    return { width: '33%', color: '#F56565', label: 'Weak' };
  };

  const strength = getStrength(password);
  const barStyle = useAnimatedStyle(() => ({
    width: withTiming(strength.width, { duration: 300 }),
    backgroundColor: strength.color,
  }));

  const validate = () => {
    const newErrors = {};
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Valid email is required';
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    if (role === 'ambulance') {
      if (!phone.trim()) newErrors.phone = 'Phone number is required';
      if (!vehicleNumber.trim()) newErrors.vehicleNumber = 'Vehicle number is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      const metadata = {
        role,
        full_name: fullName,
        phone,
        vehicle_number: vehicleNumber,
        vehicle_type: vehicleType,
      };
      const data = await authService.signUp(email, password, metadata);
      
      // Note: trigger handle_new_user will handle profile creation
      router.push({ pathname: '/(auth)/verify', params: { email: email.toLowerCase().trim() } });
    } catch (e) {
      setErrors({ general: e.message.includes('already registered') ? 'An account with this email already exists.' : e.message });
    } finally {
      setLoading(false);
    }
  };

  const renderRoleSelector = () => (
    <View style={styles.roleContainer}>
      <Text style={styles.sectionLabel}>I want to register as:</Text>
      <View style={styles.roleTabs}>
        <TouchableOpacity 
          style={[styles.roleTab, role === 'patient' && styles.roleTabActive]} 
          onPress={() => setRole('patient')}
        >
          <Ionicons name="person" size={20} color={role === 'patient' ? '#FFF' : theme.colors.textSecondary} />
          <Text style={[styles.roleTabText, role === 'patient' && styles.roleTabTextActive]}>Patient</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.roleTab, role === 'ambulance' && styles.roleTabActiveAmbulance]} 
          onPress={() => setRole('ambulance')}
        >
          <MaterialCommunityIcons name="ambulance" size={20} color={role === 'ambulance' ? '#FFF' : theme.colors.textSecondary} />
          <Text style={[styles.roleTabText, role === 'ambulance' && styles.roleTabTextActive]}>Ambulance</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScreenWrapper bg={theme.colors.bgBase}>
      <KeyboardAvoidingWrapper>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Get Started</Text>
            <Text style={styles.subtitle}>Join MediTriage for emergency care</Text>
          </View>

          {renderRoleSelector()}

          <View style={styles.form}>
            {errors.general && (
              <View style={styles.generalError}>
                <Text style={styles.generalErrorText}>{errors.general}</Text>
              </View>
            )}

            <Input label="Full Name" value={fullName} onChangeText={setFullName} icon="person-outline" error={errors.fullName} placeholder="Ex: John Doe" />
            <Input label="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address" icon="mail-outline" error={errors.email} autoCapitalize="none" />
            
            {role === 'ambulance' && (
              <Animated.View entering={FadeInDown} exiting={FadeOutUp}>
                <Input label="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" icon="call-outline" error={errors.phone} placeholder="+91 98765 43210" />
                <Input label="Ambulance Number Plate" value={vehicleNumber} onChangeText={setVehicleNumber} icon="car-outline" error={errors.vehicleNumber} placeholder="MH 04 AB 1234" />
                
                <Text style={styles.inputLabel}>Ambulance Type</Text>
                <View style={styles.typeRow}>
                  {['Basic', 'Advanced', 'ICU'].map(v => (
                    <TouchableOpacity key={v} style={[styles.typeChip, vehicleType === v && styles.typeChipActive]} onPress={() => setVehicleType(v)}>
                      <Text style={[styles.typeChipText, vehicleType === v && styles.typeChipTextActive]}>{v}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Animated.View>
            )}

            <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry icon="lock-closed-outline" error={errors.password} autoCapitalize="none" />
            
            <View style={styles.strengthContainer}>
              <View style={styles.strengthRow}>
                <Text style={styles.strengthLabel}>Password Strength</Text>
                <Text style={[styles.strengthValue, { color: strength.color }]}>{strength.label}</Text>
              </View>
              <View style={styles.strengthBarBg}>
                <Animated.View style={[styles.strengthBarFill, barStyle]} />
              </View>
            </View>

            <Input label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry icon="shield-checkmark-outline" error={errors.confirmPassword} autoCapitalize="none" />

            <Button title={loading ? "" : "Register"} onPress={handleSignUp} disabled={loading} style={role === 'ambulance' ? styles.ambulanceBtn : styles.btn}>
              {loading && <ActivityIndicator color="#FFF" />}
            </Button>
          </View>

          <View style={styles.footer}>
            <View style={styles.bottomRow}>
              <Text style={styles.bottomLabel}>Already have an account?</Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.bottomLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingWrapper>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 10 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', ...theme.shadows.sm, marginBottom: 10 },
  header: { marginTop: 20, marginBottom: 24 },
  title: { ...theme.typography.display, fontSize: 32, color: theme.colors.textPrimary },
  subtitle: { ...theme.typography.body, color: theme.colors.textSecondary, marginTop: 4 },
  sectionLabel: { ...theme.typography.label, color: theme.colors.textSecondary, marginBottom: 12, fontSize: 13 },
  roleContainer: { marginBottom: 24 },
  roleTabs: { flexDirection: 'row', gap: 12 },
  roleTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, backgroundColor: '#F1F5F9', borderRadius: 12, gap: 8 },
  roleTabActive: { backgroundColor: theme.colors.primary },
  roleTabActiveAmbulance: { backgroundColor: theme.colors.riskHigh },
  roleTabText: { ...theme.typography.label, color: theme.colors.textSecondary },
  roleTabTextActive: { color: '#FFF' },
  form: { width: '100%' },
  generalError: { backgroundColor: '#FFF5F5', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#FEB2B2', marginBottom: 20 },
  generalErrorText: { ...theme.typography.body, fontSize: 13, color: '#C53030', textAlign: 'center' },
  inputLabel: { ...theme.typography.label, color: theme.colors.textSecondary, marginBottom: 8, marginTop: 4, fontSize: 14 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  typeChip: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#F1F5F9', borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  typeChipActive: { backgroundColor: theme.colors.riskHigh, borderColor: theme.colors.riskHigh },
  typeChipText: { ...theme.typography.caption, color: theme.colors.textPrimary },
  typeChipTextActive: { color: '#FFF', fontWeight: 'bold' },
  strengthContainer: { marginTop: -8, marginBottom: 16 },
  strengthRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  strengthLabel: { ...theme.typography.caption, color: theme.colors.textSecondary, fontSize: 12 },
  strengthValue: { ...theme.typography.caption, fontWeight: '700', fontSize: 12 },
  strengthBarBg: { height: 6, width: '100%', backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' },
  strengthBarFill: { height: '100%' },
  btn: { marginTop: 20, height: 56 },
  ambulanceBtn: { marginTop: 20, height: 56, backgroundColor: theme.colors.riskHigh },
  footer: { marginTop: 40, marginBottom: 32 },
  bottomRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  bottomLabel: { ...theme.typography.body, fontSize: 14, color: theme.colors.textSecondary },
  bottomLink: { ...theme.typography.label, fontSize: 14, color: theme.colors.primary, marginLeft: 6 },
});
