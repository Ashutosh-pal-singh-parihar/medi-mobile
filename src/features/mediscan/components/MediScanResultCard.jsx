import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Share, 
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { theme } from '../../../styles/theme';
import { Card } from '../../../components/ui/Card';
import { MEDISCAN_CONFIG } from '../../../config/constants';

const SafetyBadge = ({ level }) => {
  const config = MEDISCAN_CONFIG[level] || MEDISCAN_CONFIG.SAFE;
  return (
    <View style={[styles.badge, { backgroundColor: config.bg, borderColor: config.border }]}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={[styles.badgeLabel, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

const InfoRow = ({ icon, text, color = theme.colors.textPrimary }) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={18} color={color} />
    <Text style={[styles.infoRowText, { color }]}>{text}</Text>
  </View>
);

const Chip = ({ text, color = theme.colors.primary }) => (
  <View style={[styles.chip, { backgroundColor: color + '15' }]}>
    <Text style={[styles.chipText, { color }]}>{text}</Text>
  </View>
);

export const MediScanResultCard = ({ data, onReset }) => {
  if (!data) return null;

  const copyToClipboard = async () => {
    const summary = `Medicine: ${data.medicine_name}\nGeneric: ${data.generic_name}\nType: ${data.medicine_type}\nDosage: ${data.dosage_instructions}\nSafety: ${data.safety_level}`;
    await Clipboard.setStringAsync(summary);
    Alert.alert('Success', 'Medicine summary copied to clipboard');
  };

  return (
    <ScrollView 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      <Card padding={0} style={styles.card}>
        {/* Header */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.header}
        >
          <View style={styles.medicTypeBadge}>
            <Text style={styles.medicTypeText}>{data.medicine_type}</Text>
          </View>
          <Text style={styles.medName}>{data.medicine_name}</Text>
          <Text style={styles.genericName}>{data.generic_name}</Text>
          <SafetyBadge level={data.safety_level} />
        </LinearGradient>

        <View style={styles.content}>
          {/* When to Take */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 When to Take</Text>
            {data.conditions_to_take?.map((item, idx) => (
              <InfoRow key={idx} icon="checkmark-circle" text={item} color={theme.colors.riskLow} />
            ))}
          </View>

          {/* How to Take */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💊 How to Take</Text>
            <View style={styles.highlightBox}>
              <Text style={styles.dosageLabel}>Dosage:</Text>
              <Text style={styles.dosageText}>{data.dosage_instructions}</Text>
            </View>
            <Text style={styles.howToText}>{data.how_to_take}</Text>
          </View>

          {/* Food Consumption */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🍽️ Eat Before Taking</Text>
            <View style={styles.chipRow}>
              {data.food_before?.recommended?.map((food, idx) => (
                <Chip key={idx} text={food} color={theme.colors.riskLow} />
              ))}
            </View>
            <View style={styles.toggleRow}>
              <Ionicons 
                name={data.food_before?.empty_stomach_ok ? "checkmark-circle" : "close-circle"} 
                size={20} 
                color={data.food_before?.empty_stomach_ok ? theme.colors.riskLow : theme.colors.riskHigh} 
              />
              <Text style={styles.toggleText}>
                {data.food_before?.empty_stomach_ok ? "Empty stomach OK" : "Food required"}
              </Text>
            </View>
            <Text style={styles.metaNote}>{data.food_before?.note}</Text>
          </View>

          {/* Take Alongside */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💧 Take Alongside</Text>
            <View style={styles.chipRow}>
              {data.take_with?.map((item, idx) => (
                <Chip key={idx} text={item} color={theme.colors.primary} />
              ))}
            </View>
          </View>

          {/* Avoid - Red Section */}
          <View style={styles.avoidSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.riskHigh }]}>🚫 What to Avoid</Text>
            
            {data.avoid?.food?.length > 0 && (
              <View style={styles.avoidSubSection}>
                <Text style={styles.avoidLabel}>Food & Drink</Text>
                {data.avoid.food.map((item, idx) => (
                  <InfoRow key={idx} icon="close-outline" text={item} color={theme.colors.riskHigh} />
                ))}
              </View>
            )}

            {data.avoid?.medicines?.length > 0 && (
              <View style={styles.avoidSubSection}>
                <Text style={styles.avoidLabel}>Other Medicines</Text>
                {data.avoid.medicines.map((item, idx) => (
                  <InfoRow key={idx} icon="close-outline" text={item} color={theme.colors.riskHigh} />
                ))}
              </View>
            )}

            {data.avoid?.activities?.length > 0 && (
              <View style={styles.avoidSubSection}>
                <Text style={styles.avoidLabel}>Activities</Text>
                {data.avoid.activities.map((item, idx) => (
                  <InfoRow key={idx} icon="close-outline" text={item} color={theme.colors.riskHigh} />
                ))}
              </View>
            )}

            {data.avoid?.conditions?.length > 0 && (
              <View style={styles.avoidSubSection}>
                <Text style={styles.avoidLabel}>Medical Conditions</Text>
                {data.avoid.conditions.map((item, idx) => (
                  <InfoRow key={idx} icon="close-outline" text={item} color={theme.colors.riskHigh} />
                ))}
              </View>
            )}
          </View>

          {/* Side Effects */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ Side Effects</Text>
            <View style={styles.effectBox}>
              <Text style={styles.effectLabelCommon}>Common:</Text>
              <Text style={styles.effectText}>{data.side_effects?.common?.join(', ')}</Text>
            </View>
            <View style={[styles.effectBox, { marginTop: 8 }]}>
              <Text style={styles.effectLabelSerious}>Serious:</Text>
              <Text style={[styles.effectText, { fontWeight: '700' }]}>{data.side_effects?.serious?.join(', ')}</Text>
            </View>
          </View>

          {/* Storage & Pregnancy */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📦 Storage & Pregnancy</Text>
            <View style={styles.metaRow}>
              <Ionicons name="thermometer-outline" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.metaText}>{data.storage}</Text>
            </View>
            <View style={[styles.metaRow, { marginTop: 8 }]}>
              <Ionicons name="woman-outline" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.metaText}>{data.pregnancy_safety}</Text>
            </View>
          </View>

          <Text style={styles.disclaimer}>{data.disclaimer}</Text>

          {/* Actions */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.btnSecondary} onPress={onReset}>
              <Ionicons name="refresh-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.btnSecondaryText}>Scan Another</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.btnPrimary} onPress={copyToClipboard}>
              <Ionicons name="copy-outline" size={20} color="#FFFFFF" />
              <Text style={styles.btnPrimaryText}>Copy Summary</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
  },
  card: {
    overflow: 'hidden',
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  medicTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 8,
  },
  medicTypeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  medName: {
    ...theme.typography.h1,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  genericName: {
    ...theme.typography.body,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...theme.typography.h3,
    fontSize: 15,
    marginBottom: 12,
    color: theme.colors.textPrimary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
    paddingRight: 12,
  },
  infoRowText: {
    ...theme.typography.body,
    fontSize: 14,
    flex: 1,
  },
  highlightBox: {
    backgroundColor: theme.colors.bgSurface2,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  dosageLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '700',
    marginBottom: 2,
  },
  dosageText: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  howToText: {
    ...theme.typography.body,
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  toggleText: {
    ...theme.typography.label,
    fontSize: 14,
  },
  metaNote: {
    ...theme.typography.caption,
    fontStyle: 'italic',
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  avoidSection: {
    backgroundColor: '#FFF5F5',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  avoidSubSection: {
    marginBottom: 12,
  },
  avoidLabel: {
    ...theme.typography.caption,
    color: theme.colors.riskHigh,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  effectBox: {
    flexDirection: 'row',
    gap: 8,
  },
  effectLabelCommon: {
    color: theme.colors.riskMedium,
    fontWeight: '700',
    fontSize: 14,
  },
  effectLabelSerious: {
    color: theme.colors.riskHigh,
    fontWeight: '700',
    fontSize: 14,
  },
  effectText: {
    ...theme.typography.body,
    fontSize: 14,
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaText: {
    ...theme.typography.body,
    fontSize: 14,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  disclaimer: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  btnSecondary: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  btnSecondaryText: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
});
