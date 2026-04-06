import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import { theme } from '../../styles/theme';
import { ambulanceService } from '../../features/ambulance/services/ambulance.service';
import { useAuthStore } from '../../store/auth.store';
import { Ionicons } from '@expo/vector-icons';

export default function AmbulanceStats() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const profile = await ambulanceService.getProfile(user.id);
    if (profile) {
      const data = await ambulanceService.getStats(profile.id);
      setStats(data);
    }
    setLoading(false);
  };

  const renderStatCard = (title, value, icon, color) => (
    <View style={styles.statCard}>
      <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.statLabel}>{title}</Text>
      <Text style={styles.statValue}>{value || 0}</Text>
    </View>
  );

  const acceptanceRate = stats?.total_alerts > 0 
    ? Math.round((stats.total_accepted / stats.total_alerts) * 100) 
    : 0;

  return (
    <ScreenWrapper bg={theme.colors.bgBase}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Your Performance</Text>

        <View style={styles.statsGrid}>
          {renderStatCard('Total Alerts', stats?.total_alerts, 'notifications', '#3B82F6')}
          {renderStatCard('Accepted', stats?.total_accepted, 'checkmark-circle', '#16A34A')}
          {renderStatCard('Completed', stats?.total_completed, 'checkmark-done-circle', '#22C55E')}
          {renderStatCard('Dismissed', stats?.total_dismissed, 'close-circle', '#DC2626')}
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Acceptance Rate</Text>
            <Text style={styles.progressValue}>{acceptanceRate}%</Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${acceptanceRate}%`, backgroundColor: '#16A34A' }]} />
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Quick Stats</Text>
          <View style={styles.infoRow}>
             <Ionicons name="map" size={18} color={theme.colors.textSecondary} />
             <Text style={styles.infoLabel}>Total Distance</Text>
             <Text style={styles.infoValue}>12.4 km</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
             <Ionicons name="time" size={18} color={theme.colors.textSecondary} />
             <Text style={styles.infoLabel}>Avg. Response</Text>
             <Text style={styles.infoValue}>4.2 min</Text>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  title: { ...theme.typography.h1, marginBottom: 32 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 32 },
  statCard: { width: '47%', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, ...theme.shadows.sm },
  iconBox: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  statLabel: { ...theme.typography.caption, color: theme.colors.textSecondary, marginBottom: 4 },
  statValue: { ...theme.typography.h2, color: theme.colors.textPrimary },
  progressCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, marginBottom: 32, ...theme.shadows.sm },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  progressTitle: { ...theme.typography.h3, color: theme.colors.textPrimary },
  progressValue: { ...theme.typography.h3, color: '#16A34A' },
  progressBg: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  infoCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, ...theme.shadows.sm },
  infoTitle: { ...theme.typography.h3, marginBottom: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  infoLabel: { ...theme.typography.body, color: theme.colors.textSecondary, flex: 1, marginLeft: 12 },
  infoValue: { ...theme.typography.h3, fontSize: 16 },
});
