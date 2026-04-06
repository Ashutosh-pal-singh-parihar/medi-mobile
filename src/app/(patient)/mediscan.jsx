import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import { useMediScan } from '../../features/mediscan/hooks/useMediScan';
import { MediScanResultCard } from '../../features/mediscan/components/MediScanResultCard';
import { Skeleton } from '../../components/ui/Skeleton';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

export default function MediScanScreen() {
  const { status, result, error, pickImage, takePhoto, reset } = useMediScan();

  const renderEmptyState = () => (
    <Animated.View entering={FadeInUp} style={styles.centerContainer}>
      <View style={styles.pillCircle}>
        <Text style={styles.pillEmoji}>💊</Text>
      </View>
      <Text style={styles.headline}>Scan any medicine</Text>
      <Text style={styles.subtext}>
        Take a photo or upload from gallery to learn about any medicine instantly.
      </Text>

      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.primaryBtn} onPress={takePhoto}>
          <Ionicons name="camera" size={24} color="#FFFFFF" />
          <Text style={styles.primaryBtnText}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={pickImage}>
          <Ionicons name="images" size={24} color={theme.colors.primary} />
          <Text style={styles.secondaryBtnText}>Upload from Gallery</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderAnalyzingState = () => (
    <View style={styles.analyzingContainer}>
      <Skeleton height={200} style={{ marginBottom: 20 }} />
      <Skeleton height={20} width="60%" style={{ marginBottom: 12 }} />
      <Skeleton height={20} width="80%" style={{ marginBottom: 12 }} />
      <Skeleton height={80} style={{ marginBottom: 20 }} />
      <Skeleton height={150} style={{ marginBottom: 20 }} />
      
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.analyzingText}>Analyzing medicine...</Text>
      </View>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.centerContainer}>
      <Ionicons name="alert-circle" size={64} color={theme.colors.riskHigh} />
      <Text style={[styles.headline, { marginTop: 16 }]}>Analysis Failed</Text>
      <Text style={styles.subtext}>{error}</Text>
      
      <TouchableOpacity style={styles.retryBtn} onPress={reset}>
        <Text style={styles.retryBtnText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenWrapper bg={theme.colors.bgBase}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>MediScan</Text>
          {status === 'result' && (
            <TouchableOpacity onPress={reset}>
              <Text style={styles.resetText}>New Scan</Text>
            </TouchableOpacity>
          )}
        </View>

        {status === 'idle' && renderEmptyState()}
        {(status === 'capturing' || status === 'analyzing') && renderAnalyzingState()}
        {status === 'error' && renderErrorState()}
        {status === 'result' && <MediScanResultCard data={result} onReset={reset} />}
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
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
  },
  resetText: {
    ...theme.typography.label,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  pillCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.bgSurface2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    ...theme.shadows.sm,
  },
  pillEmoji: {
    fontSize: 56,
  },
  headline: {
    ...theme.typography.h1,
    textAlign: 'center',
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  subtext: {
    ...theme.typography.body,
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginBottom: 40,
    lineHeight: 24,
  },
  buttonGroup: {
    width: '100%',
    gap: 16,
  },
  primaryBtn: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
    ...theme.shadows.md,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: theme.colors.bgSurface,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
  },
  secondaryBtnText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  analyzingContainer: {
    flex: 1,
    padding: 20,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(247, 248, 252, 0.7)',
  },
  analyzingText: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    marginTop: 16,
  },
  retryBtn: {
    marginTop: 24,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryBtnText: {
    ...theme.typography.label,
    color: theme.colors.primary,
    fontWeight: '700',
  },
});
