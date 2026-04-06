import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ActivityIndicator, TouchableOpacity } from 'react-native';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import { theme } from '../../styles/theme';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { authService } from '../../features/auth/services/auth.service';
import { Ionicons } from '@expo/vector-icons';

export default function VerifyScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  
  const inputs = useRef([]);

  useEffect(() => {
    let interval;
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) {
            setCanResend(true);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer, canResend]);

  const handleOtpChange = (text, index) => {
    if (text.length > 1) {
      // Handle paste if needed, but here we just take the last char
      text = text.slice(-1);
    }

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (text !== '' && index < 5) {
      inputs.current[index + 1].focus();
    }

    // Auto-submit on 6th digit
    if (text !== '' && index === 5) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === 6) {
        handleVerify(fullOtp);
      }
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (otp[index] === '' && index > 0) {
        inputs.current[index - 1].focus();
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handleVerify = async (code) => {
    const fullCode = code || otp.join('');
    if (fullCode.length < 6) return;

    try {
      setLoading(true);
      setError('');
      await authService.verifyOTP(email, fullCode);
      router.replace('/(auth)/role-select');
    } catch (e) {
      const msg = e.message;
      if (msg.includes('Token has expired') || msg.includes('OTP expired')) {
        setError('Code expired. Request a new one.');
        setCanResend(true);
        setTimer(0);
      } else if (msg.includes('Invalid OTP') || msg.includes('incorrect')) {
        setError('Incorrect code. Please try again.');
        setOtp(['', '', '', '', '', '']);
        inputs.current[0].focus();
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    try {
      setLoading(true);
      await authService.resendOTP(email);
      setTimer(30);
      setCanResend(false);
      setError('Code resent! Please check your inbox.');
      setOtp(['', '', '', '', '', '']);
      inputs.current[0].focus();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper bg={theme.colors.bgBase}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Confirm Email</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code we sent to{'\n'}
            <Text style={styles.emailText}>{email}</Text>
          </Text>
        </View>

        <View style={styles.otpRow}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputs.current[index] = ref)}
              style={[
                styles.otpBox, 
                digit !== '' && styles.otpBoxFilled,
                error !== '' && styles.otpBoxError
              ]}
              maxLength={1}
              keyboardType="number-pad"
              value={digit}
              onChangeText={(text) => handleOtpChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              autoFocus={index === 0}
            />
          ))}
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity 
          style={[styles.resendBtn, !canResend && styles.resendBtnDisabled]} 
          onPress={handleResend}
          disabled={!canResend || loading}
        >
          {canResend ? (
            <Text style={styles.resendTextActive}>Resend code</Text>
          ) : (
            <Text style={styles.resendTextDisabled}>Resend in 0:{timer < 10 ? `0${timer}` : timer}</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          {loading && <ActivityIndicator size="large" color={theme.colors.primary} />}
        </View>
      </View>
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
    marginBottom: 32,
    ...theme.shadows.sm,
  },
  header: {
    marginBottom: 48,
  },
  title: {
    ...theme.typography.display,
    fontSize: 32,
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  subtitle: {
    ...theme.typography.body,
    fontSize: 16,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  emailText: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  otpBox: {
    width: 48,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    ...theme.shadows.xs,
  },
  otpBoxFilled: {
    borderColor: theme.colors.primary,
    backgroundColor: '#F0F7FF',
  },
  otpBoxError: {
    borderColor: '#F56565',
    backgroundColor: '#FFF5F5',
  },
  errorContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  errorText: {
    ...theme.typography.body,
    fontSize: 14,
    color: '#E53E3E',
    textAlign: 'center',
  },
  resendBtn: {
    alignItems: 'center',
    padding: 12,
  },
  resendBtnDisabled: {
    opacity: 0.6,
  },
  resendTextActive: {
    ...theme.typography.label,
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  resendTextDisabled: {
    ...theme.typography.body,
    color: theme.colors.textTertiary,
    fontSize: 16,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
});
