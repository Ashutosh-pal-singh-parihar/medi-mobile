import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  Platform,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown, withSpring, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import ScreenWrapper from '../../components/layout/ScreenWrapper';
import Avatar from '../../components/ui/Avatar';
import { Skeleton } from '../../components/ui/Skeleton';
import { Card } from '../../components/ui/Card';
import SessionCard from '../../features/triage/components/SessionCard';
import { theme } from '../../styles/theme';
import useAuthStore from '../../store/auth.store';
import { useTriageHistory } from '../../features/triage/hooks/useTriageHistory';
import { RISK_CONFIG } from '../../config/constants';
import { useLanguage } from '../../hooks/useLanguage';
import { NotificationBadge } from '../../components/NotificationBadge';
import { notificationsService } from '../../services/notifications.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MOCK_TIPS = [
  { id: 1, emoji: '💧', title: 'Stay Hydrated', desc: 'Drink at least 8 glasses of water today.', color: theme.colors.primaryLight },
  { id: 2, emoji: '😴', title: 'Better Sleep', desc: 'Try to get 7-9 hours of restful sleep tonight.', color: theme.colors.riskLowBg },
  { id: 3, emoji: '🍎', title: 'Eat Healthy', desc: 'Include more leafy greens in your diet.', color: theme.colors.primaryLight },
  { id: 4, emoji: '🚶', title: 'Daily Walk', desc: 'A 30-minute walk can boost your mood.', color: theme.colors.riskLowBg },
];

import NetInfo from '@react-native-community/netinfo';
import { useTriageStore } from '../../store/triage.store';

