import { RISK_CONFIG } from '../config/constants';

/**
 * Returns hex color code for the risk level
 */
export const getRiskColor = (riskLevel) => {
  return RISK_CONFIG[riskLevel]?.color || '#94A3B8';
};

/**
 * Returns light background hex for the risk level
 */
export const getRiskBgColor = (riskLevel) => {
  return RISK_CONFIG[riskLevel]?.bg || '#F1F5F9';
};

/**
 * Returns border hex for the risk level
 */
export const getRiskBorderColor = (riskLevel) => {
  return RISK_CONFIG[riskLevel]?.border || '#E2E8F0';
};

/**
 * Returns full RISK_CONFIG object for the given level
 */
export const getRiskConfig = (riskLevel) => {
  return RISK_CONFIG[riskLevel] || RISK_CONFIG.LOW;
};

/**
 * Sorts an array of triage cases by severity (HIGH > MEDIUM > LOW)
 */
export const sortBySeverity = (casesArray) => {
  if (!casesArray || !Array.isArray(casesArray)) return [];
  
  return [...casesArray].sort((a, b) => {
    const orderA = RISK_CONFIG[a.risk_level]?.sortOrder ?? 3;
    const orderB = RISK_CONFIG[b.risk_level]?.sortOrder ?? 3;
    return orderA - orderB;
  });
};
