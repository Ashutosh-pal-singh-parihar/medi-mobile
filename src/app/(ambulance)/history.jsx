import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import { theme } from '../../styles/theme';
import { ambulanceService } from '../../features/ambulance/services/ambulance.service';
import { useAuthStore } from '../../store/auth.store';
import { format } from 'date-fns';
import { Badge } from '../../components/ui/Badge';

export default function AmbulanceHistory() {
  const { user } = useAuthStore();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const profile = await ambulanceService.getProfile(user.id);
    if (profile) {
      const data = await ambulanceService.getHistory(profile.id);
      setHistory(data);
    }
    setLoading(false);
  };

  const filteredHistory = history.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.dateText}>{format(new Date(item.created_at), 'MMM dd, hh:mm a')}</Text>
        <Badge 
          label={item.status.toUpperCase()} 
          color={
            item.status === 'completed' ? '#16A34A' : 
            item.status === 'dismissed' ? '#B91C1C' : 
            '#64748B'
          }
        />
      </View>
      <Text style={styles.patientInfo}>
        Patient #{item.id.slice(-4)} • {item.triage_cases.patient_profiles?.gender}, {item.triage_cases.patient_profiles?.age}y
      </Text>
      <View style={styles.symptomsRow}>
        {item.triage_cases.detected_symptoms?.map((s, i) => (
          <Text key={i} style={styles.symptomText}>• {s}</Text>
        ))}
      </View>
    </View>
  );

  return (
    <ScreenWrapper bg={theme.colors.bgBase}>
      <View style={styles.container}>
        <Text style={styles.title}>Case History</Text>
        
        <View style={styles.filterTabs}>
          {['all', 'completed', 'dismissed', 'cancelled'].map(f => (
            <TouchableOpacity 
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.tab, filter === f && styles.activeTab]}
            >
              <Text style={[styles.tabText, filter === f && styles.activeTabText]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ), null)}
        </View>

        <FlatList
          data={filteredHistory}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No cases found.</Text>
            </View>
          }
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { ...theme.typography.h1, marginBottom: 24 },
  filterTabs: { flexDirection: 'row', gap: 8, marginBottom: 24, flexWrap: 'wrap' },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#FFFFFF', borderOpacity: 0.1, borderWidth: 1, borderColor: '#E2E8F0' },
  activeTab: { backgroundColor: '#DC2626', borderColor: '#DC2626' },
  tabText: { ...theme.typography.label, color: theme.colors.textSecondary },
  activeTabText: { color: '#FFFFFF' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, ...theme.shadows.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  dateText: { ...theme.typography.caption, color: theme.colors.textSecondary },
  patientInfo: { ...theme.typography.h3, color: theme.colors.textPrimary, marginBottom: 8 },
  symptomsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  symptomText: { ...theme.typography.caption, color: theme.colors.textSecondary },
  list: { paddingBottom: 40 },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { ...theme.typography.body, color: theme.colors.textTertiary },
});