export default function HomeScreen() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { user, patientProfile } = useAuthStore();

  const { pastSessions, loading, refreshHistory, loadInitialHistory } = useTriageHistory();
  const { messages, sessionId, resetSession } = useTriageStore();
  const [refreshing, setRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fabScale = useSharedValue(1);

  useEffect(() => {
    loadInitialHistory();
    
    // Check for unread notifications
    const checkUnread = async () => {
      try {
        const seenStr = await AsyncStorage.getItem('seen_notifications') || '[]';
        const seen = JSON.parse(seenStr);
        // We'll simplify: if any doctor_actions or appointments exist for user cases that aren't in 'seen'
        // But for performance now, we'll just subscribe and count new ones.
      } catch {}
    };
    checkUnread();

    // Subscribe to realtime updates
    let unsubscribe;
    if (user?.id) {
      unsubscribe = notificationsService.subscribeToPatientCaseUpdates(user.id, (payload) => {
        if (payload.type === 'doctor_action' || payload.type === 'appointment') {
          setUnreadCount(prev => prev + 1);
          // Refresh history to show updated status badges
          refreshHistory();
          
          Alert.alert(
            payload.type === 'appointment' ? 'Appointment Scheduled' : 'Doctor Reviewed Case',
            'You have a new update on your triage session.'
          );
        } else if (payload.type === 'case_update') {
          refreshHistory();
        }
      });
    }

    // Session Recovery Alert
    if (sessionId && messages.length > 0) {
      setTimeout(() => {
        Alert.alert(
          t('incomplete_triage'),
          t('incomplete_triage_body'),
          [
            { text: t('start_fresh'), style: 'destructive', onPress: () => resetSession() },
            { text: t('continue_session'), onPress: () => router.push('/(patient)/triage/session') }
          ]
        );
      }, 500);
    }

    const netUnsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });
    return () => {
      if (unsubscribe) unsubscribe();
      netUnsubscribe();
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshHistory();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('good_morning');
    if (hour < 17) return t('good_afternoon');
    return t('good_evening');
  };

  const latestSession = pastSessions.length > 0 ? pastSessions[0] : null;
  const riskConfig = latestSession ? (RISK_CONFIG[latestSession.risk_level] || RISK_CONFIG.LOW) : null;

  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  const onPressIn = () => { fabScale.value = withSpring(0.9); };
  const onPressOut = () => { fabScale.value = withSpring(1); };

  const startTriage = (methodId) => {
    if (isOffline) {
      Alert.alert(t('error_no_internet'), t('internet_required'));
      return;
    }
    if (methodId && typeof methodId === 'string') {
      router.push({
        pathname: '/(patient)/triage/session',
        params: { initialMethod: methodId }
      });
    } else {
      router.push('/(patient)/triage/start');
    }
  };

  return (
    <ScreenWrapper bg={theme.colors.bgBase}>
      <View style={{ flex: 1, opacity: isOffline ? 0.8 : 1 }}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          enabled={!isOffline}
        >
          {/* Header Bar */}
          <View style={styles.headerBar}>
            <Avatar uri={patientProfile?.avatar_url} size={42} />
            <TouchableOpacity 
              style={styles.notifBtn} 
              onPress={() => {
                setUnreadCount(0);
                router.push('/(patient)/reports');
              }}
            >
              <Ionicons name="notifications-outline" size={24} color={theme.colors.textPrimary} />
              <NotificationBadge count={unreadCount} show={unreadCount > 0} />
            </TouchableOpacity>
          </View>

          {/* Greeting */}
          <Animated.View entering={FadeInUp.delay(100)} style={styles.greetingContainer}>
            <Text style={styles.greetingText}>{getGreeting()}, {patientProfile?.full_name?.split(' ')[0] || t('patient')} 👋</Text>
            <Text style={styles.subGreeting}>{t('how_feeling')}</Text>
          </Animated.View>

          {/* Health Status Card (Hero) */}
          <Animated.View entering={FadeInUp.delay(200)}>
            <LinearGradient
              colors={['#2563EB', '#0891B2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.heroCard}
            >
              <View style={styles.heroContentLeft}>
                <Text style={styles.heroLabel}>{latestSession ? t('last_session') : t('ready_to_help')}</Text>
                <Text style={styles.heroTime}>{latestSession ? t('health') : t('start_triage')}</Text>
                
                {latestSession && (
                  <View style={[styles.heroBadge, { backgroundColor: '#FFFFFF' }]}>
                    <Text style={[styles.heroBadgeText, { color: riskConfig?.color }]}>{language === 'hi' ? riskConfig?.hi?.label : riskConfig?.label}</Text>
                  </View>
                )}

                <TouchableOpacity 
                  style={styles.heroAction} 
                  onPress={latestSession ? () => router.push(`/(patient)/triage/result?id=${latestSession.id}`) : () => startTriage()}
                >
                  <Text style={styles.heroActionText}>
                    {latestSession ? `${t('next')} →` : `${t('next')} →`}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.heroArt}>
                <Ionicons name={latestSession ? "shield-checkmark" : "pulse"} size={80} color="rgba(255,255,255,0.15)" />
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Quick Start Row */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('start_triage')}</Text>
          </View>
          <View style={styles.quickStartRow}>
            {/* Voice Start */}
            <TouchableOpacity 
              style={[styles.methodCard, styles.methodCardVoice, isOffline && { backgroundColor: theme.colors.textTertiary }]} 
              onPress={() => startTriage('voice')} 
              activeOpacity={0.9}
            >
              <View style={styles.methodIconBg}>
                <Ionicons name="mic" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.methodTitleVoice}>Voice</Text>
            </TouchableOpacity>

            {/* Text Start */}
            <TouchableOpacity style={styles.methodCard} onPress={() => startTriage('text')} activeOpacity={0.8}>
              <Ionicons name="chatbubble-ellipses" size={24} color={isOffline ? theme.colors.textTertiary : theme.colors.primary} />
              <Text style={styles.methodTitle}>Text</Text>
            </TouchableOpacity>

            {/* Image Start */}
            <TouchableOpacity style={styles.methodCard} onPress={() => startTriage('image')} activeOpacity={0.8}>
              <Ionicons name="camera" size={24} color={isOffline ? theme.colors.textTertiary : theme.colors.primary} />
              <Text style={styles.methodTitle}>Image</Text>
            </TouchableOpacity>

            {/* Video Start */}
            <TouchableOpacity style={styles.methodCard} onPress={() => startTriage('video')} activeOpacity={0.8}>
              <Ionicons name="videocam" size={24} color={isOffline ? theme.colors.textTertiary : theme.colors.primary} />
              <Text style={styles.methodTitle}>Video</Text>
            </TouchableOpacity>
          </View>

          {/* Health Tips Scroll */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Daily Health Tips</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={280} decelerationRate="fast" contentContainerStyle={styles.tipsContainer}>
            {MOCK_TIPS.map(tip => (
              <TouchableOpacity key={tip.id} style={[styles.tipCard, { backgroundColor: tip.color }]} activeOpacity={0.9}>
                <Text style={styles.tipEmoji}>{tip.emoji}</Text>
                <View>
                  <Text style={styles.tipTitle}>{tip.title}</Text>
                  <Text style={styles.tipDesc}>{tip.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Recent Sessions */}
          <View style={[styles.sectionHeader, { marginTop: 8 }]}>
            <Text style={styles.sectionTitle}>{t('recent_history')}</Text>
            <TouchableOpacity onPress={() => router.push('/(patient)/reports')}>
              <Text style={styles.seeAll}>{t('next')} →</Text>
            </TouchableOpacity>
          </View>

          {loading && pastSessions.length === 0 ? (
            <View style={{ paddingBottom: 100 }}>
              <Skeleton height={120} style={{ marginBottom: 16 }} />
            </View>
          ) : pastSessions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="medical-outline" size={48} color={theme.colors.textTertiary} />
              <Text style={styles.emptyText}>{t('no_reports_yet')}</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => startTriage()}>
                <Text style={styles.emptyBtnText}>{t('start_triage')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ paddingBottom: 100 }}>
              {pastSessions.slice(0, 3).map((session, idx) => (
                <Animated.View key={session.id} entering={FadeInDown.delay(300 + idx * 100)}>
                  <SessionCard 
                    caseId={session.id}
                    riskLevel={session.risk_level}
                    aiSummary={session.ai_summary}
                    detectedSymptoms={session.detected_symptoms}
                    createdAt={session.created_at}
                    status={session.status}
                    verifiedByDoctor={session.doctor_reviewed}
                    onPress={() => router.push(`/(patient)/triage/result?id=${session.id}`)} 
                  />
                </Animated.View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* FAB Stack */}
        <View style={styles.fabContainer}>
          {/* Triage FAB (Primary) */}
          <Animated.View style={[styles.fabWrapper, fabStyle, isOffline && { opacity: 0.5 }]}>
            <TouchableOpacity 
              style={[styles.fab, isOffline && { backgroundColor: theme.colors.textTertiary }]} 
              activeOpacity={0.9} 
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              onPress={() => startTriage()}
            >
              <Ionicons name="add" size={32} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>

          {/* MediScan Shortcut (Secondary) */}
          <Animated.View entering={FadeInDown.delay(500)} style={[styles.scanFabWrapper, isOffline && { opacity: 0.5 }]}>
            <TouchableOpacity 
              style={styles.scanFab} 
              activeOpacity={0.8}
              onPress={() => router.push('/(patient)/mediscan')}
            >
              <Ionicons name="scan" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  notifBadge: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.riskHigh,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  greetingContainer: {
    marginBottom: 28,
  },
  greetingText: {
    ...theme.typography.h1,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  subGreeting: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  heroCard: {
    height: 160,
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    ...theme.shadows.md,
  },
  heroContentLeft: {
    flex: 1,
    justifyContent: 'center',
  },
  heroLabel: {
    ...theme.typography.caption,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  heroTime: {
    ...theme.typography.h2,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 16,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  heroAction: {
    marginTop: 'auto',
  },
  heroActionText: {
    ...theme.typography.label,
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
  },
  heroArt: {
    justifyContent: 'center',
    paddingLeft: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  sectionTitle: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  seeAll: {
    ...theme.typography.label,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  quickStartRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  methodCard: {
    flex: 1,
    backgroundColor: theme.colors.bgSurface,
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
    height: 90,
  },
  methodCardVoice: {
    backgroundColor: theme.colors.primary,
    flex: 1.2,
  },
  methodIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  methodTitleVoice: {
    ...theme.typography.label,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  methodTitle: {
    ...theme.typography.label,
    color: theme.colors.textPrimary,
    fontWeight: '700',
    marginTop: 8,
    fontSize: 12,
  },
  tipsContainer: {
    paddingRight: 20,
    marginBottom: 32,
  },
  tipCard: {
    width: 260,
    height: 100,
    borderRadius: 20,
    padding: 16,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  tipEmoji: {
    fontSize: 32,
  },
  tipTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    fontSize: 16,
    marginBottom: 2,
  },
  tipDesc: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: theme.colors.bgSurface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    marginBottom: 80,
  },
  emptyText: {
    ...theme.typography.body,
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginTop: 16,
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  emptyBtn: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyBtnText: {
    ...theme.typography.label,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  fabContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 32 : 24,
    right: 24,
    zIndex: 100,
    alignItems: 'center',
    gap: 12,
  },
  fabWrapper: {
    // Wrapper for animation
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  scanFabWrapper: {
    // Wrapper
  },
  scanFab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primaryLight,
    ...theme.shadows.sm,
  },
});
