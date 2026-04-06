import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import KeyboardAvoidingWrapper from '../../components/layout/KeyboardAvoidingWrapper';
import { theme } from '../../styles/theme';
import { useRouter } from 'expo-router';
import { authService } from '../../features/auth/services/auth.service';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const getStrength = (pass) => {
    if (pass.length === 0) return { width: '0%', color: '#E2E8F0', label: '' };
    if (pass.length < 6) return { width: '33%', color: '#F56565', label: 'Weak' };
    
    const hasUpper = /[A-Z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    
    if (pass.length >= 10 && hasUpper && hasNumber) {
      return { width: '100%', color: '#48BB78', label: 'Strong' };
    }
    
    if (pass.length >= 6 || hasUpper) {
      return { width: '66%', color: '#ECC94B', label: 'Fair' };
    }
    
    return { width: '33%', color: '#F56565', label: 'Weak' };
  };

  const strength = getStrength(password);
  
  const barStyle = useAnimatedStyle(() => ({
    width: withTiming(strength.width, { duration: 300 }),
    backgroundColor: strength.color,
  }));

  const validate = () => {
    const newErrors = {};
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Valid email is required';
    }
    if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    
    try {
      setLoading(true);
      const data = await authService.signUp(email, password);
      
      // Check if user already exists
      if (data?.user?.identities?.length === 0) {
        setErrors({ general: 'An account with this email already exists. Please sign in.' });
        return;
      }

      // Success: Route to verify
      router.push({
        pathname: '/(auth)/verify',
        params: { email: email.toLowerCase().trim() }
      });
    } catch (e) {
      let msg = e.message;
      if (msg.includes('User already registered')) {
        msg = 'An account with this email already exists.';
      }
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper bg={theme.colors.bgBase}>
      <KeyboardAvoidingWrapper>
        <View style={styles.container}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
          </View>

          <View style={styles.form}>
            {errors.general && (
              <View style={styles.generalError}>
                <Text style={styles.generalErrorText}>{errors.general}</Text>
              </View>
            )}

            <Input 
              label="Email Address" 
              value={email} 
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon="mail-outline"
              error={errors.email}
              autoCorrect={false}
            />
            
            <Input 
              label="Password" 
              value={password} 
              onChangeText={setPassword}
              secureTextEntry={true}
              icon="lock-closed-outline"
              error={errors.password}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.strengthContainer}>
              <View style={styles.strengthRow}>
                <Text style={styles.strengthLabel}>Password Strength</Text>
                <Text style={[styles.strengthValue, { color: strength.color }]}>{strength.label}</Text>
              </View>
              <View style={styles.strengthBarBg}>
                <Animated.View style={[styles.strengthBarFill, barStyle]} />
              </View>
            </View>

            <Input 
              label="Confirm Password" 
              value={confirmPassword} 
              onChangeText={setConfirmPassword}
              secureTextEntry={true}
              icon="shield-checkmark-outline"
              error={errors.confirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Button 
              title={loading ? "" : "Sign Up"} 
              onPress={handleSignUp} 
              disabled={loading}
              style={styles.btn}
            >
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
        </View>
      </KeyboardAvoidingWrapper>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
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
  header: {
    marginTop: 32,
    marginBottom: 32,
  },
  title: {
    ...theme.typography.display,
    fontSize: 32,
    color: theme.colors.textPrimary,
  },
  form: {
    width: '100%',
  },
  generalError: {
    backgroundColor: '#FFF5F5',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEB2B2',
    marginBottom: 20,
  },
  generalErrorText: {
    ...theme.typography.body,
    fontSize: 13,
    color: '#C53030',
    textAlign: 'center',
  },
  strengthContainer: {
    marginTop: -8,
    marginBottom: 16,
  },
  strengthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  strengthLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  strengthValue: {
    ...theme.typography.caption,
    fontWeight: '700',
    fontSize: 12,
  },
  strengthBarBg: {
    height: 6,
    width: '100%',
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  strengthBarFill: {
    height: '100%',
  },
  btn: {
    marginTop: 20,
    height: 56,
  },
  footer: {
    marginTop: 'auto',
    marginBottom: 32,
    paddingTop: 20,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomLabel: {
    ...theme.typography.body,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  bottomLink: {
    ...theme.typography.label,
    fontSize: 14,
    color: theme.colors.primary,
    marginLeft: 6,
  },
});
