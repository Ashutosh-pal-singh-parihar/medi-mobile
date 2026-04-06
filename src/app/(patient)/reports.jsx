import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

import ScreenWrapper from '../../components/layout/ScreenWrapper';
import { Skeleton } from '../../components/ui/Skeleton';
import SessionCard from '../../features/triage/components/SessionCard';
import { theme } from '../../styles/theme';
import { useTriageHistory } from '../../features/triage/hooks/useTriageHistory';
import { useLanguage } from '../../hooks/useLanguage';

export default function ReportsScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { pastSessions, loading, refreshHistory, loadInitialHistory } = useTriageHistory();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInitialHistory();
  }, [loadInitialHistory]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshHistory();
    setRefreshing(false);
  };

  const renderItem = ({ item, index }) => (
    <Animated.View entering={FadeInUp.delay(index * 50)}>
      <SessionCard 
        caseId={item.id}
        riskLevel={item.risk_level}
        aiSummary={item.ai_summary}
        detectedSymptoms={item.detected_symptoms}
        createdAt={item.created_at}
        status={item.status}
        verifiedByDoctor={item.doctor_reviewed}
        onPress={() => router.push(`/(patient)/triage/result?id=${item.id}`)} 
      />
    </Animated.View>
  );

  return (
    <ScreenWrapper bg={theme.colors.bgBase}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('reports')}</Text>
          <Text style={styles.subtitle}>{pastSessions.length} {t('reports').toLowerCase()}</Text>
        </View>

        {loading && pastSessions.length === 0 ? (
          <View style={styles.skeletonContainer}>
            {[1, 2, 3].map(i => <Skeleton key={i} height={120} style={{ marginBottom: 16 }} />)}
          </View>
        ) : (
          <FlatList
            data={pastSessions}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={64} color={theme.colors.textTertiary} />
                <Text style={styles.emptyTitle}>{t('no_reports_yet')}</Text>
                <TouchableOpacity style={styles.btn} onPress={() => router.push('/(patient)/home')}>
                  <Text style={styles.btnText}>{t('cancel')}</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    marginBottom: 20,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  skeletonContainer: {
    paddingHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    marginTop: 20,
  },
  emptySubtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  btn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  btnText: {
    ...theme.typography.label,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
