export const colors = {
  // Backgrounds
  bgBase:       '#F7F8FC',   // Screen background — NOT pure white
  bgSurface:    '#FFFFFF',   // Cards, modals
  bgSurface2:   '#F0F4FF',   // AI message bubbles, info sections
  bgOverlay:    'rgba(15,23,42,0.5)',  // Modal overlays

  // Brand (Patient = Blue)
  primary:      '#2563EB',
  primaryDeep:  '#1E40AF',
  primaryLight: '#EFF6FF',
  accent:       '#0891B2',   // Teal accent for AI elements

  // Triage system (SACRED — never use for decoration)
  riskHigh:        '#DC2626',
  riskHighBg:      '#FEF2F2',
  riskHighBorder:  '#FECACA',
  riskMedium:      '#D97706',
  riskMediumBg:    '#FFFBEB',
  riskMediumBorder:'#FDE68A',
  riskLow:         '#16A34A',
  riskLowBg:       '#F0FDF4',
  riskLowBorder:   '#BBF7D0',

  // Neutrals
  textPrimary:   '#0F172A',
  textSecondary: '#64748B',
  textTertiary:  '#94A3B8',
  border:        '#E2E8F0',
  divider:       '#F1F5F9',
}

export const typography = {
  display:  { fontSize: 36, fontWeight: '700', letterSpacing: -0.5, fontFamily: 'DMSans-Bold' },
  h1:       { fontSize: 28, fontWeight: '700', letterSpacing: -0.3, fontFamily: 'DMSans-Bold' },
  h2:       { fontSize: 22, fontWeight: '600', letterSpacing: -0.2, fontFamily: 'DMSans-SemiBold' },
  h3:       { fontSize: 18, fontWeight: '600', fontFamily: 'DMSans-SemiBold' },
  bodyLg:   { fontSize: 17, fontWeight: '400', lineHeight: 26, fontFamily: 'DMSans-Regular' },
  body:     { fontSize: 15, fontWeight: '400', lineHeight: 22, fontFamily: 'DMSans-Regular' },
  label:    { fontSize: 13, fontWeight: '500', letterSpacing: 0.1, fontFamily: 'DMSans-Medium' },
  caption:  { fontSize: 12, fontWeight: '400', letterSpacing: 0.2, fontFamily: 'DMSans-Regular' },
  mono:     { fontSize: 14, fontWeight: '500', fontFamily: 'JetBrainsMono' },
}

export const spacing = {
  xs: 4, sm: 8, md: 12, base: 16, lg: 20,
  xl: 24, xxl: 32, xxxl: 48,
}

export const radius = {
  sm: 6, md: 10, lg: 14, xl: 20, xxl: 24, pill: 999,
}

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 5,
  },
  highRisk: {
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
}

export const theme = { colors, typography, spacing, radius, shadows }
