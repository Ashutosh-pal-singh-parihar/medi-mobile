import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../styles/theme';
import ScreenWrapper from '../../../components/layout/ScreenWrapper';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useLanguage } from '../../../hooks/useLanguage';

/**
 * TriageStartScreen
 * Revised to allow users to type and describe their problems directly.
 */
export default function TriageStartScreen() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [symptomText, setSymptomText] = useState('');

  const START_METHODS = [
    { id: 'voice', icon: 'mic', color: '#10B981', title: language === 'hi' ? 'आवाज़' : 'Voice', desc: language === 'hi' ? 'बोलकर बताएं' : 'Speak your symptoms' },
    { id: 'image', icon: 'camera', color: '#F59E0B', title: language === 'hi' ? 'फोटो' : 'Photo', desc: language === 'hi' ? 'फोटो दिखाएं' : 'Show a photo' },
  ];

  const handleStart = (methodId = 'text', text = '') => {
    router.push({
      pathname: '/(patient)/triage/session',
      params: { 
        initialMethod: methodId,
        initialInput: text || symptomText || undefined
      }
    });
  };

  return (
    <ScreenWrapper bg={theme.colors.bgBase}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            <Animated.Text entering={FadeInDown.delay(100)} style={styles.title}>
              {language === 'hi' ? 'अपनी समस्या बताएं' : 'What is the problem?'}
            </Animated.Text>
            <Animated.Text entering={FadeInDown.delay(200)} style={styles.subtitle}>
              {language === 'hi' ? 'अपने लक्षणों के बारे में विस्तार से लिखें या बोलें।' : 'Describe your symptoms in detail below to get started.'}
            </Animated.Text>
          </View>

          {/* Description Input Card */}
          <Animated.View entering={FadeInUp.delay(300)} style={styles.inputCard}>
            <TextInput
              style={styles.textInput}
              placeholder={language === 'hi' ? 'यहाँ लिखें (जैसे: मुझे २ दिन से तेज़ बुखार है)...' : 'Type here (e.g., I have sharp pain in my stomach since morning)...'}
              placeholderTextColor={theme.colors.textTertiary}
              multiline
              textAlignVertical="top"
              value={symptomText}
              onChangeText={setSymptomText}
              maxLength={1000}
            />
            <TouchableOpacity 
              style={[styles.primaryBtn, !symptomText.trim() && styles.primaryBtnDisabled]} 
              onPress={() => handleStart('text')}
              disabled={!symptomText.trim()}
            >
              <Text style={styles.primaryBtnText}>
                {language === 'hi' ? 'मूल्यांकन शुरू करें' : 'Start Assessment'}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>{language === 'hi' ? 'या अन्य तरीका चुनें' : 'OR CHOOSE ANOTHER WAY'}</Text>
            <View style={styles.line} />
          </View>

          {/* Other Methods */}
          <View style={styles.grid}>
            {START_METHODS.map((method, idx) => (
              <Animated.View key={idx} entering={FadeInDown.delay(400 + idx * 100).springify()}>
                <TouchableOpacity 
                  style={styles.card} 
                  onPress={() => handleStart(method.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconBg, { backgroundColor: method.color }]}>
                    <Ionicons name={method.icon} size={28} color="#FFFFFF" />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{method.title}</Text>
                    <Text style={styles.cardDesc}>{method.desc}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    ...theme.shadows.sm,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.textPrimary,
    marginBottom: 8,
    fontSize: 28,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    fontSize: 16,
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    ...theme.shadows.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 32,
  },
  textInput: {
    height: 140,
    fontSize: 16,
    color: theme.colors.textPrimary,
    paddingBottom: 16,
  },
  primaryBtn: {
    backgroundColor: theme.colors.primary,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnDisabled: {
    backgroundColor: theme.colors.textTertiary,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 12,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textTertiary,
    letterSpacing: 1,
  },
  grid: {
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    fontSize: 16,
    marginBottom: 2,
  },
  cardDesc: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
});
