import { StyleSheet } from 'react-native';
import { theme } from './theme';

/**
 * Shared global styles for MediTriage AI Mobile App.
 * These styles provide consistency across different screens.
 */
export const globalStyles = StyleSheet.create({
  // Base Screen Style
  screenContainer: {
    flex: 1,
    backgroundColor: theme.colors.bgBase,
    paddingHorizontal: theme.spacing.base,
    paddingTop: theme.spacing.md,
  },

  // Typography/Headers
  sectionHeading: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },

  // Layout Utilities
  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginVertical: theme.spacing.base,
    width: '100%',
  },
  
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // UI Components
  card: {
    backgroundColor: theme.colors.bgSurface,
    borderRadius: theme.radius.lg,
    ...theme.shadows.sm,
    padding: theme.spacing.base,
  },

  // Empty States
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xxl,
  },
  
  emptyStateTitle: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  
  emptyStateSubtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Badges
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    overflow: 'hidden',
  },
});

export default globalStyles;
