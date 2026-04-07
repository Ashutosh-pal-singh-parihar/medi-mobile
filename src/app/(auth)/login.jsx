import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { authService } from '../../features/auth/services/auth.service';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import Input from '../../components/ui/Input';
import { useRouter } from 'expo-router';
import { theme } from '../../styles/theme';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);


  const formatError = (message) => {
    if (message.includes('Invalid login credentials')) return 'Incorrect email or password';
    if (message.includes('Email not confirmed')) return 'Please verify your email first';
    if (message.includes('Too many requests')) return 'Too many attempts. Wait a few minutes.';
    return message;
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authService.signIn(email, password);
      // ON SUCCESS: DO ABSOLUTELY NOTHING.

      // The _layout.jsx auth guard handles all navigation automatically.
    } catch (err) {
      setError(formatError(err.message));
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper bg="#FFFFFF">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue your journey</Text>
          </View>

          <View style={styles.form}>
            <Input 
              label="Email Address"
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <View style={{ height: 16 }} />

            <Input 
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color={theme.colors.riskHigh} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.loginBtn, isLoading && styles.loginBtnDisabled]} 
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginBtnText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flexGrow: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    ...theme.typography.h1,
    fontSize: 28,
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  form: {
    flex: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.riskHigh + '10',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  errorText: {
    ...theme.typography.label,
    color: theme.colors.riskHigh,
    fontSize: 13,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: 12,
    marginBottom: 32,
  },
  forgotText: {
    ...theme.typography.label,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  loginBtn: {
    backgroundColor: theme.colors.primary,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnText: {
    ...theme.typography.h3,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  signupLink: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '700',
  },
});
