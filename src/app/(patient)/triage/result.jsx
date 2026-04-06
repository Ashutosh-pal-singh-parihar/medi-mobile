import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInUp, FadeInDown } from 'react-native-reanimated';
import { triggerRiskHaptic, triggerSuccess } from '../../../hooks/useHaptics';

import ScreenWrapper from '../../../components/layout/ScreenWrapper';
import { theme } from '../../../styles/theme';
import { useTriageStore } from '../../../store/triage.store';
import useAuthStore from '../../../store/auth.store';
import { triageService } from '../../../features/triage/services/triage.service';
import { RISK_CONFIG } from '../../../config/constants';
import { Skeleton } from '../../../components/ui/Skeleton';
import RiskResultCard from '../../../features/triage/components/RiskResultCard';
import RiskBadge from '../../../features/triage/components/RiskBadge';
import SymptomChip from '../../../features/triage/components/SymptomChip';
import { reportService } from '../../../features/triage/services/report.service';
import { useLanguage } from '../../../hooks/useLanguage';
import { Modal } from '../../../components/ui/Modal';
import Avatar from '../../../components/ui/Avatar';

export default function TriageResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t, language } = useLanguage();
  const { result: storeResult, setResult: setStoreResult } = useTriageStore();
  const { patientProfile } = useAuthStore();
  
  const [result, setResult] = useState(storeResult);
  const [loading, setLoading] = useState(true); // Always check on mount
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const sosTimerRef = useRef(null);

  // ── FETCH DATA ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch Session (Prioritize params.id if it's different from store)
        if (params.id && (!result || result.id !== params.id)) {
          const data = await triageService.getTriageSession(params.id);
          if (data) {
            setResult(data);
            setStoreResult(data);
          }
        } else if (!result && !params.id) {
          // Fallback if no result and no ID, maybe go home
          router.replace('/(patient)/home');
          return;
        }

        // 2. Fetch doctors for sharing
        const docs = await triageService.getDoctors();
        setDoctors(docs);
      } catch (e) {
        console.error('[Result] Fetch Error:', e);
        Alert.alert(t('error_generic'), t('error_generic'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id]);

  useEffect(() => {
    if (result) {
      triggerRiskHaptic(result.risk_level);
      if (result.risk_level === 'HIGH') {
        sosTimerRef.current = setTimeout(() => {
          router.push('/(patient)/triage/sos');
        }, 2000);
      }
    }
    return () => {
      if (sosTimerRef.current) clearTimeout(sosTimerRef.current);
    };
  }, [result]);

  const handleSendToDoctor = async (doctorId) => {
    try {
      setShowDoctorModal(false);
      setSending(true);
      await triageService.updateTriageSession(result.id, { 
        status: 'pending',
        sent_to_doctor: true,
        doctor_id: doctorId,
        sent_at: new Date().toISOString()
      });
      setResult(prev => ({ ...prev, sent_to_doctor: true, doctor_id: doctorId }));
      triggerSuccess();
      Alert.alert(t('report_sent'), t('report_sent'));
    } catch (e) {
      Alert.alert(t('error_generic'), t('error_generic'));
    } finally {
      setSending(false);
    }
  };

  const handleReportDelete = () => {
    Alert.alert(
      t('delete_report'),
      t('delete_confirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        { 
          text: t('delete_report'), 
          style: 'destructive', 
          onPress: async () => {
            try {
              setDeleting(true);
              await triageService.deleteTriageSession(result.id);
              triggerSuccess();
              Alert.alert(t('report_deleted'), t('report_deleted'));
              router.replace('/(patient)/reports');
            } catch (e) {
              Alert.alert(t('error_generic'), t('error_generic'));
            } finally {
              setDeleting(false);
            }
          }
        }
      ]
    );
  };

  const handleDownloadReport = async () => {
    try {
      await reportService.shareReport(result, patientProfile);
    } catch (e) {
      Alert.alert(t('error_generic'), t('error_generic'));
    }
  };

  if (loading) {
    return (
      <ScreenWrapper bg={theme.colors.bgBase}>
        <View style={styles.padding}>
          <Skeleton height={240} borderRadius={24} style={{ marginBottom: 24 }} />
          <Skeleton height={80} style={{ marginBottom: 16 }} />
        </View>
      </ScreenWrapper>
    );
  }

  const config = RISK_CONFIG[result?.risk_level] || RISK_CONFIG.LOW;
  const riskLabel = language === 'hi' ? (config.hi?.label || config.label) : config.label;

  return (
    <ScreenWrapper bg={theme.colors.bgBase}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topActions}>
          <TouchableOpacity onPress={() => router.replace('/(patient)/home')} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDownloadReport} style={styles.iconBtn}>
            <Ionicons name="download-outline" size={22} color={theme.colors.primary} />
            <Text style={styles.iconBtnText}>PDF</Text>
          </TouchableOpacity>
        </View>

        <RiskResultCard result={result} />

        <Animated.View entering={FadeInUp.delay(300)} style={styles.section}>
          <Text style={styles.sectionTitle}>{t('known_conditions')}</Text>
          <View style={styles.symptomsContainer}>
            {result?.detected_symptoms?.map((sym, i) => <SymptomChip key={i} label={sym} />)}
            {(!result?.detected_symptoms || result.detected_symptoms.length === 0) && (
              <Text style={styles.noDataText}>{t('no_reports_yet')}</Text>
            )}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>{t('next')}</Text>
          <View style={[styles.card, styles.recommendationCard]}>
            <View style={[styles.iconCircle, { backgroundColor: config.color + '15' }]}>
              <Ionicons name="checkbox" size={24} color={config.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.recommendationTitle}>{riskLabel} {t('next')}</Text>
              <Text style={styles.recommendationText}>{result?.ai_recommendation}</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>{t('health_background')}</Text>
          <View style={styles.contextBox}>
            <Text style={styles.contextText}>{result?.ai_explanation}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(600)} style={styles.footer}>
          {result?.risk_level === 'HIGH' && (
            <TouchableOpacity 
              style={[styles.primaryBtn, { backgroundColor: theme.colors.riskHigh, marginBottom: 8 }]}
              onPress={() => {
                if (sosTimerRef.current) clearTimeout(sosTimerRef.current);
                router.push('/(patient)/triage/sos');
              }}
            >
              <Ionicons name="alert-circle" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.primaryBtnText}>{t('seek_help_now')}</Text>
            </TouchableOpacity>
          )}

          {result?.sent_to_doctor ? (
            <View style={styles.sentNotice}>
              <Ionicons name="checkmark-circle" size={18} color={theme.colors.riskLow} />
              <Text style={styles.sentNoticeText}>{t('report_sent')}</Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={[styles.primaryBtn, sending && styles.btnDisabled]}
              onPress={() => setShowDoctorModal(true)}
              disabled={sending}
            >
              <Ionicons name="paper-plane" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.primaryBtnText}>{sending ? t('next') : t('send_to_doctor')}</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.secondaryBtn}
            onPress={handleDownloadReport}
          >
            <Ionicons name="document-text-outline" size={18} color={theme.colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.secondaryBtnText}>{t('download_report')}</Text>
          </TouchableOpacity>

          {/* Delete Option for Low/Med risk */}
          {result?.risk_level !== 'HIGH' && (
            <TouchableOpacity 
              style={[styles.deleteBtn, deleting && styles.btnDisabled]}
              onPress={handleReportDelete}
              disabled={deleting}
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" style={{ marginRight: 8 }} />
              <Text style={styles.deleteBtnText}>{t('delete_report')}</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        <Text style={styles.disclaimer}>{t('disclaimer')}</Text>

        {/* Doctor Selection Modal */}
        <Modal 
          visible={showDoctorModal} 
          onClose={() => setShowDoctorModal(false)}
          title={t('select_doctor')}
          height={450}
        >
          <FlatList
            data={doctors}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: 10 }}
            ListEmptyComponent={
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: theme.colors.textTertiary }}>{t('coming_soon')}</Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.doctorItem} 
                onPress={() => handleSendToDoctor(item.id)}
              >
                <Avatar 
                  uri={item.avatar_url} 
                  size={48} 
                  ring={false}
                  style={{ backgroundColor: theme.colors.primaryLight }} 
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.doctorName}>{item.full_name}</Text>
                  <Text style={styles.doctorSub}>{item.specialty} • {item.hospital}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
              </TouchableOpacity>
            )}
          />
        </Modal>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 24,
    paddingBottom: 60,
  },
  padding: {
    padding: 24,
  },
  topActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  iconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  iconBtnText: {
    ...theme.typography.label,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontSize: 11,
  },
  symptomsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    ...theme.shadows.sm,
  },
  recommendationCard: {
    flexDirection: 'row',
    gap: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendationTitle: {
    ...theme.typography.h3,
    fontSize: 16,
    marginBottom: 4,
    color: theme.colors.textPrimary,
  },
  recommendationText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  contextBox: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    ...theme.shadows.sm,
  },
  contextText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  footer: {
    gap: 12,
    marginTop: 20,
    marginBottom: 32,
  },
  primaryBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...theme.shadows.md,
  },
  primaryBtnText: {
    ...theme.typography.label,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  secondaryBtnText: {
    ...theme.typography.label,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  deleteBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 8,
  },
  deleteBtnText: {
    ...theme.typography.label,
    color: '#EF4444',
    fontWeight: '600',
  },
  doctorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  doctorName: {
    ...theme.typography.h3,
    fontSize: 15,
    color: theme.colors.textPrimary,
  },
  doctorSub: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  noDataText: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
  },
  disclaimer: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  sentNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
  },
  sentNoticeText: {
    ...theme.typography.label,
    color: '#16A34A',
    fontWeight: '700',
    fontSize: 16,
  },
});
