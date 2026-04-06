import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../styles/theme';
import ScreenWrapper from '../../../components/layout/ScreenWrapper';
import { triageService } from '../../../features/triage/services/triage.service';
import { RISK_CONFIG } from '../../../config/constants';
import { Skeleton } from '../../../components/ui/Skeleton';
import ChatBubble from '../../../features/triage/components/ChatBubble';
import RiskBadge from '../../../features/triage/components/RiskBadge';
import SymptomChip from '../../../features/triage/components/SymptomChip';
import { reportService } from '../../../features/triage/services/report.service';
import useAuthStore from '../../../store/auth.store';
import { useLanguage } from '../../../hooks/useLanguage';
import { Modal } from '../../../components/ui/Modal';
import Avatar from '../../../components/ui/Avatar';

export default function ReportDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { t, language } = useLanguage();
  const { patientProfile } = useAuthStore();
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [showDoctorModal, setShowDoctorModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [reportData, doctorsData] = await Promise.all([
          triageService.getTriageSession(id),
          triageService.getDoctors()
        ]);
        setReport(reportData);
        setDoctors(doctorsData);
      } catch (e) {
        Alert.alert(t('error_generic'), t('error_generic'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleExportPDF = async () => {
    try {
      setExporting(true);
      await reportService.shareReport(report, patientProfile);
    } catch (e) {
      Alert.alert(t('error_generic'), t('error_generic'));
    } finally {
      setExporting(false);
    }
  };

  const handleSendToDoctor = async (doctorId) => {
    try {
      setShowDoctorModal(false);
      setSending(true);
      await triageService.updateTriageSession(id, { 
        status: 'pending',
        sent_to_doctor: true,
        doctor_id: doctorId,
        sent_at: new Date().toISOString()
      });
      Alert.alert(t('report_sent'), t('report_sent'));
      setReport(prev => ({ ...prev, sent_to_doctor: true, doctor_id: doctorId }));
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
              await triageService.deleteTriageSession(id);
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

  if (loading) {
    return (
      <ScreenWrapper bg={theme.colors.bgBase}>
        <View style={styles.padding}>
          <Skeleton height={200} style={{ marginBottom: 24 }} />
          <Skeleton height={100} style={{ marginBottom: 16 }} />
          <Skeleton height={150} style={{ marginBottom: 16 }} />
        </View>
      </ScreenWrapper>
    );
  }

  const risk = RISK_CONFIG[report?.risk_level] || RISK_CONFIG.LOW;

  return (
    <ScreenWrapper bg={theme.colors.bgBase}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('reports')}</Text>
        <TouchableOpacity 
          onPress={handleExportPDF} 
          style={[styles.headerBtn, exporting && { opacity: 0.5 }]}
          disabled={exporting}
        >
          <Ionicons name={exporting ? "hourglass-outline" : "share-outline"} size={22} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.statusSection}>
          <RiskBadge riskLevel={report?.risk_level} style={styles.mainBadge} />
          <Text style={styles.dateText}>
            {new Date(report?.created_at).toLocaleDateString()} {new Date(report?.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('patient')}</Text>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryText}>{report?.ai_summary}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('known_conditions')}</Text>
          <View style={styles.symptomsGrid}>
            {report?.detected_symptoms?.map((s, i) => (
              <SymptomChip key={i} label={s} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('next')}</Text>
          <View style={[styles.infoCard, { borderLeftColor: risk.color }]}>
            <Ionicons name="medkit" size={22} color={risk.color} />
            <Text style={styles.recommendationText}>{report?.ai_recommendation}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('health_background')}</Text>
          <View style={styles.contextBox}>
            <Text style={styles.explanationText}>{report?.ai_explanation}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.historyToggle} 
          onPress={() => setShowHistory(!showHistory)}
        >
          <View style={styles.historyToggleLeft}>
            <Ionicons name="chatbubbles-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.historyToggleText}>{t('recent_history')}</Text>
          </View>
          <Ionicons name={showHistory ? 'chevron-up' : 'chevron-down'} size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        {showHistory && (
          <View style={styles.conversation}>
            {report?.messages?.map((m, i) => (
              <ChatBubble key={i} message={m} />
            ))}
          </View>
        )}

        {report?.risk_level !== 'HIGH' && !report?.sent_to_doctor && (
          <TouchableOpacity 
            style={[styles.sendBtn, sending && { opacity: 0.7 }]}
            onPress={() => setShowDoctorModal(true)}
            disabled={sending}
          >
            <Ionicons name="medical" size={18} color="#FFFFFF" />
            <Text style={styles.sendBtnText}>{sending ? t('next') : t('send_to_doctor')}</Text>
          </TouchableOpacity>
        )}

        {report?.risk_level !== 'HIGH' && (
          <TouchableOpacity 
            style={[styles.deleteBtn, deleting && { opacity: 0.7 }]}
            onPress={handleReportDelete}
            disabled={deleting}
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
            <Text style={styles.deleteBtnText}>{t('delete_report')}</Text>
          </TouchableOpacity>
        )}

        {report?.sent_to_doctor && (
          <View style={styles.sentNotice}>
            <Ionicons name="checkmark-circle" size={18} color={theme.colors.riskLow} />
            <Text style={styles.sentNoticeText}>{t('report_sent')}</Text>
          </View>
        )}

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

        <View style={styles.footerSpacing} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  scroll: {
    padding: 24,
  },
  padding: {
    padding: 24,
  },
  statusSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  mainBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 12,
  },
  dateText: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    fontSize: 13,
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    ...theme.shadows.sm,
  },
  summaryText: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    lineHeight: 30,
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  infoCard: {
    flexDirection: 'row',
    gap: 16,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderLeftWidth: 6,
    ...theme.shadows.sm,
  },
  recommendationText: {
    ...theme.typography.body,
    fontSize: 16,
    color: theme.colors.textPrimary,
    flex: 1,
    lineHeight: 24,
  },
  contextBox: {
    backgroundColor: theme.colors.bgSurface2,
    padding: 20,
    borderRadius: 20,
  },
  explanationText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  historyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  historyToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyToggleText: {
    ...theme.typography.label,
    color: theme.colors.textPrimary,
    fontSize: 15,
  },
  conversation: {
    marginTop: 20,
    paddingHorizontal: 4,
    marginBottom: 20,
  },
  sendBtn: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 10,
    marginTop: 20,
  },
  sendBtnText: {
    ...theme.typography.label,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  deleteBtnText: {
    ...theme.typography.label,
    color: '#EF4444',
    fontWeight: '700',
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
  sentNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    padding: 12,
    backgroundColor: theme.colors.riskLowBg,
    borderRadius: 12,
  },
  sentNoticeText: {
    ...theme.typography.caption,
    color: theme.colors.riskLow,
    fontWeight: '600',
  },
  footerSpacing: {
    height: 60,
  },
});
