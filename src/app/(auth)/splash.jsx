import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, Animated as RNAnimated, TouchableOpacity } from 'react-native';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import Button from '../../components/ui/Button';
import { theme } from '../../styles/theme';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../hooks/useLanguage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ONBOARDING_DATA = [
  {
    id: '1',
    icon: 'mic-outline',
    titleKey: 'splash_card1_title',
    descKey: 'splash_card1_body',
  },
  {
    id: '2',
    icon: 'analytics-outline',
    titleKey: 'splash_card2_title',
    descKey: 'splash_card2_body',
  },
  {
    id: '3',
    icon: 'medkit-outline',
    titleKey: 'splash_card3_title',
    descKey: 'splash_card3_body',
  },
];

export default function SplashScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new RNAnimated.Value(0)).current;
  const flatListRef = useRef(null);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ 
    viewAreaCoveragePercentThreshold: 50 
  }).current;

  // Reanimated 3 Animation for Sphere
  const sphereScale = useSharedValue(1);
  const sphereStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sphereScale.value }],
  }));

  useEffect(() => {
    sphereScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.onboardingCard}>
      <View style={styles.iconCircle}>
        <Ionicons name={item.icon} size={32} color={theme.colors.primary} />
      </View>
      <Text style={styles.cardTitle}>{t(item.titleKey)}</Text>
      <Text style={styles.cardDesc}>{t(item.descKey)}</Text>
    </View>
  );

  return (
    <ScreenWrapper bg={theme.colors.bgBase}>
      <View style={styles.container}>
        {/* Top Sphere Animation */}
        <View style={styles.sphereContainer}>
          <Animated.View style={[styles.sphereWrapper, sphereStyle]}>
            <LinearGradient
              colors={['#2563EB', '#0891B2']}
              style={styles.sphere}
            />
          </Animated.View>
          <View style={styles.headerText}>
            <View style={styles.appNameRow}>
              <Text style={styles.appName}>{t('splash_title')}</Text>
              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>AI</Text>
              </View>
            </View>
            <Text style={styles.tagline}>{t('splash_tagline')}</Text>
          </View>
        </View>

        {/* Onboarding Carousel */}
        <View style={styles.carouselContainer}>
          <FlatList
            ref={flatListRef}
            data={ONBOARDING_DATA}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            onScroll={RNAnimated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
            renderItem={renderItem}
          />
          
          {/* Dot Indicator */}
          <View style={styles.indicatorRow}>
            {ONBOARDING_DATA.map((_, i) => (
              <View 
                key={i} 
                style={[
                  styles.dot, 
                  i === activeIndex && styles.activeDot
                ]} 
              />
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.footer}>
          <Button 
            title={t('get_started')} 
            onPress={() => router.push('/(auth)/signup')} 
            fullWidth 
          />
          <TouchableOpacity 
            onPress={() => router.push('/(auth)/login')} 
            style={styles.ghostBtn}
          >
            <Text style={styles.ghostBtnText}>{t('already_have_account')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#F7F8FC',
  },
  sphereContainer: {
    height: '45%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sphereWrapper: {
    width: 220,
    height: 220,
    borderRadius: 110,
    overflow: 'hidden',
    ...theme.shadows.lg,
  },
  sphere: {
    flex: 1,
  },
  headerText: {
    alignItems: 'center',
    marginTop: 32,
  },
  appNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appName: {
    ...theme.typography.display,
    fontSize: 32,
    color: theme.colors.textPrimary,
  },
  aiBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  aiBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  tagline: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  carouselContainer: {
    flex: 1,
  },
  onboardingCard: {
    width: SCREEN_WIDTH - 40,
    alignItems: 'center',
    paddingTop: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
    marginBottom: 20,
  },
  cardTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  cardDesc: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  indicatorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.border,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: theme.colors.primary,
  },
  footer: {
    marginBottom: 40,
  },
  ghostBtn: {
    alignItems: 'center',
    marginTop: 20,
  },
  ghostBtnText: {
    ...theme.typography.label,
    color: theme.colors.primary,
  },
});
